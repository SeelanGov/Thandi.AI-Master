/**
 * Debug Grade 11 Full Response
 * Get the complete API response to see the exact timeline wording
 */

console.log('🔍 DEBUGGING GRADE 11 FULL RESPONSE');
console.log('===================================');

async function debugFullGrade11Response() {
  try {
    const grade11Query = {
      query: "I am a Grade 11 student in South Africa. I have 1 full year left before Grade 12 finals. I enjoy Mathematics and Physical Sciences.",
      grade: "grade11",
      curriculum: "caps",
      profile: {
        grade: 11,
        marksData: {
          marksOption: "provide",
          exactMarks: {
            "Mathematics": "75",
            "Physical Sciences": "70"
          }
        }
      }
    };
    
    const response = await fetch('http://localhost:3000/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grade11Query)
    });
    
    if (response.status === 200) {
      const data = await response.json();
      
      console.log('📝 COMPLETE API RESPONSE:');
      console.log('========================');
      console.log(data.response);
      
      console.log('\n🔍 TIMELINE ANALYSIS:');
      console.log('=====================');
      
      const responseText = data.response || '';
      
      // Look for timeline-related content
      const timelinePatterns = [
        /(\d+)\s*months?\s*away/gi,
        /(\d+)\s*years?\s*left/gi,
        /(\d+)\s*years?\s*remaining/gi,
        /Grade 12 finals will be in/gi,
        /Academic Timeline/gi,
        /Current Phase/gi
      ];
      
      timelinePatterns.forEach(pattern => {
        const matches = responseText.match(pattern);
        if (matches) {
          console.log(`   Pattern "${pattern.source}": ${matches.join(', ')}`);
        }
      });
      
      // Check if Grade 11 is properly detected vs Grade 10
      const isGrade11 = responseText.includes('GRADE 11') && !responseText.includes('GRADE 10');
      const hasCorrectTimeline = responseText.includes('11 months') || responseText.includes('1 year') || responseText.includes('one year');
      const notTwoYears = !responseText.includes('2 years') && !responseText.includes('two years');
      
      console.log('\n📊 VERIFICATION RESULTS:');
      console.log('========================');
      console.log(`   ✓ Detected as Grade 11 (not 10): ${isGrade11 ? '✅' : '❌'}`);
      console.log(`   ✓ Has appropriate timeline: ${hasCorrectTimeline ? '✅' : '❌'}`);
      console.log(`   ✓ Does NOT show 2 years: ${notTwoYears ? '✅' : '❌'}`);
      
      const grade11Fixed = isGrade11 && hasCorrectTimeline && notTwoYears;
      console.log(`\n🎯 GRADE 11 FIX STATUS: ${grade11Fixed ? '✅ WORKING CORRECTLY' : '❌ NEEDS ATTENTION'}`);
      
      if (grade11Fixed) {
        console.log('\n🎉 Grade 11 detection is working correctly!');
        console.log('   - Shows Grade 11 (not Grade 10)');
        console.log('   - Shows appropriate timeline (11 months/1 year)');
        console.log('   - Does not show 2 years timeline');
      }
      
    } else {
      console.log('❌ API call failed');
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

debugFullGrade11Response();