#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
OUTPUT_FORMAT="json"

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Retrieve outputs from deployed CDK stacks

OPTIONS:
    -e, --environment ENV    Environment (dev, staging, prod). Default: dev
    -f, --format FORMAT      Output format (json, env). Default: json
    -h, --help               Display this help message

EXAMPLES:
    $0 -e dev
    $0 -e prod --format env

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
        -f|--format)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Change to infrastructure directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")/infrastructure"
OUTPUT_FILE="$INFRA_DIR/cdk-outputs-$ENVIRONMENT.json"

if [ ! -f "$OUTPUT_FILE" ]; then
    print_info "Output file not found. Fetching from AWS..."
    cd "$INFRA_DIR"
    npx cdk deploy --all \
        --context environment=$ENVIRONMENT \
        --outputs-file "cdk-outputs-$ENVIRONMENT.json" \
        --require-approval never \
        --no-execute-changeset
fi

if [ "$OUTPUT_FORMAT" = "env" ]; then
    # Convert JSON outputs to environment variables
    print_info "Environment variables:"
    echo ""
    jq -r 'to_entries[] | .value | to_entries[] | "\(.key)=\(.value)"' "$OUTPUT_FILE"
else
    # Display as JSON
    cat "$OUTPUT_FILE" | jq '.'
fi
