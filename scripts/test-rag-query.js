// scripts/test-rag-query.js
// STEP 6: CLI Test Script for RAG System
// Usage: node scripts/test-rag-query.js "your question" [--save] [--debug]

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';
import { semanticSearch } from '../lib/rag/search.js';
import { 
  extractStudentProfile, 
  assembleContext, 
  reRankChunks,
  deduplicateChunks 
} from '../lib/rag/retrieval.js';
import { generateResponse } from '../lib/rag/generation.js';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(text) {
  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize(text, 'bright'));
  console.log(colorize('='.repeat(60), 'cyan'));
}

function printSection(title) {
  console.log('\n' + colorize(title, 'blue'));
  console.log(colorize('-'.repeat(60), 'gray'));
}

function printSuccess(text) {
  console.log(colorize('✅ ' + text, 'green'));
}

function printError(text) {
  console.log(colorize('❌ ' + text, 'red'));
}

function printWarning(text) {
  console.log(colorize('⚠️  ' + text, 'yellow'));
}

function printInfo(text) {
  console.log(colorize('ℹ️  ' + text, 'gray'));
}

async function runQuery(query, options = {}) {
  const { saveToFile = false, includeDebug = false } = options;
  const startTime = Date.now();

  try {
    printHeader('🤖 THANDI RAG SYSTEM - QUERY TEST');
    
    console.log('\n' + colorize('Query:', 'bright'));
    console.log(colorize(`"${query}"`, 'cyan'));

    // Step 1: Extract student profile
    printSection('📋 Step 1: Extracting Student Profile');
    const profileStart = Date.now();
    const studentProfile = extractStudentProfile(query);
    const profileTime = Date.now() - profileStart;
    
    console.log(colorize(JSON.stringify(studentProfile, null, 2), 'gray'));
    printInfo(`Completed in ${profileTime}ms`);

    // Step 2: Generate query embedding
    printSection('📋 Step 2: Generating Query Embedding');
    const embeddingStart = Date.now();
    const queryEmbedding = await generateQueryEmbedding(query);
    const embeddingTime = Date.now() - embeddingStart;
    
    printSuccess(`Generated 1536-dimensional embedding in ${embeddingTime}ms`);

    // Step 3: Search knowledge base
    printSection('📋 Step 3: Searching Knowledge Base');
    const searchStart = Date.now();
    const searchResults = await semanticSearch(queryEmbedding, {
      limit: 10,
      threshold: 0.7,
      moduleNames: studentProfile.priorityModules
    });
    const searchTime = Date.now() - searchStart;
    
    if (searchResults.length === 0) {
      printError('No relevant information found');
      return {
        success: false,
        error: 'No results found'
      };
    }
    
    printSuccess(`Retrieved ${searchResults.length} chunks in ${searchTime}ms`);
    
    if (includeDebug) {
      console.log(colorize('\nTop 3 results:', 'gray'));
      searchResults.slice(0, 3).forEach((result, idx) => {
        console.log(colorize(`  ${idx + 1}. Similarity: ${result.similarity.toFixed(3)} | Module: ${result.module_name}`, 'gray'));
        console.log(colorize(`     ${result.chunk_text.substring(0, 80)}...`, 'dim'));
      });
    }

    // Step 4: Re-rank and deduplicate
    printSection('📋 Step 4: Re-ranking & Deduplication');
    const reRanked = reRankChunks(searchResults, studentProfile);
    const deduplicated = deduplicateChunks(reRanked, 0.9);
    printSuccess(`Re-ranked and deduplicated: ${deduplicated.length} unique chunks`);

    // Step 5: Assemble context
    printSection('📋 Step 5: Assembling Context');
    const contextStart = Date.now();
    const assembled = assembleContext(deduplicated, studentProfile, {
      maxTokens: 3000,
      format: 'structured'
    });
    const contextTime = Date.now() - contextStart;
    
    printSuccess(`Context assembled: ${assembled.metadata.tokensUsed} tokens in ${contextTime}ms`);

    // Step 6: Generate LLM response
    printSection('📋 Step 6: Generating LLM Response');
    console.log(colorize('⏳ This may take 5-10 seconds...', 'yellow'));
    
    const generationStart = Date.now();
    const result = await generateResponse(
      query,
      assembled.context,
      studentProfile,
      { maxRetries: 2, timeout: 10000 }
    );
    const generationTime = Date.now() - generationStart;

    if (!result.success) {
      printError('Generation failed: ' + result.error);
      return {
        success: false,
        error: result.error,
        metadata: result.metadata
      };
    }

    printSuccess(`Response generated in ${generationTime}ms`);

    // Display response
    printHeader('📝 GENERATED RESPONSE');
    console.log('\n' + colorize(result.response, 'bright'));

    // Display metadata
    printSection('📊 Performance Metrics');
    const totalTime = Date.now() - startTime;
    
    console.log(colorize(`Total Time: ${totalTime}ms (~${(totalTime/1000).toFixed(1)}s)`, 'bright'));
    console.log(colorize(`  Profile Extraction: ${profileTime}ms`, 'gray'));
    console.log(colorize(`  Embedding: ${embeddingTime}ms`, 'gray'));
    console.log(colorize(`  Search: ${searchTime}ms`, 'gray'));
    console.log(colorize(`  Context Assembly: ${contextTime}ms`, 'gray'));
    console.log(colorize(`  LLM Generation: ${generationTime}ms`, 'gray'));
    
    console.log(colorize(`\nModel Used: ${result.metadata.modelUsed}`, 'cyan'));
    console.log(colorize(`Tokens Used: ${result.metadata.tokensUsed?.total || 'N/A'}`, 'gray'));
    console.log(colorize(`Retries: ${result.metadata.retries}`, 'gray'));
    console.log(colorize(`Validation: ${result.metadata.validationPassed ? '✅ Passed' : '❌ Failed'}`, result.metadata.validationPassed ? 'green' : 'red'));
    
    if (totalTime > 10000) {
      printWarning(`Total time (${totalTime}ms) exceeded 10s target`);
    } else {
      printSuccess(`Performance within 10s requirement`);
    }

    // Display validation details
    if (includeDebug && result.validation) {
      printSection('🔍 Validation Details');
      console.log(colorize(JSON.stringify(result.validation.checks, null, 2), 'gray'));
      console.log(colorize(`\nCareer count: ${result.validation.details.careerCount}`, 'gray'));
      console.log(colorize(`Salary ranges: ${result.validation.details.salaryRangeCount}`, 'gray'));
      console.log(colorize(`Response length: ${result.validation.details.responseLength} chars`, 'gray'));
    }

    // Save to file if requested
    if (saveToFile) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `rag-response-${timestamp}.json`;
      const filepath = path.join(process.cwd(), 'test-results', filename);
      
      // Create directory if it doesn't exist
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const output = {
        timestamp: new Date().toISOString(),
        query,
        response: result.response,
        studentProfile,
        metadata: {
          totalTime,
          breakdown: {
            profileExtraction: profileTime,
            embedding: embeddingTime,
            search: searchTime,
            contextAssembly: contextTime,
            generation: generationTime
          },
          chunksRetrieved: searchResults.length,
          chunksUsed: assembled.metadata.includedChunks,
          tokensUsed: assembled.metadata.tokensUsed,
          modelUsed: result.metadata.modelUsed,
          retries: result.metadata.retries,
          validationPassed: result.metadata.validationPassed
        },
        validation: result.validation
      };
      
      fs.writeFileSync(filepath, JSON.stringify(output, null, 2));
      printSuccess(`Response saved to: ${filename}`);
    }

    printHeader('✅ QUERY COMPLETE');
    
    return {
      success: true,
      query,
      response: result.response,
      studentProfile,
      metadata: {
        totalTime,
        breakdown: {
          profileExtraction: profileTime,
          embedding: embeddingTime,
          search: searchTime,
          contextAssembly: contextTime,
          generation: generationTime
        }
      }
    };

  } catch (error) {
    printError('Query failed: ' + error.message);
    console.error(colorize('\nStack trace:', 'red'));
    console.error(colorize(error.stack, 'dim'));
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(colorize('\n🤖 Thandi RAG System - CLI Test Tool\n', 'bright'));
  console.log(colorize('Usage:', 'cyan'));
  console.log('  node scripts/test-rag-query.js "your question" [options]\n');
  console.log(colorize('Options:', 'cyan'));
  console.log('  --save     Save response to JSON file in test-results/');
  console.log('  --debug    Include debug information (search results, validation)');
  console.log('  --help     Show this help message\n');
  console.log(colorize('Examples:', 'cyan'));
  console.log('  node scripts/test-rag-query.js "I\'m good at math but hate physics"');
  console.log('  node scripts/test-rag-query.js "What careers pay well?" --save');
  console.log('  node scripts/test-rag-query.js "I need financial help" --debug --save\n');
  process.exit(0);
}

const query = args[0];
const saveToFile = args.includes('--save');
const includeDebug = args.includes('--debug');

// Run the query
runQuery(query, { saveToFile, includeDebug })
  .then(result => {
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(error => {
    printError('Unexpected error: ' + error.message);
    process.exit(1);
  });
