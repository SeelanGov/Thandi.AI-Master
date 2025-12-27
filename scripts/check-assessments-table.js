// Check assessments table structure
import { config } from 'dotenv';
import { getSupabaseAdmin } from '../lib/supabase.js';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabase = getSupabaseAdmin();

async function checkAssessmentsTable() {
  console.log('🔍 Checking assessments table structure...\n');
  
  try {
    // Get a sample assessment to see the structure
    const { data: sampleAssessment, error } = await supabase
      .from('assessments')
      .select('*')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }
    
    if (sampleAssessment) {
      console.log('📊 Sample assessment structure:');
      console.log('Columns found:', Object.keys(sampleAssessment));
      
      if (sampleAssessment.career_matches) {
        console.log('✅ career_matches column exists');
        console.log('Sample career_matches:', sampleAssessment.career_matches);
      } else {
        console.log('❌ career_matches column missing');
      }
    } else {
      console.log('📝 No assessments found in table (this is normal for new setup)');
      
      // Try to insert a test assessment to check structure
      console.log('🧪 Testing assessment insert...');
      
      const { data: testAssessment, error: insertError } = await supabase
        .from('assessments')
        .insert({
          student_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
          grade: 10,
          completed_at: new Date().toISOString(),
          career_matches: [
            { title: 'Software Developer', match_score: 85 },
            { title: 'Data Scientist', match_score: 78 }
          ]
        })
        .select()
        .single();
      
      if (insertError) {
        console.log('❌ Assessment insert failed:', insertError.message);
        
        if (insertError.message.includes('career_matches')) {
          console.log('\n💡 The career_matches column needs to be added to assessments table');
          console.log('Run this SQL in your Supabase dashboard:');
          console.log('ALTER TABLE assessments ADD COLUMN IF NOT EXISTS career_matches JSONB;');
        }
      } else {
        console.log('✅ Assessment insert successful');
        console.log('Test assessment ID:', testAssessment.id);
        
        // Clean up
        await supabase.from('assessments').delete().eq('id', testAssessment.id);
        console.log('✅ Test data cleaned up');
      }
    }
    
  } catch (error) {
    console.log('❌ Error checking assessments table:', error.message);
  }
}

checkAssessmentsTable();