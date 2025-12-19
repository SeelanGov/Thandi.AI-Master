/**
 * Debug All Grades Calendar Verification
 * Test Grade 10, 11, and 12 calendar calculations for accuracy
 */

console.log('🔍 ALL GRADES CALENDAR VERIFICATION');
console.log('===================================');

async function testGradeCalendar(grade, expectedTimeline) {
  try {
    const query = {
      query: `I am a Grade ${grade} student in South Africa. I enjoy Mathematics and Physical Sciences.`,
      grade: `grade${grade}`,
      curriculum: "caps",
      profile: {
        grade: parseInt(grade),
        marksData: {
          marksOption: "provide",
          exactMarks: {
            "Mathematics": "75",
            "Physical Sciences": "70"
          }
        }
      }
    };
    
    console.log(`\n📤 Testing Grade ${grade}...`);
    
    const response = await fetch('http://localhost:3000/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });
    
    if (response.status === 200) {
      const data = await response.json();
      const responseText = data.response || '';
      
      // Extract timeline information
      const timelineMatch = responseText.match(/Your Grade 12 finals will be in ([^(]+)\(([^)]+)\)/);
      const gradeMatch = responseText.match(/\*\*Grade Level\*\*:\s*GRADE\s*(\d+)/);
      
      const detectedGrade = gradeMatch ? gradeMatch[1] : 'unknown';
      const timelineInfo = timelineMatch ? `${timelineMatch[1].trim()} (${timelineMatch[2]})` : 'not found';
      
      console.log(`   ✓ Detected Grade: ${detectedGrade} ${detectedGrade === grade ? '✅' : '❌'}`);
      console.log(`   ✓ Timeline: ${timelineInfo}`);
      
      // Check for expected timeline patterns
      let timelineCorrect = false;
      if (grade === '10') {
        timelineCorrect = responseText.includes('23 months') || responseText.includes('24 months') || responseText.includes('2027');
      } else if (grade === '11') {
        timelineCorrect = responseText.includes('11 months') || responseText.includes('12 months') || responseText.includes('2026');
      } else if (grade === '12') {
        timelineCorrect = responseText.includes('months away') || responseText.includes('2025') || responseText.includes('completed');
      }
      
      console.log(`   ✓ Timeline Accuracy: ${timelineCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
      
      return {
        grade: detectedGrade === grade,
        timeline: timelineCorrect,
        response: responseText.substring(0, 200) + '...'
      };
    } else {
      console.log(`   ❌ API call failed for Grade ${grade}`);
      return { grade: false, timeline: false, response: 'API failed' };
    }
    
  } catch (error) {
    console.log(`   ❌ Error testing Grade ${grade}: ${error.message}`);
    return { grade: false, timeline: false, response: 'Error' };
  }
}

async function verifyAllGrades() {
  console.log('🚀 Testing all grade calendar calculations...\n');
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  console.log(`📅 Current Date: December ${currentYear}`);
  console.log(`📅 Expected Graduation Years:`);
  console.log(`   Grade 10 → Grade 12 finals: October-November ${currentYear + 2} (~23 months)`);
  console.log(`   Grade 11 → Grade 12 finals: October-November ${currentYear + 1} (~11 months)`);
  console.log(`   Grade 12 → Grade 12 finals: October-November ${currentYear} (completed or ~1 month)`);
  
  const results = {
    grade10: await testGradeCalendar('10', '23 months'),
    grade11: await testGradeCalendar('11', '11 months'),
    grade12: await testGradeCalendar('12', 'completed')
  };
  
  console.log('\n📊 CALENDAR VERIFICATION SUMMARY');
  console.log('=================================');
  
  Object.entries(results).forEach(([grade, result]) => {
    const gradeNum = grade.replace('grade', '');
    const gradeStatus = result.grade ? '✅' : '❌';
    const timelineStatus = result.timeline ? '✅' : '❌';
    console.log(`Grade ${gradeNum}: Grade Detection ${gradeStatus} | Timeline ${timelineStatus}`);
  });
  
  const allCorrect = Object.values(results).every(result => result.grade && result.timeline);
  
  console.log(`\n🎯 OVERALL CALENDAR STATUS: ${allCorrect ? '✅ ALL GRADES CORRECT' : '❌ ISSUES FOUND'}`);
  
  if (allCorrect) {
    console.log('\n🎉 All grade calendar calculations are working correctly!');
    console.log('✅ Grade 10: Shows ~23 months to Grade 12 finals');
    console.log('✅ Grade 11: Shows ~11 months to Grade 12 finals');
    console.log('✅ Grade 12: Shows finals completed or imminent');
  } else {
    console.log('\n⚠️  Some grade calendar calculations need attention');
  }
  
  return allCorrect;
}

verifyAllGrades();