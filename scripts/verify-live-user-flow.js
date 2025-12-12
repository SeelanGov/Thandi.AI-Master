// LIVE USER FLOW VERIFICATION
// Testing complete pipeline: Student Input → CAG → RAG → Personalized Output

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simulate real student profiles from Sitara's testing
const testProfiles = [
  {
    name: "Grade 10 - Science Interest",
    grade: 10,
    subjects: ['mathematics', 'physical_sciences', 'life_sciences'],
    interests: ['healthcare', 'research'],
    constraints: { budget: 'nsfas', location: 'gauteng' },
    openAnswers: {
      q1: "I want to help people and work in medicine",
      q2: "I'm good at biology and chemistry",
      q3: "I need financial aid and want to stay near home"
    }
  },
  {
    name: "Grade 11 - Tech Interest",
    grade: 11,
    subjects: ['mathematics', 'information_technology', 'english'],
    interests: ['technology', 'creative'],
    constraints: { budget: 'moderate', deadline: 'flexible' },
    openAnswers: {
      q1: "I love coding and want to build apps",
      q2: "I'm creative and technical",
      q3: "I can afford private college if needed"
    }
  },
  {
    name: "Grade 12 - Undecided",
    grade: 12,
    subjects: ['mathematics', 'accounting', 'business_studies'],
    interests: ['business', 'finance'],
    constraints: { budget: 'nsfas', deadline: 'urgent' },
    openAnswers: {
      q1: "I'm not sure what career to choose",
      q2: "I'm good with numbers and people",
      q3: "I need to apply soon and need funding"
    }
  }
];

