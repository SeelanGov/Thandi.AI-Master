/**
 * Upload TVET College Pathways to Supabase
 * 
 * This script processes TVET college data and uploads it to the knowledge base
 * with proper embeddings for RAG retrieval.
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

async function uploadTVETPathways() {
  console.log('🎓 Starting TVET college pathways upload...\n');

  // Load the data
  const dataPath = path.join(__dirname, '../thandi_knowledge_base/tvet_pathways/tvet_colleges.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  let totalUploaded = 0;
  let totalErrors = 0;

  for (const college of data.colleges) {
    console.log(`\n📚 Processing ${college.college_name}...`);

    for (const program of college.programs) {
      try {
        // Create content for embedding
        const content = `
TVET College: ${college.college_name} (${college.college_code})
Province: ${college.location.province}
Campuses: ${college.location.campuses.join(', ')}
Program: ${program.program_name}
Type: ${program.program_type}
NQF Level: ${program.nqf_level}
Duration: ${program.duration_years} year(s)
Fields: ${program.fields?.join(', ') || 'N/A'}
Entry Requirements: ${program.entry_requirements}
Career Outcomes: ${program.career_outcomes.join(', ')}
Progression: ${program.progression_pathways?.join(', ') || 'Direct employment'}
        `.trim();

        // Generate embedding
        const embedding = await generateEmbedding(content);

        // Upload to Supabase
        const { error } = await supabase
          .from('knowledge_base')
          .insert({
            content,
            content_type: 'tvet_pathway',
            metadata: {
              college_code: college.college_code,
              college_name: college.college_name,
              province: college.location.province,
              campuses: college.location.campuses,
              program_name: program.program_name,
              program_type: program.program_type,
              nqf_level: program.nqf_level,
              duration_years: program.duration_years,
              fields: program.fields || [],
              entry_requirements: program.entry_requirements,
              career_outcomes: program.career_outcomes,
              progression_pathways: program.progression_pathways || [],
              application_link: college.application_link
            },
            embedding
          });

        if (error) {
          console.error(`   ❌ Error uploading ${program.program_name}:`, error.message);
          totalErrors++;
        } else {
          console.log(`   ✅ Uploaded: ${program.program_name}`);
          totalUploaded++;
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`   ❌ Error processing ${program.program_name}:`, error.message);
        totalErrors++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully uploaded: ${totalUploaded}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log(`📚 Total colleges processed: ${data.colleges.length}`);
}

// Run the upload
uploadTVETPathways()
  .then(() => {
    console.log('\n✨ TVET pathways upload complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
