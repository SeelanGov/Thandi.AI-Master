#!/usr/bin/env node

/**
 * CLEAN BUILD AND DEPLOY
 * Ensure clean build before Vercel deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function deployCleanBuild() {
  console.log('🧹 CLEAN BUILD AND DEPLOY');
  console.log('==========================');
  
  try {
    // Step 1: Clean build artifacts
    console.log('\n1️⃣ Cleaning build artifacts...');
    
    const cleanDirs = ['.next', 'node_modules/.cache', '.vercel'];
    for (const dir of cleanDirs) {
      if (fs.existsSync(dir)) {
        console.log(`   🗑️ Removing ${dir}`);
        execSync(`rmdir /s /q "${dir}"`, { stdio: 'inherit' });
      }
    }
    
    // Step 2: Verify critical files exist
    console.log('\n2️⃣ Verifying critical files...');
    
    const criticalFiles = [
      'app/assessment/page.jsx',
      'components/BulletproofStudentRegistration.jsx',
      'app/api/rag/query/route.js',
      'package.json',
      'next.config.js'
    ];
    
    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Critical file missing: ${file}`);
      }
      console.log(`   ✅ ${file}`);
    }
    
    // Step 3: Test local build
    console.log('\n3️⃣ Testing local build...');
    
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('   ✅ Local build successful');
    } catch (error) {
      throw new Error('Local build failed - cannot deploy');
    }
    
    // Step 4: Commit changes
    console.log('\n4️⃣ Committing changes...');
    
    try {
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Fix: Clean assessment flow - students see registration form"', { stdio: 'inherit' });
      console.log('   ✅ Changes committed');
    } catch (error) {
      console.log('   ℹ️ No changes to commit (already committed)');
    }
    
    // Step 5: Deploy to Vercel
    console.log('\n5️⃣ Deploying to Vercel...');
    
    try {
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('   ✅ Pushed to GitHub - Vercel will auto-deploy');
    } catch (error) {
      throw new Error('Failed to push to GitHub');
    }
    
    console.log('\n🎉 DEPLOYMENT INITIATED!');
    console.log('✅ Clean build completed locally');
    console.log('✅ Changes pushed to GitHub');
    console.log('✅ Vercel auto-deployment triggered');
    console.log('\n📋 Next steps:');
    console.log('1. Monitor Vercel deployment dashboard');
    console.log('2. Test https://www.thandi.online/assessment once deployed');
    console.log('3. Verify students see registration form (not grade selector)');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    return false;
  }
}

// Run deployment
deployCleanBuild().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});