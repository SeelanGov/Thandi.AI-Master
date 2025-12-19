/**
 * Debug Grade 10 Calendar Calculation
 * Check what the API is returning for Grade 10 students to ensure "2 years left" is correct
 */

console.log('🔍 DEBUGGING GRADE 10 CALENDAR CALCULATION');
console.log('==========================================');

async function debugGrade10Response() {
  try {
    const grade10Query = {
      query: "I am a Grade 10 student in South Africa. I have 2 years left before Grade 12 finals. I enjoy Mathematics and Physical Sciences.",
      grade: "grade10",
      curriculum: "caps",
      profile: {
        grade: 10,
        marksData: {
          marksOption: "provide",
          exactMarks: {
            "Mathematics": "75",
            "Physical Sciences": "70"
          }
        }
      }
    };
    
    console.log('📤 Sending Grade 10 query...');
    console.log('Query:', JSON.stringify(grade10Query, null, 2));
    
    const response = await fetch('http://localhost:3000/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grade10Query)
    });
    
    console.log(`\n📥 Response status: ${response.status}`);
    
    if (response.status === 200) {
      const data = await response.json();
      
      console.log('\n📋 Full API Response:');
      console.log('Success:', data.success);
      console.log('Source:', data.source);
      console.log('Grade detected:', data.metadata?.grade);
      
      console.log('\n📝 Response content (first 800 chars):');
      console.log(data.response?.substring(0, 800) + '...');
      
      console.log('\n🔍 Searching for timeline keywords:');
      const response_text = data.response || '';
      
      // Check for various timeline patterns
      const patterns = [
        '2 years left',
        '2 full years',
        'two years left',
        'two years remaining',
        '2 years remaining',
        '23 months',
        '24 months',
        'Grade 12 finals will be in',
        'Academic Timeline',
        'Current Phase',
        'GRADE 10',
        'grade 10'
      ];
      
      patterns.forEach(pattern => {
        const found = response_text.toLowerCase().includes(pattern.toLowerCase());
        console.log(`   "${pattern}": ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
      });
      
      // Look for specific Grade 10 content
      console.log('\n📊 Grade 10 Analysis:');
      const hasGrade10 = response_text.includes('GRADE 10') || response_text.includes('grade 10');
      const hasTwoYears = response_text.includes('2 years') || response_text.includes('two years') || response_text.includes('23 months') || response_text.includes('24 months');
      const notOneYear = !response_text.includes('1 year left') && !response_text.includes('one year left');
      
      console.log(`   Contains "Grade 10": ${hasGrade10 ? '✅' : '❌'}`);
      console.log(`   Contains "2 years" timeline: ${hasTwoYears ? '✅' : '❌'}`);
      console.log(`   Does NOT show "1 year": ${notOneYear ? '✅' : '❌'}`);
      
      // Check for calendar calculation details
      console.log('\n📅 Calendar Calculation Details:');
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
      const currentYear = currentDate.getFullYear();
      
      console.log(`   Current date: ${currentMonth} ${currentYear}`);
      console.log(`   Grade 10 should graduate: October-November ${currentYear + 2}`);
      console.log(`   Expected timeline: ~23-24 months from now`);
      
      // Look for specific timeline mentions
      const timelineMatches = response_text.match(/(\d+)\s*months?\s*(away|remaining)/gi);
      if (timelineMatches) {
        console.log(`   Timeline matches found: ${timelineMatches.join(', ')}`);
      }
      
      const grade10Correct = hasGrade10 && hasTwoYears && notOneYear;
      console.log(`\n🎯 GRADE 10 CALENDAR: ${grade10Correct ? '✅ CORRECT' : '❌ NEEDS ATTENTION'}`);
      
      if (!grade10Correct) {
        console.log('\n⚠️  POTENTIAL ISSUES:');
        if (!hasGrade10) console.log('   - Not detected as Grade 10');
        if (!hasTwoYears) console.log('   - Missing "2 years" timeline');
        if (!notOneYear) console.log('   - Incorrectly showing "1 year"');
      }
      
    } else {
      console.log('❌ API call failed');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

debugGrade10Response();