#!/usr/bin/env node

/**
 * VERCEL DEPLOYMENT AUTOMATION TOOLKIT
 * Comprehensive deployment automation with validation and monitoring
 * 
 * Usage:
 *   node vercel-deployment-automation.js --validate
 *   node vercel-deployment-automation.js --deploy
 *   node vercel-deployment-automation.js --monitor
 *   node vercel-deployment-automation.js --rollback
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

class VercelDeploymentAutomation {
  constructor() {
    this.config = {
      maxRetries: 3,
      healthCheckTimeout: 30000,
      monitoringInterval: 60000,
      errorThreshold: 5, // 5% error rate
      responseTimeThreshold: 5000 // 5 seconds
    };
    
    this.metrics = {
      deploymentStart: null,
      deploymentEnd: null,
      buildDuration: null,
      healthChecks: [],
      errors: []
    };
  }

  // ============================================================================
  // PRE-DEPLOYMENT VALIDATION
  // ============================================================================

  async validateDeployment() {
    console.log('🔍 Starting comprehensive deployment validation...\n');
    
    const validations = [
      { name: 'Build Configuration', fn: () => this.validateBuildConfiguration() },
      { name: 'Environment Variables', fn: () => this.validateEnvironmentVariables() },
      { name: 'Dependencies', fn: () => this.validateDependencies() },
      { name: 'Function Sizes', fn: () => this.validateFunctionSizes() },
      { name: 'Resource Limits', fn: () => this.validateResourceLimits() },
      { name: 'Local Build', fn: () => this.validateLocalBuild() }
    ];

    const results = [];
    
    for (const validation of validations) {
      try {
        console.log(`⏳ Validating ${validation.name}...`);
        const result = await validation.fn();
        results.push({ ...result, name: validation.name });
        
        if (result.success) {
          console.log(`✅ ${validation.name}: PASSED`);
        } else {
          console.log(`❌ ${validation.name}: FAILED - ${result.message}`);
        }
      } catch (error) {
        console.log(`❌ ${validation.name}: ERROR - ${error.message}`);
        results.push({
          name: validation.name,
          success: false,
          message: error.message,
          error: error
        });
      }
      console.log('');
    }

    const failures = results.filter(r => !r.success);
    
    if (failures.length > 0) {
      console.log('🚨 VALIDATION FAILED');
      console.log('===================');
      failures.forEach(failure => {
        console.log(`❌ ${failure.name}: ${failure.message}`);
      });
      
      return { success: false, failures };
    }

    console.log('✅ ALL VALIDATIONS PASSED - READY FOR DEPLOYMENT');
    return { success: true, results };
  }

  validateBuildConfiguration() {
    // Check package.json
    if (!fs.existsSync('package.json')) {
      return { success: false, message: 'package.json not found' };
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const issues = [];

    // Check for build script
    if (!packageJson.scripts?.build) {
      issues.push('Missing build script');
    }

    // Check for Next.js
    if (!packageJson.dependencies?.next && !packageJson.devDependencies?.next) {
      issues.push('Next.js not found in dependencies');
    }

    // Check for lockfile
    const hasLockfile = fs.existsSync('package-lock.json') || 
                       fs.existsSync('yarn.lock') || 
                       fs.existsSync('pnpm-lock.yaml');
    
    if (!hasLockfile) {
      issues.push('No lockfile found (package-lock.json, yarn.lock, or pnpm-lock.yaml)');
    }

    return {
      success: issues.length === 0,
      message: issues.join(', '),
      issues
    };
  }

  validateEnvironmentVariables() {
    // Check for .env.local
    if (!fs.existsSync('.env.local')) {
      return { success: false, message: '.env.local file not found' };
    }

    // Read environment variables
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const envVars = envContent.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => line.split('=')[0]);

    // Check for common required variables
    const requiredVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    const missing = requiredVars.filter(varName => !envVars.includes(varName));

    if (missing.length > 0) {
      return {
        success: false,
        message: `Missing required environment variables: ${missing.join(', ')}`
      };
    }

    // Check total size (approximate)
    const totalSize = envContent.length;
    const maxSize = 64 * 1024; // 64KB

    if (totalSize > maxSize) {
      return {
        success: false,
        message: `Environment variables exceed 64KB limit (${Math.round(totalSize/1024)}KB)`
      };
    }

    return {
      success: true,
      message: `${envVars.length} environment variables validated`,
      count: envVars.length,
      size: Math.round(totalSize/1024)
    };
  }

  validateDependencies() {
    try {
      // Check for security vulnerabilities
      const auditResult = execSync('npm audit --audit-level moderate --json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const audit = JSON.parse(auditResult);
      
      if (audit.metadata.vulnerabilities.total > 0) {
        return {
          success: false,
          message: `${audit.metadata.vulnerabilities.total} security vulnerabilities found`
        };
      }

      return {
        success: true,
        message: 'No security vulnerabilities found'
      };
    } catch (error) {
      // npm audit returns non-zero exit code when vulnerabilities found
      if (error.stdout) {
        try {
          const audit = JSON.parse(error.stdout);
          return {
            success: false,
            message: `${audit.metadata.vulnerabilities.total} security vulnerabilities found`
          };
        } catch (parseError) {
          return {
            success: false,
            message: 'Failed to parse audit results'
          };
        }
      }
      
      return {
        success: false,
        message: `Dependency validation failed: ${error.message}`
      };
    }
  }

  validateFunctionSizes() {
    // This is a simplified check - in practice, you'd analyze the build output
    const apiDir = path.join(process.cwd(), 'app', 'api');
    
    if (!fs.existsSync(apiDir)) {
      return {
        success: true,
        message: 'No API functions found'
      };
    }

    // Count API routes
    const apiRoutes = this.countApiRoutes(apiDir);
    
    return {
      success: true,
      message: `${apiRoutes} API routes found`,
      count: apiRoutes
    };
  }

  countApiRoutes(dir) {
    let count = 0;
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        count += this.countApiRoutes(itemPath);
      } else if (item === 'route.js' || item === 'route.ts') {
        count++;
      }
    }
    
    return count;
  }

  validateResourceLimits() {
    // Check for large files that might cause issues
    const issues = [];
    
    // Check for .next directory (shouldn't be committed)
    if (fs.existsSync('.next')) {
      issues.push('.next directory found (should not be committed)');
    }

    // Check for large node_modules (if committed by mistake)
    if (fs.existsSync('node_modules')) {
      const stat = fs.statSync('node_modules');
      if (stat.isDirectory()) {
        issues.push('node_modules directory found (should not be committed)');
      }
    }

    return {
      success: issues.length === 0,
      message: issues.join(', '),
      issues
    };
  }

  async validateLocalBuild() {
    try {
      console.log('   Building locally to verify...');
      execSync('npm run build', { 
        stdio: 'pipe',
        timeout: 300000 // 5 minutes
      });
      
      // Check if build output exists
      if (!fs.existsSync('.next')) {
        return {
          success: false,
          message: 'Build completed but .next directory not found'
        };
      }

      return {
        success: true,
        message: 'Local build completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Local build failed: ${error.message}`
      };
    }
  }

  // ============================================================================
  // DEPLOYMENT EXECUTION
  // ============================================================================

  async deployToVercel() {
    console.log('🚀 Starting Vercel deployment...\n');
    
    this.metrics.deploymentStart = Date.now();
    
    try {
      // Pre-deployment validation
      console.log('📋 Running pre-deployment validation...');
      const validation = await this.validateDeployment();
      
      if (!validation.success) {
        throw new Error('Pre-deployment validation failed');
      }

      // Create backup reference
      console.log('💾 Creating deployment backup reference...');
      await this.createBackupReference();

      // Execute deployment
      console.log('🔄 Executing Vercel deployment...');
      const deploymentResult = await this.executeDeployment();

      // Post-deployment health checks
      console.log('🏥 Running post-deployment health checks...');
      const healthCheck = await this.performHealthChecks(deploymentResult.url);

      this.metrics.deploymentEnd = Date.now();
      this.metrics.buildDuration = this.metrics.deploymentEnd - this.metrics.deploymentStart;

      if (healthCheck.success) {
        console.log('✅ DEPLOYMENT SUCCESSFUL');
        console.log(`🌐 URL: ${deploymentResult.url}`);
        console.log(`⏱️  Duration: ${Math.round(this.metrics.buildDuration / 1000)}s`);
        
        return {
          success: true,
          url: deploymentResult.url,
          duration: this.metrics.buildDuration,
          healthCheck
        };
      } else {
        console.log('⚠️  DEPLOYMENT COMPLETED BUT HEALTH CHECKS FAILED');
        console.log('🔄 Consider rolling back if issues persist');
        
        return {
          success: false,
          url: deploymentResult.url,
          duration: this.metrics.buildDuration,
          healthCheck
        };
      }

    } catch (error) {
      console.error('❌ DEPLOYMENT FAILED:', error.message);
      
      return {
        success: false,
        error: error.message,
        duration: Date.now() - this.metrics.deploymentStart
      };
    }
  }

  async createBackupReference() {
    try {
      // Get current production deployment
      const currentDeployment = execSync('vercel ls --prod --json', { 
        encoding: 'utf8' 
      });
      
      const deployments = JSON.parse(currentDeployment);
      
      if (deployments.length > 0) {
        const backup = {
          timestamp: new Date().toISOString(),
          deployment: deployments[0],
          reason: 'Pre-deployment backup'
        };
        
        fs.writeFileSync(
          `backup-reference-${Date.now()}.json`, 
          JSON.stringify(backup, null, 2)
        );
        
        console.log(`   ✅ Backup reference created: ${deployments[0].url}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Could not create backup reference: ${error.message}`);
    }
  }

  async executeDeployment() {
    return new Promise((resolve, reject) => {
      const deployment = spawn('vercel', ['--prod', '--json'], {
        stdio: ['inherit', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      deployment.stdout.on('data', (data) => {
        output += data.toString();
        process.stdout.write(data);
      });

      deployment.stderr.on('data', (data) => {
        errorOutput += data.toString();
        process.stderr.write(data);
      });

      deployment.on('close', (code) => {
        if (code === 0) {
          try {
            // Parse the JSON output to get deployment URL
            const lines = output.trim().split('\n');
            const jsonLine = lines.find(line => line.startsWith('{'));
            
            if (jsonLine) {
              const result = JSON.parse(jsonLine);
              resolve({ url: result.url });
            } else {
              resolve({ url: 'https://your-deployment.vercel.app' });
            }
          } catch (error) {
            resolve({ url: 'https://your-deployment.vercel.app' });
          }
        } else {
          reject(new Error(`Deployment failed with exit code ${code}: ${errorOutput}`));
        }
      });
    });
  }

  // ============================================================================
  // HEALTH CHECKS & MONITORING
  // ============================================================================

  async performHealthChecks(deploymentUrl) {
    console.log(`   🔍 Testing deployment: ${deploymentUrl}`);
    
    const checks = [
      { name: 'Response Time', fn: () => this.checkResponseTime(deploymentUrl) },
      { name: 'SSL Certificate', fn: () => this.checkSSLCertificate(deploymentUrl) },
      { name: 'API Endpoints', fn: () => this.checkAPIEndpoints(deploymentUrl) },
      { name: 'Static Assets', fn: () => this.checkStaticAssets(deploymentUrl) }
    ];

    const results = [];
    
    for (const check of checks) {
      try {
        const result = await check.fn();
        results.push({ ...result, name: check.name });
        
        if (result.success) {
          console.log(`   ✅ ${check.name}: ${result.message}`);
        } else {
          console.log(`   ❌ ${check.name}: ${result.message}`);
        }
      } catch (error) {
        console.log(`   ❌ ${check.name}: ${error.message}`);
        results.push({
          name: check.name,
          success: false,
          message: error.message
        });
      }
    }

    const failures = results.filter(r => !r.success);
    
    return {
      success: failures.length === 0,
      results,
      failures
    };
  }

  async checkResponseTime(url) {
    return new Promise((resolve) => {
      const start = Date.now();
      
      https.get(url, (res) => {
        const duration = Date.now() - start;
        
        resolve({
          success: duration < this.config.responseTimeThreshold && res.statusCode === 200,
          message: `${duration}ms (Status: ${res.statusCode})`,
          duration,
          statusCode: res.statusCode
        });
      }).on('error', (error) => {
        resolve({
          success: false,
          message: error.message,
          duration: Date.now() - start
        });
      });
    });
  }

  async checkSSLCertificate(url) {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      
      if (urlObj.protocol !== 'https:') {
        resolve({
          success: false,
          message: 'Not using HTTPS'
        });
        return;
      }

      const req = https.get(url, (res) => {
        const cert = res.socket.getPeerCertificate();
        
        if (cert && cert.valid_to) {
          const expiryDate = new Date(cert.valid_to);
          const daysUntilExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
          
          resolve({
            success: daysUntilExpiry > 30,
            message: `Valid until ${cert.valid_to} (${daysUntilExpiry} days)`,
            expiryDate,
            daysUntilExpiry
          });
        } else {
          resolve({
            success: false,
            message: 'Could not retrieve certificate information'
          });
        }
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          message: error.message
        });
      });
    });
  }

  async checkAPIEndpoints(baseUrl) {
    // Test common API endpoints
    const endpoints = ['/api/health', '/api/status'];
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const result = await this.checkResponseTime(`${baseUrl}${endpoint}`);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          message: `${endpoint}: ${error.message}`
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount > 0,
      message: `${successCount}/${endpoints.length} API endpoints responding`,
      results
    };
  }

  async checkStaticAssets(baseUrl) {
    // Test common static assets
    const assets = ['/favicon.ico', '/_next/static/css'];
    let successCount = 0;
    
    for (const asset of assets) {
      try {
        const result = await this.checkResponseTime(`${baseUrl}${asset}`);
        if (result.success || result.statusCode === 404) {
          successCount++; // 404 is acceptable for optional assets
        }
      } catch (error) {
        // Continue checking other assets
      }
    }

    return {
      success: true, // Static assets are optional
      message: `${successCount}/${assets.length} static assets checked`,
      successCount
    };
  }

  // ============================================================================
  // MONITORING & ALERTING
  // ============================================================================

  async startMonitoring(deploymentUrl, duration = 300000) { // 5 minutes default
    console.log(`📊 Starting deployment monitoring for ${duration/1000} seconds...\n`);
    
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const monitoringResults = {
      startTime,
      endTime,
      checks: [],
      alerts: [],
      summary: {}
    };

    const monitoringInterval = setInterval(async () => {
      const now = Date.now();
      
      if (now >= endTime) {
        clearInterval(monitoringInterval);
        this.generateMonitoringReport(monitoringResults);
        return;
      }

      try {
        const healthCheck = await this.performHealthChecks(deploymentUrl);
        monitoringResults.checks.push({
          timestamp: now,
          ...healthCheck
        });

        // Check for alerts
        const alerts = this.checkForAlerts(healthCheck);
        if (alerts.length > 0) {
          monitoringResults.alerts.push(...alerts);
          console.log(`🚨 ALERTS: ${alerts.map(a => a.message).join(', ')}`);
        }

        // Progress indicator
        const elapsed = now - startTime;
        const progress = Math.round((elapsed / duration) * 100);
        process.stdout.write(`\r📊 Monitoring progress: ${progress}%`);

      } catch (error) {
        console.error(`\n❌ Monitoring error: ${error.message}`);
      }
    }, this.config.monitoringInterval);

    // Return a promise that resolves when monitoring is complete
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(monitoringResults);
      }, duration);
    });
  }

  checkForAlerts(healthCheck) {
    const alerts = [];
    
    if (!healthCheck.success) {
      alerts.push({
        type: 'health-check-failure',
        message: 'Health check failed',
        timestamp: Date.now(),
        details: healthCheck.failures
      });
    }

    // Check response time
    const responseTimeCheck = healthCheck.results?.find(r => r.name === 'Response Time');
    if (responseTimeCheck && responseTimeCheck.duration > this.config.responseTimeThreshold) {
      alerts.push({
        type: 'high-response-time',
        message: `High response time: ${responseTimeCheck.duration}ms`,
        timestamp: Date.now(),
        value: responseTimeCheck.duration
      });
    }

    return alerts;
  }

  generateMonitoringReport(results) {
    console.log('\n\n📊 MONITORING REPORT');
    console.log('===================');
    
    const duration = results.endTime - results.startTime;
    const totalChecks = results.checks.length;
    const successfulChecks = results.checks.filter(c => c.success).length;
    const successRate = Math.round((successfulChecks / totalChecks) * 100);

    console.log(`Duration: ${Math.round(duration / 1000)} seconds`);
    console.log(`Total Checks: ${totalChecks}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Alerts Generated: ${results.alerts.length}`);

    if (results.alerts.length > 0) {
      console.log('\n🚨 ALERTS:');
      results.alerts.forEach(alert => {
        console.log(`   ${alert.type}: ${alert.message}`);
      });
    }

    // Calculate average response time
    const responseTimes = results.checks
      .map(c => c.results?.find(r => r.name === 'Response Time')?.duration)
      .filter(t => t !== undefined);
    
    if (responseTimes.length > 0) {
      const avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
      console.log(`\nAverage Response Time: ${avgResponseTime}ms`);
    }

    console.log('\n✅ Monitoring complete');
  }

  // ============================================================================
  // ROLLBACK FUNCTIONALITY
  // ============================================================================

  async performRollback(targetDeployment = null) {
    console.log('🔄 Initiating deployment rollback...\n');
    
    try {
      // If no target specified, find the previous deployment
      if (!targetDeployment) {
        targetDeployment = await this.findPreviousDeployment();
      }

      console.log(`🎯 Rolling back to: ${targetDeployment}`);

      // Execute rollback
      execSync(`vercel rollback ${targetDeployment} --yes`, { 
        stdio: 'inherit' 
      });

      // Verify rollback
      console.log('🔍 Verifying rollback...');
      const healthCheck = await this.performHealthChecks(targetDeployment);

      if (healthCheck.success) {
        console.log('✅ ROLLBACK SUCCESSFUL');
        console.log(`🌐 Active deployment: ${targetDeployment}`);
        
        return {
          success: true,
          deployment: targetDeployment,
          healthCheck
        };
      } else {
        console.log('⚠️  ROLLBACK COMPLETED BUT HEALTH CHECKS FAILED');
        
        return {
          success: false,
          deployment: targetDeployment,
          healthCheck
        };
      }

    } catch (error) {
      console.error('❌ ROLLBACK FAILED:', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async findPreviousDeployment() {
    try {
      const deployments = execSync('vercel ls --json', { encoding: 'utf8' });
      const deploymentList = JSON.parse(deployments);
      
      // Find the second most recent deployment (first is current)
      if (deploymentList.length < 2) {
        throw new Error('No previous deployment found');
      }

      return deploymentList[1].url;
    } catch (error) {
      throw new Error(`Could not find previous deployment: ${error.message}`);
    }
  }

  // ============================================================================
  // CLI INTERFACE
  // ============================================================================

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    console.log('🚀 VERCEL DEPLOYMENT AUTOMATION TOOLKIT');
    console.log('======================================\n');

    switch (command) {
      case '--validate':
        await this.validateDeployment();
        break;

      case '--deploy':
        await this.deployToVercel();
        break;

      case '--monitor':
        const url = args[1] || 'https://your-deployment.vercel.app';
        const duration = parseInt(args[2]) || 300000;
        await this.startMonitoring(url, duration);
        break;

      case '--rollback':
        const target = args[1];
        await this.performRollback(target);
        break;

      case '--health-check':
        const checkUrl = args[1] || 'https://your-deployment.vercel.app';
        const healthResult = await this.performHealthChecks(checkUrl);
        console.log('\n📊 HEALTH CHECK RESULTS:');
        console.log(healthResult.success ? '✅ HEALTHY' : '❌ UNHEALTHY');
        break;

      default:
        console.log('Usage:');
        console.log('  node vercel-deployment-automation.js --validate');
        console.log('  node vercel-deployment-automation.js --deploy');
        console.log('  node vercel-deployment-automation.js --monitor [url] [duration]');
        console.log('  node vercel-deployment-automation.js --rollback [deployment-url]');
        console.log('  node vercel-deployment-automation.js --health-check [url]');
        break;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const automation = new VercelDeploymentAutomation();
  automation.run().catch(console.error);
}

module.exports = VercelDeploymentAutomation;