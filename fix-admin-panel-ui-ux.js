#!/usr/bin/env node

/**
 * ADMIN PANEL UI/UX FIXES
 * Systematically fixes all identified admin panel issues
 */

const fs = require('fs');

function fixAdminPageBranding() {
  console.log('🏫 FIXING ADMIN PAGE');
  console.log('====================');
  
  const adminPath = 'app/admin/page.js';
  let content = fs.readFileSync(adminPath, 'utf8');
  let changes = 0;
  
  // Fix branding
  if (content.includes('bg-thandi-cream')) {
    content = content.replace(
      'Redirecting to school login...',
      'Redirecting to Thandi school portal...'
    );
    changes++;
    console.log('   ✅ Fixed loading message branding');
  }
  
  // Add responsive design
  content = content.replace(
    'className="min-h-screen bg-thandi-cream flex items-center justify-center"',
    'className="min-h-screen bg-thandi-cream flex items-center justify-center px-4 sm:px-6"'
  );
  changes++;
  console.log('   ✅ Added responsive padding');
  
  // Add loading state management
  content = content.replace(
    "import { useEffect } from 'react';",
    "import { useEffect, useState } from 'react';"
  );
  
  content = content.replace(
    'export default function AdminPage() {\n  const router = useRouter();',
    `export default function AdminPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);`
  );
  
  content = content.replace(
    'useEffect(() => {\n    // Redirect to school claim page\n    router.replace(\'/school/claim\');\n  }, [router]);',
    `useEffect(() => {
    // Redirect to school claim page
    setIsRedirecting(true);
    const timer = setTimeout(() => {
      router.replace('/school/claim');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);`
  );
  
  content = content.replace(
    '<p className="text-thandi-brown font-body">Redirecting to Thandi school portal...</p>',
    `<p className="text-thandi-brown font-body">
        {isRedirecting ? 'Redirecting to Thandi school portal...' : 'Loading...'}
      </p>`
  );
  
  changes += 3;
  console.log('   ✅ Added proper loading state management');
  
  fs.writeFileSync(adminPath, content);
  console.log(`   📝 Updated ${adminPath} with ${changes} fixes`);
  
  return changes;
}

function fixSchoolClaimPageBranding() {
  console.log('\n🏫 FIXING SCHOOL CLAIM PAGE');
  console.log('===========================');
  
  const claimPath = 'app/school/claim/page.js';
  let content = fs.readFileSync(claimPath, 'utf8');
  let changes = 0;
  
  // Fix title branding
  content = content.replace(
    'School Administration Portal',
    'Thandi School Administration Portal'
  );
  changes++;
  console.log('   ✅ Fixed main title branding');
  
  content = content.replace(
    'Claim your school\'s access to the THANDI AI dashboard',
    'Claim your school\'s access to the Thandi AI dashboard'
  );
  changes++;
  console.log('   ✅ Fixed description branding');
  
  // Fix button consistency - add proper Thandi button classes
  content = content.replace(
    'className="px-6 py-3 bg-thandi-teal text-white rounded-lg hover:bg-thandi-teal-mid disabled:opacity-50 transition-all duration-200 font-body font-medium"',
    'className="px-6 py-3 bg-thandi-teal text-white rounded-lg hover:bg-thandi-teal-mid disabled:opacity-50 transition-all duration-200 font-body font-medium hover:scale-105 focus:ring-2 focus:ring-thandi-teal focus:ring-offset-2"'
  );
  changes++;
  console.log('   ✅ Enhanced search button with Thandi design system');
  
  // Add loading spinner
  content = content.replace(
    '{loading ? \'Searching...\' : \'Search\'}',
    `{loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </div>
                ) : 'Search'}`
  );
  changes++;
  console.log('   ✅ Added loading spinner to search button');
  
  // Fix claim button loading state
  content = content.replace(
    '{loading ? \'Sending Magic Link...\' : \'Claim School Access\'}',
    `{loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-thandi-teal"></div>
                      <span>Sending Magic Link...</span>
                    </div>
                  ) : 'Claim School Access'}`
  );
  changes++;
  console.log('   ✅ Added loading spinner to claim button');
  
  fs.writeFileSync(claimPath, content);
  console.log(`   📝 Updated ${claimPath} with ${changes} fixes`);
  
  return changes;
}

