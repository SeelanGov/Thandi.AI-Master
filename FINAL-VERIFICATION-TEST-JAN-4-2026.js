#!/usr/bin/env node

console.log('🔍 FINAL VERIFICATION TEST - PROVE ALL CLAIMS');
console.log('='.repeat(60));
console.log('Testing ALL systems locally for manual verification');
console.log('User will manually test each URL provided\n');

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

// Test URLs that user can manually verify
const testUrls = [
  {
    category: 'LANDING PAGE & BRANDING',
    tests: [
      {
        name: 'Landing Page with New Content',
        url: `${BASE_URL}/`,
        expected: 'Should show "From School to Success", "Grade 10-12 South African Students", "Built in South Africa" badge'
      },
      {
        name: 'Header Navigation',
        url: `${BASE_URL}/`,
        expected: 'Should show "Thandi.ai" logo, "School Login" (not Admin), "Start Assessment" button'
      },
      {
        name: 'Footer Legal Framework',
        url: `${BASE_URL}/`,
        expected: 'Should show trust badges (POPIA, B-BBEE), legal links, "Thandi Admin" button'
      }
    ]
  },
  {
    category: 'LEGAL DOCUMENTS',
    tests: [
      {
        name: 'Privacy Policy',
        url: `${BASE_URL}/legal/privacy-policy`,
        expected: 'Should load legal document with print button and "Back to Thandi.ai" link'
      },
      {
        name: 'Terms of Service',
        url: `${BASE_URL}/legal/terms-of-service`,
        expected: 'Should load legal document with professional layout'
      },
      {
        name: 'POPIA Compliance',
        url: `${BASE_URL}/legal/popia-compliance`,
        expected: 'Should load POPIA compliance document'
      },
      {
        name: 'Student Data Protection',
        url: `${BASE_URL}/legal/student-data-protection`,
        expected: 'Should load student data protection policy'
      }
    ]
  },
  {
    category: 'ASSESSMENT SYSTEM',
    tests: [
      {
        name: 'Grade 10 Assessment',
        url: `${BASE_URL}/assessment/grade/10`,
        expected: 'Should load assessment form for Grade 10 students'
      },
      {
        name: 'Grade 11 Assessment',
        url: `${BASE_URL}/assessment/grade/11`,
        expected: 'Should load assessment form for Grade 11 students'
      },
      {
        name: 'Grade 12 Assessment',
        url: `${BASE_URL}/assessment/grade/12`,
        expected: 'Should load assessment form for Grade 12 students'
      },
      {
        name: 'Assessment Selector',
        url: `${BASE_URL}/assessment`,
        expected: 'Should show grade selection page'
      }
    ]
  },
  {
    category: 'ADMIN & SCHOOL SYSTEM',
    tests: [
      {
        name: 'Admin Panel',
        url: `${BASE_URL}/admin`,
        expected: 'Should load admin login page'
      },
      {
        name: 'School Claim',
        url: `${BASE_URL}/school/claim`,
        expected: 'Should load school claim page with Thandi branding'
      },
      {
        name: 'School Verification',
        url: `${BASE_URL}/school/verify`,
        expected: 'Should load school verification page'
      }
    ]
  }
];

async function testSystemHealth() {
  console.log('🏥 TESTING SYSTEM HEALTH');
  console.log('-'.repeat(30));
  
  const healthTests = [
    { name: 'Main Health', endpoint: '/api/health' },
    { name: 'Cache Health', endpoint: '/api/cache/health' }
  ];
  
  for (const test of healthTests) {
    try {
      const response = await fetch(`${BASE_URL}${test.endpoint}`);
      const data = await response.json();
      console.log(`✅ ${test.name}: ${response.status} - ${data.status || 'OK'}`);
    } catch (error) {
      console.log(`❌ ${test.name}: Failed - ${error.message}`);
    }
  }
}

async function testRegistrationAPI() {
  console.log('\n🔐 TESTING REGISTRATION API');
  console.log('-'.repeat(30));
  
  try {
    const response = await fetch(`${BASE_URL}/api/student/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name: 'Test',
        student_surname: 'Student',
        grade: 10,
        school_id: 'ZAF-200100005', // Valid school ID
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        consent_version: '1.0'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Registration API: Working - Student ID: ${data.student_id}`);
    } else {
      console.log(`❌ Registration API: Failed - Status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Registration API: Error - ${error.message}`);
  }
}

async function testRAGAPI() {
  console.log('\n🤖 TESTING RAG API WITH CALENDAR INTEGRATION');
  console.log('-'.repeat(30));
  
  const ragTests = [
    { grade: 'grade10', query: 'I am a Grade 10 student interested in engineering' },
    { grade: 'grade11', query: 'Grade 11 student with Grade 10 marks, need university guidance' },
    { grade: 'grade12', query: 'Grade 12 final year student preparing for NSC exams' }
  ];
  
  for (const test of ragTests) {
    try {
      const response = await fetch(`${BASE_URL}/api/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: test.query,
          grade: test.grade,
          curriculum: 'caps'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const hasCalendarContext = data.response.includes('Academic Year') || data.response.includes('2025');
        console.log(`✅ RAG ${test.grade}: Working - Calendar Context: ${hasCalendarContext ? 'Yes' : 'No'}`);
      } else {
        console.log(`❌ RAG ${test.grade}: Failed - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ RAG ${test.grade}: Error - ${error.message}`);
    }
  }
}

async function main() {
  console.log(`🌐 Testing against: ${BASE_URL}`);
  console.log(`📅 Test Date: ${new Date().toISOString()}\n`);
  
  // Run automated tests
  await testSystemHealth();
  await testRegistrationAPI();
  await testRAGAPI();
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 MANUAL VERIFICATION REQUIRED');
  console.log('='.repeat(60));
  console.log('Please manually test each URL below to verify claims:\n');
  
  // Print manual test URLs
  testUrls.forEach((category, categoryIndex) => {
    console.log(`${categoryIndex + 1}. ${category.category}`);
    console.log('-'.repeat(category.category.length + 3));
    
    category.tests.forEach((test, testIndex) => {
      console.log(`   ${categoryIndex + 1}.${testIndex + 1} ${test.name}`);
      console.log(`       URL: ${test.url}`);
      console.log(`       Expected: ${test.expected}`);
      console.log('');
    });
  });
  
  console.log('🎯 VERIFICATION CHECKLIST');
  console.log('='.repeat(25));
  console.log('□ Landing page shows new content and branding');
  console.log('□ All legal documents load correctly');
  console.log('□ Assessment pages work for all grades');
  console.log('□ Admin/school pages load properly');
  console.log('□ Mobile responsiveness verified');
  console.log('□ No console errors in browser');
  console.log('□ All links and buttons functional');
  
  console.log('\n✅ AUTOMATED TESTS COMPLETE');
  console.log('🔍 MANUAL VERIFICATION REQUIRED');
  console.log('📋 Test each URL above to confirm all claims');
}

main().catch(console.error);