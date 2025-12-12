/**
 * Upload SETA Pathways to Supabase
 * 
 * Processes all 21 SETAs and creates embeddings for:
 * - SETA overview information
 * - Programme-specific details
 * - Career pathway connections
 * - Geographic/location data
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
  apiKey: process.env.OPENAI_API_KEY
});

// Load SETA data
const setaData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../thandi_knowledge_base/seta_pathways/setas.json'),
    'utf-8'
  )
);

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data[0].embedding;
}

async function uploadSETAPathways() {
  console.log('🚀 Starting SETA pathways upload...');
  console.log(`📊 Processing ${setaData.setas.length} SETAs\n`);

  let totalChunks = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const seta of setaData.setas) {
    console.log(`\n📍 Processing: ${seta.seta_full}`);

    try {
      // Chunk 1: SETA Overview
      const overviewText = `
${seta.seta_full} (${seta.seta_short})

SETA Overview:
${seta.seta_full} is a Sector Education and Training Authority that provides learnerships, apprenticeships, and occupational qualifications in its sector.

Location:
- Province: ${seta.province}
- Town: ${seta.town}
- Municipality: ${seta.municipality}

Contact Information:
- ${seta.contact}
- Website: ${seta.website}
- Application: ${seta.programmes[0].application_link}

This SETA offers training and qualifications that lead to careers in the ${seta.seta_short} sector.
      `.trim();

      const overviewEmbedding = await generateEmbedding(overviewText);
      
      const { error: overviewError } = await supabase
        .from('knowledge_base')
        .insert({
          content: overviewText,
          embedding: overviewEmbedding,
          metadata: {
            content_type: 'seta_pathway',
            seta_code: seta.seta_short,
            seta_full_name: seta.seta_full,
            chunk_type: 'overview',
            province: seta.province,
            town: seta.town,
            unique_id: seta.unique_id,
            source: 'seta_pathways_database'
          }
        });

      if (overviewError) throw overviewError;
      totalChunks++;
      console.log(`  ✅ Overview chunk uploaded`);

      // Chunk 2: Programme Details
      for (const programme of seta.programmes) {
        const programmeText = `
${seta.seta_full} - ${programme.programme_type}

Programme Information:
The ${seta.seta_short} offers ${programme.programme_type} including:
${programme.examples}

Qualification Details:
- NQF Level: ${programme.nqf_level}
- Entry Requirements: ${programme.min_points}
- Required Subjects: ${programme.required_subjects}

Career Outcomes:
After completing training through ${seta.seta_short}, you can work as:
${programme.career_outcomes.map(c => `- ${c}`).join('\n')}

How to Apply:
Visit ${programme.application_link} to apply for learnerships and qualifications.

Contact: ${seta.contact}
        `.trim();

        const programmeEmbedding = await generateEmbedding(programmeText);
        
        const { error: programmeError } = await supabase
          .from('knowledge_base')
          .insert({
            content: programmeText,
            embedding: programmeEmbedding,
            metadata: {
              content_type: 'seta_pathway',
              seta_code: seta.seta_short,
              seta_full_name: seta.seta_full,
              chunk_type: 'programme_details',
              programme_type: programme.programme_type,
              nqf_level: programme.nqf_level,
              career_outcomes: programme.career_outcomes,
              province: seta.province,
              unique_id: `${seta.unique_id}-PROG`,
              source: 'seta_pathways_database'
            }
          });

        if (programmeError) throw programmeError;
        totalChunks++;
        console.log(`  ✅ Programme chunk uploaded`);
      }

      // Chunk 3: Career Pathways (one chunk per career outcome)
      for (const programme of seta.programmes) {
        for (const career of programme.career_outcomes) {
          const careerText = `
How to become a ${career} through ${seta.seta_short}

Career Path:
To become a ${career}, you can train through the ${seta.seta_full}.

Training Route:
- SETA: ${seta.seta_full} (${seta.seta_short})
- Programme Type: ${programme.programme_type}
- NQF Level: ${programme.nqf_level}
- Entry Requirements: ${programme.min_points}
- Required Subjects: ${programme.required_subjects}

Related Qualifications:
${programme.examples}

Application Process:
1. Check if you meet the entry requirements (${programme.min_points})
2. Ensure you have the required subjects: ${programme.required_subjects}
3. Apply online at: ${programme.application_link}
4. Contact ${seta.contact} for more information

Location: ${seta.town}, ${seta.province}
          `.trim();

          const careerEmbedding = await generateEmbedding(careerText);
          
          const { error: careerError } = await supabase
            .from('knowledge_base')
            .insert({
              content: careerText,
              embedding: careerEmbedding,
              metadata: {
                content_type: 'seta_pathway',
                seta_code: seta.seta_short,
                seta_full_name: seta.seta_full,
                chunk_type: 'career_pathway',
                career_focus: career,
                nqf_level: programme.nqf_level,
                required_subjects: programme.required_subjects,
                province: seta.province,
                unique_id: `${seta.unique_id}-${career.replace(/\s+/g, '-').toUpperCase()}`,
                source: 'seta_pathways_database'
              }
            });

          if (careerError) throw careerError;
          totalChunks++;
        }
      }
      
      console.log(`  ✅ Career pathway chunks uploaded`);
      successCount++;

    } catch (error) {
      console.error(`  ❌ Error processing ${seta.seta_short}:`, error.message);
      errorCount++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total SETAs processed: ${setaData.setas.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total chunks created: ${totalChunks}`);
  console.log('='.repeat(60));
}

// Run the upload
uploadSETAPathways()
  .then(() => {
    console.log('\n✅ SETA pathways upload complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Upload failed:', error);
    process.exit(1);
  });
