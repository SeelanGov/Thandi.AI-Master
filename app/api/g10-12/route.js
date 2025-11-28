// app/api/g10-12/route.js
// Fast G10-12 Guidance Endpoint - Direct Requirements Engine Call

import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { query, learner_grade, subjects, career_interests, institution } = body;

    // Extract profile from query if not provided
    const grade = learner_grade || extractGrade(query || '');
    const subjectsList = subjects || extractSubjects(query || '');
    const careersList = career_interests || extractCareers(query || '');
    const inst = institution || extractInstitution(query || '');

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Call requirements engine
    const { data, error } = await supabase.functions.invoke(
      'requirements-engine',
      {
        body: {
          learner_grade: grade,
          subjects: subjectsList,
          career_interests: careersList,
          institution: inst
        }
      }
    );

    const elapsed = Date.now() - startTime;

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          processingTime: elapsed
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse if string
    let parsedData = data;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        // Already parsed or not JSON
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        requirements: parsedData,
        query: query || 'Direct API call',
        profile: {
          grade,
          subjects: subjectsList,
          careers: careersList,
          institution: inst
        },
        processingTime: elapsed
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const elapsed = Date.now() - startTime;
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        processingTime: elapsed
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Simple extraction helpers
function extractGrade(query) {
  if (!query) return null;
  const match = query.match(/grade\s*(\d+)/i);
  return match ? match[1] : null;
}

function extractSubjects(query) {
  if (!query) return [];
  const subjects = [];
  if (/maths?\s*literacy/i.test(query)) subjects.push('Maths Literacy');
  if (/core\s*maths?/i.test(query)) subjects.push('Core Mathematics');
  if (/physical\s*science/i.test(query)) subjects.push('Physical Science');
  return subjects;
}

function extractCareers(query) {
  if (!query) return [];
  const careers = [];
  if (/engineer/i.test(query)) careers.push('Engineering');
  if (/computer\s*science/i.test(query)) careers.push('Computer Science');
  if (/architecture/i.test(query)) careers.push('Architecture');
  return careers;
}

function extractInstitution(query) {
  if (!query) return null;
  if (/wits|witwatersrand/i.test(query)) return 'Witwatersrand';
  if (/up|pretoria/i.test(query)) return 'Pretoria';
  if (/uct|cape town/i.test(query)) return 'Cape Town';
  return null;
}

export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      endpoint: '/api/g10-12',
      description: 'Fast G10-12 Requirements Engine API',
      usage: {
        method: 'POST',
        body: {
          query: 'string (optional)',
          learner_grade: 'string (10, 11, or 12)',
          subjects: 'array of strings',
          career_interests: 'array of strings',
          institution: 'string (optional)'
        }
      },
      examples: [
        {
          query: 'Grade 10 learner, Maths Literacy, wants Engineering'
        },
        {
          learner_grade: '11',
          subjects: ['Core Mathematics'],
          institution: 'Witwatersrand'
        }
      ]
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
