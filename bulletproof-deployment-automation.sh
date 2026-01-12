#!/bin/bash

# BULLETPROOF VERCEL DEPLOYMENT AUTOMATION
# Complete deployment pipeline with validation, monitoring, and rollback
# 
# Usage:
#   ./bulletproof-deployment-automation.sh --full-deploy
#   ./bulletproof-deployment-automation.sh --validate-only
#   ./bulletproof-deployment-automation.sh --deploy-with-monitoring
#   ./bulletproof-deployment-automation.sh --emergency-rollback

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="deployment-$(date +%Y%m%d-%H%M%S).log"
BACKUP_DIR="deployment-backups"
MAX_RETRIES=3
HEALTH_CHECK_TIMEOUT=30
MONITORING_DURATION=300

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

# Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Script failed at line $line_number with exit code $exit_code"
    
    # Attempt emergency rollback if deployment was in progress
    if [[ -f ".deployment-in-progress" ]]; then
        log_warning "Deployment was in progress, attempting emergency rollback..."
        emergency_rollback
    fi
    
    cleanup
    exit $exit_code
}

trap 'handle_error $LINENO' ERR

# Cleanup function
cleanup() {
    log "Cleaning up temporary files..."
    rm -f .deployment-in-progress
    rm -f .validation-passed
}

# ============================================================================
# PRE-DEPLOYMENT VALIDATION
# ============================================================================

validate_environment() {
    log "🔍 Validating deployment environment..."
    
    # Check required tools
    local required_tools=("node" "npm" "vercel" "git")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is not installed or not in PATH"
            return 1
        fi
    done
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $node_version -lt 16 ]]; then
        log_error "Node.js version 16 or higher required (current: $(node --version))"
        return 1
    fi
    
    # Check if logged into Vercel
    if ! vercel whoami &> /dev/null; then
        log_error "Not logged into Vercel. Run 'vercel login' first."
        return 1
    fi
    
    # Check git status
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "Working directory has uncommitted changes"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Deployment cancelled by user"
            return 1
        fi
    fi
    
    log_success "Environment validation passed"
    return 0
}

validate_project_structure() {
    log "🏗️  Validating project structure..."
    
    # Check for package.json
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found"
        return 1
    fi
    
    # Check for Next.js
    if ! grep -q '"next"' package.json; then
        log_error "Next.js not found in package.json"
        return 1
    fi
    
    # Check for build script
    if ! grep -q '"build"' package.json; then
        log_error "Build script not found in package.json"
        return 1
    fi
    
    # Check for app or pages directory
    if [[ ! -d "app" && ! -d "pages" ]]; then
        log_error "Neither app/ nor pages/ directory found"
        return 1
    fi
    
    # Check for problematic files
    local problematic_files=(".next" "node_modules" ".vercel")
    for file in "${problematic_files[@]}"; do
        if [[ -d "$file" && -n $(git ls-files "$file" 2>/dev/null) ]]; then
            log_warning "$file directory is tracked by git (should be in .gitignore)"
        fi
    done
    
    log_success "Project structure validation passed"
    return 0
}

validate_dependencies() {
    log "📦 Validating dependencies..."
    
    # Install dependencies if node_modules doesn't exist
    if [[ ! -d "node_modules" ]]; then
        log "Installing dependencies..."
        npm ci
    fi
    
    # Run security audit
    log "Running security audit..."
    if ! npm audit --audit-level moderate; then
        log_error "Security vulnerabilities found"
        return 1
    fi
    
    # Check for outdated dependencies (warning only)
    log "Checking for outdated dependencies..."
    if npm outdated; then
        log_warning "Some dependencies are outdated (not blocking deployment)"
    fi
    
    log_success "Dependencies validation passed"
    return 0
}

