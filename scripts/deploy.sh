#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
AWS_REGION="us-east-1"
SKIP_BOOTSTRAP=false
SKIP_BUILD=false
DRY_RUN=false

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy AI Video SaaS infrastructure to AWS using CDK

OPTIONS:
    -e, --environment ENV    Environment to deploy (dev, staging, prod). Default: dev
    -r, --region REGION      AWS region. Default: us-east-1
    -b, --skip-bootstrap     Skip CDK bootstrap step
    -s, --skip-build         Skip npm install and build step
    -d, --dry-run            Run CDK synth only (don't deploy)
    -h, --help               Display this help message

EXAMPLES:
    $0 -e dev
    $0 -e prod -r us-west-2
    $0 -e staging --skip-bootstrap
    $0 --dry-run

EOF
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            AWS_REGION="$2"
            shift 2
            ;;
        -b|--skip-bootstrap)
            SKIP_BOOTSTRAP=true
            shift
            ;;
        -s|--skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or prod."
    exit 1
fi

print_info "Starting deployment for environment: $ENVIRONMENT in region: $AWS_REGION"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials are not configured. Please run 'aws configure'."
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
print_info "Using AWS Account: $AWS_ACCOUNT_ID"

# Change to infrastructure directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")/infrastructure"

if [ ! -d "$INFRA_DIR" ]; then
    print_error "Infrastructure directory not found: $INFRA_DIR"
    exit 1
fi

cd "$INFRA_DIR"
print_info "Changed to infrastructure directory: $INFRA_DIR"

# Install dependencies and build
if [ "$SKIP_BUILD" = false ]; then
    print_info "Installing dependencies..."
    npm install

    print_info "Building TypeScript..."
    npm run build
else
    print_warning "Skipping build step"
fi

# Bootstrap CDK (if needed)
if [ "$SKIP_BOOTSTRAP" = false ]; then
    print_info "Bootstrapping CDK..."
    npx cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION
else
    print_warning "Skipping bootstrap step"
fi

# Synthesize CloudFormation templates
print_info "Synthesizing CloudFormation templates..."
npx cdk synth --context environment=$ENVIRONMENT

# Deploy or dry run
if [ "$DRY_RUN" = true ]; then
    print_info "Dry run mode - showing diff..."
    npx cdk diff --all --context environment=$ENVIRONMENT
    print_info "Dry run complete. No resources were deployed."
else
    # Production deployment requires confirmation
    if [ "$ENVIRONMENT" = "prod" ]; then
        print_warning "You are about to deploy to PRODUCTION!"
        read -p "Are you sure you want to continue? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            print_info "Deployment cancelled."
            exit 0
        fi
    fi

    print_info "Deploying stacks..."
    npx cdk deploy --all \
        --context environment=$ENVIRONMENT \
        --require-approval never \
        --outputs-file cdk-outputs-$ENVIRONMENT.json

    print_info "Deployment complete!"
    print_info "Outputs saved to: cdk-outputs-$ENVIRONMENT.json"

    # Display important outputs
    if [ -f "cdk-outputs-$ENVIRONMENT.json" ]; then
        print_info "Key outputs:"
        cat "cdk-outputs-$ENVIRONMENT.json"
    fi
fi

print_info "Done!"
