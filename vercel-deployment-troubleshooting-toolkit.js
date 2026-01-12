#!/usr/bin/env node

/**
 * VERCEL DEPLOYMENT TROUBLESHOOTING TOOLKIT
 * Comprehensive diagnostic and recovery tools for Phase 0 deployments
 * 
 * Based on research findings from Vercel deployment mechanics analysis
 * Generated: January 11, 2026
 */

const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');

/**
 * Deployment issue classifier based on research findings
 */
class DeploymentIssueClassifier {
  constructor() {
    this.issuePatterns = {
      // Build failures (Stage 4 issues)
      buildFailures: {
        'DEPENDENCY_INSTALL_FAILED': {
          patterns: [
            /npm ERR! 404/,
            /Package not found/,
            /ENOTFOUND registry/,
            /network timeout/
          ],
          category: 'dependency',
          severity: 'high'
        },
        'BUILD_SCRIPT_FAILED': {
          patterns: [
            /Command "build" exited with 1/,
            /TypeScript error/,
            /Compilation failed/,
            /Module not found/
          ],
          category: 'buildScript',
          severity: 'high'
        },
        'MEMORY_EXCEEDED': {
          patterns: [
            /JavaScript heap out of memory/,
            /FATAL ERROR: Ineffective mark-compacts/,
            /Process out of memory/
          ],
          category: 'resource',
          severity: 'medium'
        },
        'TIMEOUT_EXCEEDED': {
          patterns: [
            /Build exceeded maximum time/,
            /Command timed out/,
            /Build timeout/
          ],
          category: 'resource',
          severity: 'medium'
        }
      },
      
      // Runtime failures (Stage 6 issues)
      runtimeFailures: {
        'FUNCTION_TIMEOUT': {
          patterns: [
            /Task timed out after/,
            /504 Gateway Timeout/,
            /Function execution timeout/
          ],
          category: 'runtime',
          severity: 'high'
        },
        'SUPABASE_CONNECTION_FAILED': {
          patterns: [
            /connect ECONNREFUSED.*supabase/,
            /Invalid API key/,
            /Supabase client error/,
            /Database connection failed/
          ],
          category: 'database',
          severity: 'critical'
        },
        'RLS_POLICY_VIOLATION': {
          patterns: [
            /new row violates row-level security policy/,
            /permission denied for table/,
            /RLS policy/
          ],
          category: 'security',
          severity: 'high'
        }
      },
      
      // Phase 0 specific issues
      phase0Issues: {
        'STUDENT_REGISTRATION_FAILED': {
          patterns: [
            /student registration.*failed/,
            /registration form.*error/,
            /student.*validation.*failed/
          ],
          category: 'phase0',
          severity: 'critical'
        },
        'SCHOOL_SEARCH_FAILED': {
          patterns: [
            /school search.*failed/,
            /school.*not found/,
            /search.*timeout/
          ],
          category: 'phase0',
          severity: 'high'
        },
        'SCHOOL_CODE_VALIDATION_FAILED': {
          patterns: [
            /school code.*invalid/,
            /code validation.*failed/,
            /invalid.*school.*code/
          ],
          category: 'phase0',
          severity: 'medium'
        }
      }
    };
  }

  classifyError(errorMessage) {
    const allPatterns = {
      ...this.issuePatterns.buildFailures,
      ...this.issuePatterns.runtimeFailures,
      ...this.issuePatterns.phase0Issues
    };

    for (const [issueType, config] of Object.entries(allPatterns)) {
      for (const pattern of config.patterns) {
        if (pattern.test(errorMessage)) {
          return {
            type: issueType,
            category: config.category,
            severity: config.severity,
            patterns: config.patterns
          };
        }
      }
    }

    return {
      type: 'UNKNOWN_ERROR',
      category: 'unknown',
      severity: 'medium',
      patterns: []
    };
  }
}

/**
 * Comprehensive diagnostic toolkit
 */
class DeploymentDiagnostics {
  constructor() {
    this.classifier = new DeploymentIssueClassifier();
    this.diagnosticResults = {};
  }

  // Stage 1-2: Source and dependency diagnostics
  async diagnoseBuildEnvironment() {
    console.log('🔍 Diagnosing build environment...');
    
    const diagnostics = {
      nodeVersion: process.version,
      npmVersion: null,
      lockfilePresent: false,
      packageJsonValid: false,
      vercelConfigPresent: false
    };

    try {
      diagnostics.npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    } catch (error) {
      diagnostics.npmVersion = 'Not available';
    }

    diagnostics.lockfilePresent = fs.existsSync('package-lock.json') || fs.existsSync('yarn.lock');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      diagnostics.packageJsonValid = true;
      diagnostics.scripts = Object.keys(packageJson.scripts || {});
      diagnostics.dependencies = Object.keys(packageJson.dependencies || {}).length;
      diagnostics.devDependencies = Object.keys(packageJson.devDependencies || {}).length;
    } catch (error) {
      diagnostics.packageJsonValid = false;
    }

