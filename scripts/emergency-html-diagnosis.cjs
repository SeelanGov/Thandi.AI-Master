#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function diagnoseHTML() {
  console.log('🔍 EMERGENCY HTML DIAGNOSIS');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch('https://thandiai.vercel.app/assessment');
    const html = await response.text();
    
    console.log('📄 HTML ANALYSIS:');
    console.log(`   Total size: ${html.length} characters`);
    
    // Check for critical elements
    const checks = {
      'Grade selector buttons': html.includes('Grade 10') || html.includes('Grade 11'),
      'Input fields': html.includes('<input'),
      'Text inputs': html.includes('type="text"'),
      'Select dropdowns': html.includes('<select'),
      'Form elements': html.includes('<form'),
      'Student registration': html.includes('Student Registration') || html.includes('First Name'),
      'BulletproofStudentRegistration': html.includes('BulletproofStudentRegistration'),
      'React hydration': html.includes('__NEXT_DATA__'),
      'JavaScript bundles': html.includes('/_next/static/chunks/'),
      'CSS styles': html.includes('/_next/static/css/')
    };
    
    Object.entries(checks).forEach(([check, result]) => {
      console.log(`   ${check}: ${result ? '✅' : '❌'}`);
    });
    
    // Extract the main content area
    const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/s);
    if (bodyMatch) {
      const bodyContent = bodyMatch[1];
      console.log('\n📋 BODY CONTENT PREVIEW:');
      console.log(bodyContent.substring(0, 500) + '...');
      
      // Look for specific component names
      if (bodyContent.includes('GradeSelector')) {
        console.log('\n✅ GradeSelector component found in HTML');
      } else {
        console.log('\n❌ GradeSelector component NOT found in HTML');
      }
      
      if (bodyContent.includes('BulletproofStudentRegistration')) {
        console.log('✅ BulletproofStudentRegistration component found in HTML');
      } else {
        console.log('❌ BulletproofStudentRegistration component NOT found in HTML');
      }
    }
    
    // Check for hydration errors
    if (html.includes('Hydration failed') || html.includes('hydration')) {
      console.log('\n🚨 HYDRATION ISSUES DETECTED');
    }
    
    console.log('\n🎯 DIAGNOSIS COMPLETE');
    
  } catch (error) {
    console.error('Diagnosis failed:', error);
  }
}

diagnoseHTML();