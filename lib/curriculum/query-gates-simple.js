// Simplified gate query - keyword matching for MVP
import { createClient } from '@supabase/supabase-js';

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

/**
 * Get relevant curriculum gate using keyword matching
 * This is the MVP approach - works without vector search function
 */
export async function getRelevantGate(studentGrade, studentSubjects, studentQuery) {
  console.log('🔍 Querying curriculum gates...');
  console.log('Grade:', studentGrade);
  console.log('Subjects:', studentSubjects);
  console.log('Query:', studentQuery);

  // Fetch all curriculum gates
  const { data: chunks, error } = await getSupabaseClient()
    .from('knowledge_chunks')
    .select('*')
    .eq('source_entity_type', 'curriculum_gate');

  if (error) {
    console.error('❌ Error querying gates:', error);
    return null;
  }

  if (!chunks || chunks.length === 0) {
    console.log('⚠️ No gates found in database');
    return null;
  }

  // Keyword matching logic
  const query = studentQuery.toLowerCase();
  const subjectsLower = studentSubjects.map(s => s.toLowerCase());

  let bestMatch = null;
  let bestScore = 0;

  for (const chunk of chunks) {
    const metadata = chunk.chunk_metadata;
    const text = chunk.chunk_text.toLowerCase();
    let score = 0;

    // Rule 1: Math Lit + Engineering query
    if ((subjectsLower.includes('mathematical literacy') || subjectsLower.includes('math lit')) &&
        (query.includes('engineer') || query.includes('stem'))) {
      if (metadata.gate_type === 'irreversible') {
        score = 100;
      }
    }

    // Rule 2: APS + Medicine/high requirement query
    if (query.includes('aps') && (query.includes('medicine') || query.includes('engineering'))) {
      if (metadata.gate_type === 'aps_shortfall') {
        score = 100;
      }
    }

    // Rule 3: IEB query
    if (query.includes('ieb') || query.includes('independent')) {
      if (metadata.gate_type === 'curriculum_type') {
        score = 100;
      }
    }

    // Rule 4: Grade 11/12 + change/drop subjects
    if ((studentGrade === 11 || studentGrade === 12) && 
        (query.includes('change') || query.includes('drop') || query.includes('switch'))) {
      if (metadata.gate_type === 'deadline') {
        score = 100;
      }
    }

    // Rule 5: Medicine + missing Physical Sciences
    if (query.includes('medicine') && !subjectsLower.includes('physical sciences')) {
      if (metadata.gate_type === 'subject_chain') {
        score = 100;
      }
    }

    // Grade level match bonus
    if (metadata.grade_level && metadata.grade_level.includes(studentGrade.toString())) {
      score += 10;
    }

    // Update best match
    if (score > bestScore) {
      bestScore = score;
      bestMatch = chunk;
    }
  }

  if (!bestMatch) {
    console.log('⚠️ No matching gate found');
    return null;
  }

  console.log('✅ Retrieved gate:', bestMatch.chunk_metadata.gate_type);
  console.log('RAG retrieved:', bestMatch.chunk_metadata.gate_type);

  return {
    text: bestMatch.chunk_text,
    metadata: bestMatch.chunk_metadata,
    similarity: bestScore / 100
  };
}

/**
 * Check if gate should be shown in report
 */
export function shouldShowGate(gate, studentProfile) {
  if (!gate || !gate.metadata) return false;

  const { gate_type, subjects, urgency } = gate.metadata;
  const studentSubjects = studentProfile.currentSubjects || [];
  const studentSubjectsLower = studentSubjects.map(s => s.toLowerCase());

  // CRITICAL FIX: Math Lit gate should ONLY show if student actually has Math Lit
  if (gate_type === 'irreversible' && subjects && subjects.includes('Mathematical Literacy')) {
    const hasMathLit = studentSubjectsLower.some(s => 
      s.includes('mathematical literacy') || s === 'math lit'
    );
    const hasPureMath = studentSubjectsLower.some(s => 
      s === 'mathematics' && !s.includes('literacy')
    );
    
    // If student has Pure Math, don't show Math Lit gate
    if (hasPureMath && !hasMathLit) {
      return false;
    }
    
    // If student doesn't have Math Lit, don't show gate
    if (!hasMathLit) {
      return false;
    }
  }

  // Always show critical gates (after Math Lit check)
  if (urgency === 'critical') return true;

  // Show high urgency gates for Grade 10-11
  if (urgency === 'high' && studentProfile.grade <= 11) return true;

  // Show medium urgency gates if relevant to query
  if (urgency === 'medium') return true;

  return false;
}
