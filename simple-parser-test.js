/**
 * SIMPLE PARSER TEST
 * Test individual functions directly
 */

const fs = require('fs');

// Test individual parsing functions
function testAPSExtraction() {
  const text = `
**Your Career Guidance Report - Grade 12**

**Academic Status:**
Your current APS score is 38, which makes you eligible for university admission.
You are in the Application Phase of your academic journey.
`;

  console.log('Testing APS extraction...');
  const apsPatterns = [
    /(?:Your current|Current|APS score is|APS Score[:\s]*is)[:\s]*(\d+)/gi,
    /(?:APS|Admission Point Score)[:\s]*(\d+)/gi,
    /(?:Your|Current|Projected)\s*APS[:\s]*(\d+)/gi,
    /(\d+)\s*APS/gi
  ];
  
  for (const pattern of apsPatterns) {
    const match = pattern.exec(text);
    if (match) {
      const aps = parseInt(match[1]);
      if (aps >= 15 && aps <= 50) {
        console.log(`✅ APS extracted: ${aps}`);
        return aps;
      }
    }
  }
  console.log('❌ APS not found');
  return null;
}

async function testDirectImport() {
  console.log('🔍 SIMPLE PARSER TEST');
  console.log('====================\n');
  
  // Test APS extraction directly
  const aps = testAPSExtraction();
  
  // Test import
  try {
    const { ResultsParser } = await import('./app/results/services/resultsParser.js');
    console.log('✅ ResultsParser imported');
    
    // Load mock data
    const mockData = JSON.parse(fs.readFileSync('mock-assessment-results.json', 'utf8'));
    
    // Test just the parseResults function
    console.log('\n🔄 Testing parseResults function...');
    const result = ResultsParser.parseResults(mockData.fullResponse, mockData.grade);
    
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result || {}));
    
    if (result && result.headerData) {
      console.log('Header data keys:', Object.keys(result.headerData));
      console.log('APS Score from result:', result.headerData.apsScore);
    }
    
  } catch (error) {
    console.error('❌ Import or parsing failed:', error);
  }
}

testDirectImport();