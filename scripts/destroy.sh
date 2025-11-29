#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
FORCE=false

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

Destroy AI Video SaaS infrastructure from AWS

OPTIONS:
    -e, --environment ENV    Environment to destroy (dev, staging, prod). Default: dev
    -f, --force              Skip confirmation prompt
    -h, --help               Display this help message

EXAMPLES:
    $0 -e dev
    $0 -e staging --force

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
        -f|--force)
            FORCE=true
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

print_warning "You are about to DESTROY all infrastructure for environment: $ENVIRONMENT"

# Confirm destruction
if [ "$FORCE" = false ]; then
    read -p "Are you absolutely sure? This action cannot be undone. Type '$ENVIRONMENT' to confirm: " -r
    if [[ ! $REPLY = "$ENVIRONMENT" ]]; then
        print_info "Destruction cancelled."
        exit 0
    fi

    if [ "$ENVIRONMENT" = "prod" ]; then
        print_error "Production environment requires extra confirmation!"
        read -p "Type 'DELETE PRODUCTION' to confirm: " -r
        if [[ ! $REPLY = "DELETE PRODUCTION" ]]; then
            print_info "Destruction cancelled."
            exit 0
        fi
    fi
fi

# Change to infrastructure directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")/infrastructure"

if [ ! -d "$INFRA_DIR" ]; then
    print_error "Infrastructure directory not found: $INFRA_DIR"
    exit 1
fi

cd "$INFRA_DIR"

print_info "Destroying infrastructure..."
npx cdk destroy --all \
    --context environment=$ENVIRONMENT \
    --force

print_info "Infrastructure destroyed successfully!"

# Clean up output files
if [ -f "cdk-outputs-$ENVIRONMENT.json" ]; then
    rm "cdk-outputs-$ENVIRONMENT.json"
    print_info "Cleaned up output file"
fi

print_info "Done!"