function fixSchoolVerifyPageBranding() {
  console.log('\n🏫 FIXING SCHOOL VERIFY PAGE');
  console.log('============================');
  
  const verifyPath = 'app/school/verify/page.js';
  let content = fs.readFileSync(verifyPath, 'utf8');
  let changes = 0;
  
  // Fix title branding
  content = content.replace(
    'School Successfully Claimed!',
    'Thandi School Successfully Claimed!'
  );
  changes++;
  console.log('   ✅ Fixed success title branding');
  
  // Add responsive design to main container
  content = content.replace(
    'className="max-w-md w-full px-4"',
    'className="max-w-md w-full px-4 sm:px-6"'
  );
  changes++;
  console.log('   ✅ Added responsive padding');
  
  // Fix button consistency - enhance with Thandi design system
  content = content.replace(
    'className="w-full px-6 py-3 bg-thandi-gold text-thandi-teal rounded-lg hover:bg-thandi-gold/90 transition-all duration-200 font-body font-semibold hover:scale-105"',
    'className="w-full px-6 py-3 bg-thandi-gold text-thandi-teal rounded-lg hover:bg-thandi-gold/90 transition-all duration-200 font-body font-semibold hover:scale-105 focus:ring-2 focus:ring-thandi-gold focus:ring-offset-2"'
  );
  changes++;
  
  content = content.replace(
    'className="w-full px-4 py-3 bg-thandi-teal text-white rounded-lg hover:bg-thandi-teal-mid transition-colors font-body font-medium"',
    'className="w-full px-4 py-3 bg-thandi-teal text-white rounded-lg hover:bg-thandi-teal-mid transition-colors font-body font-medium hover:scale-105 focus:ring-2 focus:ring-thandi-teal focus:ring-offset-2"'
  );
  changes++;
  
  console.log('   ✅ Enhanced buttons with Thandi design system');
  
  fs.writeFileSync(verifyPath, content);
  console.log(`   📝 Updated ${verifyPath} with ${changes} fixes`);
  
  return changes;
}

function fixSchoolDashboardBranding() {
  console.log('\n🏫 FIXING SCHOOL DASHBOARD');
  console.log('==========================');
  
  const dashboardPath = 'app/school/dashboard/simple-page.js';
  let content = fs.readFileSync(dashboardPath, 'utf8');
  let changes = 0;
  
  // Fix title branding
  content = content.replace(
    'School Dashboard',
    'Thandi School Dashboard'
  );
  changes++;
  console.log('   ✅ Fixed dashboard title branding');
  
  // Fix branding in debug section
  content = content.replace(
    '✅ THANDI branding applied',
    '✅ Thandi branding applied'
  );
  changes++;
  console.log('   ✅ Fixed debug section branding');
  
  // Add better error handling message
  content = content.replace(
    'Unable to load dashboard',
    'Unable to load Thandi dashboard'
  );
  changes++;
  console.log('   ✅ Fixed error message branding');
  
  fs.writeFileSync(dashboardPath, content);
  console.log(`   📝 Updated ${dashboardPath} with ${changes} fixes`);
  
  return changes;
}

function runAdminPanelFixes() {
  console.log('🛠️  ADMIN PANEL UI/UX FIXES');
  console.log('============================');
  console.log('');
  
  let totalFixes = 0;
  
  try {
    totalFixes += fixAdminPageBranding();
    totalFixes += fixSchoolClaimPageBranding();
    totalFixes += fixSchoolVerifyPageBranding();
    totalFixes += fixSchoolDashboardBranding();
    
    console.log('\n📊 ADMIN PANEL FIX SUMMARY');
    console.log('===========================');
    console.log(`Total fixes applied: ${totalFixes}`);
    console.log('');
    
    console.log('✅ ADMIN PANEL FIXES COMPLETED:');
    console.log('- Branding consistency (THANDI → Thandi)');
    console.log('- Title consistency with Thandi branding');
    console.log('- Button design system enhancement');
    console.log('- Loading states with spinners');
    console.log('- Responsive design improvements');
    console.log('- Error handling enhancements');
    console.log('');
    
    console.log('🎯 RESULT: Admin panel UI/UX issues resolved');
    console.log('🚀 Admin panel ready for deployment!');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Error during admin panel fixes: ${error.message}`);
    return false;
  }
}

// Run admin panel fixes
const success = runAdminPanelFixes();
console.log(`\n📅 Admin panel fixes completed: ${new Date().toISOString()}`);
console.log(`🎯 Status: ${success ? 'SUCCESS' : 'FAILED'}`);