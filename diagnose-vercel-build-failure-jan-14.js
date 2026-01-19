#!/usr/bin/env node

/**
 * DIAGNOSE VERCEL BUILD FAILURE - JAN 14 2026
 * Check what went wrong with the school search restoration deployment
 */

const { execSync } = require('child_process');

async function diagnoseVercelBuildFailure() {
  console.log('🔍 DIAGNOSING VERCEL BUILD FAILURE');
  console.log('='.repeat(80));
  console.log('');

  // Get latest deployment info
  console.log('📊 Getting latest deployment info...');
  try {
    const deploymentInfo = execSync('vercel ls --limit 1', { encoding: 'utf8' });
    console.log(deploymentInfo);
  } catch (error) {
    console.log('Error getting deployment info:', error.message);
  }
  console.log('');

  // Check local build
  console.log('🏗️  Testing local build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Local build PASSES');
  } catch (error) {
    console.log('❌ Local build FAILS');
    console.log('Error:', error.message);
  }
  console.log('');

  // Check for syntax errors in restored file
  console.log('🔍 Checking school search API syntax...');
  try {
    const fs = require('fs');
    const filePath = 'app/api/schools/search/route.js';
    
    if (fs.existsSync(filePath)) {
      console.log(`✅ File exists: ${filePath}`);
      
      // Check for common issues
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Count parentheses
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      console.log(`  Parentheses: ${openParens} open, ${closeParens} close`);
      
      if (openParens !== closeParens) {
        console.log(`  ⚠️  MISMATCH: ${Math.abs(openParens - closeParens)} unmatched parentheses`);
      }
      
      // Check for addCacheHeaders calls
      const addCacheHeadersCalls = content.match(/addCacheHeaders\(/g) || [];
      console.log(`  addCacheHeaders calls: ${addCacheHeadersCalls.length}`);
      
      // Check for incomplete calls
      const incompletePattern = /addCacheHeaders\([^)]+\);(?!\))/g;
      const incomplete = content.match(incompletePattern) || [];
      if (incomplete.length > 0) {
        console.log(`  ⚠️  Found ${incomplete.length} potentially incomplete addCacheHeaders calls`);
      }
      
    } else {
      console.log(`❌ File NOT found: ${filePath}`);
    }
  } catch (error) {
    console.log('Error checking file:', error.message);
  }
  console.log('');

  console.log('='.repeat(80));
  console.log('📋 DIAGNOSIS COMPLETE');
  console.log('');
  console.log('Next steps:');
  console.log('1. Review local build output above');
  console.log('2. Check for syntax errors in school search API');
  console.log('3. Fix any issues found');
  console.log('4. Test build locally before redeploying');
}

diagnoseVercelBuildFailure().catch(console.error);
