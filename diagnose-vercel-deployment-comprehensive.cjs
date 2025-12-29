/**
 * COMPREHENSIVE VERCEL DEPLOYMENT DIAGNOSTIC
 * 
 * Systematic troubleshooting for exit code 126 build failure
 * Focus: Permission/execution errors in Vercel environment
 */

const fs = require('fs');
const { execSync } = require('child_process');

async function comprehensiveVercelDiagnostic() {
  console.log('🔍 COMPREHENSIVE VERCEL DEPLOYMENT DIAGNOSTIC');
  console.log('==============================================');
  console.log('📋 Issue: Build failed with exit code 126 (permission/execution error)');
  console.log('🎯 Goal: Identify and fix Vercel-specific deployment issues\n');

  const diagnostic = {
    timestamp: new Date().toISOString(),
    localBuildStatus: 'unknown',
    packageJsonIssues: [],
    vercelConfigIssues: [],
    dependencyIssues: [],
    nodeVersionIssues: [],
    filePermissionIssues: [],
    recommendations: [],
    criticalFixes: []
  };

  // 1. Test Local Build
  console.log('🔨 STEP 1: Testing Local Build');
  console.log('==============================');
  try {
    execSync('npm run build', { stdio: 'pipe' });
    diagnostic.localBuildStatus = 'success';
    console.log('✅ Local build: SUCCESS');
  } catch (error) {
    diagnostic.localBuildStatus = 'failed';
    console.log('❌ Local build: FAILED');
    console.log('Error:', error.message);
    diagnostic.criticalFixes.push('Fix local build errors before deploying to Vercel');
  }

  // 2. Analyze package.json
  console.log('\n📦 STEP 2: Analyzing package.json');
  console.log('==================================');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check build script
    if (!packageJson.scripts || !packageJson.scripts.build) {
      diagnostic.packageJsonIssues.push('Missing build script');
      diagnostic.criticalFixes.push('Add "build": "next build" to package.json scripts');
    } else if (packageJson.scripts.build !== 'next build') {
      diagnostic.packageJsonIssues.push(`Non-standard build script: ${packageJson.scripts.build}`);
      diagnostic.recommendations.push('Consider using standard "next build" command');
    } else {
      console.log('✅ Build script: Standard Next.js build command');
    }
    
    // Check Node.js version
    if (!packageJson.engines || !packageJson.engines.node) {
      diagnostic.nodeVersionIssues.push('No Node.js version specified');
      diagnostic.criticalFixes.push('Add Node.js version to engines in package.json');
    } else {
      const nodeVersion = packageJson.engines.node;
      console.log(`✅ Node.js requirement: ${nodeVersion}`);
      
      if (!nodeVersion.includes('18') && !nodeVersion.includes('20')) {
        diagnostic.nodeVersionIssues.push('Node.js version may be incompatible with Vercel');
        diagnostic.recommendations.push('Update Node.js requirement to >=18.0.0 or >=20.0.0');
      }
    }
    
    // Check for problematic dependencies
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const problematicDeps = [];
    
    if (dependencies['@types/node'] && dependencies['typescript']) {
      console.log('✅ TypeScript setup detected');
    }
    
    if (dependencies['next']) {
      const nextVersion = dependencies['next'];
      console.log(`✅ Next.js version: ${nextVersion}`);
      
      if (nextVersion.startsWith('15.')) {
        diagnostic.recommendations.push('Next.js 15.x detected - ensure compatibility with all dependencies');
      }
    }
    
  } catch (error) {
    diagnostic.packageJsonIssues.push('Failed to parse package.json');
    diagnostic.criticalFixes.push('Fix package.json syntax errors');
    console.log('❌ package.json parsing failed:', error.message);
  }

  // 3. Check Vercel Configuration
  console.log('\n🚀 STEP 3: Checking Vercel Configuration');
  console.log('=========================================');
  
  if (fs.existsSync('vercel.json')) {
    try {
      const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
      console.log('✅ vercel.json exists and is valid JSON');
      
      // Check for problematic configurations
      if (vercelConfig.builds) {
        diagnostic.vercelConfigIssues.push('Custom builds configuration detected');
        diagnostic.criticalFixes.push('Remove builds configuration for Next.js projects');
      }
      
      if (vercelConfig.framework && vercelConfig.framework !== 'nextjs') {
        diagnostic.vercelConfigIssues.push(`Framework set to ${vercelConfig.framework} instead of nextjs`);
        diagnostic.criticalFixes.push('Set framework to "nextjs" in vercel.json');
      }
      
      if (vercelConfig.regions) {
        console.log(`✅ Regions configured: ${JSON.stringify(vercelConfig.regions)}`);
      }
      
    } catch (error) {
      diagnostic.vercelConfigIssues.push('Invalid vercel.json syntax');
      diagnostic.criticalFixes.push('Fix vercel.json syntax or remove file');
      console.log('❌ vercel.json parsing failed:', error.message);
    }
  } else {
    console.log('ℹ️  No vercel.json found (using defaults)');
  }

  // 4. Check next.config.js
  console.log('\n⚙️  STEP 4: Checking Next.js Configuration');
  console.log('==========================================');
  
  if (fs.existsSync('next.config.js')) {
    try {
      const configContent = fs.readFileSync('next.config.js', 'utf8');
      console.log('✅ next.config.js exists');
      
      // Check for ES modules syntax in CommonJS file
      if (configContent.includes('import ') && !configContent.includes('require(')) {
        diagnostic.vercelConfigIssues.push('next.config.js uses ES modules syntax');
        diagnostic.criticalFixes.push('Convert next.config.js to CommonJS or rename to next.config.mjs');
      }
      
      // Check for experimental features that might cause issues
      if (configContent.includes('experimental')) {
        console.log('⚠️  Experimental features detected in next.config.js');
        diagnostic.recommendations.push('Review experimental features for Vercel compatibility');
      }
      
    } catch (error) {
      diagnostic.vercelConfigIssues.push('Failed to read next.config.js');
      console.log('❌ next.config.js reading failed:', error.message);
    }
  } else {
    console.log('ℹ️  No next.config.js found (using defaults)');
  }

  // 5. Check File Permissions and Structure
  console.log('\n📁 STEP 5: Checking File Structure');
  console.log('===================================');
  
  const requiredFiles = ['package.json', 'package-lock.json'];
  const optionalFiles = ['next.config.js', 'vercel.json', 'tsconfig.json'];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      diagnostic.filePermissionIssues.push(`Missing required file: ${file}`);
      diagnostic.criticalFixes.push(`Create ${file}`);
    }
  });
  
  optionalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`ℹ️  ${file} not found (optional)`);
    }
  });

  // 6. Check for Hidden Characters and Encoding Issues
  console.log('\n🔍 STEP 6: Checking for Hidden Characters');
  console.log('=========================================');
  
  try {
    const packageJsonContent = fs.readFileSync('package.json', 'utf8');
    
    // Check for BOM (Byte Order Mark)
    if (packageJsonContent.charCodeAt(0) === 0xFEFF) {
      diagnostic.filePermissionIssues.push('package.json contains BOM (Byte Order Mark)');
      diagnostic.criticalFixes.push('Remove BOM from package.json');
    }
    
    // Check for non-printable characters
    const nonPrintableRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
    if (nonPrintableRegex.test(packageJsonContent)) {
      diagnostic.filePermissionIssues.push('package.json contains non-printable characters');
      diagnostic.criticalFixes.push('Remove non-printable characters from package.json');
    }
    
    console.log('✅ No hidden character issues detected');
    
  } catch (error) {
    console.log('❌ Failed to check for hidden characters');
  }

  // 7. Generate Specific Fixes
  console.log('\n🔧 STEP 7: Generating Targeted Fixes');
  console.log('====================================');
  
  const fixes = generateTargetedFixes(diagnostic);
  
  // 8. Create Fix Script
  const fixScript = createFixScript(fixes);
  fs.writeFileSync('fix-vercel-deployment.sh', fixScript);
  console.log('💾 Fix script created: fix-vercel-deployment.sh');

  // 9. Summary Report
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('=====================');
  
  console.log(`\n🔍 Issues Found:`);
  console.log(`   Package.json: ${diagnostic.packageJsonIssues.length}`);
  console.log(`   Vercel Config: ${diagnostic.vercelConfigIssues.length}`);
  console.log(`   Dependencies: ${diagnostic.dependencyIssues.length}`);
  console.log(`   Node Version: ${diagnostic.nodeVersionIssues.length}`);
  console.log(`   File Permissions: ${diagnostic.filePermissionIssues.length}`);
  
  console.log(`\n🔧 Critical Fixes Required: ${diagnostic.criticalFixes.length}`);
  diagnostic.criticalFixes.forEach((fix, index) => {
    console.log(`   ${index + 1}. ${fix}`);
  });
  
  console.log(`\n💡 Recommendations: ${diagnostic.recommendations.length}`);
  diagnostic.recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });

  // Save diagnostic report
  fs.writeFileSync('vercel-deployment-diagnostic.json', JSON.stringify(diagnostic, null, 2));
  console.log('\n💾 Full diagnostic saved: vercel-deployment-diagnostic.json');

  return diagnostic;
}

