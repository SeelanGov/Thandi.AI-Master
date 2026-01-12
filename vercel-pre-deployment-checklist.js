#!/usr/bin/env node
/**
 * VERCEL PRE-DEPLOYMENT VERIFICATION SCRIPT
 * Comprehensive checks before deploying to Vercel
 * Based on research of common deployment failures
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VercelPreDeploymentChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addResult(message, type, category) {
    this[category].push({ message, type, timestamp: new Date().toISOString() });
    this.log(message, type);
  }

  // 1. Build Environment Verification
  async checkBuildEnvironment() {
    this.log('Checking build environment...', 'info');
    
    try {
      // Check Node.js version
      const nodeVersion = process.version;
      if (parseInt(nodeVersion.slice(1)) < 18) {
        this.addResult(`Node.js version ${nodeVersion} is below recommended 18+`, 'warning', 'warnings');
      } else {
        this.addResult(`Node.js version ${nodeVersion} is compatible`, 'success', 'passed');
      }

      // Check package.json
      if (!fs.existsSync('package.json')) {
        this.addResult('package.json not found', 'error', 'errors');
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check required scripts
      const requiredScripts = ['build', 'start'];
      for (const script of requiredScripts) {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
          this.addResult(`Missing required script: ${script}`, 'error', 'errors');
        } else {
          this.addResult(`Required script found: ${script}`, 'success', 'passed');
        }
      }

      // Check Next.js dependency
      const nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next;
      if (!nextVersion) {
        this.addResult('Next.js dependency not found', 'error', 'errors');
      } else {
        this.addResult(`Next.js version: ${nextVersion}`, 'success', 'passed');
      }

    } catch (error) {
      this.addResult(`Build environment check failed: ${error.message}`, 'error', 'errors');
    }
  }

  // 2. Environment Variables Verification
  async checkEnvironmentVariables() {
    this.log('Checking environment variables...', 'info');
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const optionalEnvVars = [
      'DATABASE_URL',
      'VERCEL_URL',
      'NODE_ENV'
    ];

    // Check required variables
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        this.addResult(`Missing required environment variable: ${envVar}`, 'error', 'errors');
      } else {
        this.addResult(`Required environment variable found: ${envVar}`, 'success', 'passed');
      }
    }

    // Check optional variables
    for (const envVar of optionalEnvVars) {
      if (!process.env[envVar]) {
        this.addResult(`Optional environment variable missing: ${envVar}`, 'warning', 'warnings');
      } else {
        this.addResult(`Optional environment variable found: ${envVar}`, 'success', 'passed');
      }
    }

    // Validate Supabase URL format
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
      this.addResult('Supabase URL format may be incorrect', 'warning', 'warnings');
    }
  }

  // 3. File System Checks
  async checkFileSystem() {
    this.log('Checking file system...', 'info');
    
    try {
      // Check for build artifacts that shouldn't be committed
      const buildArtifacts = ['.next', 'node_modules', '.vercel'];
      for (const artifact of buildArtifacts) {
        if (fs.existsSync(artifact)) {
          // Check if it's in .gitignore
          const gitignore = fs.existsSync('.gitignore') ? 
            fs.readFileSync('.gitignore', 'utf8') : '';
          
          if (!gitignore.includes(artifact)) {
            this.addResult(`Build artifact ${artifact} should be in .gitignore`, 'warning', 'warnings');
          } else {
            this.addResult(`Build artifact ${artifact} properly ignored`, 'success', 'passed');
          }
        }
      }

      // Check for case sensitivity issues in imports
      this.checkCaseSensitivity();

      // Check for required Next.js files
      const requiredFiles = ['next.config.js', 'next.config.mjs'];
      const hasNextConfig = requiredFiles.some(file => fs.existsSync(file));
      if (!hasNextConfig) {
        this.addResult('No Next.js config file found (optional but recommended)', 'warning', 'warnings');
      } else {
        this.addResult('Next.js config file found', 'success', 'passed');
      }

    } catch (error) {
      this.addResult(`File system check failed: ${error.message}`, 'error', 'errors');
    }
  }

  // 4. Case Sensitivity Check
  checkCaseSensitivity() {
    try {
      // Find all JS/TS files and check imports
      const findCommand = `find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | grep -v node_modules | head -20`;
      const files = execSync(findCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
      
      let caseIssues = 0;
      for (const file of files) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          // Simple check for potential case issues
          const importLines = content.split('\n').filter(line => line.includes('import'));
          for (const line of importLines) {
            if (line.includes('./') || line.includes('../')) {
              // This is a relative import - could have case issues
              caseIssues++;
            }
          }
        }
      }
      
      if (caseIssues > 0) {
        this.addResult(`Found ${caseIssues} potential case sensitivity issues in imports`, 'warning', 'warnings');
      } else {
        this.addResult('No obvious case sensitivity issues found', 'success', 'passed');
      }
    } catch (error) {
      this.addResult(`Case sensitivity check failed: ${error.message}`, 'warning', 'warnings');
    }
  }

  // 5. Build Process Test
  async testBuildProcess() {
    this.log('Testing build process...', 'info');
    
    try {
      // Clean previous build
      if (fs.existsSync('.next')) {
        execSync('rm -rf .next', { stdio: 'pipe' });
        this.addResult('Cleaned previous build artifacts', 'success', 'passed');
      }

      // Run build
      this.log('Running npm run build...', 'info');
      execSync('npm run build', { stdio: 'pipe' });
      this.addResult('Build completed successfully', 'success', 'passed');

      // Check build output
      if (fs.existsSync('.next')) {
        const buildStats = fs.statSync('.next');
        this.addResult(`Build output created (${buildStats.size} bytes)`, 'success', 'passed');
      } else {
        this.addResult('Build output directory not created', 'error', 'errors');
      }

    } catch (error) {
      this.addResult(`Build process failed: ${error.message}`, 'error', 'errors');
    }
  }

  // 6. TypeScript Check
  async checkTypeScript() {
    this.log('Checking TypeScript...', 'info');
    
    try {
      if (fs.existsSync('tsconfig.json')) {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        this.addResult('TypeScript check passed', 'success', 'passed');
      } else {
        this.addResult('No TypeScript configuration found', 'info', 'passed');
      }
    } catch (error) {
      this.addResult(`TypeScript check failed: ${error.message}`, 'error', 'errors');
    }
  }

  // 7. Linting Check
  async checkLinting() {
    this.log('Checking linting...', 'info');
    
    try {
      if (fs.existsSync('.eslintrc.json') || fs.existsSync('.eslintrc.js')) {
        execSync('npm run lint', { stdio: 'pipe' });
        this.addResult('Linting check passed', 'success', 'passed');
      } else {
        this.addResult('No ESLint configuration found', 'warning', 'warnings');
      }
    } catch (error) {
      this.addResult(`Linting check failed: ${error.message}`, 'warning', 'warnings');
    }
  }

  // 8. Database Connection Test
  async testDatabaseConnection() {
    this.log('Testing database connection...', 'info');
    
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        this.addResult('Supabase credentials not available for database test', 'warning', 'warnings');
        return;
      }

      // Simple connection test
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Test basic query
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        this.addResult(`Database connection test failed: ${error.message}`, 'error', 'errors');
      } else {
        this.addResult('Database connection test passed', 'success', 'passed');
      }

    } catch (error) {
      this.addResult(`Database connection test failed: ${error.message}`, 'error', 'errors');
    }
  }

  // 9. API Routes Test
  async testApiRoutes() {
    this.log('Testing API routes...', 'info');
    
    try {
      const apiDir = path.join(process.cwd(), 'app', 'api');
      if (fs.existsSync(apiDir)) {
        const routes = this.findApiRoutes(apiDir);
        this.addResult(`Found ${routes.length} API routes`, 'success', 'passed');
        
        // Check for common issues in API routes
        for (const route of routes) {
          this.validateApiRoute(route);
        }
      } else {
        this.addResult('No API routes directory found', 'info', 'passed');
      }
    } catch (error) {
      this.addResult(`API routes test failed: ${error.message}`, 'warning', 'warnings');
    }
  }

  findApiRoutes(dir) {
    const routes = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        routes.push(...this.findApiRoutes(fullPath));
      } else if (item === 'route.js' || item === 'route.ts') {
        routes.push(fullPath);
      }
    }
    
    return routes;
  }

  validateApiRoute(routePath) {
    try {
      const content = fs.readFileSync(routePath, 'utf8');
      
      // Check for proper error handling
      if (!content.includes('try') && !content.includes('catch')) {
        this.addResult(`API route ${routePath} may lack error handling`, 'warning', 'warnings');
      }
      
      // Check for proper response handling
      if (!content.includes('NextResponse')) {
        this.addResult(`API route ${routePath} may not use NextResponse`, 'warning', 'warnings');
      }
      
    } catch (error) {
      this.addResult(`Failed to validate API route ${routePath}: ${error.message}`, 'warning', 'warnings');
    }
  }

  // 10. Performance Checks
  async checkPerformance() {
    this.log('Checking performance considerations...', 'info');
    
    try {
      // Check bundle size (if build exists)
      if (fs.existsSync('.next')) {
        const buildManifest = path.join('.next', 'build-manifest.json');
        if (fs.existsSync(buildManifest)) {
          const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
          const pageCount = Object.keys(manifest.pages || {}).length;
          this.addResult(`Build contains ${pageCount} pages`, 'success', 'passed');
        }
      }

      // Check for large dependencies
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      const depCount = Object.keys(deps).length;
      
      if (depCount > 50) {
        this.addResult(`Large number of dependencies (${depCount}) may affect build time`, 'warning', 'warnings');
      } else {
        this.addResult(`Reasonable number of dependencies (${depCount})`, 'success', 'passed');
      }

    } catch (error) {
      this.addResult(`Performance check failed: ${error.message}`, 'warning', 'warnings');
    }
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.passed.length + this.warnings.length + this.errors.length,
        passed: this.passed.length,
        warnings: this.warnings.length,
        errors: this.errors.length
      },
      results: {
        passed: this.passed,
        warnings: this.warnings,
        errors: this.errors
      },
      deploymentReady: this.errors.length === 0
    };

    // Write report to file
    fs.writeFileSync(
      `vercel-pre-deployment-report-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );

    return report;
  }

  // Main execution
  async run() {
    console.log('🚀 VERCEL PRE-DEPLOYMENT VERIFICATION');
    console.log('=====================================');
    console.log(`Started at: ${new Date().toISOString()}\n`);

    await this.checkBuildEnvironment();
    await this.checkEnvironmentVariables();
    await this.checkFileSystem();
    await this.testBuildProcess();
    await this.checkTypeScript();
    await this.checkLinting();
    await this.testDatabaseConnection();
    await this.testApiRoutes();
    await this.checkPerformance();

    const report = this.generateReport();

    console.log('\n📊 VERIFICATION SUMMARY');
    console.log('=======================');
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`❌ Errors: ${report.summary.errors}`);
    console.log(`📋 Total Checks: ${report.summary.total}`);

    if (report.deploymentReady) {
      console.log('\n🎉 DEPLOYMENT READY!');
      console.log('All critical checks passed. Safe to deploy to Vercel.');
    } else {
      console.log('\n🚨 DEPLOYMENT NOT READY!');
      console.log('Critical errors found. Fix these issues before deploying:');
      this.errors.forEach(error => {
        console.log(`   ❌ ${error.message}`);
      });
    }

    console.log(`\n📄 Detailed report saved to: vercel-pre-deployment-report-${Date.now()}.json`);
    
    return report.deploymentReady;
  }
}

// Execute if run directly
if (require.main === module) {
  const checker = new VercelPreDeploymentChecker();
  checker.run().then(ready => {
    process.exit(ready ? 0 : 1);
  }).catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

module.exports = VercelPreDeploymentChecker;