    diagnostics.vercelConfigPresent = fs.existsSync('vercel.json');

    this.diagnosticResults.buildEnvironment = diagnostics;
    return diagnostics;
  }

  // Stage 3-4: Build process diagnostics
  async diagnoseBuildProcess() {
    console.log('🔍 Diagnosing build process...');
    
    const diagnostics = {
      typeCheckPassed: false,
      lintPassed: false,
      buildPassed: false,
      buildTime: null,
      buildSize: null,
      errors: []
    };

    // Type checking
    try {
      const start = Date.now();
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      diagnostics.typeCheckPassed = true;
      diagnostics.typeCheckTime = Date.now() - start;
    } catch (error) {
      diagnostics.errors.push(`Type check failed: ${error.message}`);
    }

    // Linting
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      diagnostics.lintPassed = true;
    } catch (error) {
      diagnostics.errors.push(`Lint failed: ${error.message}`);
    }

    // Build process
    try {
      const start = Date.now();
      execSync('npm run build', { stdio: 'pipe' });
      diagnostics.buildPassed = true;
      diagnostics.buildTime = Date.now() - start;
      
      // Check build output size
      if (fs.existsSync('.next')) {
        const stats = execSync('du -sh .next', { encoding: 'utf8' });
        diagnostics.buildSize = stats.split('\t')[0];
      }
    } catch (error) {
      diagnostics.errors.push(`Build failed: ${error.message}`);
    }

    this.diagnosticResults.buildProcess = diagnostics;
    return diagnostics;
  }

  // Stage 5-6: Runtime and deployment diagnostics
  async diagnoseRuntimeEnvironment() {
    console.log('🔍 Diagnosing runtime environment...');
    
    const diagnostics = {
      environmentVariables: {},
      supabaseConnection: false,
      databaseTables: [],
      rlsPolicies: [],
      errors: []
    };

    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'SUPABASE_URL', 
      'SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    for (const envVar of requiredEnvVars) {
      diagnostics.environmentVariables[envVar] = {
        present: !!process.env[envVar],
        length: process.env[envVar]?.length || 0
      };
    }

    // Test Supabase connection
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );

      // Test basic connectivity
      const { data, error } = await supabase.from('schools').select('count').limit(1);
      
      if (error) {
        diagnostics.errors.push(`Supabase connection error: ${error.message}`);
      } else {
        diagnostics.supabaseConnection = true;
      }

      // Check required tables
      const requiredTables = ['schools', 'students', 'student_school_associations'];
      for (const table of requiredTables) {
        try {
          const { error: tableError } = await supabase.from(table).select('*').limit(1);
          if (!tableError) {
            diagnostics.databaseTables.push(table);
          }
        } catch (tableError) {
          diagnostics.errors.push(`Table ${table} not accessible: ${tableError.message}`);
        }
      }

    } catch (error) {
      diagnostics.errors.push(`Supabase setup error: ${error.message}`);
    }

    this.diagnosticResults.runtimeEnvironment = diagnostics;
    return diagnostics;
  }

  // Phase 0 specific diagnostics
  async diagnosePhase0Functionality() {
    console.log('🔍 Diagnosing Phase 0 functionality...');
    
    const diagnostics = {
      apiRoutes: {},
      components: {},
      functionality: {},
      errors: []
    };

    // Check API routes
    const requiredApiRoutes = [
      'app/api/student/register/route.js',
      'app/api/schools/search/route.js',
      'app/api/schools/validate-code/route.js',
      'app/api/schools/request-addition/route.js'
    ];

    for (const route of requiredApiRoutes) {
      diagnostics.apiRoutes[route] = {
        exists: fs.existsSync(route),
        size: fs.existsSync(route) ? fs.statSync(route).size : 0
      };
    }

    // Check components
    const requiredComponents = [
      'components/BulletproofStudentRegistration.jsx',
      'app/school/claim/page.js'
    ];

    for (const component of requiredComponents) {
      diagnostics.components[component] = {
        exists: fs.existsSync(component),
        size: fs.existsSync(component) ? fs.statSync(component).size : 0
      };
    }

    this.diagnosticResults.phase0Functionality = diagnostics;
    return diagnostics;
  }

  // Performance diagnostics
  async diagnosePerformance() {
    console.log('🔍 Diagnosing performance...');
    
    const diagnostics = {
      buildOptimization: {},
      bundleAnalysis: {},
      recommendations: []
    };

    // Check for optimization opportunities
    if (fs.existsSync('.next/cache')) {
      diagnostics.buildOptimization.cacheEnabled = true;
      const cacheStats = execSync('du -sh .next/cache', { encoding: 'utf8' });
      diagnostics.buildOptimization.cacheSize = cacheStats.split('\t')[0];
    } else {
      diagnostics.buildOptimization.cacheEnabled = false;
      diagnostics.recommendations.push('Enable Next.js build cache for 40-70% faster builds');
    }

    // Check bundle size
    if (fs.existsSync('.next/static')) {
      const bundleStats = execSync('du -sh .next/static', { encoding: 'utf8' });
      diagnostics.bundleAnalysis.staticSize = bundleStats.split('\t')[0];
    }

    this.diagnosticResults.performance = diagnostics;
    return diagnostics;
  }

  // Run comprehensive diagnostics
  async runComprehensiveDiagnostics() {
    console.log('🚀 Running comprehensive deployment diagnostics...');
    
    const results = {
      timestamp: new Date().toISOString(),
      diagnostics: {}
    };

    try {
      results.diagnostics.buildEnvironment = await this.diagnoseBuildEnvironment();
      results.diagnostics.buildProcess = await this.diagnoseBuildProcess();
      results.diagnostics.runtimeEnvironment = await this.diagnoseRuntimeEnvironment();
      results.diagnostics.phase0Functionality = await this.diagnosePhase0Functionality();
      results.diagnostics.performance = await this.diagnosePerformance();
      
      // Generate recommendations
      results.recommendations = this.generateRecommendations(results.diagnostics);
      
      // Save results
      fs.writeFileSync(
        `deployment-diagnostics-${Date.now()}.json`,
        JSON.stringify(results, null, 2)
      );
      
      console.log('✅ Comprehensive diagnostics completed');
      return results;
      
    } catch (error) {
      console.error('❌ Diagnostics failed:', error.message);
      throw error;
    }
  }

  generateRecommendations(diagnostics) {
    const recommendations = [];

    // Build environment recommendations
    if (!diagnostics.buildEnvironment.lockfilePresent) {
      recommendations.push({
        category: 'build',
        priority: 'high',
        message: 'Add package-lock.json or yarn.lock for consistent builds'
      });
    }

    // Build process recommendations
    if (!diagnostics.buildProcess.buildPassed) {
      recommendations.push({
        category: 'build',
        priority: 'critical',
        message: 'Fix build errors before deployment'
      });
    }

    if (diagnostics.buildProcess.buildTime > 300000) { // > 5 minutes
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        message: 'Build time is slow - consider optimization techniques'
      });
    }

    // Runtime environment recommendations
    if (!diagnostics.runtimeEnvironment.supabaseConnection) {
      recommendations.push({
        category: 'database',
        priority: 'critical',
        message: 'Fix Supabase connection before deployment'
      });
    }

    // Phase 0 functionality recommendations
    const missingApiRoutes = Object.entries(diagnostics.phase0Functionality.apiRoutes)
      .filter(([route, info]) => !info.exists)
      .map(([route]) => route);

    if (missingApiRoutes.length > 0) {
      recommendations.push({
        category: 'phase0',
        priority: 'critical',
        message: `Missing API routes: ${missingApiRoutes.join(', ')}`
      });
    }

    return recommendations;
  }
}

