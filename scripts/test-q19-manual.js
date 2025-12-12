// Manual test for Q19 to verify framework citation
import dotenv from 'dotenv';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';
import { semanticSearch } from '../lib/rag/search.js';
import { extractStudentProfile, assembleContext, reRankChunks } from '../lib/rag/retrieval.js';
import { generateResponse } from '../lib/rag/generation.js';

dotenv.config({ path: '.env.local' });

// Set testing flag
process.env.TESTING = 'true';

async function testQ19() {
  const query = "I'm stuck between two career paths. How do I choose?";
  
  console.log('🧪 MANUAL TEST: Q19 Framework Citation\n');
  console.log(`Query: "${query}"\n`);
  
  try {
    // Step 1: Generate embedding
    console.log('Step 1: Generating embedding...');
    const embedding = await generateQueryEmbedding(query);
    console.log('✓ Embedding generated\n');
    
    // Step 2: Search
    console.log('Step 2: Searching knowledge base...');
    const searchResults = await semanticSearch(embedding, { limit: 5, threshold: 0.5 });
    console.log(`✓ Retrieved ${searchResults.length} chunks\n`);
    
    // Step 3: Extract profile & assemble context
    console.log('Step 3: Assembling context...');
    const studentProfile = extractStudentProfile(query);
    const reRanked = reRankChunks(searchResults, studentProfile);
    const context = assembleContext(reRanked, studentProfile);
    
    console.log(`✓ Context assembled`);
    console.log(`  - Frameworks detected: ${context.frameworksDetected}`);
    if (context.frameworksDetected) {
      console.log(`  - Frameworks found: ${context.frameworks.map(f => f.name).join(', ')}`);
    }
    console.log('');
    
    // Step 4: Generate response
    console.log('Step 4: Generating response...');
    const result = await generateResponse(query, context, studentProfile);
    
    if (result.success) {
      console.log('✓ Response generated\n');
      console.log('═══════════════════════════════════════');
      console.log('RESPONSE:');
      console.log('═══════════════════════════════════════');
      console.log(result.response);
      console.log('═══════════════════════════════════════\n');
      
      console.log('VALIDATION:');
      console.log(JSON.stringify(result.validation.checks, null, 2));
      console.log('');
      
      // Check for framework citation
      const hasVIS = /V\.I\.S\.|Values.*Interest.*Skills|VIS Model/i.test(result.response);
      const hasMatrix = /Career Choice Matrix|decision matrix/i.test(result.response);
      const hasAnyFramework = hasVIS || hasMatrix;
      
      console.log('FRAMEWORK CITATION CHECK:');
      console.log(`  - V.I.S. Model mentioned: ${hasVIS ? '✓ YES' : '✗ NO'}`);
      console.log(`  - Career Choice Matrix mentioned: ${hasMatrix ? '✓ YES' : '✗ NO'}`);
      console.log(`  - Any framework cited: ${hasAnyFramework ? '✓ YES' : '✗ NO'}`);
      console.log('');
      
      if (hasAnyFramework) {
        console.log('🎉 SUCCESS: Framework citation working!');
      } else {
        console.log('⚠️  WARNING: No framework cited despite detection');
      }
    } else {
      console.log('✗ Generation failed:', result.error);
    }
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error(error.stack);
  }
}

testQ19();
