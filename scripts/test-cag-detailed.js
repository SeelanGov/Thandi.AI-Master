/**
 * Detailed CAG Layer Production Test
 * Inspects the full response structure
 */

const PRODUCTION_URL = 'https://thandiai.vercel.app';

async function testCAGDetailed() {
  console.log('🔍 DETAILED CAG LAYER TEST');
  console.log('='.repeat(70));
  
  try {
    const testQuery = {
      query: "I want to become a software engineer",
      profile: {
        grade: 10,
        subjects: ["Mathematics", "Physical Sciences", "English"],
        marks: { Mathematics: 85, "Physical Sciences": 80, English: 75 },
        interests: ["technology", "problem-solving"],
        constraints: { budget: "NSFAS", location: "Gauteng" }
      }
    };

    console.log('Sending request...');
    const response = await fetch(`${PRODUCTION_URL}/api/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testQuery)
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log();

    const data = await response.json();
    
    console.log('📦 FULL RESPONSE STRUCTURE:');
    console.log('='.repeat(70));
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testCAGDetailed();
