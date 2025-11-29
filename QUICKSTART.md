# Quick Start Guide

Get your AI Video SaaS platform deployed to AWS in minutes.

## Prerequisites Checklist

- [ ] AWS Account with admin access
- [ ] AWS CLI installed and configured
- [ ] Node.js 18+ installed
- [ ] Git installed

## 5-Minute Setup

### Step 1: Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Verify credentials
aws sts get-caller-identity
```

### Step 2: Install Dependencies

```bash
# Install AWS CDK globally
npm install -g aws-cdk

# Verify installation
cdk --version
```

### Step 3: Deploy Infrastructure

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd AI-Video-SaaS

# Deploy to development environment
./scripts/deploy.sh -e dev
```

That's it! The deployment will take about 15-20 minutes.

## What Gets Deployed

| Component | Resource | Purpose |
|-----------|----------|---------|
| **Network** | VPC with 3 subnet types | Isolated network infrastructure |
| **Storage** | 4 S3 buckets + CloudFront | Video storage and delivery |
| **Database** | PostgreSQL + Redis | Data persistence and caching |
| **Compute** | ECS Fargate cluster | Application hosting |
| **Media** | SQS + Lambda | Video processing queue |

## Next Steps

### 1. Get Your Endpoints

```bash
# Retrieve deployment outputs
./scripts/get-outputs.sh -e dev

# Save important values:
# - LoadBalancerDNS: Your application URL
# - CloudFrontDistributionDomain: Your CDN URL
# - DatabaseEndpoint: Your database host
```

### 2. Retrieve Database Credentials

```bash
# Get database password
aws secretsmanager get-secret-value \
  --secret-id /dev/ai-video-saas/database/credentials \
  --query SecretString \
  --output text | jq -r .password
```

### 3. Deploy Your Application

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push your app (example)
docker build -t ai-video-saas-app ./app
docker tag ai-video-saas-app:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-video-saas-app-dev:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-video-saas-app-dev:latest

# Update ECS service
aws ecs update-service \
  --cluster ai-video-saas-dev \
  --service AppService \
  --force-new-deployment
```

## Common Commands

### Deployment

```bash
# Deploy dev
./scripts/deploy.sh -e dev

# Deploy staging
./scripts/deploy.sh -e staging

# Deploy production (requires confirmation)
./scripts/deploy.sh -e prod

# Dry run (no changes)
./scripts/deploy.sh -e dev --dry-run
```

### Monitoring

```bash
# View application logs
aws logs tail /aws/ecs/app --follow --region us-east-1

# View worker logs
aws logs tail /aws/ecs/worker --follow --region us-east-1

# Check ECS service status
aws ecs describe-services \
  --cluster ai-video-saas-dev \
  --services AppService \
  --region us-east-1
```

### Database

```bash
# Connect to database (requires network access)
psql -h <database-endpoint> -U dbadmin -d aivideosaas

# Create backup
aws rds create-db-snapshot \
  --db-instance-identifier <instance-id> \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d)
```

### S3 Operations

```bash
# List buckets
aws s3 ls | grep ai-video-saas

# Upload test video
aws s3 cp test-video.mp4 s3://ai-video-saas-uploads-dev-<account-id>/

# Check bucket contents
aws s3 ls s3://ai-video-saas-uploads-dev-<account-id>/
```

### Queue Management

```bash
# Get queue URL
aws sqs get-queue-url --queue-name dev-video-processing

# Check queue depth
aws sqs get-queue-attributes \
  --queue-url <queue-url> \
  --attribute-names ApproximateNumberOfMessages

# Purge queue (careful!)
aws sqs purge-queue --queue-url <queue-url>
```

## Cleanup

```bash
# Destroy all resources
./scripts/destroy.sh -e dev

# Force destroy (skip confirmation)
./scripts/destroy.sh -e dev --force
```

## Troubleshooting

### Issue: "Need to perform AWS calls for account XXX, but no credentials found"

**Solution:**
```bash
aws configure
# Or set environment variables:
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

### Issue: "Error: This stack uses assets, so the toolkit stack must be deployed"

