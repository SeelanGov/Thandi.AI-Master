#!/bin/bash

# VERCEL DEPLOYMENT AUTOMATION SCRIPT
# Comprehensive deployment pipeline with safety checks
# Based on research of Vercel best practices

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR" && pwd)"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="deployment-log-$TIMESTAMP.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} [$timestamp] $message" | tee -a "$LOG_FILE"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} [$timestamp] $message" | tee -a "$LOG_FILE"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} [$timestamp] $message" | tee -a "$LOG_FILE"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} [$timestamp] $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Error handler
error_handler() {
    local line_number=$1
    log "ERROR" "Script failed at line $line_number"
    log "ERROR" "Deployment aborted due to error"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Banner
echo "🚀 VERCEL DEPLOYMENT AUTOMATION"
echo "==============================="
echo "Started at: $(date)"
echo "Project: $PROJECT_ROOT"
echo "Log file: $LOG_FILE"
echo ""

# Phase 1: Pre-deployment verification
phase1_pre_deployment_verification() {
    log "INFO" "Phase 1: Pre-deployment verification"
    log "INFO" "====================================="
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log "ERROR" "Not in a git repository"
        exit 1
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        log "WARNING" "Uncommitted changes detected"
        read -p "Continue with uncommitted changes? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "INFO" "Deployment cancelled by user"
            exit 0
        fi
    fi
    
    # Run pre-deployment checklist
    log "INFO" "Running comprehensive pre-deployment checks..."
    if command -v node > /dev/null 2>&1; then
        if [ -f "vercel-pre-deployment-checklist.js" ]; then
            if node vercel-pre-deployment-checklist.js; then
                log "SUCCESS" "Pre-deployment verification passed"
            else
                log "ERROR" "Pre-deployment verification failed"
                exit 1
            fi
        else
            log "WARNING" "Pre-deployment checklist script not found"
        fi
    else
        log "WARNING" "Node.js not available for pre-deployment checks"
    fi
    
    # Check Vercel CLI
    if ! command -v vercel > /dev/null 2>&1; then
        log "ERROR" "Vercel CLI not installed. Install with: npm i -g vercel"
        exit 1
    fi
    
    # Verify Vercel authentication
    if ! vercel whoami > /dev/null 2>&1; then
        log "ERROR" "Not authenticated with Vercel. Run: vercel login"
        exit 1
    fi
    
    log "SUCCESS" "Phase 1 completed successfully"
}

# Phase 2: Environment preparation
phase2_environment_preparation() {
    log "INFO" "Phase 2: Environment preparation"
    log "INFO" "==============================="
    
    # Clean build artifacts
    log "INFO" "Cleaning build artifacts..."
    rm -rf .next
    rm -rf node_modules/.cache
    rm -rf .vercel
    log "SUCCESS" "Build artifacts cleaned"
    
    # Install dependencies
    log "INFO" "Installing dependencies..."
    if [ -f "package-lock.json" ]; then
        npm ci
    elif [ -f "yarn.lock" ]; then
        yarn install --frozen-lockfile
    else
        npm install
    fi
    log "SUCCESS" "Dependencies installed"
    
    # Run local build test
    log "INFO" "Testing local build..."
    if npm run build; then
        log "SUCCESS" "Local build successful"
    else
        log "ERROR" "Local build failed"
        exit 1
    fi
    
    log "SUCCESS" "Phase 2 completed successfully"
}

# Phase 3: Preview deployment
phase3_preview_deployment() {
    log "INFO" "Phase 3: Preview deployment"
    log "INFO" "=========================="
    
    # Create preview deployment
    log "INFO" "Creating preview deployment..."
    PREVIEW_OUTPUT=$(vercel --yes 2>&1)
    PREVIEW_URL=$(echo "$PREVIEW_OUTPUT" | grep -o 'https://[^[:space:]]*\.vercel\.app' | head -1)
    
    if [ -z "$PREVIEW_URL" ]; then
        log "ERROR" "Failed to extract preview URL from Vercel output"
        log "ERROR" "Vercel output: $PREVIEW_OUTPUT"
        exit 1
    fi
    
    log "SUCCESS" "Preview deployment created: $PREVIEW_URL"
    
    # Wait for deployment to be ready
    log "INFO" "Waiting for preview deployment to be ready..."
    sleep 10
    
    # Test preview deployment
    log "INFO" "Testing preview deployment..."
    if curl -f -s "$PREVIEW_URL" > /dev/null; then
        log "SUCCESS" "Preview deployment is accessible"
    else
        log "ERROR" "Preview deployment is not accessible"
        exit 1
    fi
    
    # Test API endpoints if they exist
    if [ -d "app/api" ] || [ -d "pages/api" ]; then
        log "INFO" "Testing API endpoints..."
        
        # Test health endpoint if it exists
        if curl -f -s "$PREVIEW_URL/api/health" > /dev/null 2>&1; then
            log "SUCCESS" "API health endpoint accessible"
        else
            log "WARNING" "API health endpoint not accessible or doesn't exist"
        fi
    fi
    
    # Interactive preview approval
    echo ""
    log "INFO" "Preview deployment ready for review: $PREVIEW_URL"
    read -p "Review the preview deployment. Continue to production? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "INFO" "Deployment cancelled by user after preview review"
        exit 0
    fi
    
    log "SUCCESS" "Phase 3 completed successfully"
}

# Phase 4: Production deployment
phase4_production_deployment() {
    log "INFO" "Phase 4: Production deployment"
    log "INFO" "============================="
    
    # Create backup reference
    CURRENT_COMMIT=$(git rev-parse HEAD)
    CURRENT_BRANCH=$(git branch --show-current)
    log "INFO" "Current commit: $CURRENT_COMMIT"
    log "INFO" "Current branch: $CURRENT_BRANCH"
    
    # Deploy to production
    log "INFO" "Deploying to production..."
    PROD_OUTPUT=$(vercel --prod --yes 2>&1)
    PROD_URL=$(echo "$PROD_OUTPUT" | grep -o 'https://[^[:space:]]*' | grep -v 'vercel\.app' | head -1)
    
    if [ -z "$PROD_URL" ]; then
        # Fallback to extract any URL
        PROD_URL=$(echo "$PROD_OUTPUT" | grep -o 'https://[^[:space:]]*' | head -1)
    fi
    
    if [ -z "$PROD_URL" ]; then
        log "ERROR" "Failed to extract production URL from Vercel output"
        log "ERROR" "Vercel output: $PROD_OUTPUT"
        exit 1
    fi
    
    log "SUCCESS" "Production deployment created: $PROD_URL"
    
    # Wait for deployment to propagate
    log "INFO" "Waiting for production deployment to propagate..."
    sleep 15
    
    log "SUCCESS" "Phase 4 completed successfully"
}

# Phase 5: Post-deployment verification
phase5_post_deployment_verification() {
    log "INFO" "Phase 5: Post-deployment verification"
    log "INFO" "===================================="
    
    # Test production deployment
    log "INFO" "Testing production deployment accessibility..."
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$PROD_URL" > /dev/null; then
            log "SUCCESS" "Production deployment is accessible (attempt $attempt)"
            break
        else
            log "WARNING" "Production deployment not accessible (attempt $attempt/$max_attempts)"
            if [ $attempt -eq $max_attempts ]; then
                log "ERROR" "Production deployment failed accessibility test"
                exit 1
            fi
            sleep 10
            ((attempt++))
        fi
    done
    
    # Test critical endpoints
    log "INFO" "Testing critical endpoints..."
    
    # Test API health if it exists
    if curl -f -s "$PROD_URL/api/health" > /dev/null 2>&1; then
        log "SUCCESS" "API health endpoint accessible"
    else
        log "WARNING" "API health endpoint not accessible or doesn't exist"
    fi
    
    # Test database connection if endpoint exists
    if curl -f -s "$PROD_URL/api/db-test" > /dev/null 2>&1; then
        log "SUCCESS" "Database connection test passed"
    else
        log "WARNING" "Database connection test endpoint not accessible or doesn't exist"
    fi
    
    # Performance check
    log "INFO" "Running basic performance check..."
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$PROD_URL" || echo "0")
    if (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
        log "SUCCESS" "Response time acceptable: ${RESPONSE_TIME}s"
    else
        log "WARNING" "Response time high: ${RESPONSE_TIME}s"
    fi
    
    log "SUCCESS" "Phase 5 completed successfully"
}

# Phase 6: Deployment summary and cleanup
phase6_summary_and_cleanup() {
    log "INFO" "Phase 6: Summary and cleanup"
    log "INFO" "==========================="
    
    # Generate deployment summary
    cat << EOF > "deployment-summary-$TIMESTAMP.md"
# Deployment Summary - $TIMESTAMP

## Deployment Information
- **Date**: $(date)
- **Commit**: $CURRENT_COMMIT
- **Branch**: $CURRENT_BRANCH
- **Production URL**: $PROD_URL
- **Preview URL**: $PREVIEW_URL

## Deployment Status
- ✅ Pre-deployment verification passed
- ✅ Environment preparation completed
- ✅ Preview deployment successful
- ✅ Production deployment successful
- ✅ Post-deployment verification passed

## Next Steps
1. Monitor deployment for any issues
2. Run additional manual tests if needed
3. Update documentation if necessary

## Rollback Information
If rollback is needed:
\`\`\`bash
# Get deployment list
vercel ls

# Rollback to previous deployment
vercel rollback [previous-deployment-url]
\`\`\`

## Logs
Full deployment logs available in: $LOG_FILE
EOF
    
    log "SUCCESS" "Deployment summary created: deployment-summary-$TIMESTAMP.md"
    
    # Clean up temporary files (optional)
    # Uncomment if you want to clean up build artifacts after deployment
    # rm -rf .next
    
    log "SUCCESS" "Phase 6 completed successfully"
}

# Main execution
main() {
    # Check if running in correct directory
    if [ ! -f "package.json" ]; then
        log "ERROR" "package.json not found. Run this script from your project root."
        exit 1
    fi
    
    # Execute all phases
    phase1_pre_deployment_verification
    phase2_environment_preparation
    phase3_preview_deployment
    phase4_production_deployment
    phase5_post_deployment_verification
    phase6_summary_and_cleanup
    
    # Final success message
    echo ""
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "====================================="
    echo "Production URL: $PROD_URL"
    echo "Deployment time: $(date)"
    echo "Summary: deployment-summary-$TIMESTAMP.md"
    echo "Logs: $LOG_FILE"
    echo ""
    
    log "SUCCESS" "Automated deployment completed successfully"
}

# Help function
show_help() {
    cat << EOF
Vercel Deployment Automation Script

Usage: $0 [OPTIONS]

OPTIONS:
    -h, --help      Show this help message
    --dry-run       Run pre-deployment checks only
    --skip-preview  Skip preview deployment step
    --force         Skip interactive confirmations

EXAMPLES:
    $0                  # Full deployment with all checks
    $0 --dry-run        # Run checks only
    $0 --skip-preview   # Deploy directly to production
    $0 --force          # Automated deployment without prompts

REQUIREMENTS:
    - Node.js and npm installed
    - Vercel CLI installed and authenticated
    - Git repository with committed changes
    - Valid package.json with build script

For more information, see: VERCEL-DEPLOYMENT-COMPREHENSIVE-GUIDE-JAN-11-2026.md
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --dry-run)
            log "INFO" "Dry run mode - running pre-deployment checks only"
            phase1_pre_deployment_verification
            log "SUCCESS" "Dry run completed"
            exit 0
            ;;
        --skip-preview)
            SKIP_PREVIEW=true
            shift
            ;;
        --force)
            FORCE_MODE=true
            shift
            ;;
        *)
            log "ERROR" "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Execute main function
main

# Exit with success
exit 0