#!/usr/bin/env node

const { execSync } = require('child_process');

function deploySchoolSelectionFix() {
  console.log('🚀 DEPLOYING SCHOOL SELECTION FIX');
  console.log('=================================\n');
  
  console.log('📋 Fix Summary:');
  console.log('- Improved dropdown positioning (absolute with z-50)');
  console.log('- Added mousedown and touchstart event handlers');
  console.log('- Added debugging and validation');
  console.log('- Fixed container positioning');
  
  try {
    console.log('\n📦 Step 1: Staging changes...');
    execSync('git add components/BulletproofStudentRegistration.jsx', { stdio: 'inherit' });
    
    console.log('\n💾 Step 2: Committing fix...');
    execSync('git commit -m "CRITICAL FIX: School selection dropdown UI issue\n\n- Fixed dropdown positioning with absolute and z-50\n- Added mousedown and touchstart handlers for better reliability\n- Added client-side validation and debugging\n- Fixed container positioning for proper dropdown containment\n\nThis fixes the critical issue where students cannot select schools\nfrom the dropdown, causing registration to fail with empty school_id."', { stdio: 'inherit' });
    
    console.log('\n🌐 Step 3: Pushing to GitHub...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('\n🚀 Step 4: Triggering Vercel deployment...');
    console.log('Vercel will automatically deploy from the main branch...');
    
    console.log('\n✅ DEPLOYMENT INITIATED');
    console.log('======================');
    console.log('🔗 Monitor deployment: https://vercel.com/dashboard');
    console.log('🌐 Test URL: https://www.thandi.online/assessment');
    console.log('⏱️  Expected deployment time: 2-3 minutes');
    
    console.log('\n🧪 POST-DEPLOYMENT TESTING:');
    console.log('===========================');
    console.log('1. Go to https://www.thandi.online/assessment');
    console.log('2. Click "Continue with Registration"');
    console.log('3. Fill name/surname, type "high" in school field');
    console.log('4. Verify dropdown appears and schools are clickable');
    console.log('5. Select a school and complete registration');
    console.log('6. Check browser console for debug logs');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploySchoolSelectionFix();