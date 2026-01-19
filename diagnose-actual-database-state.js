// Diagnostic script to understand actual database state
// This will tell us exactly what needs to be fixed

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseDatabase() {
  console.log('🔍 DIAGNOSING ACTUAL DATABASE STATE');
  console.log('====================================\n');

  try {
    // 1. Check student_assessments table schema
    console.log('📊 Step 1: Checking student_assessments schema...');
    const { data: assessmentColumns, error: assessmentError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, character_maximum_length
          FROM information_schema.columns
          WHERE table_name = 'student_assessments'
          AND column_name = 'school_id';
        `
      });

    if (assessmentError) {
      console.log('⚠️  Cannot query schema directly');
      console.log('   Will test with actual insert instead\n');
    } else {
      console.log('✅ student_assessments.school_id:', assessmentColumns);
    }

    // 2. Check all policies on student_assessments
    console.log('\n📊 Step 2: Checking RLS policies on student_assessments...');
    const { data: policies, error: policyError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT policyname, cmd, qual
          FROM pg_policies
          WHERE tablename = 'student_assessments';
        `
      });

    if (policyError) {
      console.log('⚠️  Cannot query policies directly');
    } else {
      console.log('✅ Found policies:', policies);
    }

    // 3. Test actual insert to see what fails
    console.log('\n📊 Step 3: Testing actual insert with VARCHAR school_id...');
    const testData = {
      student_profile_id: null,
      school_id: 'ZAF-200100021', // VARCHAR format
      grade: 11,
      assessment_data: { test: true },
      created_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('student_assessments')
      .insert(testData)
      .select();

    if (insertError) {
      console.log('❌ Insert failed with error:');
      console.log('   Code:', insertError.code);
      console.log('   Message:', insertError.message);
      console.log('   Details:', insertError.details);
      console.log('   Hint:', insertError.hint);
      
      if (insertError.code === '22P02') {
        console.log('\n✅ CONFIRMED: Column is UUID, needs to be VARCHAR');
      } else if (insertError.code === '23503') {
        console.log('\n✅ GOOD: Column accepts VARCHAR (foreign key error is expected)');
      } else {
        console.log('\n⚠️  UNEXPECTED ERROR:', insertError.code);
      }
    } else {
      console.log('✅ Insert succeeded!');
      console.log('   This means column is already VARCHAR');
      
      // Clean up
      if (insertData[0]?.id) {
        await supabase
          .from('student_assessments')
          .delete()
          .eq('id', insertData[0].id);
        console.log('✅ Test data cleaned up');
      }
    }

    // 4. Check school_master table
    console.log('\n📊 Step 4: Checking school_master schema...');
    const { data: schoolColumns, error: schoolError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, character_maximum_length
          FROM information_schema.columns
          WHERE table_name = 'school_master'
          AND column_name = 'school_id';
        `
      });

    if (!schoolError) {
      console.log('✅ school_master.school_id:', schoolColumns);
    }

    // 5. Check if foreign key exists
    console.log('\n📊 Step 5: Checking foreign key constraints...');
    const { data: fkData, error: fkError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT constraint_name, table_name, column_name
          FROM information_schema.key_column_usage
          WHERE table_name = 'student_assessments'
          AND column_name = 'school_id';
        `
      });

    if (!fkError) {
      console.log('✅ Foreign key constraints:', fkData);
    }

    console.log('\n' + '='.repeat(50));
    console.log('DIAGNOSIS COMPLETE');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Diagnosis failed:', error.message);
    console.error('   Stack:', error.stack);
  }
}

diagnoseDatabase();
