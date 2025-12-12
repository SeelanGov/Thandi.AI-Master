# Thandi RAG System - Deployment Guide

## Quick Start: Database Setup

### Step 1: Run Database Schema
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz
2. Click "SQL Editor"
3. Copy contents of `database-schema.sql`
4. Paste and run (takes ~30 seconds)
5. Verify: You should see 13 tables created

### Step 2: Load Sample Data
1. In Supabase SQL Editor, create new query
2. Copy contents of `sample-data.sql`
3. Paste and run (takes ~1-2 minutes)
4. Verify at bottom: Should show counts for all modules

### Expected Data Counts
- **Universities**: 10 (UCT, Wits, UP, Stellenbosch, UJ, DUT, Rhodes, NMU, UFH, NWU)
- **University Programs**: 40+ (5 programs per major university)
- **Bursaries**: 10 (Sasol, FNB, Nedbank, Discovery, Anglo, Eskom, Transnet, Funza Lushaka, NSFAS, Standard Bank)
- **Careers**: 10 (Data Scientist, Software Developer, Nurse, Teacher, CA, Engineer, Doctor, Physiotherapist, Lawyer, Entrepreneur)
- **Subject-Career Mappings**: 30+ (Math→Data Scientist, Life Sciences→Nurse, etc.)
- **Emerging Careers**: 10 (AI Engineer, Renewable Energy, Cybersecurity, Data Analyst, UX Designer, Digital Marketing, Cloud Architect, Robotics, Sustainability, Blockchain)
- **Test Questions**: 20 (All questions from PRD with ideal answers)

## What's Included

### Module 1: SA Universities
- 10 major South African universities with realistic data
- Province, contact info, ranking info
- 40+ popular programs (Computer Science, Accounting, Engineering, Psychology, Nursing)
- Realistic tuition fees (R35K-R66K range)
- Admission requirements with APS scores and subject requirements

### Module 2: Bursaries
- 10 major SA bursaries with real providers
- Sasol, FNB, Nedbank, Discovery, Anglo American, Eskom, Transnet
- Government bursaries: Funza Lushaka, NSFAS
- Corporate: Standard Bank Tutuwa
- Realistic eligibility criteria, deadlines (2026), amounts
- Application URLs and contact information

### Module 3: Careers Database
- 10 diverse careers across sectors
- Technology: Data Scientist, Software Developer
- Healthcare: Registered Nurse, Medical Doctor, Physiotherapist
- Education: High School Teacher
- Business: Chartered Accountant, Corporate Lawyer
- Other: Mechanical Engineer, Social Entrepreneur
- Realistic SA salary ranges (entry/mid/senior)
- SA-specific info: companies hiring, demand levels, provincial demand

### Module 6: Subject-Career Mappings
- 30+ mappings showing which matric subjects lead to which careers
- Importance levels: essential, highly_recommended, recommended
- Minimum mark percentages
- Alternative subjects
- Examples:
  - Mathematics (70%+) → Data Scientist (essential)
  - Life Sciences (60%+) → Registered Nurse (essential)
  - English (70%+) → Corporate Lawyer (essential)

### Module 7: Emerging Careers (4IR)
- 10 emerging/4IR careers
- AI/ML Engineer, Renewable Energy Specialist, Cybersecurity Analyst
- Data Analyst, UX/UI Designer, Digital Marketing Specialist
- Cloud Solutions Architect, Robotics Engineer, Sustainability Consultant, Blockchain Developer
- Technology categories, SA adoption levels
- Growth projections, SA companies hiring
- Government initiatives (DHET-Microsoft, Just Energy Transition, etc.)

### Test Questions (20 Questions)
All 20 test questions from PRD with:
- Question ID (Q1-Q20)
- Category (subject_career_matching, financial_constraints, career_misconceptions, 4ir_emerging, decision_making)
- Full question text
- Complete ideal answer (from PRD)
- Key points array (5-8 key points for scoring)
- Required modules array (which knowledge modules should be used)

**Categories**:
- Q1-Q5: Subject-Career Matching
- Q6-Q10: Financial Constraints
- Q11-Q15: Career Misconceptions
- Q16-Q18: 4IR/Emerging Careers
- Q19-Q20: Decision-Making Process

## Verification Queries

After loading data, run these queries to verify:

```sql
-- Check all modules loaded
SELECT 'Universities' as module, COUNT(*) as count FROM universities
UNION ALL SELECT 'Programs', COUNT(*) FROM university_programs
UNION ALL SELECT 'Bursaries', COUNT(*) FROM bursaries
UNION ALL SELECT 'Careers', COUNT(*) FROM careers
UNION ALL SELECT 'Subject Mappings', COUNT(*) FROM subject_career_mappings
UNION ALL SELECT 'Emerging Careers', COUNT(*) FROM emerging_careers
UNION ALL SELECT 'Test Questions', COUNT(*) FROM test_questions;

-- Check test questions by category
SELECT category, COUNT(*) as count 
FROM test_questions 
GROUP BY category 
ORDER BY category;

-- Sample some data
SELECT university_name, province FROM universities LIMIT 5;
SELECT bursary_name, provider_name FROM bursaries LIMIT 5;
SELECT career_title, demand_level FROM careers LIMIT 5;
SELECT question_id, category FROM test_questions ORDER BY question_id;
```

## Next Steps

After database is populated:

1. **Week 1, Day 2**: Generate embeddings for knowledge chunks
   - Extract text from ideal answers
   - Create chunks (500 tokens, 50 overlap)
   - Generate OpenAI embeddings
   - Store in `knowledge_chunks` table

2. **Week 1, Day 3-4**: Build RAG retrieval system
   - Implement vector search using pgvector
   - Test semantic search queries
   - Optimize retrieval parameters

3. **Week 2**: Test with 20 questions
   - Run each test question through RAG pipeline
   - Compare output to ideal answers
   - Track pass/fail rate
   - Target: 14/20 pass rate (70%)

## Troubleshooting

### Issue: Foreign key constraint errors
**Solution**: Make sure you run `database-schema.sql` BEFORE `sample-data.sql`

### Issue: Duplicate key errors
**Solution**: Database already has data. Either:
- Drop all tables and re-run both scripts
- Or modify INSERT statements to use `INSERT ... ON CONFLICT DO NOTHING`

### Issue: JSONB syntax errors
**Solution**: Make sure you're using PostgreSQL 12+ (Supabase uses 15+)

### Issue: Vector extension not found
**Solution**: Run `CREATE EXTENSION IF NOT EXISTS vector;` first

## Data Quality Notes

All data is:
- ✅ Realistic for South African context
- ✅ Uses actual ZAR amounts (not USD)
- ✅ References real SA institutions and companies
- ✅ Includes SA-specific information (provinces, NSFAS, POPIA, etc.)
- ✅ Dates set to 2026 (future) for bursary deadlines
- ✅ All JSONB fields are valid JSON
- ✅ Foreign key relationships maintained

## Cost Estimate

**One-time costs**:
- Database setup: R0 (Supabase free tier)
- Sample data loading: R0
- Embedding generation (Day 2): ~R50-R100 (OpenAI ada-002)

**Ongoing costs**:
- Database storage: R0 (well under 500MB limit)
- Queries: R0 (Supabase free tier covers pilot usage)

Total for Sprint 1-2: **R50-R100**
