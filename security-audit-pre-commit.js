#!/usr/bin/env node

/**
 * Security Audit Script - Pre-Commit & Pre-Deploy
 * Ensures no secrets are exposed in code before GitHub commit or Vercel deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.scannedFiles = 0;
    
    // Patterns that indicate secrets or sensitive data
    this.secretPatterns = [
      // API Keys
      { pattern: /sk-[a-zA-Z0-9]{48,}/, type: 'OpenAI API Key', severity: 'CRITICAL' },
      { pattern: /gsk_[a-zA-Z0-9]{52}/, type: 'GROQ API Key', severity: 'CRITICAL' },
      { pattern: /sk-ant-api[0-9]{2}-[a-zA-Z0-9_-]{95}/, type: 'Anthropic API Key', severity: 'CRITICAL' },
      
      // Database URLs and tokens
      { pattern: /postgres:\/\/[^@]+:[^@]+@[^\/]+\/[^\s"']+/, type: 'PostgreSQL Connection String', severity: 'CRITICAL' },
      { pattern: /https:\/\/[a-z0-9-]+\.supabase\.co/, type: 'Supabase URL', severity: 'HIGH' },
      { pattern: /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/, type: 'JWT Token', severity: 'HIGH' },
      { pattern: /sbp_[a-f0-9]{40}/, type: 'Supabase Access Token', severity: 'CRITICAL' },
      
      // Redis and Cache
      { pattern: /redis:\/\/[^@]+:[^@]+@[^\/]+/, type: 'Redis Connection String', severity: 'HIGH' },
      { pattern: /AYL[a-zA-Z0-9_-]{40,}/, type: 'Upstash Redis Token', severity: 'CRITICAL' },
      
      // Generic patterns
      { pattern: /password\s*[:=]\s*["'][^"']{8,}["']/, type: 'Hardcoded Password', severity: 'CRITICAL' },
      { pattern: /secret\s*[:=]\s*["'][^"']{16,}["']/, type: 'Hardcoded Secret', severity: 'CRITICAL' },
      { pattern: /token\s*[:=]\s*["'][^"']{20,}["']/, type: 'Hardcoded Token', severity: 'HIGH' },
      
      // Environment variable assignments (should use process.env) - exclude test mocks
      { pattern: /GROQ_API_KEY\s*=\s*["'](?!mock-|test-|YOUR_)[^"']+["']/, type: 'Hardcoded GROQ Key', severity: 'CRITICAL' },
      { pattern: /OPENAI_API_KEY\s*=\s*["'](?!mock-|test-|YOUR_)[^"']+["']/, type: 'Hardcoded OpenAI Key', severity: 'CRITICAL' },
      { pattern: /ANTHROPIC_API_KEY\s*=\s*["'](?!mock-|test-|YOUR_)[^"']+["']/, type: 'Hardcoded Anthropic Key', severity: 'CRITICAL' },
      { pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'](?!mock-|test-|YOUR_)[^"']+["']/, type: 'Hardcoded Supabase Key', severity: 'CRITICAL' },
    ];
    
    // Files and directories to exclude from scanning
    this.excludePatterns = [
      /node_modules/,
      /\.git/,
      /\.next/,
      /\.vercel/,
      /\.env\.local$/,
      /\.env\.example$/,
      /\.env\.staging\.example$/,
      /\.env\.production\.example$/,
      /security-audit-pre-commit\.js$/,
      /emergency-security-cleanup\.js$/,
      /package-lock\.json$/,
      /yarn\.lock$/,
      /\.log$/,
      /\.md$/,  // Exclude markdown files from secret scanning
      /backups\//,  // Exclude backup directory
      /scripts\/debug-/,  // Exclude debug scripts
      /scripts\/test-/,  // Exclude test scripts
      /scripts\/verify-/  // Exclude verification scripts
    ];
    
    // File extensions to scan
    this.includeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.json', '.env', '.yml', '.yaml', '.toml'
    ];
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logBold(message, color = 'white') {
    console.log(`${colors.bold}${colors[color]}${message}${colors.reset}`);
  }

  shouldScanFile(filePath) {
    // Check if file should be excluded
    for (const pattern of this.excludePatterns) {
      if (pattern.test(filePath)) {
        return false;
      }
    }
    
    // Check if file extension should be included
    const ext = path.extname(filePath);
    return this.includeExtensions.includes(ext);
  }

  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, lineNumber) => {
        this.secretPatterns.forEach(({ pattern, type, severity }) => {
          const matches = line.match(pattern);
          if (matches) {
            this.issues.push({
              file: filePath,
              line: lineNumber + 1,
              type,
              severity,
              content: line.trim(),
              match: matches[0]
            });
          }
        });
      });
      
      this.scannedFiles++;
    } catch (error) {
      this.warnings.push(`Could not read file: ${filePath} - ${error.message}`);
    }
  }

  scanDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          this.scanDirectory(fullPath);
        } else if (stat.isFile() && this.shouldScanFile(fullPath)) {
          this.scanFile(fullPath);
        }
      }
    } catch (error) {
      this.warnings.push(`Could not scan directory: ${dirPath} - ${error.message}`);
    }
  }

  checkGitignore() {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    const requiredEntries = [
      '.env.local',
      '.env.production',
      '.env.staging',
      'node_modules/',
      '.next/',
      '.vercel/'
    ];
    
    if (!fs.existsSync(gitignorePath)) {
      this.issues.push({
        file: '.gitignore',
        line: 0,
        type: 'Missing .gitignore',
        severity: 'HIGH',
        content: 'No .gitignore file found',
        match: 'Missing file'
      });
      return;
    }
    
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    requiredEntries.forEach(entry => {
      if (!gitignoreContent.includes(entry)) {
        this.warnings.push(`Missing .gitignore entry: ${entry}`);
      }
    });
  }

  checkEnvironmentFiles() {
    const envFiles = ['.env.local', '.env.production', '.env.staging'];
    
    envFiles.forEach(envFile => {
      const envPath = path.join(process.cwd(), envFile);
      if (fs.existsSync(envPath)) {
        this.issues.push({
          file: envFile,
          line: 0,
          type: 'Environment File in Repository',
          severity: 'CRITICAL',
          content: `${envFile} should not be committed to repository`,
          match: 'File exists'
        });
      }
    });
  }

  generateReport() {
    this.logBold('\n🔒 SECURITY AUDIT REPORT', 'cyan');
    this.log('=====================================', 'cyan');
    
    // Summary
    this.log(`📊 Files Scanned: ${this.scannedFiles}`, 'blue');
    this.log(`🚨 Security Issues: ${this.issues.length}`, this.issues.length > 0 ? 'red' : 'green');
    this.log(`⚠️  Warnings: ${this.warnings.length}`, this.warnings.length > 0 ? 'yellow' : 'green');
    
    // Critical issues
    const criticalIssues = this.issues.filter(issue => issue.severity === 'CRITICAL');
    const highIssues = this.issues.filter(issue => issue.severity === 'HIGH');
    
    if (criticalIssues.length > 0) {
      this.logBold('\n🚨 CRITICAL SECURITY ISSUES:', 'red');
      criticalIssues.forEach(issue => {
        this.log(`\n❌ ${issue.type}`, 'red');
        this.log(`   File: ${issue.file}:${issue.line}`, 'white');
        this.log(`   Content: ${issue.content}`, 'yellow');
        this.log(`   Match: ${issue.match.substring(0, 50)}...`, 'magenta');
      });
    }
    
    if (highIssues.length > 0) {
      this.logBold('\n⚠️  HIGH PRIORITY ISSUES:', 'yellow');
      highIssues.forEach(issue => {
        this.log(`\n⚠️  ${issue.type}`, 'yellow');
        this.log(`   File: ${issue.file}:${issue.line}`, 'white');
        this.log(`   Content: ${issue.content}`, 'yellow');
      });
    }
    
    if (this.warnings.length > 0) {
      this.logBold('\n💡 WARNINGS:', 'yellow');
      this.warnings.forEach(warning => {
        this.log(`   • ${warning}`, 'yellow');
      });
    }
    
    // Recommendations
    this.logBold('\n📋 SECURITY RECOMMENDATIONS:', 'blue');
    this.log('   • Use environment variables for all secrets', 'white');
    this.log('   • Ensure .env.local is in .gitignore', 'white');
    this.log('   • Use Vercel environment variables for deployment', 'white');
    this.log('   • Never commit API keys or tokens to repository', 'white');
    this.log('   • Use example files (.env.example) for documentation', 'white');
    
    // Final status
    if (criticalIssues.length > 0) {
      this.logBold('\n❌ SECURITY AUDIT FAILED', 'red');
      this.log('   Critical security issues must be resolved before commit/deploy', 'red');
      return false;
    } else if (highIssues.length > 0) {
      this.logBold('\n⚠️  SECURITY AUDIT PASSED WITH WARNINGS', 'yellow');
      this.log('   Consider addressing high priority issues', 'yellow');
      return true;
    } else {
      this.logBold('\n✅ SECURITY AUDIT PASSED', 'green');
      this.log('   No critical security issues found', 'green');
      return true;
    }
  }

  async run() {
    this.logBold('🔒 Starting Security Audit...', 'cyan');
    this.log('Scanning for exposed secrets and sensitive data\n', 'white');
    
    // Check .gitignore
    this.log('📋 Checking .gitignore configuration...', 'blue');
    this.checkGitignore();
    
    // Check for environment files
    this.log('🔍 Checking for environment files in repository...', 'blue');
    this.checkEnvironmentFiles();
    
    // Scan all files
    this.log('🔍 Scanning source code for secrets...', 'blue');
    this.scanDirectory(process.cwd());
    
    // Generate report
    const passed = this.generateReport();
    
    if (!passed) {
      process.exit(1);
    }
    
    return passed;
  }
}

// Run the audit
const auditor = new SecurityAuditor();
auditor.run().catch(error => {
  console.error('Security audit failed:', error);
  process.exit(1);
});