validate_build() {
    log "🔨 Validating build process..."
    
    # Clean previous build
    if [[ -d ".next" ]]; then
        log "Cleaning previous build..."
        rm -rf .next
    fi
    
    # Run build
    log "Running build..."
    if ! npm run build; then
        log_error "Build failed"
        return 1
    fi
    
    # Verify build output
    if [[ ! -d ".next" ]]; then
        log_error "Build output (.next directory) not found"
        return 1
    fi
    
    # Check for build artifacts
    local required_files=(".next/BUILD_ID" ".next/static")
    for file in "${required_files[@]}"; do
        if [[ ! -e "$file" ]]; then
            log_error "Required build file not found: $file"
            return 1
        fi
    done
    
    log_success "Build validation passed"
    return 0
}

validate_environment_variables() {
    log "🔧 Validating environment variables..."
    
    # Check local environment file
    if [[ ! -f ".env.local" ]]; then
        log_warning ".env.local file not found"
    fi
    
    # Check Vercel environment variables
    log "Checking Vercel environment variables..."
    if ! vercel env ls > /dev/null; then
        log_error "Failed to fetch Vercel environment variables"
        return 1
    fi
    
    # Validate common required variables
    local env_check_result=0
    local required_vars=("DATABASE_URL" "NEXT_PUBLIC_SUPABASE_URL")
    
    for var in "${required_vars[@]}"; do
        if ! vercel env ls | grep -q "$var"; then
            log_warning "Environment variable $var not found in Vercel"
            env_check_result=1
        fi
    done
    
    if [[ $env_check_result -eq 1 ]]; then
        log_warning "Some environment variables may be missing"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Deployment cancelled by user"
            return 1
        fi
    fi
    
    log_success "Environment variables validation passed"
    return 0
}

run_comprehensive_validation() {
    log "🔍 STARTING COMPREHENSIVE VALIDATION"
    log "===================================="
    
    local validation_steps=(
        "validate_environment"
        "validate_project_structure" 
        "validate_dependencies"
        "validate_build"
        "validate_environment_variables"
    )
    
    for step in "${validation_steps[@]}"; do
        if ! $step; then
            log_error "Validation failed at step: $step"
            return 1
        fi
    done
    
    # Mark validation as passed
    touch .validation-passed
    
    log_success "ALL VALIDATIONS PASSED - READY FOR DEPLOYMENT"
    return 0
}

# ============================================================================
# BACKUP & RECOVERY
# ============================================================================

create_deployment_backup() {
    log "💾 Creating deployment backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Get current deployment info
    local current_deployment=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "unknown")
    local backup_timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_file="$BACKUP_DIR/backup-$backup_timestamp.json"
    
    # Create backup record
    cat > "$backup_file" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "current_deployment": "$current_deployment",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
    "reason": "Pre-deployment backup"
}
EOF
    
    log_success "Backup created: $backup_file"
    echo "$backup_file"
}

# ============================================================================
# DEPLOYMENT EXECUTION
# ============================================================================

execute_deployment() {
    log "🚀 EXECUTING VERCEL DEPLOYMENT"
    log "=============================="
    
    # Mark deployment as in progress
    touch .deployment-in-progress
    
    # Create backup
    local backup_file=$(create_deployment_backup)
    
    # Execute deployment with timeout
    log "Deploying to Vercel..."
    local deployment_start=$(date +%s)
    
    if timeout 600 vercel --prod --json > deployment-result.json; then
        local deployment_end=$(date +%s)
        local deployment_duration=$((deployment_end - deployment_start))
        
        # Extract deployment URL
        local deployment_url=$(jq -r '.url' deployment-result.json 2>/dev/null || echo "")
        
        if [[ -z "$deployment_url" ]]; then
            log_error "Failed to extract deployment URL from result"
            return 1
        fi
        
        log_success "Deployment completed in ${deployment_duration}s"
        log_success "Deployment URL: $deployment_url"
        
        # Store deployment info
        echo "$deployment_url" > .current-deployment-url
        
        return 0
    else
        log_error "Deployment failed or timed out"
        return 1
    fi
}

# ============================================================================
# HEALTH CHECKS & MONITORING
# ============================================================================

