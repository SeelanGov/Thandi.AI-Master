// test-thandi-stack.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Groq from "groq-sdk";
import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

// Load .env.local from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Load from .env.local
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const groq = new Groq({ apiKey: GROQ_API_KEY });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("🚀 Testing Thandi Stack...\n");
console.log("Project: pvvnxupuukuefajypovz (Thandi - Fresh Project)\n");

// Test 1: Supabase Connection
async function testSupabase() {
  console.log("1️⃣ Testing Supabase connection...");
  try {
    // Test basic connection by checking if we can query
    const { data, error } = await supabase
      .from('knowledge_modules')
      .select('count')
      .limit(1);

    // If table doesn't exist, that's okay - connection works, just needs migration
    if (error) {
      // Check if error is about missing table (various error messages)
      const isMissingTable = error.message?.includes('table') || 
                            error.message?.includes('schema cache') ||
                            error.code === '42P01' ||
                            error.code === 'PGRST200';
      
      if (isMissingTable) {
        console.log("✅ Supabase connected successfully");
        console.log("   Project: pvvnxupuukuefajypovz");
        console.log("   Status: Empty (ready for migration)");
        console.log("   ⚠️  Tables not created yet - run database-schema.sql in Supabase SQL Editor");
        console.log("");
        return true;
      }
      throw error;
    }

    console.log("✅ Supabase connected successfully");
    console.log("   Project: pvvnxupuukuefajypovz");
    console.log("   Status: Tables exist (migration complete)");
    console.log("");
    return true;
  } catch (error) {
    console.error("❌ Supabase connection failed:", error.message, "\n");
    return false;
  }
}

// Test 2: Groq LLM
async function testGroq() {
  console.log("2️⃣ Testing Groq LLM...");
  try {
    const start = Date.now();
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are Thandi, a career counselor for South African Grade 12 students. Be helpful and concise."
        },
        {
          role: "user",
          content: "I'm good at math but hate physics. Suggest ONE career option in South Africa in one sentence."
        }
      ],
      max_tokens: 100
    });

    const duration = Date.now() - start;

    console.log("✅ Groq LLM working");
    console.log(`   Model: ${response.model}`);
    console.log(`   Response time: ${duration}ms`);
    console.log(`   Speed: ${response.usage.total_tokens / (duration / 1000)} tokens/sec`);
    console.log(`   Answer: "${response.choices[0].message.content}"`);
    console.log(`   Cost: R0 (free tier)\n`);
    return true;
  } catch (error) {
    console.error("❌ Groq failed:", error.message, "\n");
    return false;
  }
}

// Test 3: OpenAI Embeddings
async function testEmbeddings() {
  console.log("3️⃣ Testing OpenAI Embeddings...");
  try {
    const start = Date.now();
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: "Data scientist career in South Africa with bursary opportunities"
    });

    const duration = Date.now() - start;

    console.log("✅ Embeddings working");
    console.log(`   Model: text-embedding-ada-002`);
    console.log(`   Dimensions: ${response.data[0].embedding.length}`);
    console.log(`   Response time: ${duration}ms`);
    console.log(`   First 5 values: [${response.data[0].embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    console.log(`   Cost: ~$0.0001 per request\n`);
    return true;
  } catch (error) {
    console.error("❌ Embeddings failed:", error.message, "\n");
    return false;
  }
}

// Test 4: OpenAI Fallback
async function testOpenAIFallback() {
  console.log("4️⃣ Testing OpenAI GPT-3.5-turbo (Fallback)...");
  try {
    const start = Date.now();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Thandi, a career counselor for South African Grade 12 students."
        },
        {
          role: "user",
          content: "I'm good at math but hate physics. Suggest ONE career in one sentence."
        }
      ],
      max_tokens: 100
    });

    const duration = Date.now() - start;

    console.log("✅ OpenAI fallback working");
    console.log(`   Model: ${response.model}`);
    console.log(`   Response time: ${duration}ms`);
    console.log(`   Answer: "${response.choices[0].message.content}"`);
    console.log(`   Cost: ~$0.002 per request\n`);
    return true;
  } catch (error) {
    console.error("❌ OpenAI fallback failed:", error.message, "\n");
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    supabase: await testSupabase(),
    groq: await testGroq(),
    embeddings: await testEmbeddings(),
    openai: await testOpenAIFallback()
  };

  console.log("═════════════════════════════════════════════════════");
  console.log("📊 THANDI STACK TEST RESULTS");
  console.log("═════════════════════════════════════════════════════");
  console.log(`Supabase (Fresh):    ${results.supabase ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Groq LLM (Primary):  ${results.groq ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`OpenAI Embeddings:   ${results.embeddings ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`OpenAI Fallback:     ${results.openai ? '✅ PASS' : '❌ FAIL'}`);
  console.log("═════════════════════════════════════════════════════");

  const allPassed = Object.values(results).every(r => r === true);

  if (allPassed) {
    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("\n✅ Stack Configuration Confirmed:");
    console.log("   • Database: Supabase (pvvnxupuukuefajypovz) - FRESH");
    console.log("   • Primary LLM: Groq Llama 3.1 70B - FREE");
    console.log("   • Embeddings: OpenAI ada-002 - ~R180 one-time");
    console.log("   • Fallback: OpenAI GPT-3.5-turbo - ~R50/month");
    console.log("\n📝 NEXT STEPS:");
    console.log("   1. Rotate your API keys (SECURITY - see above)");
    console.log("   2. Tell Kiro: 'Generate the complete SQL migration with sample data'");
    console.log("   3. Run migration in Supabase SQL Editor");
    console.log("   4. Start Week 1 Day 1 development tasks");
    console.log("\n💰 Estimated Pilot Cost: R230-360 (~$13-20)");
  } else {
    console.log("\n⚠️  SOME TESTS FAILED");
    console.log("Fix the failing components before proceeding.");
  }
}

runAllTests();
