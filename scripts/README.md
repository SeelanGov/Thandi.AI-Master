# Thandi Scripts

## Stack Test Script

### Purpose
Tests all components of the Thandi stack to ensure everything is configured correctly before development.

### What It Tests
1. **Supabase Connection**: Verifies database connectivity and pgvector extension
2. **Groq LLM**: Tests primary (free) LLM for career recommendations
3. **OpenAI Embeddings**: Tests embedding generation for RAG system
4. **OpenAI Fallback**: Tests backup LLM in case Groq has issues

### Prerequisites

1. **Install Dependencies**:
```bash
npm install groq-sdk openai @supabase/supabase-js
```

2. **Get API Keys**:
   - **Supabase**: https://supabase.com → Your Project → Settings → API
   - **Groq**: https://console.groq.com → API Keys (FREE tier available)
   - **OpenAI**: https://platform.openai.com → API Keys

3. **Configure Environment**:
Create `.env.local` in project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://pvvnxupuukuefajypovz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=gsk_your_groq_key
OPENAI_API_KEY=sk-your_openai_key
```

### Running the Test

```bash
# Make sure you're in the project root
node scripts/test-thandi-stack.js
```

### Expected Output

```
🚀 Testing Thandi Stack...

Project: pvvnxupuukuefajypovz (Thandi - Fresh Project)

1️⃣ Testing Supabase connection...
✅ Supabase connected successfully
   Project: pvvnxupuukuefajypovz
   Status: Empty (ready for migration)

2️⃣ Testing Groq LLM...
✅ Groq LLM working
   Model: llama-3.1-70b-versatile
   Response time: 1234ms
   Speed: 45.2 tokens/sec
   Answer: "Consider becoming a data scientist..."
   Cost: R0 (free tier)

3️⃣ Testing OpenAI Embeddings...
✅ Embeddings working
   Model: text-embedding-ada-002
   Dimensions: 1536
   Response time: 456ms
   First 5 values: [0.0123, -0.0456, 0.0789...]
   Cost: ~$0.0001 per request

4️⃣ Testing OpenAI GPT-3.5-turbo (Fallback)...
✅ OpenAI fallback working
   Model: gpt-3.5-turbo
   Response time: 789ms
   Answer: "Consider actuarial science..."
   Cost: ~$0.002 per request

═════════════════════════════════════════════════════
📊 THANDI STACK TEST RESULTS
═════════════════════════════════════════════════════
Supabase (Fresh):    ✅ PASS
Groq LLM (Primary):  ✅ PASS
OpenAI Embeddings:   ✅ PASS
OpenAI Fallback:     ✅ PASS
═════════════════════════════════════════════════════

🎉 ALL TESTS PASSED!

✅ Stack Configuration Confirmed:
   • Database: Supabase (pvvnxupuukuefajypovz) - FRESH
   • Primary LLM: Groq Llama 3.1 70B - FREE
   • Embeddings: OpenAI ada-002 - ~R180 one-time
   • Fallback: OpenAI GPT-3.5-turbo - ~R50/month

📝 NEXT STEPS:
   1. Rotate your API keys (SECURITY - see above)
   2. Tell Kiro: 'Generate the complete SQL migration with sample data'
   3. Run migration in Supabase SQL Editor
   4. Start Week 1 Day 1 development tasks

💰 Estimated Pilot Cost: R230-360 (~$13-20)
```

### Troubleshooting

#### Groq API Error
```
❌ Groq failed: Invalid API key
```
**Solution**: 
- Get free API key from https://console.groq.com
- Add to `.env.local` as `GROQ_API_KEY=gsk_...`
- Restart the test

#### OpenAI Rate Limit
```
❌ Embeddings failed: Rate limit exceeded
```
**Solution**:
- Check your OpenAI usage at https://platform.openai.com/usage
- Add credits if needed (minimum $5)
- Wait a few minutes and retry

#### Supabase Connection Failed
```
❌ Supabase connection failed: Invalid API key
```
**Solution**:
- Verify project URL matches: `pvvnxupuukuefajypovz.supabase.co`
- Check API keys in Supabase Dashboard → Settings → API
- Ensure service role key (not anon key) is used

### Cost Breakdown

**One-Time Costs**:
- OpenAI embeddings for knowledge base: ~R180 ($10)
  - 10 modules × ~50 chunks each = 500 chunks
  - 500 × $0.0001 = $0.05 (negligible)
  - Main cost is testing/development iterations

**Monthly Costs (3 pilot schools)**:
- Groq LLM: R0 (free tier covers 14,400 requests/day)
- OpenAI embeddings: R0 (one-time only)
- OpenAI fallback: R50-180 ($3-10) if Groq fails
- Supabase: R0 (free tier covers 500MB + 2GB bandwidth)

**Total Pilot Cost**: R230-360 (~$13-20)

### Why This Stack?

1. **Groq (Primary LLM)**: 
   - FREE unlimited usage
   - Fast (45+ tokens/sec)
   - Good quality (Llama 3.1 70B)
   - Perfect for MVP

2. **OpenAI (Embeddings + Fallback)**:
   - Best embeddings quality
   - Reliable fallback if Groq has issues
   - Only pay for what you use

3. **Supabase (Database + Vector)**:
   - Free tier sufficient for pilots
   - pgvector built-in
   - No separate vector DB needed
   - Easy to scale later

### Next Steps After Test Passes

1. **Run database migration**: `database-schema.sql`
2. **Load knowledge base data**: Day 2 tasks
3. **Generate embeddings**: Day 2 tasks
4. **Build RAG pipeline**: Week 1-2 tasks
5. **Test with 20 questions**: Week 2 tasks
