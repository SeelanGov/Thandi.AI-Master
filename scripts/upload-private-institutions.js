/**
 * Upload Private Higher Education Institutions to Supabase
 * 
 * This script processes private institution data and uploads it to the knowledge base
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

async function uploadPrivateInstitutions() {
  console.log('🎓 Starting private institutions upload...\n');

  // Load the data
  const dataPath = path.join(__dirname, '../thandi_knowledge_base/private_institutions/institutions.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  let totalUploaded = 0;
  let totalErrors = 0;

  for (const institution of data.institutions) {
    console.log(`\n🏫 Processing ${institution.institution_name}...`);

    for (const programme of institution.programmes) {
      try {
        // Create content for embedding
        const content = `
Institution: ${institution.institution_name} (${institution.institution_code})
Type: Private Higher Education Institution
Registration: ${institution.registration_status}
Location: ${institution.location.city}, ${institution.location.province}
${institution.location.campuses ? `Campuses: ${institution.location.campuses.join(', ')}` : ''}
Programme: ${programme.programme_name}
Type: ${programme.programme_type}
Duration: ${programme.duration_years} years
Requirements: ${programme.min_requirements}
Estimated Cost: ${programme.estimated_annual_cost}
Career Outcomes: ${programme.career_outcomes.join(', ')}
        `.trim();

        // Generate embedding
        const embedding = await generateEmbedding(content);

        // Upload to Supabase
        const { error } = await supabase
          .from('knowledge_base')
          .insert({
            content,
            content_type: 'private_institution',
            metadata: {
              institution_code: institution.institution_code,
              institution_name: institution.institution_name,
              institution_type: institution.institution_type,
              registration_status: institution.registration_status,
              province: institution.location.province,
              city: institution.location.city,
              campuses: institution.location.campuses || [],
              programme_name: programme.programme_name,
              programme_type: programme.programme_type,
              nqf_level: programme.nqf_level,
              duration_years: programme.duration_years,
              min_requirements: programme.min_requirements,
              estimated_annual_cost: programme.estimated_annual_cost,
              career_outcomes: programme.career_outcomes,
              website: institution.website,
              application_link: institution.application_link
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
  console.log(`🏫 Total institutions processed: ${data.institutions.length}`);
}

// Run the upload
uploadPrivateInstitutions()
  .then(() => {
    console.log('\n✨ Private institutions upload complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
