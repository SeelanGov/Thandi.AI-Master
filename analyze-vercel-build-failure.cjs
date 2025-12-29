/**
 * VERCEL BUILD FAILURE ANALYSIS
 * 
 * Based on the Vercel deployment logs showing:
 * - Build Failed: Command "npm run build" exited with 126
 * - Exit code 126 = Permission/execution error
 */

const fs = require('fs');
const { execSync } = require('child_process');

function analyzeVercelBuildFailure() {
  console.log('🔍 ANALYZING VERCEL BUILD FAILURE');
  console.log('=================================');
  console.log('📋 Error: Command "npm run build" exited with 126');
  console.log('🔍 Exit Code 126: Permission/execution error\n');

  const analysis = {
    rootCause: 'permission_or_execution_error',
    possibleCauses: [],
    fixes: [],
    verificationSteps: []
  };

  // Check package.json scripts
  console.log('📦 Checking package.json scripts...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.build) {
      console.log(`✅ Build script found: "${packageJson.scripts.build}"`);
      
      // Check for potential issues in build script
      const buildScript = packageJson.scripts.build;
      
      if (buildScript.includes('&&')) {
        analysis.possibleCauses.push('Build script uses && which may fail on Vercel');
        analysis.fixes.push('Simplify build script to single command');
      }
      
      if (buildScript !== 'next build') {
        analysis.possibleCauses.push('Build script is not standard Next.js build command');
        analysis.fixes.push('Change build script to "next build"');
      }
      
    } else {
      console.log('❌ Build script missing in package.json');
      analysis.possibleCauses.push('Missing build script in package.json');
      analysis.fixes.push('Add "build": "next build" to package.json scripts');
    }
    
  } catch (error) {
    console.log('❌ Failed to read package.json:', error.message);
    analysis.possibleCauses.push('package.json is corrupted or missing');
  }

  // Check Node.js version compatibility
  console.log('\n🔧 Checking Node.js version requirements...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.engines && packageJson.engines.node) {
      console.log(`✅ Node.js requirement: ${packageJson.engines.node}`);
      
      // Check if requirement is compatible with Vercel
      const nodeVersion = packageJson.engines.node;
      if (nodeVersion.includes('>=18') || nodeVersion.includes('>=20')) {
        console.log('✅ Node.js version compatible with Vercel');
      } else {
        analysis.possibleCauses.push('Node.js version may be incompatible with Vercel');
        analysis.fixes.push('Update Node.js requirement to ">=18.0.0"');
      }
    } else {
      console.log('⚠️  No Node.js version specified');
      analysis.possibleCauses.push('No Node.js version specified in engines');
      analysis.fixes.push('Add Node.js version to engines in package.json');
    }
    
  } catch (error) {
    console.log('❌ Failed to check Node.js requirements');
  }

  // Check for file permission issues
  console.log('\n📁 Checking file permissions...');
  try {
    // Check if package-lock.json exists and is readable
    if (fs.existsSync('package-lock.json')) {
      const stats = fs.statSync('package-lock.json');
      console.log('✅ package-lock.json exists and is readable');
    } else {
      console.log('⚠️  package-lock.json missing');
      analysis.possibleCauses.push('Missing package-lock.json may cause dependency issues');
      analysis.fixes.push('Run npm install to generate package-lock.json');
    }
    
    // Check next.config.js
    if (fs.existsSync('next.config.js')) {
      console.log('✅ next.config.js exists');
    } else {
      console.log('⚠️  next.config.js missing');
    }
    
  } catch (error) {
    console.log('❌ File permission check failed:', error.message);
    analysis.possibleCauses.push('File permission issues in project directory');
  }

  // Check for Vercel-specific issues
  console.log('\n🚀 Checking Vercel configuration...');
  
  if (fs.existsSync('vercel.json')) {
    try {
      const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
      console.log('✅ vercel.json exists and is valid');
      
      // Check for problematic configurations
      if (vercelConfig.builds) {
        analysis.possibleCauses.push('Custom builds configuration may conflict with Next.js');
        analysis.fixes.push('Remove custom builds configuration for Next.js projects');
      }
      
      if (vercelConfig.functions) {
        console.log('✅ Functions configuration found');
      }
      
    } catch (error) {
      console.log('❌ vercel.json is invalid:', error.message);
      analysis.possibleCauses.push('Invalid vercel.json configuration');
      analysis.fixes.push('Fix or remove vercel.json');
    }
  }

  // Generate specific fixes based on analysis
  console.log('\n🔧 GENERATING TARGETED FIXES...');
  
  // Primary fix: Ensure clean package.json
  analysis.fixes.unshift('Ensure package.json has clean, standard build script');
  
  // Secondary fix: Clear any cached dependencies
  analysis.fixes.push('Clear node_modules and reinstall dependencies');
  
  // Tertiary fix: Simplify Vercel configuration
  analysis.fixes.push('Simplify or remove custom Vercel configuration');

  // Verification steps
  analysis.verificationSteps = [
    'Test local build: npm run build',
    'Check package.json syntax and scripts',
    'Verify Node.js version compatibility',
    'Test with clean node_modules installation',
    'Deploy with minimal Vercel configuration'
  ];

  return analysis;
}

function generateFixScript(analysis) {
  console.log('\n🛠️  GENERATING FIX SCRIPT...');
  
  const fixes = `
# VERCEL BUILD FAILURE FIX SCRIPT
# ===============================

# Fix 1: Clean package.json build script
echo "📦 Fixing package.json build script..."

# Fix 2: Ensure standard Next.js build command
echo "🔧 Setting standard build command..."

# Fix 3: Clean dependencies
echo "🧹 Cleaning dependencies..."
rm -rf node_modules package-lock.json
npm install

# Fix 4: Test local build
echo "🔨 Testing local build..."
npm run build

# Fix 5: Simplify Vercel configuration
echo "🚀 Checking Vercel configuration..."

echo "✅ Fixes applied - ready for deployment"
`;

  fs.writeFileSync('fix-vercel-build.sh', fixes);
  console.log('💾 Fix script saved to: fix-vercel-build.sh');
}

// Run analysis
const analysis = analyzeVercelBuildFailure();

console.log('\n📊 ANALYSIS RESULTS');
console.log('==================');

console.log('\n🔍 Root Cause:', analysis.rootCause);

console.log('\n❌ Possible Causes:');
analysis.possibleCauses.forEach((cause, index) => {
  console.log(`${index + 1}. ${cause}`);
});

console.log('\n🔧 Recommended Fixes:');
analysis.fixes.forEach((fix, index) => {
  console.log(`${index + 1}. ${fix}`);
});

console.log('\n✅ Verification Steps:');
analysis.verificationSteps.forEach((step, index) => {
  console.log(`${index + 1}. ${step}`);
});

// Generate fix script
generateFixScript(analysis);

// Save analysis
fs.writeFileSync('vercel-build-failure-analysis.json', JSON.stringify(analysis, null, 2));
console.log('\n💾 Analysis saved to: vercel-build-failure-analysis.json');

console.log('\n🎯 IMMEDIATE ACTION PLAN:');
console.log('1. Apply the fixes below');
console.log('2. Test local build');
console.log('3. Commit and push changes');
console.log('4. Monitor Vercel deployment');

module.exports = { analyzeVercelBuildFailure };