perform_health_checks() {
    local deployment_url="$1"
    log "🏥 Performing health checks on: $deployment_url"
    
    local max_attempts=10
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Health check attempt $attempt/$max_attempts..."
        
        # Basic connectivity check
        if curl -s --max-time $HEALTH_CHECK_TIMEOUT "$deployment_url" > /dev/null; then
            log_success "Deployment is responding"
            
            # Check for application errors
            local response=$(curl -s --max-time $HEALTH_CHECK_TIMEOUT "$deployment_url")
            if echo "$response" | grep -q "Application error\|500 Internal Server Error"; then
                log_error "Application errors detected in response"
                return 1
            fi
            
            # Performance check
            local response_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time $HEALTH_CHECK_TIMEOUT "$deployment_url")
            local response_time_ms=$(echo "$response_time * 1000" | bc -l | cut -d'.' -f1)
            
            if [[ $response_time_ms -gt 5000 ]]; then
                log_warning "High response time: ${response_time_ms}ms"
            else
                log_success "Response time: ${response_time_ms}ms"
            fi
            
            return 0
        fi
        
        log_warning "Health check failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Health checks failed after $max_attempts attempts"
    return 1
}

test_api_endpoints() {
    local deployment_url="$1"
    log "🔌 Testing API endpoints..."
    
    local endpoints=("/api/health" "/api/status")
    local working_endpoints=0
    
    for endpoint in "${endpoints[@]}"; do
        local full_url="${deployment_url}${endpoint}"
        log "Testing: $full_url"
        
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$full_url")
        
        if [[ "$status_code" == "200" ]]; then
            log_success "$endpoint: OK (200)"
            ((working_endpoints++))
        elif [[ "$status_code" == "404" ]]; then
            log "$endpoint: Not implemented (404)"
        else
            log_warning "$endpoint: Status $status_code"
        fi
    done
    
    log "API endpoints working: $working_endpoints/${#endpoints[@]}"
    return 0
}

start_monitoring() {
    local deployment_url="$1"
    local duration="${2:-$MONITORING_DURATION}"
    
    log "📊 Starting deployment monitoring for ${duration}s..."
    
    local start_time=$(date +%s)
    local end_time=$((start_time + duration))
    local check_interval=60
    local total_checks=0
    local successful_checks=0
    
    while [[ $(date +%s) -lt $end_time ]]; do
        ((total_checks++))
        
        if curl -s --max-time 10 "$deployment_url" > /dev/null; then
            ((successful_checks++))
            echo -n "✅"
        else
            echo -n "❌"
            log_warning "Monitoring detected issue at $(date)"
        fi
        
        sleep $check_interval
    done
    
    echo # New line after status indicators
    
    local availability=$((successful_checks * 100 / total_checks))
    log "Monitoring complete: $availability% availability ($successful_checks/$total_checks checks)"
    
    if [[ $availability -lt 95 ]]; then
        log_warning "Low availability detected: $availability%"
        return 1
    fi
    
    log_success "Monitoring passed: $availability% availability"
    return 0
}

# ============================================================================
# ROLLBACK FUNCTIONALITY
# ============================================================================

emergency_rollback() {
    log "🚨 PERFORMING EMERGENCY ROLLBACK"
    log "================================"
    
    # Try to rollback using Vercel's instant rollback
    if vercel rollback --yes; then
        log_success "Emergency rollback completed"
        
        # Quick health check
        sleep 10
        local current_url=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null)
        if [[ -n "$current_url" ]] && curl -s --max-time 10 "$current_url" > /dev/null; then
            log_success "Rollback verification passed"
            return 0
        else
            log_error "Rollback verification failed"
            return 1
        fi
    else
        log_error "Emergency rollback failed"
        return 1
    fi
}

smart_rollback() {
    log "🧠 PERFORMING SMART ROLLBACK"
    log "============================"
    
    # Use Node.js rollback automation if available
    if [[ -f "vercel-rollback-automation.js" ]]; then
        log "Using advanced rollback automation..."
        if node vercel-rollback-automation.js --smart-rollback; then
            log_success "Smart rollback completed"
            return 0
        else
            log_error "Smart rollback failed, attempting emergency rollback..."
            return emergency_rollback
        fi
    else
        log "Advanced rollback not available, using emergency rollback..."
        return emergency_rollback
    fi
}

