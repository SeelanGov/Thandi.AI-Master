#!/usr/bin/env node
/**
 * VERCEL DEPLOYMENT TROUBLESHOOTING SCRIPT
 * Comprehensive diagnostic tool for Vercel deployment issues
 * Based on research findings and common failure patterns
 */

import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

class VercelDeploymentTroubleshooter {
  constructor() {
    this.issues = [];
    this.recommendations = [];
    this.diagnostics = {};
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      fix: '🔧'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addIssue(category, issue, severity = 'medium', fix = null) {
    this.issues.push({ category, issue, severity, fix });
  }

  addRecommendation(recommendation) {
    this.recommendations.push(recommendation);
  }

  async executeCommand(command, options = {}) {
    try {
      const result = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        ...options
      });
      return result.trim();
    } catch (error) {
      return { error: error.message, stderr: error.stderr };
    }
  }

  // 1. Analyze Build Artifacts
  async analyzeBuildArtifacts() {
    this.log('Analyzing build artifacts...');
    
    // Check for .next directory in git
    try {
      const gitStatus = await this.executeCommand('git status --porcelain');
      if (typeof gitStatus === 'string' && gitStatus.includes('.next/')) {
        this.addIssue(
          'Build Artifacts',
          '.next directory is tracked in git',
          'high',
          'Add .next/ to .gitignore and run: git rm -r --cached .next'
        );
      }

      if (typeof gitStatus === 'string' && gitStatus.includes('node_modules/')) {
        this.addIssue(
          'Build Artifacts',
          'node_modules directory is tracked in git',
          'critical',
          'Add node_modules/ to .gitignore and run: git rm -r --cached node_modules'
        );
      }
    } catch (error) {
      this.log('Not a git repository or git not available', 'warning');
    }

    // Check .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      const requiredEntries = ['.next/', 'node_modules/', '.env.local'];
      const missing = requiredEntries.filter(entry => !gitignore.includes(entry));
      
      if (missing.length > 0) {
        this.addIssue(
          'Build Configuration',
          `Missing .gitignore entries: ${missing.join(', ')}`,
          'medium',
          `Add these entries to .gitignore: ${missing.join(', ')}`
        );
      }
    } else {
      this.addIssue(
        'Build Configuration',
        '.gitignore file not found',
        'high',
        'Create .gitignore with: .next/\\nnode_modules/\\n.env.local'
      );
    }

    // Check for build directory size
    if (fs.existsSync('.next')) {
      try {
        const sizeOutput = await this.executeCommand('du -sh .next');
        const size = typeof sizeOutput === 'string' ? sizeOutput.split('\t')[0] : 'unknown';
        this.diagnostics.buildSize = size;
        
        if (size.includes('G') || (size.includes('M') && parseInt(size) > 500)) {
          this.addIssue(
            'Build Performance',
            `Large build directory: ${size}`,
            'medium',
            'Consider optimizing bundle size or using dynamic imports'
          );
        }
      } catch (error) {
        this.log('Could not determine build size', 'warning');
      }
    }
  }

  // 2. Environment Variable Analysis
  async analyzeEnvironmentVariables() {
    this.log('Analyzing environment variables...');
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'DATABASE_URL'
    ];

    const envIssues = [];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        envIssues.push(varName);
      }
    }

    if (envIssues.length > 0) {
      this.addIssue(
        'Environment Variables',
        `Missing environment variables: ${envIssues.join(', ')}`,
        'critical',
        'Set these variables in Vercel dashboard under Project Settings > Environment Variables'
      );
    }

    // Check DATABASE_URL format for Vercel compatibility
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      if (!dbUrl.includes(':6543')) {
        this.addIssue(
          'Database Configuration',
          'DATABASE_URL uses port 5432 instead of 6543',
          'high',
          'Change DATABASE_URL port from 5432 to 6543 for Vercel serverless compatibility'
        );
      }

      if (!dbUrl.includes('pgbouncer=true')) {
        this.addIssue(
          'Database Configuration',
          'DATABASE_URL missing pgbouncer parameter',
          'high',
          'Add ?pgbouncer=true to DATABASE_URL for connection pooling'
        );
      }

      this.diagnostics.databaseUrl = {
        hasCorrectPort: dbUrl.includes(':6543'),
        hasPgBouncer: dbUrl.includes('pgbouncer=true'),
        isSupabase: dbUrl.includes('supabase.com')
      };
    }

    // Check for NEXT_PUBLIC_ variables that might need redeployment
    const nextPublicVars = Object.keys(process.env)
      .filter(key => key.startsWith('NEXT_PUBLIC_'));
    
    if (nextPublicVars.length > 0) {
      this.addRecommendation(
        `Found ${nextPublicVars.length} NEXT_PUBLIC_ variables. Remember that changes to these require redeployment.`
      );
    }
  }

  // 3. Database Connectivity Analysis
  async analyzeDatabaseConnectivity() {
    this.log('Analyzing database connectivity...');
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.addIssue(
        'Database Connection',
        'Cannot test database - missing Supabase credentials',
        'high',
        'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      );
      return;
    }

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Test basic connectivity
      const { data, error } = await supabase
        .from('students')
        .select('count')
        .limit(1);

      if (error) {
        this.addIssue(
          'Database Connection',
          `Database connection failed: ${error.message}`,
          'critical',
          'Check database credentials and network connectivity'
        );
      } else {
        this.diagnostics.databaseConnection = 'successful';
      }

      // Test RLS policies
      const anonSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );

      const { error: rlsError } = await anonSupabase
        .from('students')
        .select('*')
        .limit(1);

      if (!rlsError) {
        this.addIssue(
          'Database Security',
          'RLS policies may not be properly configured',
          'medium',
          'Review and enable Row Level Security policies'
        );
      }

    } catch (error) {
      this.addIssue(
        'Database Connection',
        `Database test failed: ${error.message}`,
        'critical',
        'Verify database configuration and credentials'
      );
    }
  }

  // 4. Build Configuration Analysis
  async analyzeBuildConfiguration() {
    this.log('Analyzing build configuration...');
    
    // Check package.json
    if (!fs.existsSync('package.json')) {
      this.addIssue(
        'Build Configuration',
        'package.json not found',
        'critical',
        'Ensure package.json exists in project root'
      );
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check build script
    if (!packageJson.scripts?.build) {
      this.addIssue(
        'Build Configuration',
        'Missing build script in package.json',
        'critical',
        'Add "build": "next build" to package.json scripts'
      );
    }

    // Check for Prisma
    const hasPrisma = packageJson.dependencies?.prisma || 
                     packageJson.devDependencies?.prisma ||
                     packageJson.dependencies?.['@prisma/client'];

    if (hasPrisma && !packageJson.scripts?.build?.includes('prisma generate')) {
      this.addIssue(
        'Build Configuration',
        'Prisma detected but build script missing prisma generate',
        'high',
        'Update build script to: "prisma generate && next build"'
      );
    }

    // Check Next.js version
    const nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next;
    if (nextVersion) {
      this.diagnostics.nextVersion = nextVersion;
      
      // Check for very old versions
      if (nextVersion.includes('12.') || nextVersion.includes('11.')) {
        this.addRecommendation(
          `Next.js version ${nextVersion} is outdated. Consider upgrading for better Vercel compatibility.`
        );
      }
    }

    // Check next.config.js
    if (fs.existsSync('next.config.js')) {
      const nextConfig = fs.readFileSync('next.config.js', 'utf8');
      
      // Check for problematic configurations
      if (nextConfig.includes('output: "standalone"')) {
        this.addIssue(
          'Build Configuration',
          'Standalone output may cause issues on Vercel',
          'medium',
          'Remove output: "standalone" for standard Vercel deployment'
        );
      }

      if (nextConfig.includes('trailingSlash: true')) {
        this.addRecommendation(
          'trailingSlash configuration detected. Ensure this matches your routing expectations.'
        );
      }
    }
  }

  // 5. API Routes Analysis
  async analyzeAPIRoutes() {
    this.log('Analyzing API routes...');
    
    const apiDirs = ['app/api', 'pages/api'];
    let foundApiRoutes = false;
    
    for (const apiDir of apiDirs) {
      if (fs.existsSync(apiDir)) {
        foundApiRoutes = true;
        this.diagnostics.apiRouterType = apiDir.includes('app') ? 'App Router' : 'Pages Router';
        
        // Recursively find API routes
        const findApiRoutes = (dir) => {
          const files = fs.readdirSync(dir, { withFileTypes: true });
          const routes = [];
          
          for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
              routes.push(...findApiRoutes(fullPath));
            } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
              routes.push(fullPath);
            }
          }
          
          return routes;
        };
        
        const routes = findApiRoutes(apiDir);
        this.diagnostics.apiRouteCount = routes.length;
        
        // Check for common issues in API routes
        for (const route of routes.slice(0, 5)) { // Check first 5 routes
          try {
            const content = fs.readFileSync(route, 'utf8');
            
            // Check for missing error handling
            if (!content.includes('try') && !content.includes('catch')) {
              this.addIssue(
                'API Routes',
                `API route ${route} missing error handling`,
                'medium',
                'Add try-catch blocks to handle errors gracefully'
              );
            }
            
            // Check for database connections without proper cleanup
            if (content.includes('createClient') && !content.includes('finally')) {
              this.addRecommendation(
                `Consider proper connection cleanup in ${route}`
              );
            }
          } catch (error) {
            this.log(`Could not analyze ${route}: ${error.message}`, 'warning');
          }
        }
      }
    }
    
    if (!foundApiRoutes) {
      this.diagnostics.apiRouteCount = 0;
      this.addRecommendation('No API routes found. This is fine for static sites.');
    }
  }

  // 6. Deployment History Analysis
  async analyzeDeploymentHistory() {
    this.log('Analyzing deployment history...');
    
    try {
      const deployments = await this.executeCommand('vercel ls --json');
      
      if (typeof deployments === 'string') {
        const parsed = JSON.parse(deployments);
        this.diagnostics.deploymentCount = parsed.length;
        
        if (parsed.length > 0) {
          const latest = parsed[0];
          this.diagnostics.latestDeployment = {
            url: latest.url,
            state: latest.state,
            created: latest.created
          };
          
          // Check for failed deployments
          const failed = parsed.filter(d => d.state === 'ERROR').length;
          if (failed > 0) {
            this.addIssue(
              'Deployment History',
              `${failed} failed deployments found`,
              'medium',
              'Review deployment logs to identify recurring issues'
            );
          }
        }
      }
    } catch (error) {
      this.log('Could not fetch deployment history. Ensure Vercel CLI is installed and authenticated.', 'warning');
    }
  }

  // 7. Performance Analysis
  async analyzePerformance() {
    this.log('Analyzing performance indicators...');
    
    // Check bundle size if .next exists
    if (fs.existsSync('.next')) {
      try {
        // Check for large pages
        const pagesDir = '.next/static/chunks/pages';
        if (fs.existsSync(pagesDir)) {
          const files = fs.readdirSync(pagesDir);
          const largeFiles = [];
          
          for (const file of files) {
            const stats = fs.statSync(path.join(pagesDir, file));
            if (stats.size > 1024 * 1024) { // > 1MB
              largeFiles.push({ file, size: Math.round(stats.size / 1024) + 'KB' });
            }
          }
          
          if (largeFiles.length > 0) {
            this.addIssue(
              'Performance',
              `Large bundle files detected: ${largeFiles.map(f => `${f.file} (${f.size})`).join(', ')}`,
              'medium',
              'Consider code splitting or dynamic imports to reduce bundle size'
            );
          }
        }
      } catch (error) {
        this.log('Could not analyze bundle size', 'warning');
      }
    }

    // Check for common performance issues in package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const heavyDependencies = ['lodash', 'moment', 'axios'];
    const found = heavyDependencies.filter(dep => 
      packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
    );
    
    if (found.length > 0) {
      this.addRecommendation(
        `Consider lighter alternatives for: ${found.join(', ')}. For example: date-fns instead of moment, native fetch instead of axios.`
      );
    }
  }

  // 8. Generate Troubleshooting Report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      diagnostics: this.diagnostics,
      issues: this.issues,
      recommendations: this.recommendations,
      summary: {
        totalIssues: this.issues.length,
        criticalIssues: this.issues.filter(i => i.severity === 'critical').length,
        highIssues: this.issues.filter(i => i.severity === 'high').length,
        mediumIssues: this.issues.filter(i => i.severity === 'medium').length
      }
    };

    const reportPath = `vercel-troubleshooting-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return { report, reportPath };
  }

  // Main troubleshooting function
  async troubleshoot() {
    console.log('🔍 VERCEL DEPLOYMENT TROUBLESHOOTING');
    console.log('====================================');
    console.log('Comprehensive diagnostic analysis for deployment issues\n');

    const diagnostics = [
      ['Build Artifacts', () => this.analyzeBuildArtifacts()],
      ['Environment Variables', () => this.analyzeEnvironmentVariables()],
      ['Database Connectivity', () => this.analyzeDatabaseConnectivity()],
      ['Build Configuration', () => this.analyzeBuildConfiguration()],
      ['API Routes', () => this.analyzeAPIRoutes()],
      ['Deployment History', () => this.analyzeDeploymentHistory()],
      ['Performance', () => this.analyzePerformance()]
    ];

    for (const [name, diagnosticFn] of diagnostics) {
      try {
        await diagnosticFn();
      } catch (error) {
        this.log(`Diagnostic ${name} failed: ${error.message}`, 'error');
      }
    }

    // Generate and display report
    const { report, reportPath } = this.generateReport();

    console.log('\n📊 TROUBLESHOOTING SUMMARY');
    console.log('==========================');
    console.log(`Total Issues: ${report.summary.totalIssues}`);
    console.log(`Critical: ${report.summary.criticalIssues}`);
    console.log(`High: ${report.summary.highIssues}`);
    console.log(`Medium: ${report.summary.mediumIssues}`);

    if (this.issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      console.log('================');
      
      const sortedIssues = this.issues.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

      for (const issue of sortedIssues) {
        const severityIcon = {
          critical: '🚨',
          high: '⚠️',
          medium: '⚡',
          low: 'ℹ️'
        }[issue.severity];
        
        console.log(`\n${severityIcon} ${issue.category.toUpperCase()}`);
        console.log(`   Issue: ${issue.issue}`);
        if (issue.fix) {
          console.log(`   Fix: ${issue.fix}`);
        }
      }
    }

    if (this.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('===================');
      this.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    console.log(`\n📄 Detailed report saved: ${reportPath}`);

    if (report.summary.criticalIssues > 0) {
      console.log('\n🚨 CRITICAL ISSUES DETECTED');
      console.log('Fix critical issues before attempting deployment.');
      return false;
    }

    if (report.summary.totalIssues === 0) {
      console.log('\n✅ NO ISSUES DETECTED');
      console.log('Your project appears ready for Vercel deployment.');
    }

    return true;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const troubleshooter = new VercelDeploymentTroubleshooter();
  troubleshooter.troubleshoot().catch(error => {
    console.error('❌ Troubleshooting failed:', error.message);
    process.exit(1);
  });
}

export default VercelDeploymentTroubleshooter;