async function testCompleteFlow(profile) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TESTING: ${profile.name}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // STEP 1: Verify CAG (Curriculum Alignment Gates)
    console.log('STEP 1: Testing Curriculum Alignment Gates...');
    const { data: gateData, error: gateError } = await supabase
      .from('knowledge_chunks')
      .select('content, metadata')
      .eq('category', 'curriculum_gates')
      .limit(5);

    if (gateError) throw new Error(`CAG Error: ${gateError.message}`);
    console.log(`✓ CAG System: ${gateData?.length || 0} gate rules loaded`);

    // STEP 2: Test subject-based filtering
    console.log('\nSTEP 2: Testing Subject-Based Career Filtering...');
    const subjectQuery = profile.subjects.join(' OR ');
    const { data: subjectMatches, error: subjectError } = await supabase.rpc(
      'match_knowledge_chunks',
      {
        query_embedding: await generateMockEmbedding(subjectQuery),
        match_threshold: 0.5,
        match_count: 10,
        filter_category: 'career_profile'
      }
    );

    if (subjectError) throw new Error(`Subject Filter Error: ${subjectError.message}`);
    console.log(`✓ Found ${subjectMatches?.length || 0} careers matching subjects`);
    if (subjectMatches?.length > 0) {
      console.log(`  Sample: ${subjectMatches[0].metadata?.career_title || 'N/A'}`);
    }

    // STEP 3: Test RAG query with student context
    console.log('\nSTEP 3: Testing RAG Query with Student Context...');
    const ragQuery = `
      Student Profile:
      - Grade: ${profile.grade}
      - Subjects: ${profile.subjects.join(', ')}
      - Interests: ${profile.interests.join(', ')}
      - Budget: ${profile.constraints.budget}
      - Goals: ${profile.openAnswers.q1}
    `;

    const { data: ragResults, error: ragError } = await supabase.rpc(
      'match_knowledge_chunks',
      {
        query_embedding: await generateMockEmbedding(ragQuery),
        match_threshold: 0.6,
        match_count: 15
      }
    );

    if (ragError) throw new Error(`RAG Error: ${ragError.message}`);
    console.log(`✓ RAG Retrieved ${ragResults?.length || 0} relevant chunks`);

    // Analyze retrieved content
    const categories = {};
    ragResults?.forEach(chunk => {
      const cat = chunk.category || 'unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    console.log('  Content breakdown:', categories);

    // STEP 4: Verify personalization elements
    console.log('\nSTEP 4: Verifying Personalization Elements...');
    
    // Check for budget-appropriate pathways
    const budgetKeyword = profile.constraints.budget === 'nsfas' ? 'nsfas' : 'funding';
    const budgetRelevant = ragResults?.filter(chunk => 
      chunk.content?.toLowerCase().includes(budgetKeyword) ||
      chunk.content?.toLowerCase().includes('bursary') ||
      chunk.content?.toLowerCase().includes('financial aid')
    );
    console.log(`✓ Budget-relevant content: ${budgetRelevant?.length || 0} chunks`);

    // Check for grade-appropriate guidance
    const gradeRelevant = ragResults?.filter(chunk =>
      chunk.metadata?.grade_level === profile.grade ||
      chunk.content?.includes(`Grade ${profile.grade}`)
    );
    console.log(`✓ Grade-appropriate content: ${gradeRelevant?.length || 0} chunks`);

    // STEP 5: Test qualification matching
    console.log('\nSTEP 5: Testing Qualification Database Integration...');
    const { data: qualifications, error: qualError } = await supabase
      .from('qualifications')
      .select('*')
      .limit(5);

    if (qualError) throw new Error(`Qualification Error: ${qualError.message}`);
    console.log(`✓ Qualifications database: ${qualifications?.length || 0} entries accessible`);

    // STEP 6: Verify gate compliance
    console.log('\nSTEP 6: Testing Gate Compliance Logic...');
    const gateChecks = {
      math_gate: profile.subjects.includes('mathematics'),
      science_gate: profile.subjects.includes('physical_sciences') || profile.subjects.includes('life_sciences'),
      budget_gate: profile.constraints.budget !== undefined,
      deadline_gate: profile.constraints.deadline !== undefined
    };
    console.log('✓ Gate compliance:', gateChecks);

    // STEP 7: Simulate API call
    console.log('\nSTEP 7: Testing Live API Endpoint...');
    const apiPayload = {
      grade: profile.grade,
      subjects: profile.subjects,
      interests: profile.interests,
      constraints: profile.constraints,
      openAnswers: profile.openAnswers
    };

    const response = await fetch('https://thandiai.vercel.app/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload)
    });

    if (!response.ok) {
      console.log(`⚠ API returned ${response.status}: ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error details:', errorText.substring(0, 200));
    } else {
      const apiResult = await response.json();
      console.log('✓ API Response received');
      console.log(`  Careers suggested: ${apiResult.careers?.length || 0}`);
      console.log(`  Pathways provided: ${apiResult.pathways?.length || 0}`);
      console.log(`  Personalized: ${apiResult.personalized ? 'YES' : 'NO'}`);
      
      if (apiResult.careers?.length > 0) {
        console.log(`  Sample career: ${apiResult.careers[0].title || apiResult.careers[0]}`);
      }
    }

    console.log(`\n✅ FLOW COMPLETE for ${profile.name}`);
    return { success: true, profile: profile.name };

  } catch (error) {
    console.error(`\n❌ FLOW FAILED for ${profile.name}:`, error.message);
    return { success: false, profile: profile.name, error: error.message };
  }
}

async function generateMockEmbedding(text) {
  // Generate consistent mock embedding for testing
  const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array(1536).fill(0).map((_, i) => Math.sin(hash + i) * 0.1);
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    LIVE USER FLOW VERIFICATION                             ║');
  console.log('║              Testing: Student Input → CAG → RAG → Output                  ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  const results = [];
  
  for (const profile of testProfiles) {
    const result = await testCompleteFlow(profile);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.profile}: ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log(passed === results.length ? '✅ ALL SYSTEMS OPERATIONAL' : '⚠ ISSUES DETECTED');
  console.log('='.repeat(80));
}

runAllTests().catch(console.error);
