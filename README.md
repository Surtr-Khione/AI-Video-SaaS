# AI Video SaaS Platform

A complete AWS infrastructure-as-code solution for deploying a scalable AI-powered video processing SaaS platform.

## Overview

This project provides automated deployment of a production-ready video processing platform on AWS with:

- **Video Upload & Storage**: S3-based storage with intelligent tiering
- **Video Processing**: MediaConvert integration for transcoding
- **AI Analysis**: AWS Rekognition for video content analysis
- **Scalable Compute**: ECS Fargate for containerized applications
- **Content Delivery**: CloudFront CDN for global distribution
- **Database**: RDS PostgreSQL with ElastiCache Redis caching
- **Queue Management**: SQS for asynchronous job processing
- **Monitoring**: CloudWatch dashboards and alarms

## Quick Start

### Prerequisites

- AWS Account with appropriate permissions
- Node.js 18+ installed
- AWS CLI v2+ configured
- AWS CDK installed globally

### Deploy to AWS

```bash
# Deploy development environment
./scripts/deploy.sh -e dev

# Deploy production environment
./scripts/deploy.sh -e prod -r us-east-1
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Architecture

The infrastructure is organized into 5 main stacks:

1. **Network Stack** - VPC, subnets, security groups, NAT gateways
2. **Storage Stack** - S3 buckets, CloudFront distribution
3. **Database Stack** - RDS PostgreSQL, ElastiCache Redis
4. **Compute Stack** - ECS cluster, ALB, auto-scaling
5. **Media Stack** - SQS queues, Lambda functions, MediaConvert

### AWS Services Used

- **Compute**: ECS Fargate, Lambda, EC2 (NAT)
- **Storage**: S3, EFS
- **Database**: RDS PostgreSQL, ElastiCache Redis
- **Networking**: VPC, ALB, CloudFront, Route53
- **Media**: MediaConvert, Rekognition
- **Messaging**: SQS, SNS
- **Security**: Secrets Manager, IAM, Security Groups
- **Monitoring**: CloudWatch, X-Ray

## Project Structure

```
AI-Video-SaaS/
├── infrastructure/           # AWS CDK infrastructure code
│   ├── bin/
│   │   └── app.ts           # CDK app entry point
│   ├── lib/
│   │   ├── config.ts        # Environment configurations
│   │   └── stacks/          # CDK stack definitions
│   │       ├── network-stack.ts
│   │       ├── storage-stack.ts
│   │       ├── database-stack.ts
│   │       ├── compute-stack.ts
│   │       └── media-stack.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── cdk.json
├── scripts/                 # Deployment automation scripts
│   ├── deploy.sh           # Main deployment script
│   ├── destroy.sh          # Cleanup script
│   └── get-outputs.sh      # Retrieve stack outputs
├── DEPLOYMENT.md           # Comprehensive deployment guide
└── README.md               # This file
```

## Features

### Multi-Environment Support

Deploy to development, staging, or production with environment-specific configurations:

```bash
./scripts/deploy.sh -e dev      # Development
./scripts/deploy.sh -e staging  # Staging
./scripts/deploy.sh -e prod     # Production
```

### Auto-Scaling

- CPU-based scaling (70% target)
- Memory-based scaling (80% target)
- Environment-specific min/max capacity

### High Availability

- Multi-AZ deployment for production
- RDS automated backups and snapshots
- ElastiCache Redis clustering
- CloudFront for global content delivery

### Security

- VPC with isolated subnets for databases
- Security groups with least-privilege access
- Encrypted storage (S3, RDS, ElastiCache)
- Secrets Manager for credential management
- VPC endpoints for private AWS service access

### Cost Optimization

- Intelligent S3 tiering and lifecycle policies
- Environment-specific resource sizing
- NAT Gateway optimization (1 for dev, multi-AZ for prod)
- Auto-scaling to match demand

## Configuration

Edit `infrastructure/lib/config.ts` to customize:

- VPC CIDR ranges
- Database instance types and sizes
- ECS task CPU/memory
- Auto-scaling parameters
- S3 lifecycle policies
- Backup retention periods
- Monitoring settings

## Deployment Commands

```bash
# Deploy all stacks
./scripts/deploy.sh -e dev

