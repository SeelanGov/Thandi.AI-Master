#!/usr/bin/env node

/**
 * Fix Student Assessments Schema
 * Make school_id column nullable to allow proper student registration
 */

const { config } = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔧 FIXING STUDENT ASSESSMENTS SCHEMA');
console.log('=' .repeat(60));

async function fixSchoolIdConstraint() {
  console.log('\n📋 Making school_id column nullable...');
  
  try {
    // Execute SQL to alter the table
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Make school_id column nullable
        ALTER TABLE student_assessments 
        ALTER COLUMN school_id DROP NOT NULL;
        
        -- Add comment for documentation
        COMMENT ON COLUMN student_assessments.school_id IS 
        'Nullable school_id - can be NULL when school info is stored in assessment_data JSON';
      `
    });
    
    if (error) {
      console.log('   ⚠️  Could not execute via RPC, trying direct approach...');
      
      // Alternative approach: Use a simple query that should work
      const { error: alterError } = await supabase
        .from('student_assessments')
        .select('id')
        .limit(0); // This will fail if table doesn't exist
      
      if (alterError) {
        console.log('   ❌ Table access failed:', alterError.message);
        return false;
      }
      
      console.log('   ✅ Table is accessible, but cannot alter schema via API');
      console.log('   💡 Manual SQL needed - see recommendations below');
      return false;
    } else {
      console.log('   ✅ Schema updated successfully');
      return true;
    }
    
  } catch (error) {
    console.log('   ❌ Schema fix failed:', error.message);
    return false;
  }
}

async function testSchemaFix() {
  console.log('\n🧪 Testing schema fix...');
  
  try {
    // Try to insert a test record with NULL school_id
    const testData = {
      student_name: 'SCHEMA',
      student_surname: 'TEST',
      school_id: null, // This should now work
      grade: 10,
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      consent_version: 'v1.0',
      assessment_data: {
        school_master_id: 'ZAF-200100021',
        school_name: 'TEST SCHOOL',
        test_record: true
      }
    };
    
    const { data, error } = await supabase
      .from('student_assessments')
      .insert(testData)
      .select()
      .single();
    
    if (error) {
      console.log('   ❌ Test insert failed:', error.message);
      console.log(`   Error Code: ${error.code}`);
      return false;
    } else {
      console.log('   ✅ Test insert successful - schema is fixed!');
      
      // Clean up test record
      await supabase
        .from('student_assessments')
        .delete()
        .eq('id', data.id);
      
      console.log('   🧹 Test record cleaned up');
      return true;
    }
    
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
    return false;
  }
}

async function generateManualInstructions() {
  console.log('\n📋 MANUAL SCHEMA FIX INSTRUCTIONS');
  console.log('=' .repeat(60));
  
  console.log('\n🔧 If automatic fix failed, run this SQL manually in Supabase:');
  console.log('\n```sql');
  console.log('-- Make school_id column nullable');
  console.log('ALTER TABLE student_assessments ');
  console.log('ALTER COLUMN school_id DROP NOT NULL;');
  console.log('');
  console.log('-- Add documentation comment');
  console.log('COMMENT ON COLUMN student_assessments.school_id IS ');
  console.log("'Nullable school_id - can be NULL when school info is stored in assessment_data JSON';");
  console.log('```');
  
  console.log('\n📍 How to run this:');
  console.log('   1. Go to Supabase Dashboard → SQL Editor');
  console.log('   2. Paste the SQL above');
  console.log('   3. Click "Run"');
  console.log('   4. Re-run this script to verify the fix');
  
  console.log('\n⚠️  IMPORTANT: This change is safe and reversible');
  console.log('   - Existing data will not be affected');
  console.log('   - NULL values will be stored in assessment_data JSON');
  console.log('   - Future migration can restore proper foreign keys');
}

// Main execution
async function main() {
  try {
    const schemaFixed = await fixSchoolIdConstraint();
    
    if (schemaFixed) {
      const testPassed = await testSchemaFix();
      
      if (testPassed) {
        console.log('\n✅ SCHEMA FIX COMPLETE');
        console.log('   Student registration should now work properly');
        console.log('   Run the user journey test to verify');
      } else {
        console.log('\n⚠️  SCHEMA FIX APPLIED BUT TEST FAILED');
        console.log('   Manual verification may be needed');
      }
    } else {
      await generateManualInstructions();
    }
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
    await generateManualInstructions();
  }
}

main();