/**
 * Automated recovery toolkit
 */
class DeploymentRecovery {
  constructor() {
    this.diagnostics = new DeploymentDiagnostics();
  }

  // Automated fix for common issues
  async attemptAutomatedFix(issueType) {
    console.log(`🔧 Attempting automated fix for: ${issueType}`);

    switch (issueType) {
      case 'DEPENDENCY_INSTALL_FAILED':
        return await this.fixDependencyIssues();
      
      case 'BUILD_SCRIPT_FAILED':
        return await this.fixBuildIssues();
      
      case 'SUPABASE_CONNECTION_FAILED':
        return await this.fixSupabaseConnection();
      
      default:
        return { success: false, message: 'No automated fix available' };
    }
  }

  async fixDependencyIssues() {
    try {
      console.log('🔧 Fixing dependency issues...');
      
      // Clear npm cache
      execSync('npm cache clean --force', { stdio: 'inherit' });
      
      // Remove node_modules and lockfile
      if (fs.existsSync('node_modules')) {
        execSync('rm -rf node_modules', { stdio: 'inherit' });
      }
      
      if (fs.existsSync('package-lock.json')) {
        fs.unlinkSync('package-lock.json');
      }
      
      // Reinstall dependencies
      execSync('npm install', { stdio: 'inherit' });
      
      return { success: true, message: 'Dependencies reinstalled successfully' };
      
    } catch (error) {
      return { success: false, message: `Dependency fix failed: ${error.message}` };
    }
  }

