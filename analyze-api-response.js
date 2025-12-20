#!/usr/bin/env node

/**
 * Analyze API Response
 * Deep dive into the actual API response content
 */

const DEPLOYMENT_URL = 'https://thandiai-j3jdmrcxd-thandiai-projects.vercel.app';

console.log('🔍 Analyze API Response');
console.log('='.repeat(50));

async function analyzeAPIResponse() {
  console.log('📊 Getting detailed API response...\n');
  
  const testData = {
    query: `I am a Grade 10 student in South Africa following the CAPS curriculum. Today is December 2025. I have 2 years left before Grade 12 finals.

    ASSESSMENT DATA:
    Subjects I enjoy: Mathematics, Physical Sciences, English Home Language.
    Interests: Engineering, Technology, Problem-solving.
    
    My current marks (as of December 2025): Mathematics: 75%, Physical Sciences: 70%, English Home Language: 80%, Life Orientation: 85%, Accounting: 65%, Geography: 72%, Afrikaans First Additional Language: 68%.
    
    IMPORTANT: Student explicitly stated career interest: "I want to become a mechanical engineer". 
    Prioritize this career if their subjects and marks make it feasible.`,
    
    grade: 'grade10',
    curriculum: 'caps',
    profile: {
      grade: 10,
      marksData: {
        marksOption: 'provide',
        exactMarks: {
          'Mathematics': '75',
          'Physical Sciences': '70',
          'English Home Language': '80',
          'Life Orientation': '85',
          'Accounting': '65',
          'Geography': '72',
          'Afrikaans First Additional Language': '68'
        }
      },
      constraints: {
        time: 'flexible',
        money: 'not specified',
        location: 'anywhere'
      }
    }
  };
  
  try {
    const response = await fetch(DEPLOYMENT_URL + '/api/rag/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const data = await response.json();
      const responseText = data.response || '';
      
      console.log('📄 FULL API RESPONSE:');
      console.log('='.repeat(80));
      console.log(responseText);
      console.log('='.repeat(80));
      
      console.log('\n🔍 RESPONSE ANALYSIS:');
      
      // Look for all APS-related patterns
      const apsPatterns = [
        /APS[:\s]*(\d+)/gi,
        /aps[:\s]*(\d+)/gi,
        /Current.*APS[:\s]*(\d+)/gi,
        /Projected.*APS[:\s]*(\d+)/gi,
        /(\d+)\s*points/gi,
        /University.*Eligibility/gi,
        /Qualified.*university/gi
      ];
      
      apsPatterns.forEach((pattern, index) => {
        const matches = responseText.match(pattern);
        if (matches) {
          console.log(`   Pattern ${index + 1}: ${matches.join(', ')}`);
        }
      });
      
      // Look for university programs
      const universityMatches = responseText.match(/(University of|UCT|Wits|Stellenbosch|UKZN)/gi);
      if (universityMatches) {
        console.log(`   Universities: ${[...new Set(universityMatches)].join(', ')}`);
      }
      
      // Look for specific programs
      const programMatches = responseText.match(/(Engineering|Medicine|Computer Science|Business Science|Mechanical)/gi);
      if (programMatches) {
        console.log(`   Programs: ${[...new Set(programMatches)].join(', ')}`);
      }
      
      // Check response structure
      console.log('\n📊 RESPONSE STRUCTURE:');
      console.log(`   Total length: ${responseText.length} characters`);
      console.log(`   Contains sections: ${responseText.includes('##') ? 'Yes' : 'No'}`);
      console.log(`   Contains headers: ${responseText.includes('#') ? 'Yes' : 'No'}`);
      console.log(`   Contains lists: ${responseText.includes('*') || responseText.includes('-') ? 'Yes' : 'No'}`);
      
      // Check if it's using the enhanced response format
      const isEnhancedResponse = responseText.includes('Your Specific Career Guidance Results') || 
                                responseText.includes('Academic Performance Analysis');
      console.log(`   Enhanced format: ${isEnhancedResponse ? 'Yes' : 'No'}`);
      
      // Check metadata
      if (data.metadata) {
        console.log('\n🔧 METADATA:');
        console.log(`   Grade: ${data.metadata.grade}`);
        console.log(`   Curriculum: ${data.metadata.curriculum}`);
        console.log(`   Provider: ${data.metadata.provider}`);
        console.log(`   Has verification footer: ${data.metadata.hasVerificationFooter}`);
      }
      
    } else {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 ANALYSIS COMPLETE');
}

analyzeAPIResponse().catch(console.error);