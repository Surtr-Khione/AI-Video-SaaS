export interface EnvironmentConfig {
  environment: string;
  region: string;
  account?: string;

  // VPC Configuration
  vpcCidr: string;
  maxAzs: number;

  // Database Configuration
  databaseInstanceType: string;
  databaseAllocatedStorage: number;
  databaseBackupRetention: number;
  databaseMultiAz: boolean;

  // Cache Configuration
  cacheNodeType: string;
  cacheNumNodes: number;

  // ECS Configuration
  ecsTaskCpu: number;
  ecsTaskMemory: number;
  ecsDesiredCount: number;
  ecsMinCapacity: number;
  ecsMaxCapacity: number;

  // Storage Configuration
  enableS3Versioning: boolean;
  s3TransitionToIA: number; // days
  s3TransitionToGlacier: number; // days
  s3ExpirationDays: number;

  // Application Configuration
  domainName?: string;
  certificateArn?: string;

  // Monitoring
  enableDetailedMonitoring: boolean;
  logRetentionDays: number;

  // Tags
  tags: { [key: string]: string };
}

export const getConfig = (environment: string = 'dev'): EnvironmentConfig => {
  const configs: { [key: string]: EnvironmentConfig } = {
    dev: {
      environment: 'dev',
      region: 'us-east-1',

      vpcCidr: '10.0.0.0/16',
      maxAzs: 2,

      databaseInstanceType: 'db.t3.medium',
      databaseAllocatedStorage: 100,
      databaseBackupRetention: 7,
      databaseMultiAz: false,

      cacheNodeType: 'cache.t3.micro',
      cacheNumNodes: 1,

      ecsTaskCpu: 512,
      ecsTaskMemory: 1024,
      ecsDesiredCount: 1,
      ecsMinCapacity: 1,
      ecsMaxCapacity: 4,

      enableS3Versioning: true,
      s3TransitionToIA: 30,
      s3TransitionToGlacier: 90,
      s3ExpirationDays: 365,

      enableDetailedMonitoring: false,
      logRetentionDays: 7,

      tags: {
        Environment: 'dev',
        Project: 'AI-Video-SaaS',
        ManagedBy: 'CDK'
      }
    },

    staging: {
      environment: 'staging',
      region: 'us-east-1',

      vpcCidr: '10.1.0.0/16',
      maxAzs: 2,

      databaseInstanceType: 'db.t3.large',
      databaseAllocatedStorage: 200,
      databaseBackupRetention: 14,
      databaseMultiAz: true,

      cacheNodeType: 'cache.t3.small',
      cacheNumNodes: 2,

      ecsTaskCpu: 1024,
      ecsTaskMemory: 2048,
      ecsDesiredCount: 2,
      ecsMinCapacity: 2,
      ecsMaxCapacity: 8,

      enableS3Versioning: true,
      s3TransitionToIA: 30,
      s3TransitionToGlacier: 90,
      s3ExpirationDays: 730,

      enableDetailedMonitoring: true,
      logRetentionDays: 14,

      tags: {
        Environment: 'staging',
        Project: 'AI-Video-SaaS',
        ManagedBy: 'CDK'
      }
    },

    prod: {
      environment: 'prod',
      region: 'us-east-1',

      vpcCidr: '10.2.0.0/16',
      maxAzs: 3,

      databaseInstanceType: 'db.r5.xlarge',
      databaseAllocatedStorage: 500,
      databaseBackupRetention: 30,
      databaseMultiAz: true,

      cacheNodeType: 'cache.r5.large',
      cacheNumNodes: 3,

      ecsTaskCpu: 2048,
      ecsTaskMemory: 4096,
      ecsDesiredCount: 3,
      ecsMinCapacity: 3,
      ecsMaxCapacity: 20,

      enableS3Versioning: true,
      s3TransitionToIA: 30,
      s3TransitionToGlacier: 90,
      s3ExpirationDays: 2555, // 7 years

      enableDetailedMonitoring: true,
      logRetentionDays: 30,

      tags: {
        Environment: 'prod',
        Project: 'AI-Video-SaaS',
        ManagedBy: 'CDK'
      }
    }
  };

  return configs[environment] || configs.dev;
};
