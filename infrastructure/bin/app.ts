#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/stacks/network-stack';
import { StorageStack } from '../lib/stacks/storage-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { ComputeStack } from '../lib/stacks/compute-stack';
import { MediaStack } from '../lib/stacks/media-stack';
import { getConfig } from '../lib/config';

const app = new cdk.App();

// Get environment from context or default to 'dev'
const environment = app.node.tryGetContext('environment') || 'dev';
const config = getConfig(environment);

console.log(`Deploying to environment: ${config.environment}`);

// Define stack props
const stackProps: cdk.StackProps = {
  env: {
    account: config.account || process.env.CDK_DEFAULT_ACCOUNT,
    region: config.region || process.env.CDK_DEFAULT_REGION,
  },
  description: `AI Video SaaS Infrastructure - ${config.environment}`,
};

// Network Stack - VPC, Security Groups, etc.
const networkStack = new NetworkStack(app, `AIVideoSaaS-Network-${config.environment}`, {
  ...stackProps,
  config,
});

// Storage Stack - S3 Buckets, CloudFront
const storageStack = new StorageStack(app, `AIVideoSaaS-Storage-${config.environment}`, {
  ...stackProps,
  config,
});

// Database Stack - RDS, ElastiCache
const databaseStack = new DatabaseStack(app, `AIVideoSaaS-Database-${config.environment}`, {
  ...stackProps,
  config,
  vpc: networkStack.vpc,
  databaseSecurityGroup: networkStack.databaseSecurityGroup,
  cacheSecurityGroup: networkStack.cacheSecurityGroup,
});

// Compute Stack - ECS, ALB, ECR
const computeStack = new ComputeStack(app, `AIVideoSaaS-Compute-${config.environment}`, {
  ...stackProps,
  config,
  vpc: networkStack.vpc,
  albSecurityGroup: networkStack.albSecurityGroup,
  ecsSecurityGroup: networkStack.ecsSecurityGroup,
  databaseSecret: databaseStack.databaseSecret,
  videoUploadBucket: storageStack.videoUploadBucket,
  videoProcessedBucket: storageStack.videoProcessedBucket,
  videoThumbnailBucket: storageStack.videoThumbnailBucket,
});

// Media Processing Stack - SQS, SNS, Lambda, MediaConvert
const mediaStack = new MediaStack(app, `AIVideoSaaS-Media-${config.environment}`, {
  ...stackProps,
  config,
  videoUploadBucket: storageStack.videoUploadBucket,
  videoProcessedBucket: storageStack.videoProcessedBucket,
  videoThumbnailBucket: storageStack.videoThumbnailBucket,
});

// Add dependencies
databaseStack.addDependency(networkStack);
computeStack.addDependency(networkStack);
computeStack.addDependency(databaseStack);
computeStack.addDependency(storageStack);
mediaStack.addDependency(storageStack);

// Add tags to all stacks
Object.entries(config.tags).forEach(([key, value]) => {
  cdk.Tags.of(app).add(key, value);
});

app.synth();
