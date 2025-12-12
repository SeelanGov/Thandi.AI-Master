# Week 1 Day 2: Embedding Generation Guide

## What This Script Does

The `generate-embeddings.js` script:
1. ✅ Extracts text from all knowledge sources (test questions, careers, bursaries, university programs, emerging careers)
2. ✅ Chunks text into 500-token pieces with 50-token overlap
3. ✅ Generates OpenAI ada-002 embeddings (1536 dimensions)
4. ✅ Inserts chunks with embeddings into `knowledge_chunks` table
5. ✅ Tracks progress and estimates costs

## Prerequisites

✅ **Already Done:**
- Database schema deployed (`database-schema.sql`)
- Sample data loaded (`sample-data.sql`)
- Dependencies installed (`openai`, `@supabase/supabase-js`, `dotenv`)
- Environment variables configured (`.env.local`)

## Running the Script

```bash
# Run the embedding generation
npm run embeddings:generate
```

## Expected Output

```
═══════════════════════════════════════════════════════
🚀 THANDI RAG SYSTEM - EMBEDDING GENERATION
   Week 1 Day 2: Generate Knowledge Chunks & Embeddings
═══════════════════════════════════════════════════════

📚 Processing test questions...
  ✓ Created 45 chunks from 20 test questions

💼 Processing careers...
  ✓ Created 25 chunks from 10 careers

💰 Processing bursaries...
  ✓ Created 15 chunks from 10 bursaries

🎓 Processing university programs...
  ✓ Created 40 chunks from 32 university programs

🚀 Processing emerging careers...
  ✓ Created 20 chunks from 10 emerging careers

📊 SUMMARY:
   Total chunks created: 145
   - Test questions: 45
   - Careers: 25
   - Bursaries: 15
   - University programs: 40
   - Emerging careers: 20

🔮 Generating embeddings for 145 chunks...
   Estimated cost: $0.0145 (~R0.26)

  Processing batch 1/15...
    ✓ Processed: 145/145 chunks

  ✓ Successfully processed: 145 chunks

═══════════════════════════════════════════════════════
✅ EMBEDDING GENERATION COMPLETE!
   Total chunks in database: 145
═══════════════════════════════════════════════════════
```

## Cost Estimate

- **Per chunk**: $0.0001 (OpenAI ada-002)
- **Total chunks**: ~145-200 (depends on text length)
- **Total cost**: $0.015-0.020 (~R0.27-R0.36)

**Very affordable!** Less than R1 for the entire knowledge base.

## What Gets Created

### knowledge_chunks Table
Each row contains:
- `module_id`: Reference to knowledge module (test_questions, careers, etc.)
- `source_entity_id`: ID of the source record (question ID, career ID, etc.)
- `source_entity_type`: Type of source ('test_question', 'career', 'bursary', etc.)
- `chunk_text`: The actual text content (500 tokens max)
- `chunk_metadata`: JSON with source info, tags, categories
- `embedding`: 1536-dimensional vector for semantic search

### Example Chunk Metadata
```json
{
  "source": "test_question_Q1",
  "question_id": "Q1",
  "category": "subject_career_matching",
  "chunk_index": 0,
  "total_chunks": 2,
  "tags": ["Data Science as alternative", "Actuarial Science option"],
  "required_modules": ["careers", "subject_career_mapping", "sa_universities"]
}
```

## Verification Queries

After running the script, verify in Supabase:

```sql
-- Check total chunks created
SELECT COUNT(*) as total_chunks FROM knowledge_chunks;

-- Check chunks by module
SELECT 
  km.module_name,
  COUNT(*) as chunk_count
FROM knowledge_chunks kc
JOIN knowledge_modules km ON kc.module_id = km.id
GROUP BY km.module_name
ORDER BY chunk_count DESC;

-- Check a sample chunk
SELECT 
  chunk_text,
  chunk_metadata,
  array_length(embedding::float[], 1) as embedding_dimensions
FROM knowledge_chunks
LIMIT 1;

-- Verify embedding dimensions (should be 1536)
SELECT 
  MIN(array_length(embedding::float[], 1)) as min_dim,
  MAX(array_length(embedding::float[], 1)) as max_dim,
  AVG(array_length(embedding::float[], 1)) as avg_dim
FROM knowledge_chunks;
```

Expected results:
- Total chunks: 145-200
- Embedding dimensions: 1536 for all chunks
- Chunks distributed across all 5 priority modules

## Troubleshooting

### Issue: OpenAI Rate Limit Error
```
Error: Rate limit exceeded
```
**Solution**: The script already includes 100ms delays between requests. If you still hit limits:
- Increase `BATCH_SIZE` delay in the script
- Wait a few minutes and re-run (script will skip existing chunks)

### Issue: Supabase Connection Error
```
Error: Could not connect to Supabase
```
**Solution**:
- Verify `.env.local` has correct `SUPABASE_SERVICE_ROLE_KEY`
- Check Supabase project is not paused
- Verify internet connection

### Issue: pgvector Format Error
```
Error: Invalid vector format
```
**Solution**: The script converts embeddings to JSON string format for pgvector. If this fails:
- Check pgvector extension is enabled: `CREATE EXTENSION IF NOT EXISTS vector;`
- Verify `embedding` column type is `vector(1536)`

### Issue: Out of Memory
```
Error: JavaScript heap out of memory
```
**Solution**: Reduce `BATCH_SIZE` from 10 to 5 in the script

## Performance

- **Processing speed**: ~10 chunks/second (with rate limiting)
- **Total time**: ~15-20 seconds for 145 chunks
- **Memory usage**: <100MB
- **Network**: ~2MB upload (embeddings)

## Next Steps After Completion

Once embeddings are generated:

1. **Test Vector Search** (Week 1 Day 3):
   ```sql
   -- Test semantic search
   SELECT chunk_text, 
          1 - (embedding <=> '[your_query_embedding]'::vector) as similarity
   FROM knowledge_chunks
   ORDER BY embedding <=> '[your_query_embedding]'::vector
   LIMIT 5;
   ```

2. **Build RAG Retrieval System** (Week 1 Day 3-4):
   - Implement query embedding generation
   - Build semantic search function
   - Add hybrid search (semantic + keyword)
   - Implement re-ranking logic

3. **Test with 20 Questions** (Week 2):
   - Run each test question through RAG pipeline
   - Compare outputs to ideal answers
   - Track pass/fail rate (target: 14/20)

## Files Created

- ✅ `scripts/generate-embeddings.js` - Main embedding generation script
- ✅ `scripts/EMBEDDING-GENERATION-GUIDE.md` - This guide
- ✅ Updated `package.json` with `embeddings:generate` command

## Summary

This script is the bridge between your structured data and the RAG system. It transforms your knowledge base into searchable vector embeddings that enable semantic search - the core of your AI recommendation engine.

**Cost**: Less than R1
**Time**: ~20 seconds
**Result**: 145-200 searchable knowledge chunks ready for RAG retrieval

You're on track for Week 1-2 completion! 🚀
