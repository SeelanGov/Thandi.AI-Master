// G10-12 Diagnostic Test - Run against current Thandi system
// This identifies exact knowledge gaps before building anything

const queries = [
  {
    id: 'Q1_G10_Switcher',
    prompt: 'Grade 10 learner, currently taking Maths Literacy, wants to become a Civil Engineer. Provide guidance.',
    expectedGaps: ['No deadline warning', 'No irreversibility notice', 'No alternative pathway']
  },
  {
    id: 'Q2_G11_Reality_Check',
    prompt: 'Grade 11 learner has 55% in Core Maths, wants BSc Computer Science at Wits. What\'s their chance?',
    expectedGaps: ['No specific APS requirement', 'No minimum mark threshold', 'No disqualification clarity']
  },
  {
    id: 'Q3_G12_Hidden_Requirement',
    prompt: 'Grade 12 learner wants to study Architecture at UP. What must they submit and by when?',
    expectedGaps: ['No portfolio deadline', 'No NBT mention', 'No LO exclusion info']
  }
];

async function runDiagnostic() {
  console.log('=== G10-12 DIAGNOSTIC TEST ===\n');
  
  for (const query of queries) {
    console.log(`\n--- ${query.id} ---`);
    console.log(`Query: ${query.prompt}\n`);
    
    try {
      const response = await fetch('https://thandiai.vercel.app/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.prompt })
      });
      
      const data = await response.json();
      
      console.log('THANDI RESPONSE:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\nEXPECTED GAPS:');
      query.expectedGaps.forEach(gap => console.log(`  - ${gap}`));
      console.log('\n' + '='.repeat(80));
    } catch (error) {
      console.error(`Error testing ${query.id}:`, error.message);
    }
  }
  
  console.log('\n\n=== NEXT STEPS ===');
  console.log('1. Review responses above');
  console.log('2. Identify which specific data points are missing');
  console.log('3. Create Supabase tables for ONLY those gaps');
  console.log('4. Seed with minimal data to fix the 3 queries');
}

runDiagnostic();
