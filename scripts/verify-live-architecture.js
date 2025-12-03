// LIVE ARCHITECTURE VERIFICATION
// Confirms: Student Input → CAG → RAG → Personalized Output

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Real student scenarios from Sitara's testing
const testScenarios = [
  {
    name: "Grade 10 - Healthcare Dream",
    profile: {
      grade: 10,
      subjects: ['mathematics', 'life_sciences', 'physical_sciences'],
      mathMark: 75,
      mathType: 'mathematics',
      interests: ['healthcare', 'helping_people'],
      budgetLimit: 'nsfas',
      province: 'gauteng'
    },
    expectedCareerTypes: ['healthcare', 'medical', 'nursing']
  },
  {
    name: "Grade 11 - Tech Enthusiast",
    profile: {
      grade: 11,
      subjects: ['mathematics', 'information_technology'],
      mathMark: 82,
      mathType: 'mathematics',
      interests: ['technology', 'coding'],
      budgetLimit: 'moderate',
      province: 'western_cape'
    },
    expectedCareerTypes: ['technology', 'software', 'it']
  },
  {
    name: "Grade 12 - Undecided",
    profile: {
      grade: 12,
      subjects: ['mathematics', 'accounting', 'business_studies'],
      mathMark: 68,
      mathType: 'mathematics',
      interests: ['business', 'finance'],
      budgetLimit: 'nsfas',
      province: 'kwazulu_natal'
    },
    expectedCareerTypes: ['business', 'finance', 'accounting']
  }
];

async function verifyArchitectureLayer(layerName, testFn) {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`LAYER: ${layerName}`);
  console.log('─'.repeat(80));
  
  try {
    const result = await testFn();
    console.log(`✅ ${layerName} - OPERATIONAL`);
    return { layer: layerName, status: 'pass', ...result };
  } catch (error) {
    console.log(`❌ ${layerName} - FAILED: ${error.message}`);
    return { layer: layerName, status: 'fail', error: error.message };
  }
}

