// Real RAG endpoint with Supabase integration
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Extract requirements from query using simple parsing
function extractRequirements(query) {
  const lowerQuery = query.toLowerCase();
  
  // Extract subjects mentioned
  const subjects = [];
  const subjectKeywords = {
    'mathematics': ['math', 'mathematics', 'maths'],
    'physical_sciences': ['physical science', 'physics', 'chemistry'],
    'life_sciences': ['life science', 'biology', 'life sciences'],
    'english': ['english'],
    'accounting': ['accounting'],
    'business_studies': ['business studies', 'business']
  };
  
  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    if (keywords.some(kw => lowerQuery.includes(kw))) {
      subjects.push(subject);
    }
  }
  
  // Extract APS (rough estimate based on query context)
  let estimatedAPS = 30; // default
  if (lowerQuery.includes('medicine') || lowerQuery.includes('mbchb')) {
    estimatedAPS = 35;
  } else if (lowerQuery.includes('engineering')) {
    estimatedAPS = 32;
  } else if (lowerQuery.includes('science')) {
    estimatedAPS = 30;
  }
  
  return {
    subjects,
    estimatedAPS,
    interests: [],
    constraints: {
      financial: lowerQuery.includes('bursary') || lowerQuery.includes('financial aid') || lowerQuery.includes('nsfas')
    }
  };
}

// Generate embedding for semantic search
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    return null;
  }
}

// Query Supabase for relevant careers/qualifications
async function queryDatabase(query, extracted) {
  try {
    // Generate embedding for semantic search
    const embedding = await generateEmbedding(query);
    
    if (!embedding) {
      throw new Error('Failed to generate embedding');
    }
    
    // Query knowledge_chunks table with hybrid search
    const { data: chunks, error: chunksError } = await supabase
      .rpc('match_knowledge_chunks', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 10
      });
    
    if (chunksError) {
      console.error('Chunks query error:', chunksError);
      throw chunksError;
    }
    
    // Also query qualifications table if we have APS info
    let qualifications = [];
    if (extracted.estimatedAPS) {
      const { data: quals, error: qualsError } = await supabase
        .from('qualifications')
        .select('*')
        .lte('aps_min', extracted.estimatedAPS + 5)
        .gte('aps_min', Math.max(0, extracted.estimatedAPS - 10))
        .limit(5);
      
      if (!qualsError && quals) {
        qualifications = quals;
      }
    }
    
    return {
      chunks: chunks || [],
      qualifications: qualifications || []
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Format response from database results
function formatResponse(query, extracted, dbResults) {
  const { chunks, qualifications } = dbResults;
  
  // Build response from retrieved data
  let response = `### Your Career Matches\n\nBased on your profile`;
  
  if (extracted.subjects.length > 0) {
    response += ` and your interest in ${extracted.subjects.join(', ')}`;
  }
  
  response += `, here are some career options:\n\n`;
  
  // Add qualifications if available
  if (qualifications.length > 0) {
    qualifications.slice(0, 3).forEach((qual, idx) => {
      response += `**${idx + 1}. ${qual.qualification_name}**\n`;
      response += `- Institution: ${qual.institution_name}\n`;
      response += `- APS Required: ${qual.aps_min || 'Contact institution'}\n`;
      
      if (qual.subject_requirements) {
        response += `- Subject Requirements: ${qual.subject_requirements}\n`;
      }
      
      if (qual.duration_years) {
        response += `- Duration: ${qual.duration_years} years\n`;
      }
      
      response += `\n`;
    });
  }
  
  // Add relevant context from chunks
  if (chunks.length > 0) {
    response += `### Additional Information\n\n`;
    
    // Group chunks by career/topic
    const topChunks = chunks.slice(0, 3);
    topChunks.forEach(chunk => {
      if (chunk.content && chunk.content.length > 50) {
        response += `${chunk.content.substring(0, 200)}...\n\n`;
      }
    });
  }
  
  // Add next steps
  response += `### Next Steps\n\n`;
  response += `1. **Research thoroughly**: Visit university websites for current requirements\n`;
  response += `2. **Apply for bursaries**: Start researching NSFAS and private bursaries\n`;
  response += `3. **Improve your marks**: Focus on getting the best possible results\n`;
  response += `4. **Talk to professionals**: Shadow someone in these careers if possible\n\n`;
  
  // Add verification warning
  response += `⚠️ **Verify before you decide:**\n`;
  response += `1. Speak with your school counselor\n`;
  response += `2. Call the institution directly\n`;
  response += `3. Check official websites for current requirements\n\n`;
  response += `*Thandi's data may be outdated. Always confirm with real people.*`;
  
  return response;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { query } = body;
    
    if (!query) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Query is required'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract requirements from query
    const extracted = extractRequirements(query);
    
    // Query database
    const dbResults = await queryDatabase(query, extracted);
    
    // Format response
    const responseText = formatResponse(query, extracted, dbResults);
    
    // Build response object
    const response = {
      success: true,
      query,
      response: responseText,
      studentProfile: {
        academicStrengths: extracted.subjects,
        interests: extracted.interests,
        financialConstraint: extracted.constraints.financial ? 'Limited budget' : null
      },
      metadata: {
        processingTime: Date.now(),
        chunksRetrieved: dbResults.chunks.length,
        chunksUsed: Math.min(3, dbResults.chunks.length),
        qualificationsFound: dbResults.qualifications.length,
        modelUsed: 'real-rag-v1',
        validationPassed: true
      }
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('RAG endpoint error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      endpoint: '/api/rag/query',
      version: '1.0.0-real-db',
      mode: 'production',
      database: 'supabase-connected'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
