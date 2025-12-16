// Query curriculum gates from RAG system
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data[0].embedding;
}

/**
 * Get relevant curriculum gate for student query
 * Returns TOP 1 chunk only (no decision paralysis)
 */
export async function getRelevantGate(studentGrade, studentSubjects, studentQuery) {
  console.log('🔍 Querying curriculum gates...');
  console.log('Grade:', studentGrade);
  console.log('Subjects:', studentSubjects);
  console.log('Query:', studentQuery);

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(studentQuery);

  // Query with direct vector search
  const { data: chunks, error } = await supabase
    .from('knowledge_chunks')
    .select('*')
    .filter('source_entity_type', 'eq', 'curriculum_gate')
    .limit(10);

  if (error) {
    console.error('❌ Error querying gates:', error);
    return null;
  }

  if (!chunks || chunks.length === 0) {
    console.log('⚠️ No matching gates found');
    return null;
  }

  // Filter by grade level and subjects
  const filteredChunks = chunks.filter(chunk => {
    const metadata = chunk.chunk_metadata || chunk.metadata;
    if (!metadata) return false;

    // Check grade level match
    const gradeMatch = metadata.grade_level?.includes(studentGrade.toString());
    
    // Check subject match (if subjects provided)
    let subjectMatch = true;
    if (studentSubjects && studentSubjects.length > 0 && metadata.subjects) {
      subjectMatch = metadata.subjects.some(s => 
        studentSubjects.some(ss => 
          s.toLowerCase().includes(ss.toLowerCase()) || 
          ss.toLowerCase().includes(s.toLowerCase())
        )
      );
    }

    return gradeMatch || subjectMatch; // Match either grade OR subjects
  });

  // Sort by urgency (critical > high > medium > low)
  const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  filteredChunks.sort((a, b) => {
    const urgencyA = urgencyOrder[a.chunk_metadata?.urgency || a.metadata?.urgency] || 999;
    const urgencyB = urgencyOrder[b.chunk_metadata?.urgency || b.metadata?.urgency] || 999;
    return urgencyA - urgencyB;
  });

  // Return top 1 chunk
  const topChunk = filteredChunks[0] || chunks[0];
  
  console.log('✅ Retrieved gate:', topChunk.chunk_metadata?.gate_type || topChunk.metadata?.gate_type);
  console.log('RAG retrieved:', topChunk.chunk_metadata?.gate_type || topChunk.metadata?.gate_type);
  
  return {
    text: topChunk.chunk_text,
    metadata: topChunk.chunk_metadata || topChunk.metadata,
    similarity: topChunk.similarity
  };
}

/**
 * Check if gate should be shown in report
 */
export function shouldShowGate(gate, studentProfile) {
  if (!gate || !gate.metadata) return false;

  const { gate_type, urgency } = gate.metadata;

  // Always show critical gates
  if (urgency === 'critical') return true;

  // Show high urgency gates for Grade 10-11
  if (urgency === 'high' && studentProfile.grade <= 11) return true;

  // Show medium urgency gates if relevant to query
  if (urgency === 'medium') return true;

  return false;
}