**Solution:**
```bash
cdk bootstrap aws://<account-id>/<region>
```

### Issue: ECS tasks keep restarting

**Solution:**
```bash
# Check task logs
aws ecs describe-tasks \
  --cluster ai-video-saas-dev \
  --tasks <task-id>

# Common fixes:
# 1. Check environment variables in compute-stack.ts
# 2. Verify database connectivity
# 3. Check IAM permissions
```

### Issue: Cannot connect to database

**Solution:**
```bash
# Verify security group rules allow access
# Check if connecting from within VPC (use bastion or ECS exec)
# Verify credentials from Secrets Manager

# Enable ECS Exec for debugging
aws ecs execute-command \
  --cluster ai-video-saas-dev \
  --task <task-id> \
  --container AppContainer \
  --interactive \
  --command "/bin/bash"
```

## Environment Differences

| Feature | Dev | Staging | Prod |
|---------|-----|---------|------|
| AZs | 2 | 2 | 3 |
| NAT Gateways | 1 | 1 | 3 |
| RDS Instance | t3.medium | t3.large | r5.xlarge |
| RDS Multi-AZ | No | Yes | Yes |
| Cache Nodes | 1 | 2 | 3 |
| Min ECS Tasks | 1 | 2 | 3 |
| Max ECS Tasks | 4 | 8 | 20 |
| Deletion Protection | No | No | Yes |

## Cost Warning

This infrastructure will incur AWS charges. Estimated monthly costs:

- **Dev**: ~$225-305
- **Staging**: ~$600-900
- **Prod**: ~$1,360-2,500+

**Always destroy dev/staging environments when not in use!**

```bash
./scripts/destroy.sh -e dev
```

## Getting Help

1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed documentation
2. Review CloudWatch logs for errors
3. Check AWS Service Health Dashboard
4. Verify IAM permissions
5. Open an issue on GitHub

## Useful AWS Console Links

After deployment, bookmark these:

- **CloudWatch Dashboards**: Monitor metrics
- **ECS Clusters**: View running services
- **RDS Console**: Database monitoring
- **S3 Console**: View uploaded videos
- **CloudFront**: CDN configuration
- **Secrets Manager**: Retrieve credentials
- **SQS Console**: Monitor queues

## Advanced Usage

### Multi-Region Deployment

```bash
# Deploy to us-west-2
./scripts/deploy.sh -e prod -r us-west-2
```

### Custom Configuration

Edit `infrastructure/lib/config.ts`:

```typescript
export const getConfig = (environment: string): EnvironmentConfig => {
  // Customize settings here
  vpcCidr: '10.0.0.0/16',
  databaseInstanceType: 'db.r5.2xlarge',
  // ... more settings
}
```

### CI/CD Integration

See [README.md](README.md#cicd-integration) for GitHub Actions examples.

## Security Checklist

After deployment:

- [ ] Change default admin email in media-stack.ts
- [ ] Configure custom domain with ACM certificate
- [ ] Enable AWS GuardDuty
- [ ] Set up AWS WAF rules
- [ ] Enable VPC Flow Logs
- [ ] Configure AWS Config rules
- [ ] Set up CloudWatch alarms
- [ ] Review IAM permissions
- [ ] Enable MFA for AWS account
- [ ] Rotate database credentials

## Performance Optimization

### Enable Caching

- CloudFront cache policies already configured
- Redis ElastiCache for application caching
- Use intelligent S3 tiering

### Scaling Tips

- Adjust ECS task count in config.ts
- Modify auto-scaling targets
- Use CloudFront for static assets
- Enable RDS read replicas for prod

### Monitoring

- Set up CloudWatch dashboards
- Configure SNS alerts
- Enable X-Ray tracing
- Use AWS Cost Explorer

## Resources

- [Full Documentation](DEPLOYMENT.md)
- [AWS CDK Docs](https://docs.aws.amazon.com/cdk/)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Project README](README.md)

---

**Ready to deploy? Run:**

```bash
./scripts/deploy.sh -e dev
```

Happy deploying! 🚀
