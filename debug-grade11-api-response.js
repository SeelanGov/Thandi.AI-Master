/**
 * Debug Grade 11 API Response
 * Check what the API is actually returning for Grade 11 students
 */

console.log('🔍 DEBUGGING GRADE 11 API RESPONSE');
console.log('==================================');

async function debugGrade11Response() {
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
    
    console.log('📤 Sending Grade 11 query...');
    console.log('Query:', JSON.stringify(grade11Query, null, 2));
    
    const response = await fetch('http://localhost:3000/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grade11Query)
    });
    
    console.log(`\n📥 Response status: ${response.status}`);
    
    if (response.status === 200) {
      const data = await response.json();
      
      console.log('\n📋 Full API Response:');
      console.log('Success:', data.success);
      console.log('Source:', data.source);
      console.log('Grade detected:', data.metadata?.grade);
      
      console.log('\n📝 Response content (first 500 chars):');
      console.log(data.response?.substring(0, 500) + '...');
      
      console.log('\n🔍 Searching for timeline keywords:');
      const response_text = data.response || '';
      
      // Check for various timeline patterns
      const patterns = [
        '1 year left',
        '1 full year',
        'one year left',
        'one year remaining',
        '1 year remaining',
        '2 year',
        'two year',
        'Grade 11',
        'grade 11'
      ];
      
      patterns.forEach(pattern => {
        const found = response_text.toLowerCase().includes(pattern.toLowerCase());
        console.log(`   "${pattern}": ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
      });
      
      // Look for specific Grade 11 content
      console.log('\n📊 Grade 11 Analysis:');
      const hasGrade11 = response_text.includes('Grade 11') || response_text.includes('grade 11');
      const hasOneYear = response_text.includes('1 year') || response_text.includes('one year');
      const hasTwoYears = response_text.includes('2 year') || response_text.includes('two year');
      
      console.log(`   Contains "Grade 11": ${hasGrade11 ? '✅' : '❌'}`);
      console.log(`   Contains "1 year": ${hasOneYear ? '✅' : '❌'}`);
      console.log(`   Contains "2 year": ${hasTwoYears ? '❌ PROBLEM' : '✅ GOOD'}`);
      
    } else {
      console.log('❌ API call failed');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

debugGrade11Response();