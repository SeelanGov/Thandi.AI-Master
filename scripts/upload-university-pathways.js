/**
 * Upload University Pathways to Supabase
 * 
 * This script processes university pathway data and uploads it to the knowledge base
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

async function uploadUniversityPathways() {
  console.log('🎓 Starting university pathways upload...\n');

  // Load the data
  const dataPath = path.join(__dirname, '../thandi_knowledge_base/university_pathways/universities.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  let totalUploaded = 0;
  let totalErrors = 0;

  for (const uni of data.universities) {
    console.log(`\n📚 Processing ${uni.university_name}...`);

    for (const faculty of uni.faculties) {
      for (const program of faculty.programs) {
        try {
          // Create content for embedding
          const content = `
University: ${uni.university_name} (${uni.university_code})
Location: ${uni.location?.city}, ${uni.location?.province}
Faculty: ${faculty.faculty_name}
Degree: ${program.degree_name}
Type: ${program.degree_type}
Duration: ${program.duration_years} years
Career Outcomes: ${program.career_outcomes.join(', ')}
Required Subjects: ${program.required_subjects.join(', ')}
${program.min_aps_estimate ? `Minimum APS: ${program.min_aps_estimate}` : ''}
          `.trim();

          // Generate embedding
          const embedding = await generateEmbedding(content);

          // Upload to Supabase
          const { error } = await supabase
            .from('knowledge_base')
            .insert({
              content,
              content_type: 'university_pathway',
              metadata: {
                university_code: uni.university_code,
                university_name: uni.university_name,
                university_type: uni.university_type,
                province: uni.location?.province,
                city: uni.location?.city,
                faculty: faculty.faculty_name,
                degree_name: program.degree_name,
                degree_type: program.degree_type,
                nqf_level: program.nqf_level,
                duration_years: program.duration_years,
                career_outcomes: program.career_outcomes,
                required_subjects: program.required_subjects,
                recommended_subjects: program.recommended_subjects || [],
                min_aps_estimate: program.min_aps_estimate
              },
              embedding
            });

          if (error) {
            console.error(`   ❌ Error uploading ${program.degree_name}:`, error.message);
            totalErrors++;
          } else {
            console.log(`   ✅ Uploaded: ${program.degree_name}`);
            totalUploaded++;
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`   ❌ Error processing ${program.degree_name}:`, error.message);
          totalErrors++;
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully uploaded: ${totalUploaded}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log(`📚 Total universities processed: ${data.universities.length}`);
}

// Run the upload
uploadUniversityPathways()
  .then(() => {
    console.log('\n✨ University pathways upload complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