# Dry run (synthesize only)
./scripts/deploy.sh -e dev --dry-run

# Skip bootstrap
./scripts/deploy.sh -e dev --skip-bootstrap

# Destroy infrastructure
./scripts/destroy.sh -e dev

# Get stack outputs
./scripts/get-outputs.sh -e dev
```

## Monitoring

Access monitoring through:

1. **CloudWatch Dashboards**: ECS, RDS, SQS metrics
2. **CloudWatch Logs**: Application and Lambda logs
3. **CloudWatch Alarms**: Queue depth, DLQ messages
4. **X-Ray**: Distributed tracing (optional)

View logs:
```bash
aws logs tail /aws/ecs/app --follow
```

## Cost Estimation

- **Development**: ~$225-305/month
- **Production**: ~$1,360-2,500+/month (varies with usage)

See [DEPLOYMENT.md](DEPLOYMENT.md#cost-estimation) for detailed breakdown.

## Post-Deployment

After deployment:

1. Retrieve database credentials from Secrets Manager
2. Build and push Docker images to ECR
3. Update ECS services with new images
4. Run database migrations
5. Configure SNS email notifications
6. Update DNS records (if using custom domain)

See [DEPLOYMENT.md](DEPLOYMENT.md#post-deployment) for detailed steps.

## Troubleshooting

Common issues and solutions:

- **Bootstrap required**: Run `cdk bootstrap`
- **ECS tasks not starting**: Check CloudWatch logs and IAM permissions
- **Database connection failed**: Verify security groups and credentials
- **S3 upload failed**: Check CORS configuration and bucket policies

See [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting) for more details.

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [infrastructure/README.md](infrastructure/README.md) - Infrastructure details
- AWS CDK generated docs in `infrastructure/cdk.out/`

## Development

### Local Development Setup

```bash
# Install dependencies
cd infrastructure
npm install

# Build TypeScript
npm run build

# Watch mode
npm run watch

# Synthesize CloudFormation
npm run synth

# View differences
npm run diff
```

### Adding New Stacks

1. Create new stack file in `infrastructure/lib/stacks/`
2. Import and instantiate in `infrastructure/bin/app.ts`
3. Add configuration to `infrastructure/lib/config.ts`
4. Update dependencies if needed

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Deploy
        run: ./scripts/deploy.sh -e prod
```

## Security Best Practices

- [ ] Rotate database credentials regularly
- [ ] Enable AWS GuardDuty for threat detection
- [ ] Configure AWS WAF for ALB protection
- [ ] Enable VPC Flow Logs for network monitoring
- [ ] Use AWS Systems Manager Session Manager instead of bastion hosts
- [ ] Enable AWS Config for compliance monitoring
- [ ] Set up AWS Security Hub for centralized security view

## Maintenance

### Updating Dependencies

```bash
cd infrastructure
npm update
npm audit fix
```

### Database Maintenance

- Automated backups run daily
- Manual snapshots before major changes
- Test restore procedures regularly

### Monitoring Resource Limits

- EC2 instance limits
- VPC limits (subnets, route tables)
- S3 bucket limits
- RDS storage limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in dev environment
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

- Check [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
- Review CloudWatch logs
- Open an issue on GitHub

## Roadmap

- [ ] Add Cognito for user authentication
- [ ] Implement API Gateway for REST API
- [ ] Add Step Functions for workflow orchestration
- [ ] Integrate AWS Transcribe for video transcription
- [ ] Add AWS Translate for multi-language support
- [ ] Implement real-time video streaming with MediaLive
- [ ] Add AWS Elemental MediaPackage for video packaging
- [ ] Integrate AWS SageMaker for custom ML models

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [MediaConvert Documentation](https://docs.aws.amazon.com/mediaconvert/)
- [Rekognition Documentation](https://docs.aws.amazon.com/rekognition/)
