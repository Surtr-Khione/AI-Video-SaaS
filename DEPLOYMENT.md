# AI Video SaaS - AWS Deployment Guide

This guide provides comprehensive instructions for deploying the AI Video SaaS infrastructure to AWS using AWS CDK.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Infrastructure Components](#infrastructure-components)
- [Deployment Steps](#deployment-steps)
- [Configuration](#configuration)
- [Post-Deployment](#post-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)
- [Cost Estimation](#cost-estimation)

## Architecture Overview

The infrastructure consists of the following stacks:

1. **Network Stack**: VPC, subnets, security groups, VPC endpoints
2. **Storage Stack**: S3 buckets for videos, CloudFront CDN
3. **Database Stack**: RDS PostgreSQL, ElastiCache Redis
4. **Compute Stack**: ECS Fargate, Application Load Balancer, ECR repositories
5. **Media Stack**: SQS queues, SNS topics, Lambda functions, MediaConvert integration

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CloudFront CDN                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                     Application Load Balancer                   │
│                         (Public Subnets)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴───────────┐
                │                        │
        ┌───────▼────────┐      ┌───────▼────────┐
        │   ECS App      │      │  ECS Worker    │
        │   Service      │      │   Service      │
        │ (Private)      │      │  (Private)     │
        └───────┬────────┘      └───────┬────────┘
                │                       │
        ┌───────┴───────────────────────┴────────┐
        │                                        │
    ┌───▼────┐  ┌─────────┐  ┌──────────┐  ┌───▼────┐
    │  RDS   │  │  Redis  │  │    S3    │  │  SQS   │
    │  DB    │  │  Cache  │  │ Buckets  │  │ Queues │
    └────────┘  └─────────┘  └──────────┘  └────────┘
         (Isolated)  (Private)     (Private)   (Private)
```

## Prerequisites

### Required Tools

1. **Node.js** (v18 or later)
   ```bash
   node --version
   ```

2. **AWS CLI** (v2 or later)
   ```bash
   aws --version
   ```

3. **AWS CDK**
   ```bash
   npm install -g aws-cdk
   cdk --version
   ```

4. **TypeScript**
   ```bash
   npm install -g typescript
   ```

### AWS Account Setup

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **AWS Credentials**: Configure AWS credentials
   ```bash
   aws configure
   ```

   Or set environment variables:
   ```bash
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_DEFAULT_REGION=us-east-1
   ```

3. **Required IAM Permissions**:
   - EC2, VPC, ECS, ECR
   - RDS, ElastiCache
   - S3, CloudFront
   - IAM roles and policies
   - Lambda, SQS, SNS
   - MediaConvert, Rekognition
   - CloudFormation
   - Secrets Manager

## Quick Start

### Deploy Development Environment

```bash
# 1. Navigate to the project root
cd AI-Video-SaaS

# 2. Run the deployment script
./scripts/deploy.sh -e dev

# This will:
# - Install dependencies
# - Bootstrap CDK
# - Deploy all stacks to the dev environment
```

### Deploy Production Environment

```bash
./scripts/deploy.sh -e prod -r us-east-1
```

## Infrastructure Components

### Network Stack

- **VPC**: /16 CIDR with public, private, and isolated subnets
- **NAT Gateways**: 1 for dev, multi-AZ for prod
- **Security Groups**: ALB, ECS, RDS, ElastiCache
- **VPC Endpoints**: S3, DynamoDB, ECR, Secrets Manager, CloudWatch

### Storage Stack

- **S3 Buckets**:
  - `ai-video-saas-uploads-{env}`: Raw video uploads
  - `ai-video-saas-processed-{env}`: Processed videos
  - `ai-video-saas-thumbnails-{env}`: Video thumbnails
  - `ai-video-saas-assets-{env}`: Static assets
  - `ai-video-saas-logs-{env}`: Access logs

- **CloudFront**: CDN for content delivery
- **Lifecycle Policies**: Intelligent tiering and archival

### Database Stack

- **RDS PostgreSQL 15.4**:
  - Multi-AZ in staging/prod
  - Automated backups (7-30 days retention)
  - Performance Insights enabled
  - Encrypted at rest

- **ElastiCache Redis 7.0**:
  - Cluster mode for high availability
  - Automatic snapshots
  - In-transit encryption

### Compute Stack

- **ECS Cluster**: Fargate for serverless containers
- **ECR Repositories**: For app and worker images
- **Application Load Balancer**:
  - HTTP/HTTPS listeners
  - Health checks
  - Target groups

- **Auto Scaling**:
  - CPU-based (70% target)
  - Memory-based (80% target)
  - Min/max capacity based on environment

### Media Stack

- **SQS Queues**:
  - Video processing queue
  - AI analysis queue
  - Dead letter queues

- **Lambda Functions**:
  - Metadata extraction
  - Video preprocessing

- **SNS Topics**: Notifications and alerts
- **MediaConvert Role**: For video transcoding
- **CloudWatch Alarms**: Queue depth monitoring

## Deployment Steps

### Step 1: Install Dependencies

```bash
cd infrastructure
npm install
```

### Step 2: Configure Environment

Edit `infrastructure/lib/config.ts` to customize settings for your environment:

```typescript
// Modify configuration values
vpcCidr: '10.0.0.0/16',
databaseInstanceType: 'db.t3.medium',
// ... other settings
```

### Step 3: Bootstrap CDK

Required only once per AWS account and region:

```bash
cdk bootstrap aws://ACCOUNT_ID/REGION
```

Or use the script:

```bash
./scripts/deploy.sh -e dev  # Bootstrap is included
```

### Step 4: Review Changes

```bash
cd infrastructure
cdk diff --context environment=dev
```

### Step 5: Deploy

**Development:**
```bash
./scripts/deploy.sh -e dev
```

**Staging:**
```bash
./scripts/deploy.sh -e staging
```

**Production:**
```bash
./scripts/deploy.sh -e prod
```

### Step 6: Verify Deployment

```bash
# Get stack outputs
./scripts/get-outputs.sh -e dev

# Check deployed resources
aws cloudformation list-stacks --region us-east-1
```

## Configuration

### Environment Variables

The deployment uses environment-specific configurations:

| Variable | Dev | Staging | Prod |
|----------|-----|---------|------|
| VPC AZs | 2 | 2 | 3 |
| RDS Instance | t3.medium | t3.large | r5.xlarge |
| RDS Multi-AZ | No | Yes | Yes |
| Cache Nodes | 1 | 2 | 3 |
| ECS Tasks (min) | 1 | 2 | 3 |
| ECS Tasks (max) | 4 | 8 | 20 |

### Custom Domain

To use a custom domain:

1. Update `infrastructure/lib/config.ts`:
   ```typescript
   domainName: 'video.yourdomain.com',
   certificateArn: 'arn:aws:acm:...',
   ```

2. Create ACM certificate in us-east-1 (for CloudFront)
3. Update Route53 DNS records

## Post-Deployment

### 1. Retrieve Database Credentials

```bash
aws secretsmanager get-secret-value \
  --secret-id /dev/ai-video-saas/database/credentials \
  --region us-east-1 \
  --query SecretString \
  --output text
```

### 2. Build and Push Docker Images

```bash
# Get ECR login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push app image
docker build -t ai-video-saas-app:latest ./app
docker tag ai-video-saas-app:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-video-saas-app-dev:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-video-saas-app-dev:latest

# Build and push worker image
docker build -t ai-video-saas-worker:latest ./worker
docker tag ai-video-saas-worker:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-video-saas-worker-dev:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-video-saas-worker-dev:latest
```

### 3. Update ECS Services

```bash
aws ecs update-service \
  --cluster ai-video-saas-dev \
  --service AppService \
  --force-new-deployment \
  --region us-east-1
```

### 4. Run Database Migrations

```bash
# Connect to database via ECS Exec or bastion host
# Run migrations from your application
```

### 5. Configure SNS Email Subscription

```bash
# Update email in infrastructure/lib/stacks/media-stack.ts
# Then redeploy or subscribe manually:
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:dev-video-notifications \
  --protocol email \
  --notification-endpoint your-email@example.com
```

## Monitoring and Maintenance

### CloudWatch Dashboards

Access CloudWatch dashboard:
```bash
aws cloudwatch list-dashboards --region us-east-1
```

### Key Metrics to Monitor

1. **ECS Services**:
   - CPU/Memory utilization
   - Task count
   - Service health

2. **RDS**:
   - CPU, connections, IOPS
   - Replication lag (Multi-AZ)
   - Storage space

3. **SQS**:
   - Messages in queue
   - Message age
   - DLQ messages

4. **S3**:
   - Request count
   - Data transfer
   - 4xx/5xx errors

### Logs

```bash
# View ECS logs
aws logs tail /aws/ecs/app --follow

# View Lambda logs
aws logs tail /aws/lambda/dev-video-metadata-extraction --follow
```

### Backups

- **RDS**: Automated daily backups (retention: 7-30 days)
- **ElastiCache**: Daily snapshots (retention: 1-7 days)
- **S3**: Versioning enabled, lifecycle policies

## Troubleshooting

### Common Issues

#### 1. Deployment Fails - Bootstrap Required

```bash
Error: Need to perform AWS calls for account XXX, but no credentials found
```

**Solution:**
```bash
cdk bootstrap aws://ACCOUNT_ID/REGION
```

#### 2. S3 Bucket Already Exists

```bash
Error: Bucket already exists
```

**Solution:** Bucket names include account ID. If error persists, delete existing bucket or modify bucket name.

#### 3. ECS Task Fails to Start

Check logs:
```bash
aws ecs describe-tasks \
  --cluster ai-video-saas-dev \
  --tasks TASK_ID \
  --region us-east-1
```

Common causes:
- Missing environment variables
- Incorrect IAM permissions
- Image pull errors

#### 4. Database Connection Issues

Verify:
- Security group rules
- Secrets Manager credentials
- RDS instance status
- Network connectivity from ECS

### Debug Mode

Enable debug logging:
```bash
export DEBUG=true
./scripts/deploy.sh -e dev
```

## Cost Estimation

### Monthly Cost Estimates (USD)

**Development Environment:**
- VPC & NAT Gateway: ~$45
- RDS (t3.medium): ~$70
- ElastiCache (t3.micro): ~$15
- ECS Fargate (2 tasks): ~$50
- S3 & Data Transfer: ~$20-100 (usage-based)
- ALB: ~$25
- **Total: ~$225-305/month**

**Production Environment:**
- VPC & NAT Gateways (3 AZs): ~$135
- RDS (r5.xlarge, Multi-AZ): ~$600
- ElastiCache (r5.large, 3 nodes): ~$300
- ECS Fargate (6+ tasks): ~$150-500
- S3 & Data Transfer: ~$100-500+ (usage-based)
- CloudFront: ~$50-200+ (usage-based)
- ALB: ~$25
- MediaConvert: ~$0.015/min of video (usage-based)
- Rekognition: ~$0.10/min of video (usage-based)
- **Total: ~$1,360-2,500+/month**

### Cost Optimization Tips

1. **Use Reserved Instances** for RDS and ElastiCache (30-60% savings)
2. **S3 Intelligent Tiering** for automatic cost optimization
3. **CloudFront** with optimized caching policies
4. **Auto Scaling** to match demand
5. **Spot Instances** for non-critical worker tasks
6. **S3 Lifecycle Policies** to archive old content
7. **CloudWatch Logs** retention policies

## Cleanup

### Destroy Infrastructure

**Warning:** This will delete all resources!

```bash
# Development
./scripts/destroy.sh -e dev

# With confirmation
./scripts/destroy.sh -e prod

# Force (skip confirmation)
./scripts/destroy.sh -e dev --force
```

### Manual Cleanup

Some resources may need manual deletion:

1. **S3 Buckets**: Empty buckets if deletion fails
   ```bash
   aws s3 rm s3://bucket-name --recursive
   ```

2. **ECR Images**: Delete old images
   ```bash
   aws ecr batch-delete-image --repository-name repo-name --image-ids imageTag=tag
   ```

3. **Secrets Manager**: Secrets have recovery period
   ```bash
   aws secretsmanager delete-secret --secret-id secret-name --force-delete-without-recovery
   ```

## Support and Contributing

For issues, questions, or contributions:

1. Check the troubleshooting section
2. Review CloudWatch logs
3. Open an issue on GitHub
4. Contact the DevOps team

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [MediaConvert Documentation](https://docs.aws.amazon.com/mediaconvert/)
- [Rekognition Documentation](https://docs.aws.amazon.com/rekognition/)

## License

MIT License - See LICENSE file for details
