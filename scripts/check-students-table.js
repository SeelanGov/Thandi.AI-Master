// Check students table structure
import { config } from 'dotenv';
import { getSupabaseAdmin } from '../lib/supabase.js';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabase = getSupabaseAdmin();

async function checkStudentsTable() {
  console.log('🔍 Checking students table structure...\n');
  
  try {
    // Get a sample student to see the structure
    const { data: sampleStudent, error } = await supabase
      .from('students')
      .select('*')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }
    
    if (sampleStudent) {
      console.log('📊 Sample student structure:');
      console.log('Columns found:', Object.keys(sampleStudent));
      console.log('Sample data:', sampleStudent);
    } else {
      console.log('📝 No students found in table');
      
      // Try to get table schema from information_schema
      console.log('🔍 Checking table schema...');
      
      const { data: columns, error: schemaError } = await supabase
        .rpc('exec_sql', { 
          sql: `SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'students' 
                AND table_schema = 'public'
                ORDER BY ordinal_position;`
        });
      
      if (schemaError) {
        console.log('⚠️  Could not get schema, trying direct query...');
        
        // Try inserting a test student to see what columns are available
        const { error: insertError } = await supabase
          .from('students')
          .insert({
            email: 'test@test.com',
            grade: 10,
            school_id: 'd2d43ed5-b9d4-4e13-885e-f3c2adbf10c5'
          });
        
        if (insertError) {
          console.log('Insert error (shows available columns):', insertError.message);
        } else {
          console.log('✅ Test insert successful');
        }
      } else {
        console.log('📋 Table schema:', columns);
      }
    }
    
  } catch (error) {
    console.log('❌ Error checking students table:', error.message);
  }
}

checkStudentsTable();