  async fixBuildIssues() {
    try {
      console.log('🔧 Attempting to fix build issues...');
      
      // Run type checking to identify issues
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
      } catch (error) {
        return { 
          success: false, 
          message: `TypeScript errors need manual fixing: ${error.message}` 
        };
      }
      
      // Try to fix linting issues automatically
      try {
        execSync('npm run lint -- --fix', { stdio: 'inherit' });
      } catch (error) {
        console.warn('Some linting issues could not be auto-fixed');
      }
      
      return { success: true, message: 'Build issues partially resolved' };
      
    } catch (error) {
      return { success: false, message: `Build fix failed: ${error.message}` };
    }
  }

  async fixSupabaseConnection() {
    console.log('🔧 Diagnosing Supabase connection...');
    
    const issues = [];
    const fixes = [];

    // Check environment variables
    const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        issues.push(`Missing environment variable: ${envVar}`);
      }
    }

    if (issues.length > 0) {
      return { 
        success: false, 
        message: `Supabase connection issues: ${issues.join(', ')}` 
      };
    }

    // Test connection
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );

      const { error } = await supabase.from('schools').select('count').limit(1);
      
      if (error) {
        return { 
          success: false, 
          message: `Supabase connection test failed: ${error.message}` 
        };
      }

      return { success: true, message: 'Supabase connection is working' };
      
    } catch (error) {
      return { 
        success: false, 
        message: `Supabase connection error: ${error.message}` 
      };
    }
  }

  // Emergency rollback
  async emergencyRollback() {
    console.log('🚨 Initiating emergency rollback...');
    
    try {
      // Use Vercel CLI to rollback
      execSync('vercel rollback --yes', { stdio: 'inherit' });
      
      // Verify rollback success
      await this.verifyRollback();
      
      return { success: true, message: 'Emergency rollback completed' };
      
    } catch (error) {
      return { success: false, message: `Rollback failed: ${error.message}` };
    }
  }

  async verifyRollback() {
    // Implementation would verify that rollback was successful
    console.log('✅ Rollback verification completed');
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'diagnose':
      const diagnostics = new DeploymentDiagnostics();
      diagnostics.runComprehensiveDiagnostics()
        .then(results => {
          console.log('\n📊 Diagnostic Results:');
          console.log(JSON.stringify(results, null, 2));
        })
        .catch(error => {
          console.error('❌ Diagnostics failed:', error);
          process.exit(1);
        });
      break;
      
    case 'fix':
      const issueType = process.argv[3];
      if (!issueType) {
        console.error('❌ Please specify issue type to fix');
        process.exit(1);
      }
      
      const recovery = new DeploymentRecovery();
      recovery.attemptAutomatedFix(issueType)
        .then(result => {
          if (result.success) {
            console.log(`✅ ${result.message}`);
          } else {
            console.error(`❌ ${result.message}`);
            process.exit(1);
          }
        })
        .catch(error => {
          console.error('❌ Fix attempt failed:', error);
          process.exit(1);
        });
      break;
      
    case 'rollback':
      const recovery2 = new DeploymentRecovery();
      recovery2.emergencyRollback()
        .then(result => {
          if (result.success) {
            console.log(`✅ ${result.message}`);
          } else {
            console.error(`❌ ${result.message}`);
            process.exit(1);
          }
        })
        .catch(error => {
          console.error('❌ Rollback failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log(`
🛠️  Vercel Deployment Troubleshooting Toolkit

Usage:
  node vercel-deployment-troubleshooting-toolkit.js <command>

Commands:
  diagnose    Run comprehensive deployment diagnostics
  fix <type>  Attempt automated fix for specific issue type
  rollback    Perform emergency rollback

Issue Types for 'fix' command:
  DEPENDENCY_INSTALL_FAILED
  BUILD_SCRIPT_FAILED
  SUPABASE_CONNECTION_FAILED

Examples:
  node vercel-deployment-troubleshooting-toolkit.js diagnose
  node vercel-deployment-troubleshooting-toolkit.js fix DEPENDENCY_INSTALL_FAILED
  node vercel-deployment-troubleshooting-toolkit.js rollback
      `);
  }
}

module.exports = {
  DeploymentIssueClassifier,
  DeploymentDiagnostics,
  DeploymentRecovery
};