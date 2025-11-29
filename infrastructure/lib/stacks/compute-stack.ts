import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config';

export interface ComputeStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
  vpc: ec2.Vpc;
  albSecurityGroup: ec2.SecurityGroup;
  ecsSecurityGroup: ec2.SecurityGroup;
  databaseSecret: secretsmanager.ISecret;
  videoUploadBucket: s3.Bucket;
  videoProcessedBucket: s3.Bucket;
  videoThumbnailBucket: s3.Bucket;
}

export class ComputeStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;
  public readonly appService: ecs.FargateService;
  public readonly workerService: ecs.FargateService;
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
  public readonly appRepository: ecr.Repository;
  public readonly workerRepository: ecr.Repository;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const {
      config,
      vpc,
      albSecurityGroup,
      ecsSecurityGroup,
      databaseSecret,
      videoUploadBucket,
      videoProcessedBucket,
      videoThumbnailBucket,
    } = props;

    // ECR Repositories
    this.appRepository = new ecr.Repository(this, 'AppRepository', {
      repositoryName: `ai-video-saas-app-${config.environment}`,
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.MUTABLE,
      lifecycleRules: [
        {
          description: 'Keep last 10 images',
          maxImageCount: 10,
        },
      ],
      removalPolicy: config.environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    this.workerRepository = new ecr.Repository(this, 'WorkerRepository', {
      repositoryName: `ai-video-saas-worker-${config.environment}`,
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.MUTABLE,
      lifecycleRules: [
        {
          description: 'Keep last 10 images',
          maxImageCount: 10,
        },
      ],
      removalPolicy: config.environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    // ECS Cluster
    this.cluster = new ecs.Cluster(this, 'Cluster', {
      clusterName: `ai-video-saas-${config.environment}`,
      vpc,
      containerInsights: config.enableDetailedMonitoring,
    });

    // Application Load Balancer
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      deletionProtection: config.environment === 'prod',
    });

    // Target Group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'AppTargetGroup', {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
      deregistrationDelay: cdk.Duration.seconds(30),
    });

    // HTTP Listener
    const httpListener = this.loadBalancer.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultAction: elbv2.ListenerAction.fixedResponse(200, {
        contentType: 'text/plain',
        messageBody: 'OK',
      }),
    });

    httpListener.addTargetGroups('AppTargetGroup', {
      targetGroups: [targetGroup],
    });

    // Task Execution Role
    const taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    databaseSecret.grantRead(taskExecutionRole);

    // Task Role for App
    const appTaskRole = new iam.Role(this, 'AppTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    videoUploadBucket.grantReadWrite(appTaskRole);
    videoProcessedBucket.grantReadWrite(appTaskRole);
    videoThumbnailBucket.grantReadWrite(appTaskRole);
    databaseSecret.grantRead(appTaskRole);

    // Task Definition for App
    const appTaskDefinition = new ecs.FargateTaskDefinition(this, 'AppTaskDefinition', {
      cpu: config.ecsTaskCpu,
      memoryLimitMiB: config.ecsTaskMemory,
      executionRole: taskExecutionRole,
      taskRole: appTaskRole,
    });

    // App Container
    const appContainer = appTaskDefinition.addContainer('AppContainer', {
      image: ecs.ContainerImage.fromRegistry('nginx:latest'), // Placeholder
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'app',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        NODE_ENV: config.environment,
        AWS_REGION: config.region,
        UPLOAD_BUCKET: videoUploadBucket.bucketName,
        PROCESSED_BUCKET: videoProcessedBucket.bucketName,
        THUMBNAIL_BUCKET: videoThumbnailBucket.bucketName,
      },
      secrets: {
        DB_SECRET: ecs.Secret.fromSecretsManager(databaseSecret),
      },
    });

    appContainer.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    });

    // App Service
    this.appService = new ecs.FargateService(this, 'AppService', {
      cluster: this.cluster,
      taskDefinition: appTaskDefinition,
      desiredCount: config.ecsDesiredCount,
      securityGroups: [ecsSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      assignPublicIp: false,
      enableExecuteCommand: config.environment !== 'prod',
      circuitBreaker: {
        rollback: true,
      },
    });

    this.appService.attachToApplicationTargetGroup(targetGroup);

    // Auto Scaling
    const appScaling = this.appService.autoScaleTaskCount({
      minCapacity: config.ecsMinCapacity,
      maxCapacity: config.ecsMaxCapacity,
    });

    appScaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    appScaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 80,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Worker Task Role
    const workerTaskRole = new iam.Role(this, 'WorkerTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    videoUploadBucket.grantRead(workerTaskRole);
    videoProcessedBucket.grantWrite(workerTaskRole);
    videoThumbnailBucket.grantWrite(workerTaskRole);
    databaseSecret.grantRead(workerTaskRole);

    // Grant MediaConvert permissions
    workerTaskRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'mediaconvert:*',
        'rekognition:*',
        'sqs:*',
      ],
      resources: ['*'],
    }));

    // Worker Task Definition
    const workerTaskDefinition = new ecs.FargateTaskDefinition(this, 'WorkerTaskDefinition', {
      cpu: config.ecsTaskCpu * 2,
      memoryLimitMiB: config.ecsTaskMemory * 2,
      executionRole: taskExecutionRole,
      taskRole: workerTaskRole,
    });

    // Worker Container
    workerTaskDefinition.addContainer('WorkerContainer', {
      image: ecs.ContainerImage.fromRegistry('nginx:latest'), // Placeholder
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'worker',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        NODE_ENV: config.environment,
        AWS_REGION: config.region,
        UPLOAD_BUCKET: videoUploadBucket.bucketName,
        PROCESSED_BUCKET: videoProcessedBucket.bucketName,
        THUMBNAIL_BUCKET: videoThumbnailBucket.bucketName,
      },
      secrets: {
        DB_SECRET: ecs.Secret.fromSecretsManager(databaseSecret),
      },
    });

    // Worker Service
    this.workerService = new ecs.FargateService(this, 'WorkerService', {
      cluster: this.cluster,
      taskDefinition: workerTaskDefinition,
      desiredCount: config.ecsDesiredCount,
      securityGroups: [ecsSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      assignPublicIp: false,
      enableExecuteCommand: config.environment !== 'prod',
      circuitBreaker: {
        rollback: true,
      },
    });

    // Worker Auto Scaling
    const workerScaling = this.workerService.autoScaleTaskCount({
      minCapacity: config.ecsMinCapacity,
      maxCapacity: config.ecsMaxCapacity,
    });

    workerScaling.scaleOnCpuUtilization('WorkerCpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Tags
    Object.entries(config.tags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });

    // Outputs
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: this.loadBalancer.loadBalancerDnsName,
      description: 'Application Load Balancer DNS',
      exportName: `${config.environment}-alb-dns`,
    });

    new cdk.CfnOutput(this, 'AppRepositoryUri', {
      value: this.appRepository.repositoryUri,
      description: 'App ECR Repository URI',
    });

    new cdk.CfnOutput(this, 'WorkerRepositoryUri', {
      value: this.workerRepository.repositoryUri,
      description: 'Worker ECR Repository URI',
    });

    new cdk.CfnOutput(this, 'ClusterName', {
      value: this.cluster.clusterName,
      description: 'ECS Cluster Name',
      exportName: `${config.environment}-ecs-cluster`,
    });
  }
}