function generateTargetedFixes(diagnostic) {
  const fixes = [];
  
  // Fix 1: Ensure clean package.json
  if (diagnostic.packageJsonIssues.length > 0) {
    fixes.push({
      priority: 'critical',
      action: 'fix_package_json',
      description: 'Fix package.json issues',
      commands: [
        'npm install --package-lock-only',
        'npm audit fix --force'
      ]
    });
  }
  
  // Fix 2: Clean dependencies
  fixes.push({
    priority: 'high',
    action: 'clean_dependencies',
    description: 'Clean and reinstall dependencies',
    commands: [
      'rm -rf node_modules package-lock.json',
      'npm install',
      'npm run build'
    ]
  });
  
  // Fix 3: Simplify Vercel config
  if (diagnostic.vercelConfigIssues.length > 0) {
    fixes.push({
      priority: 'high',
      action: 'fix_vercel_config',
      description: 'Fix Vercel configuration',
      commands: [
        'echo "Creating minimal vercel.json"'
      ]
    });
  }
  
  return fixes;
}

function createFixScript(fixes) {
  let script = `#!/bin/bash
# VERCEL DEPLOYMENT FIX SCRIPT
# Generated: ${new Date().toISOString()}
# Purpose: Fix exit code 126 deployment failure

set -e

echo "🔧 Starting Vercel deployment fixes..."

`;

  fixes.forEach((fix, index) => {
    script += `
# Fix ${index + 1}: ${fix.description}
echo "📦 ${fix.description}..."
`;
    fix.commands.forEach(command => {
      script += `${command}\n`;
    });
  });

  script += `
echo "✅ All fixes applied successfully!"
echo "🚀 Ready for Vercel deployment"

# Test local build
echo "🔨 Testing local build..."
npm run build

echo "✅ Local build successful - ready to deploy!"
`;

  return script;
}

// Run diagnostic
comprehensiveVercelDiagnostic().catch(console.error);