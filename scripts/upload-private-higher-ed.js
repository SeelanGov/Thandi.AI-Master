/**
 * Upload Private Higher Education Institutions to Supabase
 * 
 * This script processes private university/higher ed data and uploads it to the knowledge base
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

async function uploadPrivateHigherEd() {
  console.log('🎓 Starting private higher education upload...\n');

  // Load the data
  const dataPath = path.join(__dirname, '../thandi_knowledge_base/private_higher_ed/universities.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  let totalUploaded = 0;
  let totalErrors = 0;

  for (const university of data.universities) {
    console.log(`\n🏛️ Processing ${university.university_name}...`);

    for (const programme of university.programmes) {
      try {
        // Create content for embedding
        const content = `
University: ${university.university_name} (${university.university_code})
Type: Private Higher Education Institution
Registration: ${university.registration_status}
Accreditation: ${university.accreditation}
Location: ${university.location.city}, ${university.location.province}
${university.location.campuses ? `Campuses: ${university.location.campuses.join(', ')}` : ''}
Programme: ${programme.programme_name}
Qualification: ${programme.qualification_type}
Duration: ${programme.duration_years} years
NQF Level: ${programme.nqf_level}
Requirements: ${programme.min_requirements}
Estimated Annual Cost: ${programme.estimated_annual_cost}
Career Outcomes: ${programme.career_outcomes.join(', ')}
${programme.bursaries_available ? 'Bursaries Available: Yes' : ''}
        `.trim();

        // Generate embedding
        const embedding = await generateEmbedding(content);

        // Upload to Supabase
        const { error } = await supabase
          .from('knowledge_base')
          .insert({
            content,
            content_type: 'private_higher_education',
            metadata: {
              university_code: university.university_code,
              university_name: university.university_name,
              registration_status: university.registration_status,
              accreditation: university.accreditation,
              province: university.location.province,
              city: university.location.city,
              campuses: university.location.campuses || [],
              programme_name: programme.programme_name,
              qualification_type: programme.qualification_type,
              nqf_level: programme.nqf_level,
              duration_years: programme.duration_years,
              min_requirements: programme.min_requirements,
              estimated_annual_cost: programme.estimated_annual_cost,
              career_outcomes: programme.career_outcomes,
              bursaries_available: programme.bursaries_available || false,
              website: university.website,
              application_link: university.application_link
            },
            embedding
          });

        if (error) {
          console.error(`   ❌ Error uploading ${programme.programme_name}:`, error.message);
          totalErrors++;
        } else {
          console.log(`   ✅ Uploaded: ${programme.programme_name}`);
          totalUploaded++;
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`   ❌ Error processing ${programme.programme_name}:`, error.message);
        totalErrors++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully uploaded: ${totalUploaded}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log(`🏛️ Total universities processed: ${data.universities.length}`);
}

// Run the upload
uploadPrivateHigherEd()
  .then(() => {
    console.log('\n✨ Private higher education upload complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
