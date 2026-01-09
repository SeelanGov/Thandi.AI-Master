/**
 * DEBUG ENHANCED PARSER
 * Step by step debugging of the enhanced parsing logic
 */

const fs = require('fs');

async function debugEnhancedParser() {
  console.log('🔍 DEBUGGING ENHANCED PARSER');
  console.log('============================\n');

  try {
    // Load mock data
    const mockData = JSON.parse(fs.readFileSync('mock-assessment-results.json', 'utf8'));
    const text = mockData.fullResponse;
    const grade = mockData.grade;
    
    console.log('📄 Input Data:');
    console.log(`Grade: ${grade}`);
    console.log(`Text length: ${text.length}`);
    console.log(`First 300 chars: ${text.substring(0, 300)}\n`);
    
    // Test APS extraction
    console.log('🔍 Testing APS Extraction:');
    const apsPatterns = [
      /(?:Your current|Current|APS score is|APS Score[:\s]*is)[:\s]*(\d+)/gi,
      /(?:APS|Admission Point Score)[:\s]*(\d+)/gi,
      /(?:Your|Current|Projected)\s*APS[:\s]*(\d+)/gi,
      /(\d+)\s*APS/gi
    ];
    
    for (let i = 0; i < apsPatterns.length; i++) {
      const pattern = apsPatterns[i];
      const match = pattern.exec(text);
      console.log(`Pattern ${i + 1}: ${pattern} -> ${match ? match[1] : 'No match'}`);
      pattern.lastIndex = 0; // Reset regex
    }
    
    // Test program extraction
    console.log('\n🔍 Testing Program Extraction:');
    const programSections = text.split(/(?=\d+\.\s*\*\*)|(?=\*\*[^*]+\*\*\s*at)/gi);
    console.log(`Program sections found: ${programSections.length}`);
    
    programSections.forEach((section, index) => {
      if (section.trim().length > 10) {
        console.log(`\nSection ${index}:`);
        console.log(`Length: ${section.length}`);
        console.log(`First 100 chars: ${section.substring(0, 100)}`);
        
        const nameMatch = section.match(/(?:\d+\.\s*)?\*\*([^*]+)\*\*\s*(?:at\s+)?([^*\n]+?)(?:\n|$)/i);
        console.log(`Name match: ${nameMatch ? [nameMatch[1], nameMatch[2]] : 'No match'}`);
      }
    });
    
    // Test bursary extraction
    console.log('\n🔍 Testing Bursary Extraction:');
    const bursarySection = text.match(/\*\*Financial Aid Opportunities:\*\*(.*?)(?=\*\*[^*]+:|$)/s);
    console.log(`Bursary section found: ${bursarySection ? 'Yes' : 'No'}`);
    if (bursarySection) {
      console.log(`Bursary section length: ${bursarySection[1].length}`);
      console.log(`First 200 chars: ${bursarySection[1].substring(0, 200)}`);
    }
    
    // Test action plan extraction
    console.log('\n🔍 Testing Action Plan Extraction:');
    const actionSection = text.match(/\*\*Action Plan:\*\*(.*?)(?=\*\*[^*]+:|$)/s);
    console.log(`Action section found: ${actionSection ? 'Yes' : 'No'}`);
    if (actionSection) {
      console.log(`Action section length: ${actionSection[1].length}`);
      console.log(`First 200 chars: ${actionSection[1].substring(0, 200)}`);
      
      const actionMatches = actionSection[1].match(/\d+\.\s*([^*\n]+?)(?=\d+\.|$)/g);
      console.log(`Action matches: ${actionMatches ? actionMatches.length : 0}`);
      if (actionMatches) {
        actionMatches.forEach((match, index) => {
          console.log(`  ${index + 1}: ${match.substring(0, 50)}...`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Execute debug
debugEnhancedParser();