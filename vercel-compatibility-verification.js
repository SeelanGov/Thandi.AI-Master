#!/usr/bin/env node

/**
 * VERCEL COMPATIBILITY VERIFICATION SCRIPT
 * January 10, 2026
 * 
 * Comprehensive verification that our codebase is aligned with Vercel's requirements
 * Addresses previous deployment failures and caching issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 VERCEL COMPATIBILITY VERIFICATION');
console.log('=====================================');
console.log('Checking codebase alignment with Vercel requirements...\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: []
};

function logResult(test, status, message, details = null) {
  const symbols = { pass: '✅', fail: '❌', warn: '⚠️' };
  console.log(`${symbols[status]} ${test}: ${message}`);
  if (details) console.log(`   ${details}`);
  
  if (status === 'pass') results.passed++;
  else if (status === 'fail') {
    results.failed++;
    results.issues.push({ test, message, details });
  } else if (status === 'warn') {
    results.warnings++;
    results.issues.push({ test, message, details, type: 'warning' });
  }
  console.log('');
}

// 1. Check Next.js Configuration
function checkNextConfig() {
  console.log('📋 CHECKING NEXT.JS CONFIGURATION');
  console.log('----------------------------------');
  
  try {
    if (!fs.existsSync('next.config.js')) {
      logResult('Next.js Config', 'fail', 'next.config.js not found');
      return;
    }
    
    const config = fs.readFileSync('next.config.js', 'utf8');
    
    // Check for Vercel-compatible settings
    if (config.includes('experimental')) {
      logResult('Experimental Features', 'warn', 'Experimental features detected', 
        'May cause deployment issues on Vercel');
    } else {
      logResult('Experimental Features', 'pass', 'No experimental features');
    }
    
    // Check for proper export configuration
    if (config.includes('output:') && !config.includes('output: "standalone"')) {
      logResult('Output Configuration', 'warn', 'Non-standard output configuration detected');
    } else {
      logResult('Output Configuration', 'pass', 'Standard output configuration');
    }
    
    // Check for image optimization
    if (config.includes('images:')) {
      logResult('Image Configuration', 'pass', 'Image configuration present');
    } else {
      logResult('Image Configuration', 'warn', 'No image configuration found');
    }
    
  } catch (error) {
    logResult('Next.js Config', 'fail', 'Error reading next.config.js', error.message);
  }
}

// 2. Check Package.json for Vercel compatibility
function checkPackageJson() {
  console.log('📦 CHECKING PACKAGE.JSON COMPATIBILITY');
  console.log('--------------------------------------');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check Node.js version compatibility
    if (packageJson.engines && packageJson.engines.node) {
      const nodeVersion = packageJson.engines.node;
      logResult('Node.js Version', 'pass', `Specified: ${nodeVersion}`);
    } else {
      logResult('Node.js Version', 'warn', 'No Node.js version specified', 
        'Vercel will use default, may cause issues');
    }
    
    // Check for build script
    if (packageJson.scripts && packageJson.scripts.build) {
      logResult('Build Script', 'pass', `Build command: ${packageJson.scripts.build}`);
    } else {
      logResult('Build Script', 'fail', 'No build script found');
    }
    
    // Check for start script
    if (packageJson.scripts && packageJson.scripts.start) {
      logResult('Start Script', 'pass', `Start command: ${packageJson.scripts.start}`);
    } else {
      logResult('Start Script', 'warn', 'No start script found');
    }
    
    // Check for problematic dependencies
    const problematicDeps = ['canvas', 'puppeteer', 'playwright', 'sharp'];
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    for (const dep of problematicDeps) {
      if (deps[dep]) {
        logResult('Dependencies', 'warn', `Potentially problematic dependency: ${dep}`, 
          'May require special Vercel configuration');
      }
    }
    
    if (!problematicDeps.some(dep => deps[dep])) {
      logResult('Dependencies', 'pass', 'No known problematic dependencies');
    }
    
  } catch (error) {
    logResult('Package.json', 'fail', 'Error reading package.json', error.message);
  }
}

// 3. Check API Routes Structure
function checkApiRoutes() {
  console.log('🔌 CHECKING API ROUTES STRUCTURE');
  console.log('---------------------------------');
  
  const apiDir = 'app/api';
  
  if (!fs.existsSync(apiDir)) {
    logResult('API Directory', 'warn', 'No API directory found');
    return;
  }
  
  try {
    const checkApiRoute = (routePath) => {
      const fullPath = path.join(apiDir, routePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for proper export structure
        if (content.includes('export async function GET') || 
            content.includes('export async function POST') ||
            content.includes('export async function PUT') ||
            content.includes('export async function DELETE')) {
          return { valid: true, hasExports: true };
        } else if (content.includes('export default')) {
          return { valid: true, hasExports: false, legacy: true };
        } else {
          return { valid: false, reason: 'No proper exports found' };
        }
      }
      return { valid: false, reason: 'File not found' };
    };
    
    // Check critical API routes
    const criticalRoutes = [
      'health/route.js',
      'rag/query/route.js',
      'pdf/[sessionId]/route.js',
      'g10-12/route.js'
    ];
    
    let validRoutes = 0;
    let totalRoutes = 0;
    
    for (const route of criticalRoutes) {
      totalRoutes++;
      const result = checkApiRoute(route);
      
      if (result.valid) {
        validRoutes++;
        if (result.legacy) {
          logResult('API Route', 'warn', `${route} uses legacy export pattern`);
        } else {
          logResult('API Route', 'pass', `${route} properly structured`);
        }
      } else {
        logResult('API Route', 'fail', `${route} invalid`, result.reason);
      }
    }
    
    logResult('API Routes Summary', validRoutes === totalRoutes ? 'pass' : 'warn', 
      `${validRoutes}/${totalRoutes} routes valid`);
    
  } catch (error) {
    logResult('API Routes', 'fail', 'Error checking API routes', error.message);
  }
}

// 4. Check Environment Variables
function checkEnvironmentVariables() {
  console.log('🔐 CHECKING ENVIRONMENT VARIABLES');
  console.log('----------------------------------');
  
  try {
    // Check for .env files
    const envFiles = ['.env.local', '.env.example', '.env.production.example'];
    
    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        logResult('Environment File', 'pass', `${envFile} exists`);
        
        // Check for sensitive data in example files
        if (envFile.includes('example')) {
          const content = fs.readFileSync(envFile, 'utf8');
          if (content.includes('sk-') || content.includes('key_') || content.includes('secret_')) {
            logResult('Environment Security', 'warn', `${envFile} may contain sensitive data`);
          }
        }
      } else {
        if (envFile === '.env.local') {
          logResult('Environment File', 'warn', `${envFile} not found`, 
            'Local environment variables not configured');
        } else {
          logResult('Environment File', 'pass', `${envFile} not found (optional)`);
        }
      }
    }
    
    // Check for required environment variables in code
    const requiredEnvVars = [
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'REDIS_URL'
    ];
    
    // Scan for environment variable usage
    const scanForEnvUsage = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      const envUsage = new Set();
      
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        
        if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
          const subUsage = scanForEnvUsage(filePath);
          subUsage.forEach(env => envUsage.add(env));
        } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.jsx'))) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const envMatches = content.match(/process\.env\.([A-Z_]+)/g);
            if (envMatches) {
              envMatches.forEach(match => {
                const envVar = match.replace('process.env.', '');
                envUsage.add(envVar);
              });
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
      
      return envUsage;
    };
    
    const usedEnvVars = scanForEnvUsage('app');
    logResult('Environment Usage', 'pass', `Found ${usedEnvVars.size} environment variables in use`);
    
    // Check if critical env vars are used
    const missingCritical = requiredEnvVars.filter(env => !usedEnvVars.has(env));
    if (missingCritical.length > 0) {
      logResult('Critical Env Vars', 'warn', `Some critical env vars not found in code: ${missingCritical.join(', ')}`);
    } else {
      logResult('Critical Env Vars', 'pass', 'All critical environment variables found in code');
    }
    
  } catch (error) {
    logResult('Environment Variables', 'fail', 'Error checking environment variables', error.message);
  }
}

// 5. Check Build Compatibility
function checkBuildCompatibility() {
  console.log('🏗️ CHECKING BUILD COMPATIBILITY');
  console.log('-------------------------------');
  
  try {
    // Check for TypeScript
    if (fs.existsSync('tsconfig.json')) {
      logResult('TypeScript', 'pass', 'TypeScript configuration found');
      
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      if (tsConfig.compilerOptions && tsConfig.compilerOptions.strict) {
        logResult('TypeScript Strict', 'pass', 'Strict mode enabled');
      } else {
        logResult('TypeScript Strict', 'warn', 'Strict mode not enabled');
      }
    } else {
      logResult('TypeScript', 'pass', 'JavaScript project (no TypeScript)');
    }
    
    // Check for Tailwind CSS
    if (fs.existsSync('tailwind.config.js')) {
      logResult('Tailwind CSS', 'pass', 'Tailwind configuration found');
    } else {
      logResult('Tailwind CSS', 'warn', 'No Tailwind configuration found');
    }
    
    // Check for PostCSS
    if (fs.existsSync('postcss.config.js')) {
      logResult('PostCSS', 'pass', 'PostCSS configuration found');
    } else {
      logResult('PostCSS', 'warn', 'No PostCSS configuration found');
    }
    
    // Test build process
    console.log('🔄 Testing build process...');
    try {
      execSync('npm run build', { stdio: 'pipe', timeout: 120000 });
      logResult('Build Test', 'pass', 'Build completed successfully');
      
      // Check build output
      if (fs.existsSync('.next')) {
        const buildStats = fs.statSync('.next');
        logResult('Build Output', 'pass', `Build directory created (${buildStats.size} bytes)`);
      } else {
        logResult('Build Output', 'fail', 'No build output directory found');
      }
      
    } catch (error) {
      logResult('Build Test', 'fail', 'Build failed', error.message.substring(0, 200));
    }
    
  } catch (error) {
    logResult('Build Compatibility', 'fail', 'Error checking build compatibility', error.message);
  }
}

// 6. Check Vercel-specific Files
function checkVercelFiles() {
  console.log('🚀 CHECKING VERCEL-SPECIFIC FILES');
  console.log('----------------------------------');
  
  // Check for vercel.json
  if (fs.existsSync('vercel.json')) {
    try {
      const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
      logResult('Vercel Config', 'pass', 'vercel.json found');
      
      // Check for common configurations
      if (vercelConfig.functions) {
        logResult('Vercel Functions', 'pass', 'Function configurations present');
      }
      
      if (vercelConfig.redirects) {
        logResult('Vercel Redirects', 'pass', `${vercelConfig.redirects.length} redirects configured`);
      }
      
      if (vercelConfig.headers) {
        logResult('Vercel Headers', 'pass', `${vercelConfig.headers.length} header rules configured`);
      }
      
    } catch (error) {
      logResult('Vercel Config', 'fail', 'Invalid vercel.json', error.message);
    }
  } else {
    logResult('Vercel Config', 'pass', 'No vercel.json (using defaults)');
  }
  
  // Check for .vercelignore
  if (fs.existsSync('.vercelignore')) {
    logResult('Vercel Ignore', 'pass', '.vercelignore found');
  } else {
    logResult('Vercel Ignore', 'pass', 'No .vercelignore (using defaults)');
  }
}

// 7. Check for Caching Issues
function checkCachingIssues() {
  console.log('🗄️ CHECKING CACHING CONFIGURATION');
  console.log('----------------------------------');
  
  try {
    // Check for cache-related files
    const cacheFiles = [
      '.next/cache',
      'node_modules/.cache',
      '.vercel'
    ];
    
    for (const cacheDir of cacheFiles) {
      if (fs.existsSync(cacheDir)) {
        const stats = fs.statSync(cacheDir);
        if (stats.isDirectory()) {
          logResult('Cache Directory', 'warn', `${cacheDir} exists`, 
            'May cause deployment issues - consider clearing before deploy');
        }
      } else {
        logResult('Cache Directory', 'pass', `${cacheDir} not present`);
      }
    }
    
    // Check for cache headers in API routes
    const apiFiles = [];
    const findApiFiles = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
          findApiFiles(filePath);
        } else if (file.name === 'route.js') {
          apiFiles.push(filePath);
        }
      }
    };
    
    findApiFiles('app/api');
    
    let routesWithCaching = 0;
    for (const apiFile of apiFiles) {
      try {
        const content = fs.readFileSync(apiFile, 'utf8');
        if (content.includes('Cache-Control') || content.includes('cache')) {
          routesWithCaching++;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    if (routesWithCaching > 0) {
      logResult('API Caching', 'pass', `${routesWithCaching} routes have caching configured`);
    } else {
      logResult('API Caching', 'warn', 'No explicit caching found in API routes');
    }
    
  } catch (error) {
    logResult('Caching Check', 'fail', 'Error checking caching configuration', error.message);
  }
}

// 8. Check for Common Deployment Issues
function checkDeploymentIssues() {
  console.log('⚠️ CHECKING FOR COMMON DEPLOYMENT ISSUES');
  console.log('----------------------------------------');
  
  try {
    // Check for large files
    const checkLargeFiles = (dir, maxSize = 50 * 1024 * 1024) => { // 50MB
      const largeFiles = [];
      
      const scanDir = (currentDir) => {
        if (!fs.existsSync(currentDir)) return;
        
        const files = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const file of files) {
          const filePath = path.join(currentDir, file.name);
          
          if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
            scanDir(filePath);
          } else if (file.isFile()) {
            try {
              const stats = fs.statSync(filePath);
              if (stats.size > maxSize) {
                largeFiles.push({ path: filePath, size: stats.size });
              }
            } catch (error) {
              // Skip files that can't be accessed
            }
          }
        }
      };
      
      scanDir(dir);
      return largeFiles;
    };
    
    const largeFiles = checkLargeFiles('.');
    if (largeFiles.length > 0) {
      logResult('Large Files', 'warn', `${largeFiles.length} large files found`, 
        largeFiles.map(f => `${f.path} (${Math.round(f.size / 1024 / 1024)}MB)`).join(', '));
    } else {
      logResult('Large Files', 'pass', 'No unusually large files found');
    }
    
    // Check for dynamic imports
    const checkDynamicImports = (dir) => {
      const dynamicImports = [];
      
      const scanForDynamicImports = (currentDir) => {
        if (!fs.existsSync(currentDir)) return;
        
        const files = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const file of files) {
          const filePath = path.join(currentDir, file.name);
          
          if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
            scanForDynamicImports(filePath);
          } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.jsx'))) {
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              if (content.includes('import(') || content.includes('dynamic(')) {
                dynamicImports.push(filePath);
              }
            } catch (error) {
              // Skip files that can't be read
            }
          }
        }
      };
      
      scanForDynamicImports(dir);
      return dynamicImports;
    };
    
    const dynamicImports = checkDynamicImports('app');
    if (dynamicImports.length > 0) {
      logResult('Dynamic Imports', 'warn', `${dynamicImports.length} files use dynamic imports`, 
        'Ensure proper error handling for failed imports');
    } else {
      logResult('Dynamic Imports', 'pass', 'No dynamic imports found');
    }
    
    // Check for console.log statements (should be removed in production)
    const checkConsoleStatements = (dir) => {
      const filesWithConsole = [];
      
      const scanForConsole = (currentDir) => {
        if (!fs.existsSync(currentDir)) return;
        
        const files = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const file of files) {
          const filePath = path.join(currentDir, file.name);
          
          if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
            scanForConsole(filePath);
          } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.jsx'))) {
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              const consoleMatches = content.match(/console\.(log|warn|error|info)/g);
              if (consoleMatches && consoleMatches.length > 0) {
                filesWithConsole.push({ path: filePath, count: consoleMatches.length });
              }
            } catch (error) {
              // Skip files that can't be read
            }
          }
        }
      };
      
      scanForConsole(dir);
      return filesWithConsole;
    };
    
    const consoleFiles = checkConsoleStatements('app');
    if (consoleFiles.length > 0) {
      const totalConsole = consoleFiles.reduce((sum, file) => sum + file.count, 0);
      logResult('Console Statements', 'warn', `${totalConsole} console statements in ${consoleFiles.length} files`, 
        'Consider removing for production');
    } else {
      logResult('Console Statements', 'pass', 'No console statements found');
    }
    
  } catch (error) {
    logResult('Deployment Issues', 'fail', 'Error checking deployment issues', error.message);
  }
}

// Main execution
async function runVerification() {
  console.log('Starting Vercel compatibility verification...\n');
  
  checkNextConfig();
  checkPackageJson();
  checkApiRoutes();
  checkEnvironmentVariables();
  checkBuildCompatibility();
  checkVercelFiles();
  checkCachingIssues();
  checkDeploymentIssues();
  
  // Summary
  console.log('📊 VERIFICATION SUMMARY');
  console.log('======================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`⚠️ Warnings: ${results.warnings}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log('');
  
  if (results.failed > 0) {
    console.log('🚨 CRITICAL ISSUES FOUND:');
    console.log('-------------------------');
    results.issues.filter(issue => issue.type !== 'warning').forEach(issue => {
      console.log(`❌ ${issue.test}: ${issue.message}`);
      if (issue.details) console.log(`   ${issue.details}`);
    });
    console.log('');
  }
  
  if (results.warnings > 0) {
    console.log('⚠️ WARNINGS:');
    console.log('------------');
    results.issues.filter(issue => issue.type === 'warning').forEach(issue => {
      console.log(`⚠️ ${issue.test}: ${issue.message}`);
      if (issue.details) console.log(`   ${issue.details}`);
    });
    console.log('');
  }
  
  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  console.log('-------------------');
  
  if (results.failed === 0 && results.warnings <= 3) {
    console.log('✅ Codebase appears Vercel-compatible');
    console.log('✅ Ready for deployment');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Clear Vercel cache: vercel --prod --force');
    console.log('2. Deploy with: vercel --prod');
    console.log('3. Monitor deployment logs for any issues');
  } else if (results.failed === 0) {
    console.log('⚠️ Codebase mostly compatible with warnings');
    console.log('⚠️ Consider addressing warnings before deployment');
    console.log('✅ Can proceed with caution');
  } else {
    console.log('❌ Critical issues found - address before deployment');
    console.log('❌ Deployment likely to fail');
  }
  
  console.log('');
  console.log('🗄️ CACHE CLEARING COMMANDS:');
  console.log('---------------------------');
  console.log('Local: rm -rf .next node_modules/.cache');
  console.log('Vercel: vercel --prod --force');
  console.log('');
  
  return {
    compatible: results.failed === 0,
    warnings: results.warnings,
    issues: results.issues
  };
}

// Run verification
runVerification().then(result => {
  process.exit(result.compatible ? 0 : 1);
}).catch(error => {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
});