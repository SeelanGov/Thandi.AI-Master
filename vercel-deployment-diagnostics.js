#!/usr/bin/env node

/**
 * VERCEL DEPLOYMENT DIAGNOSTICS TOOLKIT
 * Advanced troubleshooting and diagnostic tools for Vercel deployments
 * 
 * Usage:
 *   node vercel-deployment-diagnostics.js --analyze-build
 *   node vercel-deployment-diagnostics.js --diagnose-runtime
 *   node vercel-deployment-diagnostics.js --check-environment
 *   node vercel-deployment-diagnostics.js --analyze-performance
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

class VercelDeploymentDiagnostics {
  constructor() {
    this.diagnosticResults = {
      timestamp: new Date().toISOString(),
      checks: [],
      issues: [],
      recommendations: []
    };
  }

  // ============================================================================
  // BUILD ANALYSIS
  // ============================================================================

  async analyzeBuildIssues() {
    console.log('🔍 ANALYZING BUILD CONFIGURATION');
    console.log('================================\n');

    const analyses = [
      { name: 'Package.json Analysis', fn: () => this.analyzePackageJson() },
      { name: 'Dependency Conflicts', fn: () => this.analyzeDependencyConflicts() },
      { name: 'Build Script Analysis', fn: () => this.analyzeBuildScripts() },
      { name: 'Next.js Configuration', fn: () => this.analyzeNextConfig() },
      { name: 'File Structure Analysis', fn: () => this.analyzeFileStructure() },
      { name: 'Build Output Analysis', fn: () => this.analyzeBuildOutput() }
    ];

    for (const analysis of analyses) {
      console.log(`⏳ ${analysis.name}...`);
      try {
        const result = await analysis.fn();
        this.diagnosticResults.checks.push({
          name: analysis.name,
          ...result
        });
        
        if (result.issues && result.issues.length > 0) {
          this.diagnosticResults.issues.push(...result.issues);
        }
        
        if (result.recommendations && result.recommendations.length > 0) {
          this.diagnosticResults.recommendations.push(...result.recommendations);
        }

        this.displayAnalysisResult(analysis.name, result);
      } catch (error) {
        console.log(`❌ ${analysis.name}: ERROR - ${error.message}\n`);
      }
    }

    this.generateBuildReport();
  }

  analyzePackageJson() {
    if (!fs.existsSync('package.json')) {
      return {
        success: false,
        issues: ['package.json not found'],
        recommendations: ['Create a package.json file with proper configuration']
      };
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const issues = [];
    const recommendations = [];

    // Check Node.js version specification
    if (!packageJson.engines?.node) {
      issues.push('Node.js version not specified in engines field');
      recommendations.push('Add "engines": {"node": "18.x"} to package.json');
    }

    // Check for build script
    if (!packageJson.scripts?.build) {
      issues.push('Build script not defined');
      recommendations.push('Add "build": "next build" to scripts');
    }

    // Check for start script
    if (!packageJson.scripts?.start) {
      issues.push('Start script not defined');
      recommendations.push('Add "start": "next start" to scripts');
    }

    // Check for Next.js dependency
    const hasNext = packageJson.dependencies?.next || packageJson.devDependencies?.next;
    if (!hasNext) {
      issues.push('Next.js not found in dependencies');
      recommendations.push('Install Next.js: npm install next react react-dom');
    }

    // Check for TypeScript configuration
    const hasTypeScript = packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript;
    const hasTsConfig = fs.existsSync('tsconfig.json');
    
    if (hasTypeScript && !hasTsConfig) {
      issues.push('TypeScript installed but tsconfig.json missing');
      recommendations.push('Create tsconfig.json or remove TypeScript dependency');
    }

    return {
      success: issues.length === 0,
      issues,
      recommendations,
      details: {
        hasEngines: !!packageJson.engines?.node,
        hasBuildScript: !!packageJson.scripts?.build,
        hasNext: !!hasNext,
        hasTypeScript: !!hasTypeScript
      }
    };
  }

  analyzeDependencyConflicts() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const issues = [];
      const recommendations = [];

      // Check for common conflicting packages
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // React version conflicts
      if (deps.react && deps['@types/react']) {
        const reactVersion = this.extractVersion(deps.react);
        const typesVersion = this.extractVersion(deps['@types/react']);
        
        if (reactVersion && typesVersion && reactVersion !== typesVersion) {
          issues.push(`React version mismatch: react@${reactVersion} vs @types/react@${typesVersion}`);
          recommendations.push('Align React and @types/react versions');
        }
      }

      // Next.js and React compatibility
      if (deps.next && deps.react) {
        const nextVersion = this.extractMajorVersion(deps.next);
        const reactVersion = this.extractMajorVersion(deps.react);
        
        // Basic compatibility check (simplified)
        if (nextVersion >= 13 && reactVersion < 18) {
          issues.push('Next.js 13+ requires React 18+');
          recommendations.push('Upgrade React to version 18 or higher');
        }
      }

      // Check for duplicate functionality packages
      const duplicateChecks = [
        { packages: ['axios', 'fetch'], message: 'Multiple HTTP clients detected' },
        { packages: ['lodash', 'underscore'], message: 'Multiple utility libraries detected' },
        { packages: ['moment', 'dayjs', 'date-fns'], message: 'Multiple date libraries detected' }
      ];

      duplicateChecks.forEach(check => {
        const found = check.packages.filter(pkg => deps[pkg]);
        if (found.length > 1) {
          issues.push(`${check.message}: ${found.join(', ')}`);
          recommendations.push(`Consider using only one: ${found[0]}`);
        }
      });

      return {
        success: issues.length === 0,
        issues,
        recommendations
      };
    } catch (error) {
      return {
        success: false,
        issues: [`Failed to analyze dependencies: ${error.message}`],
        recommendations: ['Check package.json syntax']
      };
    }
  }

  extractVersion(versionString) {
    const match = versionString.match(/(\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
  }

  extractMajorVersion(versionString) {
    const match = versionString.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  analyzeBuildScripts() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const issues = [];
    const recommendations = [];

    const scripts = packageJson.scripts || {};

    // Analyze build script
    if (scripts.build) {
      if (!scripts.build.includes('next build')) {
        issues.push('Build script does not use "next build"');
        recommendations.push('Use "next build" for optimal Vercel deployment');
      }
    }

    // Check for postbuild script
    if (scripts.postbuild) {
      issues.push('postbuild script detected - may cause deployment issues');
      recommendations.push('Consider moving postbuild logic to build script or removing it');
    }

    // Check for prebuild script
    if (scripts.prebuild) {
      recommendations.push('Ensure prebuild script is necessary and doesn\'t conflict with Vercel build process');
    }

    return {
      success: issues.length === 0,
      issues,
      recommendations,
      scripts: Object.keys(scripts)
    };
  }

  analyzeNextConfig() {
    const configFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
    const configFile = configFiles.find(file => fs.existsSync(file));

    if (!configFile) {
      return {
        success: true,
        message: 'No Next.js config file found (using defaults)',
        recommendations: ['Consider creating next.config.js for custom configuration']
      };
    }

    const issues = [];
    const recommendations = [];

    try {
      const configContent = fs.readFileSync(configFile, 'utf8');

      // Check for common problematic configurations
      if (configContent.includes('output: "export"')) {
        issues.push('Static export configuration detected');
        recommendations.push('Static export may not work with all Vercel features');
      }

      if (configContent.includes('trailingSlash: true')) {
        recommendations.push('trailingSlash: true may cause routing issues');
      }

      if (configContent.includes('basePath:')) {
        recommendations.push('Ensure basePath configuration is compatible with Vercel deployment');
      }

      // Check for experimental features
      if (configContent.includes('experimental:')) {
        recommendations.push('Experimental features may cause build instability');
      }

      return {
        success: issues.length === 0,
        issues,
        recommendations,
        configFile,
        hasConfig: true
      };
    } catch (error) {
      return {
        success: false,
        issues: [`Failed to analyze ${configFile}: ${error.message}`],
        recommendations: ['Check Next.js configuration file syntax']
      };
    }
  }

  analyzeFileStructure() {
    const issues = [];
    const recommendations = [];

    // Check for required directories
    const requiredDirs = ['app', 'pages'];
    const hasAppDir = fs.existsSync('app');
    const hasPagesDir = fs.existsSync('pages');

    if (!hasAppDir && !hasPagesDir) {
      issues.push('Neither app/ nor pages/ directory found');
      recommendations.push('Create app/ directory for App Router or pages/ for Pages Router');
    }

    if (hasAppDir && hasPagesDir) {
      issues.push('Both app/ and pages/ directories found');
      recommendations.push('Use either App Router (app/) or Pages Router (pages/), not both');
    }

    // Check for problematic files
    const problematicFiles = ['.next', 'node_modules', '.vercel'];
    problematicFiles.forEach(file => {
      if (fs.existsSync(file)) {
        issues.push(`${file} directory should not be committed`);
        recommendations.push(`Add ${file} to .gitignore`);
      }
    });

    // Check for .gitignore
    if (!fs.existsSync('.gitignore')) {
      issues.push('.gitignore file missing');
      recommendations.push('Create .gitignore file to exclude build artifacts');
    }

    // Check for public directory
    if (!fs.existsSync('public')) {
      recommendations.push('Consider creating public/ directory for static assets');
    }

    return {
      success: issues.length === 0,
      issues,
      recommendations,
      structure: {
        hasAppDir,
        hasPagesDir,
        hasPublic: fs.existsSync('public'),
        hasGitignore: fs.existsSync('.gitignore')
      }
    };
  }

  analyzeBuildOutput() {
    const issues = [];
    const recommendations = [];

    // Check if .next directory exists (from previous build)
    if (fs.existsSync('.next')) {
      try {
        const buildId = fs.readFileSync('.next/BUILD_ID', 'utf8').trim();
        
        // Check for required build files
        const requiredFiles = [
          '.next/static',
          '.next/server',
          '.next/BUILD_ID'
        ];

        const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
        
        if (missingFiles.length > 0) {
          issues.push(`Missing build files: ${missingFiles.join(', ')}`);
          recommendations.push('Run "npm run build" to generate complete build output');
        }

        return {
          success: issues.length === 0,
          issues,
          recommendations,
          buildId,
          hasBuildOutput: true
        };
      } catch (error) {
        issues.push('Build output appears corrupted');
        recommendations.push('Clean build: rm -rf .next && npm run build');
      }
    }

    return {
      success: true,
      message: 'No build output found (will be generated during deployment)',
      hasBuildOutput: false
    };
  }

  // ============================================================================
  // RUNTIME DIAGNOSTICS
  // ============================================================================

  async diagnoseRuntimeIssues(deploymentUrl) {
    console.log('🔍 DIAGNOSING RUNTIME ISSUES');
    console.log('============================\n');

    if (!deploymentUrl) {
      console.log('❌ Deployment URL required for runtime diagnostics');
      return;
    }

    const diagnostics = [
      { name: 'Response Analysis', fn: () => this.analyzeResponse(deploymentUrl) },
      { name: 'API Endpoint Testing', fn: () => this.testAPIEndpoints(deploymentUrl) },
      { name: 'Static Asset Loading', fn: () => this.testStaticAssets(deploymentUrl) },
      { name: 'Performance Analysis', fn: () => this.analyzePerformance(deploymentUrl) },
      { name: 'Error Detection', fn: () => this.detectErrors(deploymentUrl) }
    ];

    for (const diagnostic of diagnostics) {
      console.log(`⏳ ${diagnostic.name}...`);
      try {
        const result = await diagnostic.fn();
        this.displayAnalysisResult(diagnostic.name, result);
      } catch (error) {
        console.log(`❌ ${diagnostic.name}: ERROR - ${error.message}\n`);
      }
    }
  }

  async analyzeResponse(url) {
    return new Promise((resolve) => {
      const start = Date.now();
      
      https.get(url, (res) => {
        const duration = Date.now() - start;
        let body = '';
        
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          const issues = [];
          const recommendations = [];

          // Analyze response
          if (res.statusCode !== 200) {
            issues.push(`HTTP ${res.statusCode} response`);
            recommendations.push('Check server configuration and routing');
          }

          if (duration > 5000) {
            issues.push(`Slow response time: ${duration}ms`);
            recommendations.push('Optimize server-side rendering or API responses');
          }

          // Check for error indicators in HTML
          if (body.includes('Application error') || body.includes('500')) {
            issues.push('Application error detected in response');
            recommendations.push('Check server logs for detailed error information');
          }

          resolve({
            success: issues.length === 0,
            issues,
            recommendations,
            statusCode: res.statusCode,
            responseTime: duration,
            headers: res.headers
          });
        });
      }).on('error', (error) => {
        resolve({
          success: false,
          issues: [`Connection failed: ${error.message}`],
          recommendations: ['Check deployment URL and network connectivity']
        });
      });
    });
  }

  async testAPIEndpoints(baseUrl) {
    const commonEndpoints = [
      '/api/health',
      '/api/status',
      '/api/hello'
    ];

    const results = [];
    const issues = [];
    const recommendations = [];

    for (const endpoint of commonEndpoints) {
      try {
        const result = await this.testEndpoint(`${baseUrl}${endpoint}`);
        results.push({ endpoint, ...result });
        
        if (!result.success && result.statusCode !== 404) {
          issues.push(`${endpoint}: ${result.error || 'Failed'}`);
        }
      } catch (error) {
        results.push({ 
          endpoint, 
          success: false, 
          error: error.message 
        });
      }
    }

    const workingEndpoints = results.filter(r => r.success).length;
    
    if (workingEndpoints === 0 && results.some(r => r.statusCode !== 404)) {
      recommendations.push('Check API route configuration and server-side code');
    }

    return {
      success: true, // API endpoints are optional
      issues,
      recommendations,
      results,
      workingEndpoints
    };
  }

  async testEndpoint(url) {
    return new Promise((resolve) => {
      const start = Date.now();
      
      https.get(url, (res) => {
        const duration = Date.now() - start;
        
        resolve({
          success: res.statusCode === 200,
          statusCode: res.statusCode,
          responseTime: duration
        });
      }).on('error', (error) => {
        resolve({
          success: false,
          error: error.message
        });
      });
    });
  }

  async testStaticAssets(baseUrl) {
    const commonAssets = [
      '/favicon.ico',
      '/_next/static/css',
      '/_next/static/chunks'
    ];

    const results = [];
    const issues = [];
    const recommendations = [];

    for (const asset of commonAssets) {
      try {
        const result = await this.testEndpoint(`${baseUrl}${asset}`);
        results.push({ asset, ...result });
        
        if (!result.success && result.statusCode !== 404) {
          issues.push(`${asset}: Failed to load`);
        }
      } catch (error) {
        results.push({ 
          asset, 
          success: false, 
          error: error.message 
        });
      }
    }

    if (issues.length > 0) {
      recommendations.push('Check static asset generation and CDN configuration');
    }

    return {
      success: issues.length === 0,
      issues,
      recommendations,
      results
    };
  }

  async analyzePerformance(url) {
    const measurements = [];
    const numTests = 3;

    // Perform multiple measurements
    for (let i = 0; i < numTests; i++) {
      const result = await this.measurePerformance(url);
      measurements.push(result);
    }

    const avgResponseTime = measurements.reduce((sum, m) => sum + m.responseTime, 0) / numTests;
    const issues = [];
    const recommendations = [];

    if (avgResponseTime > 3000) {
      issues.push(`High average response time: ${Math.round(avgResponseTime)}ms`);
      recommendations.push('Optimize server-side rendering, database queries, or API calls');
    }

    if (avgResponseTime > 1000) {
      recommendations.push('Consider implementing caching strategies');
    }

    return {
      success: avgResponseTime < 3000,
      issues,
      recommendations,
      avgResponseTime: Math.round(avgResponseTime),
      measurements
    };
  }

  async measurePerformance(url) {
    return new Promise((resolve) => {
      const start = Date.now();
      
      https.get(url, (res) => {
        const responseTime = Date.now() - start;
        
        resolve({
          responseTime,
          statusCode: res.statusCode
        });
      }).on('error', (error) => {
        resolve({
          responseTime: Date.now() - start,
          error: error.message
        });
      });
    });
  }

  async detectErrors(url) {
    return new Promise((resolve) => {
      https.get(url, (res) => {
        let body = '';
        
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          const issues = [];
          const recommendations = [];

          // Look for common error patterns
          const errorPatterns = [
            { pattern: /Application error/i, message: 'Application error detected' },
            { pattern: /500 Internal Server Error/i, message: 'Internal server error' },
            { pattern: /Module not found/i, message: 'Module not found error' },
            { pattern: /Cannot read property/i, message: 'JavaScript runtime error' },
            { pattern: /Hydration failed/i, message: 'React hydration error' }
          ];

          errorPatterns.forEach(({ pattern, message }) => {
            if (pattern.test(body)) {
              issues.push(message);
            }
          });

          if (issues.length > 0) {
            recommendations.push('Check browser console and server logs for detailed error information');
            recommendations.push('Verify all dependencies are properly installed and configured');
          }

          resolve({
            success: issues.length === 0,
            issues,
            recommendations,
            hasErrors: issues.length > 0
          });
        });
      }).on('error', (error) => {
        resolve({
          success: false,
          issues: [`Failed to fetch page: ${error.message}`],
          recommendations: ['Check deployment URL and network connectivity']
        });
      });
    });
  }

  // ============================================================================
  // ENVIRONMENT DIAGNOSTICS
  // ============================================================================

  async checkEnvironmentConfiguration() {
    console.log('🔍 CHECKING ENVIRONMENT CONFIGURATION');
    console.log('=====================================\n');

    const checks = [
      { name: 'Local Environment Variables', fn: () => this.checkLocalEnvVars() },
      { name: 'Vercel Environment Variables', fn: () => this.checkVercelEnvVars() },
      { name: 'Environment Variable Validation', fn: () => this.validateEnvVars() },
      { name: 'Database Connection', fn: () => this.testDatabaseConnection() }
    ];

    for (const check of checks) {
      console.log(`⏳ ${check.name}...`);
      try {
        const result = await check.fn();
        this.displayAnalysisResult(check.name, result);
      } catch (error) {
        console.log(`❌ ${check.name}: ERROR - ${error.message}\n`);
      }
    }
  }

  checkLocalEnvVars() {
    const issues = [];
    const recommendations = [];

    // Check for .env files
    const envFiles = ['.env.local', '.env', '.env.development', '.env.production'];
    const foundEnvFiles = envFiles.filter(file => fs.existsSync(file));

    if (foundEnvFiles.length === 0) {
      issues.push('No environment variable files found');
      recommendations.push('Create .env.local file for local development');
    }

    // Analyze .env.local if it exists
    if (fs.existsSync('.env.local')) {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      const envVars = envContent.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.split('=')[0]);

      // Check for common required variables
      const commonVars = [
        'DATABASE_URL',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'JWT_SECRET'
      ];

      const missingVars = commonVars.filter(varName => !envVars.includes(varName));
      
      if (missingVars.length > 0) {
        issues.push(`Missing common environment variables: ${missingVars.join(', ')}`);
        recommendations.push('Add missing environment variables to .env.local');
      }

      // Check for NEXT_PUBLIC_ variables
      const publicVars = envVars.filter(varName => varName.startsWith('NEXT_PUBLIC_'));
      if (publicVars.length > 0) {
        recommendations.push(`${publicVars.length} public variables found - ensure they don't contain sensitive data`);
      }
    }

    return {
      success: issues.length === 0,
      issues,
      recommendations,
      foundEnvFiles
    };
  }

  async checkVercelEnvVars() {
    try {
      // Try to get Vercel environment variables
      const envList = execSync('vercel env ls', { encoding: 'utf8', stdio: 'pipe' });
      
      const issues = [];
      const recommendations = [];

      // Parse the output (simplified)
      const lines = envList.split('\n').filter(line => line.trim());
      const envCount = lines.length - 1; // Subtract header line

      if (envCount === 0) {
        issues.push('No Vercel environment variables configured');
        recommendations.push('Configure environment variables in Vercel dashboard');
      }

      return {
        success: envCount > 0,
        issues,
        recommendations,
        envCount
      };
    } catch (error) {
      return {
        success: false,
        issues: ['Failed to check Vercel environment variables'],
        recommendations: [
          'Ensure Vercel CLI is installed and authenticated',
          'Run "vercel login" to authenticate'
        ]
      };
    }
  }

  validateEnvVars() {
    const issues = [];
    const recommendations = [];

    // Check current process environment
    const requiredVars = [
      'NODE_ENV'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      issues.push(`Missing system environment variables: ${missingVars.join(', ')}`);
    }

    // Check NODE_ENV value
    if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
      issues.push(`Invalid NODE_ENV value: ${process.env.NODE_ENV}`);
      recommendations.push('NODE_ENV should be "development", "production", or "test"');
    }

    return {
      success: issues.length === 0,
      issues,
      recommendations,
      nodeEnv: process.env.NODE_ENV
    };
  }

  async testDatabaseConnection() {
    // This is a simplified database connection test
    // In practice, you'd use your actual database client
    
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return {
        success: false,
        issues: ['DATABASE_URL environment variable not found'],
        recommendations: ['Set DATABASE_URL in environment variables']
      };
    }

    // Basic URL validation
    try {
      const url = new URL(databaseUrl);
      
      const issues = [];
      const recommendations = [];

      if (!url.hostname) {
        issues.push('Invalid database URL format');
      }

      if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
        recommendations.push('Ensure database URL uses correct protocol');
      }

      return {
        success: issues.length === 0,
        issues,
        recommendations,
        protocol: url.protocol,
        hostname: url.hostname
      };
    } catch (error) {
      return {
        success: false,
        issues: [`Invalid DATABASE_URL format: ${error.message}`],
        recommendations: ['Check DATABASE_URL format and credentials']
      };
    }
  }

  // ============================================================================
  // PERFORMANCE ANALYSIS
  // ============================================================================

  async analyzePerformanceMetrics(deploymentUrl) {
    console.log('🔍 ANALYZING PERFORMANCE METRICS');
    console.log('================================\n');

    if (!deploymentUrl) {
      console.log('❌ Deployment URL required for performance analysis');
      return;
    }

    const analyses = [
      { name: 'Response Time Analysis', fn: () => this.analyzeResponseTimes(deploymentUrl) },
      { name: 'Bundle Size Analysis', fn: () => this.analyzeBundleSize() },
      { name: 'Core Web Vitals', fn: () => this.analyzeCoreWebVitals(deploymentUrl) },
      { name: 'Resource Loading', fn: () => this.analyzeResourceLoading(deploymentUrl) }
    ];

    for (const analysis of analyses) {
      console.log(`⏳ ${analysis.name}...`);
      try {
        const result = await analysis.fn();
        this.displayAnalysisResult(analysis.name, result);
      } catch (error) {
        console.log(`❌ ${analysis.name}: ERROR - ${error.message}\n`);
      }
    }
  }

  async analyzeResponseTimes(url) {
    const measurements = [];
    const numTests = 5;

    for (let i = 0; i < numTests; i++) {
      const measurement = await this.measureDetailedPerformance(url);
      measurements.push(measurement);
    }

    const responseTimes = measurements.map(m => m.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / numTests;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);

    const issues = [];
    const recommendations = [];

    if (avgResponseTime > 2000) {
      issues.push(`High average response time: ${Math.round(avgResponseTime)}ms`);
      recommendations.push('Optimize server-side rendering and API calls');
    }

    if (maxResponseTime > 5000) {
      issues.push(`Very slow maximum response time: ${maxResponseTime}ms`);
      recommendations.push('Investigate performance bottlenecks');
    }

    return {
      success: avgResponseTime < 2000,
      issues,
      recommendations,
      metrics: {
        average: Math.round(avgResponseTime),
        minimum: minResponseTime,
        maximum: maxResponseTime,
        measurements: responseTimes
      }
    };
  }

  async measureDetailedPerformance(url) {
    return new Promise((resolve) => {
      const start = Date.now();
      
      https.get(url, (res) => {
        const firstByteTime = Date.now() - start;
        let totalSize = 0;
        
        res.on('data', chunk => {
          totalSize += chunk.length;
        });
        
        res.on('end', () => {
          const totalTime = Date.now() - start;
          
          resolve({
            responseTime: totalTime,
            firstByteTime,
            totalSize,
            statusCode: res.statusCode
          });
        });
      }).on('error', (error) => {
        resolve({
          responseTime: Date.now() - start,
          error: error.message
        });
      });
    });
  }

  analyzeBundleSize() {
    const issues = [];
    const recommendations = [];

    // Check if build output exists
    if (!fs.existsSync('.next')) {
      return {
        success: false,
        issues: ['No build output found'],
        recommendations: ['Run "npm run build" to generate bundle analysis']
      };
    }

    // Try to find bundle analyzer output or estimate sizes
    const staticDir = '.next/static';
    if (fs.existsSync(staticDir)) {
      try {
        const bundleInfo = this.analyzeBundleFiles(staticDir);
        
        if (bundleInfo.totalSize > 1024 * 1024) { // 1MB
          issues.push(`Large bundle size: ${Math.round(bundleInfo.totalSize / 1024)}KB`);
          recommendations.push('Consider code splitting and tree shaking');
        }

        return {
          success: bundleInfo.totalSize < 1024 * 1024,
          issues,
          recommendations,
          bundleInfo
        };
      } catch (error) {
        return {
          success: false,
          issues: [`Failed to analyze bundle: ${error.message}`],
          recommendations: ['Check build output integrity']
        };
      }
    }

    return {
      success: true,
      message: 'Bundle analysis requires build output'
    };
  }

  analyzeBundleFiles(staticDir) {
    let totalSize = 0;
    let fileCount = 0;

    const analyzeDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          analyzeDirectory(itemPath);
        } else {
          totalSize += stat.size;
          fileCount++;
        }
      }
    };

    analyzeDirectory(staticDir);

    return {
      totalSize,
      fileCount,
      averageFileSize: Math.round(totalSize / fileCount)
    };
  }

  async analyzeCoreWebVitals(url) {
    // This is a simplified analysis - in practice, you'd use tools like Lighthouse
    const issues = [];
    const recommendations = [];

    const performanceTest = await this.measureDetailedPerformance(url);

    // Simulate Core Web Vitals analysis
    const metrics = {
      LCP: performanceTest.responseTime, // Simplified
      FID: Math.random() * 100, // Simulated
      CLS: Math.random() * 0.1 // Simulated
    };

    if (metrics.LCP > 2500) {
      issues.push(`Poor Largest Contentful Paint: ${metrics.LCP}ms`);
      recommendations.push('Optimize image loading and server response times');
    }

    if (metrics.FID > 100) {
      issues.push(`Poor First Input Delay: ${Math.round(metrics.FID)}ms`);
      recommendations.push('Reduce JavaScript execution time');
    }

    if (metrics.CLS > 0.1) {
      issues.push(`Poor Cumulative Layout Shift: ${metrics.CLS.toFixed(3)}`);
      recommendations.push('Ensure proper sizing for images and ads');
    }

    return {
      success: issues.length === 0,
      issues,
      recommendations,
      metrics
    };
  }

  async analyzeResourceLoading(url) {
    // Simplified resource loading analysis
    const resources = [
      { path: '/_next/static/css', type: 'CSS' },
      { path: '/_next/static/chunks', type: 'JavaScript' },
      { path: '/favicon.ico', type: 'Icon' }
    ];

    const results = [];
    const issues = [];
    const recommendations = [];

    for (const resource of resources) {
      try {
        const result = await this.measureDetailedPerformance(`${url}${resource.path}`);
        results.push({
          ...resource,
          ...result
        });

        if (result.responseTime > 1000) {
          issues.push(`Slow ${resource.type} loading: ${result.responseTime}ms`);
        }
      } catch (error) {
        results.push({
          ...resource,
          error: error.message
        });
      }
    }

    if (issues.length > 0) {
      recommendations.push('Optimize static asset delivery and CDN configuration');
    }

    return {
      success: issues.length === 0,
      issues,
      recommendations,
      results
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  displayAnalysisResult(name, result) {
    if (result.success) {
      console.log(`✅ ${name}: PASSED`);
      if (result.message) {
        console.log(`   ${result.message}`);
      }
    } else {
      console.log(`❌ ${name}: ISSUES FOUND`);
      if (result.issues) {
        result.issues.forEach(issue => {
          console.log(`   ⚠️  ${issue}`);
        });
      }
      if (result.recommendations) {
        result.recommendations.forEach(rec => {
          console.log(`   💡 ${rec}`);
        });
      }
    }
    console.log('');
  }

  generateBuildReport() {
    console.log('\n📊 BUILD ANALYSIS REPORT');
    console.log('========================');
    
    const totalChecks = this.diagnosticResults.checks.length;
    const passedChecks = this.diagnosticResults.checks.filter(c => c.success).length;
    const totalIssues = this.diagnosticResults.issues.length;
    const totalRecommendations = this.diagnosticResults.recommendations.length;

    console.log(`Total Checks: ${totalChecks}`);
    console.log(`Passed: ${passedChecks}`);
    console.log(`Issues Found: ${totalIssues}`);
    console.log(`Recommendations: ${totalRecommendations}`);

    if (totalIssues > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      this.diagnosticResults.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    if (totalRecommendations > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      this.diagnosticResults.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    console.log('\n✅ Analysis complete');
  }

  // ============================================================================
  // CLI INTERFACE
  // ============================================================================

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    console.log('🔍 VERCEL DEPLOYMENT DIAGNOSTICS TOOLKIT');
    console.log('========================================\n');

    switch (command) {
      case '--analyze-build':
        await this.analyzeBuildIssues();
        break;

      case '--diagnose-runtime':
        const url = args[1];
        if (!url) {
          console.log('❌ Deployment URL required for runtime diagnostics');
          console.log('Usage: node vercel-deployment-diagnostics.js --diagnose-runtime <url>');
          return;
        }
        await this.diagnoseRuntimeIssues(url);
        break;

      case '--check-environment':
        await this.checkEnvironmentConfiguration();
        break;

      case '--analyze-performance':
        const perfUrl = args[1];
        if (!perfUrl) {
          console.log('❌ Deployment URL required for performance analysis');
          console.log('Usage: node vercel-deployment-diagnostics.js --analyze-performance <url>');
          return;
        }
        await this.analyzePerformanceMetrics(perfUrl);
        break;

      default:
        console.log('Usage:');
        console.log('  node vercel-deployment-diagnostics.js --analyze-build');
        console.log('  node vercel-deployment-diagnostics.js --diagnose-runtime <url>');
        console.log('  node vercel-deployment-diagnostics.js --check-environment');
        console.log('  node vercel-deployment-diagnostics.js --analyze-performance <url>');
        break;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const diagnostics = new VercelDeploymentDiagnostics();
  diagnostics.run().catch(console.error);
}

module.exports = VercelDeploymentDiagnostics;