# ============================================================================
# MAIN DEPLOYMENT PIPELINE
# ============================================================================

full_deployment_pipeline() {
    log "🚀 STARTING FULL DEPLOYMENT PIPELINE"
    log "===================================="
    
    # Step 1: Comprehensive validation
    if ! run_comprehensive_validation; then
        log_error "Validation failed, aborting deployment"
        return 1
    fi
    
    # Step 2: Execute deployment
    if ! execute_deployment; then
        log_error "Deployment failed"
        return 1
    fi
    
    # Get deployment URL
    local deployment_url
    if [[ -f ".current-deployment-url" ]]; then
        deployment_url=$(cat .current-deployment-url)
    else
        log_error "Could not determine deployment URL"
        return 1
    fi
    
    # Step 3: Health checks
    if ! perform_health_checks "$deployment_url"; then
        log_error "Health checks failed, initiating rollback..."
        smart_rollback
        return 1
    fi
    
    # Step 4: API endpoint testing
    test_api_endpoints "$deployment_url"
    
    # Step 5: Start monitoring
    log "Starting background monitoring..."
    start_monitoring "$deployment_url" &
    local monitoring_pid=$!
    
    # Clean up deployment markers
    rm -f .deployment-in-progress .validation-passed
    
    log_success "DEPLOYMENT PIPELINE COMPLETED SUCCESSFULLY"
    log_success "Deployment URL: $deployment_url"
    log "Monitoring PID: $monitoring_pid (running in background)"
    
    return 0
}

deploy_with_monitoring() {
    log "🚀 DEPLOYING WITH INTENSIVE MONITORING"
    log "======================================"
    
    # Quick validation
    if ! validate_environment || ! validate_project_structure; then
        log_error "Basic validation failed"
        return 1
    fi
    
    # Execute deployment
    if ! execute_deployment; then
        log_error "Deployment failed"
        return 1
    fi
    
    # Get deployment URL
    local deployment_url=$(cat .current-deployment-url)
    
    # Intensive monitoring
    if ! perform_health_checks "$deployment_url"; then
        log_error "Health checks failed, initiating rollback..."
        smart_rollback
        return 1
    fi
    
    # Extended monitoring
    start_monitoring "$deployment_url" 600 # 10 minutes
    
    log_success "Deployment with monitoring completed"
    return 0
}

# ============================================================================
# CLI INTERFACE
# ============================================================================

show_usage() {
    echo "BULLETPROOF VERCEL DEPLOYMENT AUTOMATION"
    echo "========================================"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  --full-deploy              Run complete deployment pipeline with validation"
    echo "  --validate-only            Run validation checks only"
    echo "  --deploy-with-monitoring   Deploy with intensive monitoring"
    echo "  --emergency-rollback       Perform emergency rollback"
    echo "  --smart-rollback          Perform intelligent rollback"
    echo "  --health-check [URL]      Perform health check on deployment"
    echo "  --help                    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --full-deploy"
    echo "  $0 --validate-only"
    echo "  $0 --health-check https://your-app.vercel.app"
    echo ""
}

main() {
    local command="${1:-}"
    
    case "$command" in
        --full-deploy)
            full_deployment_pipeline
            ;;
        --validate-only)
            run_comprehensive_validation
            ;;
        --deploy-with-monitoring)
            deploy_with_monitoring
            ;;
        --emergency-rollback)
            emergency_rollback
            ;;
        --smart-rollback)
            smart_rollback
            ;;
        --health-check)
            local url="${2:-}"
            if [[ -z "$url" ]]; then
                log_error "URL required for health check"
                echo "Usage: $0 --health-check <URL>"
                exit 1
            fi
            perform_health_checks "$url"
            ;;
        --help|"")
            show_usage
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"