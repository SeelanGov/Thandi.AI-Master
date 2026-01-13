// Direct SQL application to local database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function applySQLDirectly() {
  console.log('🔧 APPLYING SQL DIRECTLY TO LOCAL DATABASE');
  console.log('==========================================');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Drop existing functions first
  const dropSQL = `
    DROP FUNCTION IF EXISTS create_student_school_association(VARCHAR, VARCHAR, VARCHAR, INTEGER, BOOLEAN, VARCHAR);
    DROP FUNCTION IF EXISTS create_student_school_association(VARCHAR, VARCHAR, VARCHAR, INTEGER, BOOLEAN, VARCHAR, JSONB);
    DROP FUNCTION IF EXISTS create_student_school_association CASCADE;
  `;
  
  console.log('🗑️ Dropping existing functions...');
  try {
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropSQL });
    if (dropError) {
      console.log('⚠️ Drop functions failed (may not exist):', dropError.message);
    } else {
      console.log('✅ Functions dropped successfully');
    }
  } catch (err) {
    console.log('⚠️ Drop functions error:', err.message);
  }
  
  // Create the main function
  const createSQL = `
    CREATE OR REPLACE FUNCTION create_student_school_association(
      p_student_name VARCHAR(100),
      p_student_surname VARCHAR(100),
      p_school_id VARCHAR(50),
      p_grade INTEGER,
      p_consent_given BOOLEAN DEFAULT true,
      p_consent_method VARCHAR(50) DEFAULT 'web_form',
      p_consent_metadata JSONB DEFAULT '{}'::jsonb
    )
    RETURNS JSONB AS $$
    DECLARE
      v_student_id UUID;
      v_school_student_id UUID;
      v_result JSONB;
      v_consent_timestamp TIMESTAMPTZ;
    BEGIN
      v_consent_timestamp := CASE WHEN p_consent_given THEN NOW() ELSE NULL END;

      IF NOT EXISTS (
        SELECT 1 FROM school_master sm
        WHERE sm.school_id = p_school_id 
        AND (sm.type ILIKE '%SECONDARY%' OR sm.type ILIKE '%HIGH%' OR sm.type ILIKE '%COMBINED%')
        AND sm.type NOT ILIKE '%PRIMARY%'
      ) THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Invalid school or primary school not supported'
        );
      END IF;

      INSERT INTO student_profiles (
        student_name, student_surname, grade, school_id, consent_given, consent_date, consent_method,
        consent_version, created_at, updated_at
      ) VALUES (
        p_student_name, p_student_surname, p_grade, p_school_id, p_consent_given, v_consent_timestamp,
        CASE WHEN p_consent_given THEN p_consent_method ELSE NULL END,
        CASE WHEN p_consent_given THEN 'v2.0_popia_compliant' ELSE NULL END,
        NOW(), NOW()
      ) RETURNING id INTO v_student_id;

      INSERT INTO school_students (
        school_id, student_id, grade, status, consent_given, consent_date, consent_method,
        enrolled_date, created_at, updated_at
      ) VALUES (
        p_school_id, v_student_id, p_grade, 'active', p_consent_given, v_consent_timestamp,
        CASE WHEN p_consent_given THEN p_consent_method ELSE NULL END,
        CURRENT_DATE, NOW(), NOW()
      ) RETURNING id INTO v_school_student_id;

      RETURN jsonb_build_object(
        'success', true,
        'student_id', v_student_id,
        'school_student_id', v_school_student_id,
        'consent_given', p_consent_given,
        'consent_timestamp', v_consent_timestamp,
        'created_at', NOW()
      );

    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'error_detail', SQLSTATE,
        'timestamp', NOW()
      );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  console.log('🔧 Creating main function...');
  try {
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createSQL });
    if (createError) {
      console.log('❌ Create function failed:', createError.message);
      return false;
    } else {
      console.log('✅ Function created successfully');
    }
  } catch (err) {
    console.log('❌ Create function error:', err.message);
    return false;
  }
  
  // Test the function
  console.log('🧪 Testing function...');
  try {
    const { data: testResult, error: testError } = await supabase
      .rpc('create_student_school_association', {
        p_student_name: 'Test',
        p_student_surname: 'Local',
        p_school_id: 'TEST001',
        p_grade: 11,
        p_consent_given: true,
        p_consent_method: 'web_form'
      });
    
    if (testError) {
      console.log('❌ Function test failed:', testError.message);
      return false;
    } else {
      console.log('✅ Function test successful:', testResult);
      return true;
    }
  } catch (err) {
    console.log('❌ Function test error:', err.message);
    return false;
  }
}

if (require.main === module) {
  applySQLDirectly()
    .then(success => {
      console.log(success ? '\n🎉 SUCCESS' : '\n❌ FAILED');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { applySQLDirectly };