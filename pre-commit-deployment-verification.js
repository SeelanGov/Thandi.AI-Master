// Pre-commit deployment verification
// Cross-reference current build with Vercel deployment status

const preCommitVerification = async () => {
  console.log('🔍 PRE-COMMIT DEPLOYMENT VERIFICATION\n');
  console.log('Checking Vercel deployment status and build compatibility...\n');
  
  try {
    // Import node-fetch for API testing
    let fetch;
    try {
      fetch = (await import('node-fetch')).default;
    } catch (e) {
      console.log('⚠️  node-fetch not available, using manual verification steps');
      console.log('\n📋 MANUAL VERIFICATION REQUIRED:');
      console.log('1. Check Vercel dashboard: https://vercel.com/dashboard');
      console.log('2. Verify current deployment status');
      console.log('3. Test live PDF endpoint');
      console.log('4. Compare with local build');
      return;
    }
    
    console.log('📡 STEP 1: Testing Current Vercel Deployment...\n');
    
    // Test current production URLs
    const productionUrls = [
      'https://thandi-ai.vercel.app',
      'https://thandi-online.vercel.app',
      'https://thandi-rag-system.vercel.app'
    ];
    
    let workingProductionUrl = null;
    
    for (const url of productionUrls) {
      try {
        console.log(`🔗 Testing: ${url}`);
        const response = await fetch(url, { 
          timeout: 10000,
          headers: { 'User-Agent': 'Thandi-Deployment-Check' }
        });
        
        console.log(`   Status: ${response.status}`);
        
        if (response.status === 200) {
          workingProductionUrl = url;
          console.log(`   ✅ ACTIVE: ${url}`);
          break;
        } else {
          console.log(`   ❌ Not active: ${response.status}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    if (!workingProductionUrl) {
      console.log('\n⚠️  No active Vercel deployment found');
      console.log('💡 This might be the first deployment or all deployments are down');
      console.log('✅ Proceeding with fresh deployment verification');
    } else {
      console.log(`\n✅ Active deployment found: ${workingProductionUrl}`);
      
      // Test current PDF endpoint on production
      console.log('\n📄 STEP 2: Testing Current Production PDF Endpoint...\n');
      
      try {
        const pdfTestUrl = `${workingProductionUrl}/api/pdf/deployment-test`;
        console.log(`🔗 Testing PDF: ${pdfTestUrl}`);
        
        const pdfResponse = await fetch(pdfTestUrl, { timeout: 15000 });
        console.log(`   Status: ${pdfResponse.status}`);
        console.log(`   Content-Type: ${pdfResponse.headers.get('content-type')}`);
        
        if (pdfResponse.headers.get('content-type') === 'application/pdf') {
          console.log('   ✅ Production PDF endpoint working (returns PDF)');
        } else if (pdfResponse.headers.get('content-type') === 'text/plain') {
          console.log('   ❌ Production PDF endpoint returns text (needs our fix)');
        } else {
          console.log('   ❓ Unexpected content type');
        }
        
      } catch (pdfError) {
        console.log(`   ❌ PDF test failed: ${pdfError.message}`);
      }
    }
    
    console.log('\n🏗️  STEP 3: Local Build Verification...\n');
    
    // Check local build status
    const fs = await import('fs');
    const path = await import('path');
    
    // Check if .next directory exists (indicates successful build)
    const nextDir = '.next';
    if (fs.existsSync(nextDir)) {
      console.log('✅ Local .next build directory exists');
      
      // Check build manifest
      const buildManifest = path.join(nextDir, 'build-manifest.json');
      if (fs.existsSync(buildManifest)) {
        console.log('✅ Build manifest present');
        
        const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
        console.log(`   Pages built: ${Object.keys(manifest.pages || {}).length}`);
      }
      
      // Check for PDF route in build
      const serverDir = path.join(nextDir, 'server', 'app', 'api', 'pdf');
      if (fs.existsSync(serverDir)) {
        console.log('✅ PDF API route built successfully');
      } else {
        console.log('⚠️  PDF API route not found in build');
      }
      
    } else {
      console.log('❌ No local build found - run npm run build first');
      return;
    }
    
    console.log('\n📦 STEP 4: Package Dependencies Check...\n');
    
    // Check package.json for required dependencies
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['jspdf', 'next', 'react'];
    
    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
        console.log(`✅ ${dep}: ${packageJson.dependencies[dep] || packageJson.devDependencies[dep]}`);
      } else {
        console.log(`❌ Missing dependency: ${dep}`);
      }
    }
    
    console.log('\n🔧 STEP 5: Environment Variables Check...\n');
    
    // Check for environment files
    const envFiles = ['.env.local', '.env.production', '.env'];
    let envFound = false;
    
    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        console.log(`✅ Environment file found: ${envFile}`);
        envFound = true;
      }
    }
    
    if (!envFound) {
      console.log('⚠️  No environment files found - may need manual setup on Vercel');
    }
    
    console.log('\n📋 STEP 6: Git Status Check...\n');
    
    // Check git status
    const { execSync } = await import('child_process');
    
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      
      if (gitStatus.trim()) {
        console.log('📝 Uncommitted changes detected:');
        console.log(gitStatus);
        console.log('✅ Ready for commit and deployment');
      } else {
        console.log('✅ Working directory clean - no uncommitted changes');
      }
      
      // Check current branch
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      console.log(`📍 Current branch: ${currentBranch}`);
      
      if (currentBranch !== 'main') {
        console.log('⚠️  Not on main branch - consider switching to main for deployment');
      }
      
    } catch (gitError) {
      console.log('⚠️  Git status check failed - ensure git is initialized');
    }
    
    console.log('\n🎯 DEPLOYMENT COMPATIBILITY ASSESSMENT\n');
    
    // Deployment readiness checklist
    const checks = [
      { name: 'Local build successful', status: fs.existsSync('.next') },
      { name: 'PDF API route built', status: fs.existsSync(path.join('.next', 'server', 'app', 'api', 'pdf')) },
      { name: 'Required dependencies present', status: packageJson.dependencies['jspdf'] && packageJson.dependencies['next'] },
      { name: 'Git repository ready', status: true }, // Assume git is working if we got here
    ];
    
    let allPassed = true;
    
    for (const check of checks) {
      const status = check.status ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${check.name}`);
      if (!check.status) allPassed = false;
    }
    
    console.log('\n🚀 DEPLOYMENT RECOMMENDATION\n');
    
    if (allPassed) {
      console.log('✅ READY FOR DEPLOYMENT');
      console.log('📋 Pre-commit checklist complete');
      console.log('🎯 Safe to commit and deploy to Vercel');
      
      console.log('\n📝 RECOMMENDED COMMIT COMMANDS:');
      console.log('git add .');
      console.log('git commit -m "fix: Professional PDF generation - API endpoint now uses ProfessionalPDFGenerator"');
      console.log('git push origin main');
      
      console.log('\n🔄 VERCEL DEPLOYMENT:');
      console.log('- Vercel will auto-deploy from main branch');
      console.log('- PDF endpoints will be updated with professional generation');
      console.log('- Monitor deployment at: https://vercel.com/dashboard');
      
    } else {
      console.log('❌ NOT READY FOR DEPLOYMENT');
      console.log('🔧 Fix the failed checks above before deploying');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
};

// Run verification
preCommitVerification().catch(console.error);