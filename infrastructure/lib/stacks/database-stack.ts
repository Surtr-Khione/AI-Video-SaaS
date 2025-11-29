import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config';

export interface DatabaseStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
  vpc: ec2.Vpc;
  databaseSecurityGroup: ec2.SecurityGroup;
  cacheSecurityGroup: ec2.SecurityGroup;
}

export class DatabaseStack extends cdk.Stack {
  public readonly database: rds.DatabaseInstance;
  public readonly databaseSecret: secretsmanager.ISecret;
  public readonly cacheCluster: elasticache.CfnCacheCluster;
  public readonly cacheSubnetGroup: elasticache.CfnSubnetGroup;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const { config, vpc, databaseSecurityGroup, cacheSecurityGroup } = props;

    // Database credentials secret
    this.databaseSecret = new secretsmanager.Secret(this, 'DatabaseSecret', {
      secretName: `/${config.environment}/ai-video-saas/database/credentials`,
      description: 'RDS database credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'dbadmin' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 32,
      },
    });

    // RDS Parameter Group
    const parameterGroup = new rds.ParameterGroup(this, 'DatabaseParameterGroup', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_4,
      }),
      description: `Parameter group for AI Video SaaS ${config.environment}`,
      parameters: {
        'shared_preload_libraries': 'pg_stat_statements',
        'log_statement': 'all',
        'log_min_duration_statement': '1000', // Log queries slower than 1s
        'max_connections': config.environment === 'prod' ? '200' : '100',
      },
    });

    // RDS Subnet Group - use isolated subnets for database
    const subnetGroup = new rds.SubnetGroup(this, 'DatabaseSubnetGroup', {
      description: 'Subnet group for RDS database',
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    // RDS PostgreSQL Database
    this.database = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_4,
      }),
      instanceType: new ec2.InstanceType(config.databaseInstanceType),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [databaseSecurityGroup],
      subnetGroup,
      parameterGroup,
      credentials: rds.Credentials.fromSecret(this.databaseSecret),
      databaseName: 'aivideosaas',
      allocatedStorage: config.databaseAllocatedStorage,
      maxAllocatedStorage: config.databaseAllocatedStorage * 2,
      storageType: rds.StorageType.GP3,
      storageEncrypted: true,
      multiAz: config.databaseMultiAz,
      autoMinorVersionUpgrade: true,
      backupRetention: cdk.Duration.days(config.databaseBackupRetention),
      preferredBackupWindow: '03:00-04:00', // UTC
      preferredMaintenanceWindow: 'sun:04:00-sun:05:00', // UTC
      deletionProtection: config.environment === 'prod',
      removalPolicy: config.environment === 'prod'
        ? cdk.RemovalPolicy.SNAPSHOT
        : cdk.RemovalPolicy.DESTROY,
      cloudwatchLogsExports: ['postgresql', 'upgrade'],
      cloudwatchLogsRetention: logs.RetentionDays.ONE_MONTH,
      enablePerformanceInsights: config.enableDetailedMonitoring,
      performanceInsightRetention: config.enableDetailedMonitoring
        ? rds.PerformanceInsightRetention.DEFAULT
        : undefined,
      monitoringInterval: config.enableDetailedMonitoring
        ? cdk.Duration.seconds(60)
        : cdk.Duration.seconds(0),
    });

    // ElastiCache Subnet Group
    this.cacheSubnetGroup = new elasticache.CfnSubnetGroup(this, 'CacheSubnetGroup', {
      description: 'Subnet group for ElastiCache Redis',
      subnetIds: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }).subnetIds,
      cacheSubnetGroupName: `${config.environment}-redis-subnet-group`,
    });

    // ElastiCache Parameter Group for Redis
    const cacheParameterGroup = new elasticache.CfnParameterGroup(this, 'CacheParameterGroup', {
      cacheParameterGroupFamily: 'redis7',
      description: `Redis parameter group for AI Video SaaS ${config.environment}`,
      properties: {
        'maxmemory-policy': 'allkeys-lru',
        'timeout': '300',
      },
    });

    // ElastiCache Redis Cluster
    this.cacheCluster = new elasticache.CfnCacheCluster(this, 'CacheCluster', {
      cacheNodeType: config.cacheNodeType,
      engine: 'redis',
      engineVersion: '7.0',
      numCacheNodes: config.cacheNumNodes,
      cacheSubnetGroupName: this.cacheSubnetGroup.ref,
      vpcSecurityGroupIds: [cacheSecurityGroup.securityGroupId],
      cacheParameterGroupName: cacheParameterGroup.ref,
      clusterName: `${config.environment}-video-saas-cache`,
      autoMinorVersionUpgrade: true,
      preferredMaintenanceWindow: 'sun:05:00-sun:06:00', // UTC
      snapshotRetentionLimit: config.environment === 'prod' ? 7 : 1,
      snapshotWindow: '02:00-03:00', // UTC
    });

    this.cacheCluster.addDependency(this.cacheSubnetGroup);

    // Store cache endpoint in Secrets Manager
    const cacheSecret = new secretsmanager.Secret(this, 'CacheSecret', {
      secretName: `/${config.environment}/ai-video-saas/cache/endpoint`,
      description: 'ElastiCache Redis endpoint',
      secretStringValue: cdk.SecretValue.unsafePlainText(
        JSON.stringify({
          host: this.cacheCluster.attrRedisEndpointAddress,
          port: this.cacheCluster.attrRedisEndpointPort,
        })
      ),
    });

    // Tags
    Object.entries(config.tags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });

    // Outputs
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.dbInstanceEndpointAddress,
      description: 'RDS database endpoint',
      exportName: `${config.environment}-database-endpoint`,
    });

    new cdk.CfnOutput(this, 'DatabasePort', {
      value: this.database.dbInstanceEndpointPort,
      description: 'RDS database port',
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.databaseSecret.secretArn,
      description: 'Database credentials secret ARN',
      exportName: `${config.environment}-database-secret-arn`,
    });

    new cdk.CfnOutput(this, 'CacheEndpoint', {
      value: this.cacheCluster.attrRedisEndpointAddress,
      description: 'ElastiCache Redis endpoint',
      exportName: `${config.environment}-cache-endpoint`,
    });

    new cdk.CfnOutput(this, 'CachePort', {
      value: this.cacheCluster.attrRedisEndpointPort,
      description: 'ElastiCache Redis port',
    });
  }
}
