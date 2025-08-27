#!/bin/bash

# Deployment script for Praxiio
# Author: prxiio
# Last Updated: 2025-08-27 13:06:11

set -e

# Configuration
DEPLOY_ENV=${ENVIRONMENT:-production}
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
DEPLOYER=${DEPLOYER:-prxiio}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Starting deployment process..."
echo "Environment: $DEPLOY_ENV"
echo "Timestamp: $TIMESTAMP"
echo "Deployer: $DEPLOYER"

# Build verification
verify_build() {
    echo -e "${YELLOW}Verifying build...${NC}"
    if [ ! -d "dist" ]; then
        echo -e "${RED}Build directory not found!${NC}"
        exit 1
    fi
}

# Database migrations
run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    npm run migrate
}

# Deploy application
deploy_application() {
    echo -e "${YELLOW}Deploying application...${NC}"
    
    # Backup current version
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_dir="backups/$timestamp"
    mkdir -p $backup_dir
    
    # Deploy new version
    rsync -azP --delete dist/ /var/www/praxiio/
    
    echo -e "${GREEN}Deployment completed successfully!${NC}"
}

# Main deployment flow
main() {
    verify_build
    run_migrations
    deploy_application
    
    # Record deployment
    echo "$TIMESTAMP - Deployment completed by $DEPLOYER" >> deploy.log
}

main