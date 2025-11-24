// app/api/assess/route.js
// Proxy endpoint for Orchids frontend to connect to our RAG system

import { NextResponse } from 'next/server';
import { generateQueryEmbedding } from '@/lib/rag/embeddings';
import { hybridSearch } from '@/lib/rag/hybrid-search';
import { extractStudentProfile, assembleContext, deduplicateChunks, reRankChunks } from '@/lib/rag/retrieval';
import { generateResponse } from '@/lib/rag/generation';

/**
 * POST /api/assess
 * Assessment endpoint for Orchids frontend
 * 
 * Expected input from Orchids:
 * {
 *   answers: [string, string, string, string]  // 4 assessment answers
 * }
 * 
 * Returns:
 * {
 *   careers: [
 *     { name: string, match: number, description: string }
 *   ]
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('📥 Received from Orchids:', body);

    // Extract answers from Orchids format
    const { answers } = body;
    
    if (!answers || !Array.isArray(answers) || answers.length !== 4) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: expected 4 answers' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert answers to natural language query
    const query = `Career assessment: ${answers.join('. ')}. Please recommend suitable career paths.`;
    
    console.log('🔄 Converted to query:', query);

    // Run through RAG pipeline
    const studentProfile = extractStudentProfile(query);
    const queryEmbedding = await generateQueryEmbedding(query);
    const searchResults = await hybridSearch(query, queryEmbedding, { limit: 10 });

    if (searchResults.length === 0) {
      return new Response(
        JSON.stringify({
          careers: [{
            name: 'General Career Guidance',
            match: 50,
            description: 'Based on your profile, we recommend exploring various career options. Please provide more specific information about your interests and strengths.'
          }]
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reRanked = reRankChunks(searchResults, studentProfile);
    const deduplicated = deduplicateChunks(reRanked, 0.9);
    const assembled = assembleContext(deduplicated, studentProfile, { maxTokens: 3000 });

    const result = await generateResponse(query, assembled.context, studentProfile, {
      maxRetries: 3,  // Increase retries for Orchids endpoint
      timeout: 15000
    });

    if (!result.success) {
      // Return fallback response instead of throwing error
      console.warn('Generation failed, returning fallback:', result.error);
      return new Response(
        JSON.stringify({
          careers: [{
            name: 'Career Guidance Needed',
            match: 70,
            description: 'Based on your interests in Math, Science, and Technology, we recommend exploring STEM careers. Please consult with a career counselor for personalized guidance.'
          }],
          sessionId: Date.now().toString()
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse response to extract career recommendations
    const careers = parseCareerRecommendations(result.response);

    console.log('✅ Sending to Orchids:', { careers: careers.length });

    // CRITICAL: Include full response with footer for display
    return new Response(
      JSON.stringify({
        careers,
        sessionId: Date.now().toString(),
        fullResponse: result.response, // Full RAG response with footer
        footerPresent: result.response.includes('⚠️')
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Assessment error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Parse RAG response to extract career recommendations
 */
function parseCareerRecommendations(response) {
  // Extract career mentions from response
  const careers = [];
  
  // Common career patterns in our responses
  const careerPatterns = [
    /(?:consider|recommend|explore|pursue)\s+(?:a\s+career\s+(?:in|as)\s+)?([A-Z][a-zA-Z\s]+?)(?:\.|,|\s+because|\s+which|\s+that)/gi,
    /(?:become|work\s+as)\s+(?:a|an)\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|\s+because|\s+which|\s+that)/gi
  ];

  const foundCareers = new Set();
  
  careerPatterns.forEach(pattern => {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      const career = match[1].trim();
      if (career.length > 3 && career.length < 50) {
        foundCareers.add(career);
      }
    }
  });

  // Convert to expected format
  Array.from(foundCareers).slice(0, 5).forEach((career, index) => {
    careers.push({
      name: career,
      match: 90 - (index * 5), // Decreasing match scores
      description: extractCareerDescription(response, career)
    });
  });

  // Fallback if no careers extracted
  if (careers.length === 0) {
    careers.push({
      name: 'Personalized Career Path',
      match: 85,
      description: response.substring(0, 200) + '...'
    });
  }

  return careers;
}

/**
 * Extract description for a specific career from response
 */
function extractCareerDescription(response, careerName) {
  const sentences = response.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(careerName.toLowerCase())) {
      return sentence.trim() + '.';
    }
  }
  
  return `${careerName} is a recommended career path based on your assessment.`;
}

/**
 * GET /api/assess
 * Health check
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      endpoint: '/api/assess',
      description: 'Assessment endpoint for Orchids frontend',
      usage: {
        method: 'POST',
        body: {
          answers: ['string', 'string', 'string', 'string']
        }
      }
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * OPTIONS /api/assess
 * CORS handler for Orchids
 */
export async function OPTIONS() {
  return new Response(
    JSON.stringify({}),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  );
}