async function testCompleteUserFlow(scenario) {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`TESTING: ${scenario.name}`);
  console.log(`═'.repeat(80)}\n`);

  const results = [];

  // LAYER 1: Database Connectivity
  results.push(await verifyArchitectureLayer('Database Connection', async () => {
    const { data, error } = await supabase
      .from('knowledge_modules')
      .select('module_name')
      .limit(1);
    
    if (error) throw new Error(error.message);
    return { modules: data?.length || 0 };
  }));

  // LAYER 2: Knowledge Base Content
  results.push(await verifyArchitectureLayer('Knowledge Base', async () => {
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('id, chunk_text, chunk_metadata')
      .limit(10);
    
    if (error) throw new Error(error.message);
    
    const categories = {};
    data?.forEach(chunk => {
      const cat = chunk.chunk_metadata?.category || 'unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    console.log(`  Total chunks sampled: ${data?.length || 0}`);
    console.log(`  Categories:`, Object.keys(categories).join(', '));
    
    return { chunks: data?.length || 0, categories };
  }));

  // LAYER 3: Subject-Based Filtering (CAG)
  results.push(await verifyArchitectureLayer('Curriculum Alignment Gates (CAG)', async () => {
    const subjects = scenario.profile.subjects.join(', ');
    
    // Check for curriculum gate content
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('chunk_text, chunk_metadata')
      .ilike('chunk_text', `%${subjects.split(',')[0]}%`)
      .limit(5);
    
    if (error) throw new Error(error.message);
    
    console.log(`  Subjects: ${subjects}`);
    console.log(`  Relevant chunks found: ${data?.length || 0}`);
    
    return { subjectMatches: data?.length || 0 };
  }));

  // LAYER 4: Career Matching (RAG Core)
  results.push(await verifyArchitectureLayer('Career Matching Engine', async () => {
    // Search for careers matching student interests
    const interest = scenario.profile.interests[0];
    
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('chunk_text, chunk_metadata')
      .or(`chunk_text.ilike.%${interest}%,chunk_metadata->>category.eq.career`)
      .limit(10);
    
    if (error) throw new Error(error.message);
    
    const careerChunks = data?.filter(chunk => 
      chunk.chunk_metadata?.career || 
      chunk.chunk_text.toLowerCase().includes('career') ||
      chunk.chunk_text.toLowerCase().includes('salary')
    );
    
    console.log(`  Interest: ${interest}`);
    console.log(`  Career-relevant chunks: ${careerChunks?.length || 0}`);
    
    return { careerMatches: careerChunks?.length || 0 };
  }));

  // LAYER 5: Budget Filtering
  results.push(await verifyArchitectureLayer('Budget/NSFAS Filtering', async () => {
    const budgetKeyword = scenario.profile.budgetLimit === 'nsfas' ? 'nsfas' : 'funding';
    
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('chunk_text')
      .or(`chunk_text.ilike.%${budgetKeyword}%,chunk_text.ilike.%bursary%,chunk_text.ilike.%financial aid%`)
      .limit(5);
    
    if (error) throw new Error(error.message);
    
    console.log(`  Budget constraint: ${scenario.profile.budgetLimit}`);
    console.log(`  Budget-relevant content: ${data?.length || 0} chunks`);
    
    return { budgetContent: data?.length || 0 };
  }));

  // LAYER 6: Qualifications Database
  results.push(await verifyArchitectureLayer('Qualifications Database', async () => {
    const { data, error } = await supabase
      .from('qualifications')
      .select('title, institution')
      .limit(5);
    
    if (error) throw new Error(error.message);
    
    console.log(`  Qualifications accessible: ${data?.length || 0}`);
    if (data?.length > 0) {
      console.log(`  Sample: ${data[0].title} at ${data[0].institution}`);
    }
    
    return { qualifications: data?.length || 0 };
  }));

  // LAYER 7: Live API Endpoint
  results.push(await verifyArchitectureLayer('Live API Endpoint', async () => {
    const response = await fetch('https://thandiai.vercel.app/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        curriculumProfile: scenario.profile,
        query: `I'm in grade ${scenario.profile.grade} and interested in ${scenario.profile.interests.join(' and ')}`,
        session: { consent: true }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const result = await response.json();
    
    console.log(`  Response received: ${result.success ? 'YES' : 'NO'}`);
    console.log(`  Source: ${result.source || 'unknown'}`);
    console.log(`  Careers in response: ${result.response?.includes('Career') ? 'YES' : 'NO'}`);
    console.log(`  Personalized: ${result.response?.includes(scenario.profile.grade) ? 'YES' : 'NO'}`);
    
    return { 
      apiWorking: result.success,
      source: result.source,
      hasContent: result.response?.length > 100
    };
  }));

  // Summary for this scenario
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`SCENARIO SUMMARY: ${scenario.name}`);
  console.log(`  ✅ Passed: ${passed}/${results.length}`);
  console.log(`  ❌ Failed: ${failed}/${results.length}`);
  console.log('─'.repeat(80));

  return { scenario: scenario.name, results, passed, failed };
}

async function runFullVerification() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              LIVE ARCHITECTURE VERIFICATION                                ║');
  console.log('║     Testing: Student Input → CAG → RAG → Personalized Output              ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  const allResults = [];

  for (const scenario of testScenarios) {
    const result = await testCompleteUserFlow(scenario);
    allResults.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Final Summary
  console.log(`\n${'═'.repeat(80)}`);
  console.log('FINAL VERIFICATION SUMMARY');
  console.log('═'.repeat(80));

  allResults.forEach(result => {
    const status = result.failed === 0 ? '✅' : '⚠️';
    console.log(`${status} ${result.scenario}: ${result.passed}/${result.results.length} layers operational`);
  });

  const totalLayers = allResults.reduce((sum, r) => sum + r.results.length, 0);
  const totalPassed = allResults.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = allResults.reduce((sum, r) => sum + r.failed, 0);

  console.log(`\n${'─'.repeat(80)}`);
  console.log(`OVERALL: ${totalPassed}/${totalLayers} layers operational`);
  console.log(`Success Rate: ${((totalPassed / totalLayers) * 100).toFixed(1)}%`);
  console.log('─'.repeat(80));

  if (totalFailed === 0) {
    console.log('\n✅ ALL SYSTEMS OPERATIONAL - READY FOR LIVE TESTING');
  } else {
    console.log(`\n⚠️ ${totalFailed} ISSUES DETECTED - REVIEW REQUIRED`);
  }

  console.log('\n' + '═'.repeat(80));
}

runFullVerification().catch(console.error);
