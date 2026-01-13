// =====================================================
// APPLY HOTFIX TO LOCAL DATABASE
// Date: January 13, 2026
// Purpose: Apply the same SQL hotfix to local Supabase instance
// =====================================================

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function applyHotfixToLocal() {
  console.log('🔧 APPLYING HOTFIX TO LOCAL DATABASE');
  console.log('====================================');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Read the corrected SQL script
  const sqlScript = fs.readFileSync('CORRECTED-SUPABASE-SQL-HOTFIX-EXECUTION.sql', 'utf8');
  
  // Extract just the function creation parts (skip comments and policies for local)
  const functionParts = sqlScript
    .split('\n')
    .filter(line => 
      !line.startsWith('--') && 
      !line.trim().startsWith('DROP POLICY') &&
      !line.trim().startsWith('CREATE POLICY') &&
      !line.trim().startsWith('GRANT EXECUTE') &&
      line.trim().length > 0
    )
    .join('\n');
  
  try {
    console.log('📋 Applying SQL functions to local database...');
    
    // Apply the SQL script
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: functionParts
    });
    
    if (error) {
      console.log('❌ Failed to apply via RPC, trying direct execution...');
      
      // Try executing parts separately
      const parts = [
        // Drop existing functions
        `DROP FUNCTION IF EXISTS create_student_school_association(VARCHAR, VARCHAR, VARCHAR, INTEGER, BOOLEAN, VARCHAR);`,
        `DROP FUNCTION IF EXISTS create_student_school_association(VARCHAR, VARCHAR, VARCHAR, INTEGER, BOOLEAN, VARCHAR, JSONB);`,
        `DROP FUNCTION IF EXISTS create_student_school_association CASCADE;`,
        
        // Create backup function
        `CREATE OR REPLACE FUNCTION create_student_school_association_backup(
          p_student_name VARCHAR(100),
          p_student_surname VARCHAR(100),
          p_school_id VARCHAR(50),
          p_grade INTEGER,
          p_consent_given BOOLEAN DEFAULT true,
          p_consent_method VARCHAR(50) DEFAULT 'web_form'
        )
        RETURNS JSONB AS $$
        DECLARE
          v_student_id UUID;
          v_school_student_id UUID;
          v_result JSONB;
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM school_master 
            WHERE school_id = p_school_id 
            AND (type ILIKE '%SECONDARY%' OR type ILIKE '%HIGH%' OR type ILIKE '%COMBINED%')
            AND type NOT ILIKE '%PRIMARY%'
          ) THEN
            RETURN jsonb_build_object(
              'success', false,
              'error', 'Invalid school or primary school not supported'
            );
          END IF;

          INSERT INTO student_profiles (
            student_name, student_surname, grade, school_id, consent_given, consent_date, consent_method
          ) VALUES (
            p_student_name, p_student_surname, p_grade, p_school_id, p_consent_given,
            CASE WHEN p_consent_given THEN NOW() ELSE NULL END,
            CASE WHEN p_consent_given THEN p_consent_method ELSE NULL END
          ) RETURNING id INTO v_student_id;

          INSERT INTO school_students (
            school_id, student_id, grade, status, consent_given, consent_date, consent_method
          ) VALUES (
            p_school_id, v_student_id, p_grade, 'active', p_consent_given,
            CASE WHEN p_consent_given THEN NOW() ELSE NULL END,
            CASE WHEN p_consent_given THEN p_consent_method ELSE NULL END
          ) RETURNING id INTO v_school_student_id;

          RETURN jsonb_build_object(
            'success', true,
            'student_id', v_student_id,
            'school_student_id', v_school_student_id,
            'consent_given', p_consent_given
          );

        EXCEPTION WHEN OTHERS THEN
          RETURN jsonb_build_object('success', false, 'error', SQLERRM);
        END;
        $$ LANGUAGE plpgsql;`,
        
        // Create main function
        `CREATE OR REPLACE FUNCTION create_student_school_association(
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
        $$ LANGUAGE plpgsql SECURITY DEFINER;`
      ];
      
      for (const [index, sqlPart] of parts.entries()) {
        console.log(`📋 Executing part ${index + 1}/${parts.length}...`);
        
        try {
          const { error: partError } = await supabase.rpc('exec_sql', { sql: sqlPart });
          if (partError) {
            console.log(`⚠️ Part ${index + 1} failed:`, partError.message);
          } else {
            console.log(`✅ Part ${index + 1} successful`);
          }
        } catch (partErr) {
          console.log(`❌ Part ${index + 1} error:`, partErr.message);
        }
      }
    } else {
      console.log('✅ SQL script applied successfully');
    }
    
    // Test the function
    console.log('🧪 Testing function...');
    
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
    
  } catch (error) {
    console.error('❌ Failed to apply hotfix to local database:', error);
    return false;
  }
}

if (require.main === module) {
  applyHotfixToLocal()
    .then(success => {
      if (success) {
        console.log('\n🎉 LOCAL DATABASE HOTFIX APPLIED SUCCESSFULLY');
      } else {
        console.log('\n❌ LOCAL DATABASE HOTFIX FAILED');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Script execution failed:', error);
      process.exit(1);
    });
}

module.exports = { applyHotfixToLocal };