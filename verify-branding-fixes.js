#!/usr/bin/env node

/**
 * VERIFY BRANDING FIXES
 * Quick verification of critical branding fixes
 */

const fs = require('fs');

function verifyFixes() {
  console.log('✅ BRANDING FIXES VERIFICATION');
  console.log('==============================');
  console.log('');
  
  const fixes = [
    {
      file: 'components/BulletproofStudentRegistration.jsx',
      check: 'Welcome to Thandi Career Assessment',
      description: 'Main title branding'
    },
    {
      file: 'components/BulletproofStudentRegistration.jsx', 
      check: 'Thandi Student Registration',
      description: 'Registration form title'
    },
    {
      file: 'components/BulletproofStudentRegistration.jsx',
      check: 'Thandi_student_token',
      description: 'Storage token branding'
    },
    {
      file: 'app/assessment/page.jsx',
      check: 'Thandi Career Assessment - Discover Your Future',
      description: 'Page metadata title'
    },
    {
      file: 'app/assessment/components/AssessmentForm.jsx',
      check: 'Thandi_assessment_data',
      description: 'Assessment storage key'
    },
    {
      file: 'app/globals.css',
      check: '/* Thandi Brand Fonts */',
      description: 'CSS comment branding'
    }
  ];
  
  let passedFixes = 0;
  
  fixes.forEach(fix => {
    try {
      const content = fs.readFileSync(fix.file, 'utf8');
      if (content.includes(fix.check)) {
        console.log(`✅ ${fix.description}: FIXED`);
        passedFixes++;
      } else {
        console.log(`❌ ${fix.description}: NOT FOUND`);
      }
    } catch (error) {
      console.log(`❌ ${fix.description}: FILE ERROR`);
    }
  });
  
  console.log('');
  console.log('📊 VERIFICATION SUMMARY');
  console.log('=======================');
  console.log(`Fixes verified: ${passedFixes}/${fixes.length}`);
  
  if (passedFixes === fixes.length) {
    console.log('🎉 All critical branding fixes applied successfully!');
    console.log('✅ Ready for deployment');
  } else {
    console.log('⚠️  Some fixes may need attention');
  }
  
  console.log('');
  console.log('🎨 BRANDING STANDARDS APPLIED:');
  console.log('- "Thandi" (proper case) for brand name');
  console.log('- "Thandi.ai" for domain references');
  console.log('- "Thandi [Feature]" for titled sections');
  console.log('- Consistent storage key naming');
  
  return passedFixes === fixes.length;
}

// Run verification
const success = verifyFixes();
console.log(`\n📅 Verification completed: ${new Date().toISOString()}`);
console.log(`🎯 Result: ${success ? 'READY FOR DEPLOYMENT' : 'NEEDS ATTENTION'}`);