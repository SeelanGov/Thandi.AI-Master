import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { query, curriculum } = await request.json();
    
    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`[SIMPLE RAG] Query: "${query}", Curriculum: ${curriculum || 'any'}`);
    
    // Generate embedding for the query
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query
    });
    
    // Build curriculum filter
    let curriculumFilter = {};
    if (curriculum && curriculum !== 'any') {
      curriculumFilter = { 'chunk_metadata->>curriculum': curriculum };
    }
    
    // Get relevant chunks (using simple text search as fallback)
    let relevantChunks = [];
    
    try {
      // Try to use similarity search if available
      const { data: similarChunks, error: searchError } = await supabase.rpc(
        'match_documents',
        {
          query_embedding: queryEmbedding.data[0].embedding,
          match_threshold: 0.1,
          match_count: 10
        }
      );
      
      if (searchError) {
        throw new Error('Similarity search not available');
      }
      
      relevantChunks = similarChunks;
    } catch (error) {
      console.log('[SIMPLE RAG] Using text-based search fallback');
      
      // Fallback: Get chunks by curriculum and text search
      let allChunks = [];
      
      // First, get all chunks for the curriculum
      let base_query = supabase
        .from('knowledge_chunks')
        .select('chunk_text, chunk_metadata');
        
      if (curriculum && curriculum !== 'any') {
        base_query = base_query.eq('chunk_metadata->>curriculum', curriculum);
      }
      
      const { data: allCurriculumChunks, error: baseError } = await base_query;
      
      if (baseError) {
        throw baseError;
      }
      
      // Then filter by search terms in JavaScript for better matching
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      
      if (searchTerms.length > 0 && allCurriculumChunks) {
        allChunks = allCurriculumChunks.filter(chunk => {
          const text = chunk.chunk_text.toLowerCase();
          const metadata = JSON.stringify(chunk.chunk_metadata).toLowerCase();
          
          // Check if any search term matches in text or metadata
          return searchTerms.some(term => 
            text.includes(term) || metadata.includes(term)
          );
        });
      } else {
        allChunks = allCurriculumChunks || [];
      }
      
      const textChunks = allChunks.slice(0, 10); // Limit to 10
      
      // textChunks is now processed above
      
      relevantChunks = textChunks.map(chunk => ({
        content: chunk.chunk_text,
        metadata: chunk.chunk_metadata,
        similarity: 0.5 // Default similarity for text search
      }));
    }
    
    console.log(`[SIMPLE RAG] Found ${relevantChunks.length} relevant chunks`);
    
    // Debug: Log what chunks were found
    relevantChunks.slice(0, 3).forEach((chunk, i) => {
      const content = chunk.content || chunk.chunk_text;
      console.log(`[DEBUG] Chunk ${i + 1}: ${content.substring(0, 100)}...`);
    });
    
    if (relevantChunks.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        answer: "I don't have specific information about that topic in my knowledge base. Please try a different question or contact your school counselor for guidance.",
        sources: [],
        curriculum: curriculum || 'any'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Build context from relevant chunks - extract meaningful content
    const context = relevantChunks
      .slice(0, 5) // Use top 5 chunks
      .map((chunk, i) => {
        let content = chunk.content || chunk.chunk_text;
        
        // Remove YAML frontmatter if present
        if (content.startsWith('---')) {
          const yamlEndIndex = content.indexOf('---', 3);
          if (yamlEndIndex !== -1) {
            content = content.substring(yamlEndIndex + 3).trim();
          }
        }
        
        // Extract meaningful sections (skip empty lines)
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        const meaningfulContent = lines.slice(0, 10).join(' '); // First 10 non-empty lines
        
        return `[${i + 1}] ${meaningfulContent}`;
      })
      .join('\n\n');
    
    // Generate answer using OpenAI
    const prompt = `You are Thandi, a helpful South African career counselor. Answer the student's question using the provided context.

CONTEXT:
${context}

STUDENT QUESTION: ${query}

INSTRUCTIONS:
- Answer based ONLY on the provided context
- Be specific and helpful
- If the context mentions curriculum differences (CAPS vs IEB), explain them clearly
- If discussing university requirements, mention specific APS scores and subject requirements
- Keep your answer concise but informative
- If the context doesn't contain enough information, say so honestly

ANSWER:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.3
    });
    
    const answer = completion.choices[0].message.content;
    
    // Extract source information
    const sources = relevantChunks.slice(0, 5).map(chunk => ({
      curriculum: chunk.metadata?.curriculum || 'unknown',
      category: chunk.metadata?.category || 'unknown',
      subject: chunk.metadata?.subject_name || chunk.metadata?.university_name || 'unknown',
      similarity: chunk.similarity || 0.5
    }));
    
    console.log(`[SIMPLE RAG] Generated answer (${answer.length} chars)`);
    
    return new Response(JSON.stringify({
      success: true,
      answer,
      sources,
      curriculum: curriculum || 'any',
      chunksFound: relevantChunks.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('[SIMPLE RAG] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({
    status: 'ok',
    endpoint: '/api/rag/simple-query',
    description: 'Simple curriculum-aware RAG endpoint using direct embeddings',
    usage: 'POST with { query: string, curriculum?: "ieb"|"caps"|"shared" }'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}