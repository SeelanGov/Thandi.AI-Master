// lib/rag/embeddings.js
// STEP 1: Query Embedding Generation
import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-ada-002';
const EMBEDDING_DIMENSIONS = 1536;

// Lazy initialization of OpenAI client
let openai = null;
function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

/**
 * Generate embedding for a single query
 * @param {string} queryText - The text to embed
 * @returns {Promise<number[]>} - 1536-dimensional embedding vector
 */
export async function generateQueryEmbedding(queryText) {
  if (!queryText || typeof queryText !== 'string') {
    throw new Error('Query text must be a non-empty string');
  }

  try {
    const client = getOpenAIClient();
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: queryText.trim(),
    });

    const embedding = response.data[0].embedding;
    
    // Validate embedding dimensions
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(`Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`);
    }

    return embedding;
  } catch (error) {
    console.error('Error generating query embedding:', error.message);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple queries in batch
 * @param {string[]} queries - Array of text queries
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export async function batchGenerateEmbeddings(queries) {
  if (!Array.isArray(queries) || queries.length === 0) {
    throw new Error('Queries must be a non-empty array');
  }

  try {
    const client = getOpenAIClient();
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: queries.map(q => q.trim()),
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating batch embeddings:', error.message);
    throw new Error(`Failed to generate batch embeddings: ${error.message}`);
  }
}

/**
 * Test function to verify embedding generation
 */
export async function testEmbeddingGeneration() {
  console.log('🧪 Testing embedding generation...');
  
  const testQuery = "I'm good at math but hate physics. What should I study?";
  const start = Date.now();
  
  try {
    const embedding = await generateQueryEmbedding(testQuery);
    const duration = Date.now() - start;
    
    console.log(`✅ Embedding generated successfully`);
    console.log(`   Dimensions: ${embedding.length}`);
    console.log(`   Time: ${duration}ms`);
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    
    return { success: true, embedding, duration };
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}
