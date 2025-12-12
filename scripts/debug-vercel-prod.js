#!/usr/bin/env node

// Debug production Vercel endpoint

const API_URL = 'https://thandiai.vercel.app/api/rag/query';

async function debugEndpoint() {
  console.log('🔍 Debugging Vercel Production Endpoint\n');
  console.log(`URL: ${API_URL}\n`);

  // Test 1: Health check (GET)
  console.log('Test 1: Health Check (GET)');
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Simple query (POST)
  console.log('Test 2: Simple Query (POST)');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Grade 10 learner, currently taking Maths Literacy, wants to become a Civil Engineer.'
      })
    });

    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const text = await response.text();
    console.log(`Raw Response: ${text.substring(0, 500)}`);
    
    try {
      const data = JSON.parse(text);
      console.log(`\nParsed Response:`, JSON.stringify(data, null, 2));
    } catch (e) {
      console.log(`\n❌ Could not parse as JSON`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Direct requirements engine call
  console.log('Test 3: Direct Requirements Engine (Supabase)');
  try {
    const response = await fetch('https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing'}`
      },
      body: JSON.stringify({
        learner_grade: '10',
        subjects: ['Maths Literacy'],
        career_interests: ['Engineering']
      })
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log(`Response:`, JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

debugEndpoint().catch(console.error);
