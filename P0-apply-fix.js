#!/usr/bin/env node

/**
 * P0 CRITICAL FIX: Apply match_documents function to database
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

async function applyP0Fix() {
  console.log('🚨 P0 CRITICAL FIX: Creating missing match_documents function');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Read the SQL file
  const sql = fs.readFileSync('P0-FIX-MATCH-DOCUMENTS-FUNCTION.sql', 'utf8');
  
  try {
    // Execute the SQL directly
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    
    console.log('✅ Database connection confirmed');
    
    // Now execute the function creation SQL
    // Note: We'll use a workaround since Supabase client doesn't support DDL directly
    console.log('🔧 Creating match_documents function...');
    console.log('📋 SQL to execute:');
    console.log(sql);
    console.log('\n⚠️ MANUAL ACTION REQUIRED:');
    console.log('1. Go to https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/sql');
    console.log('2. Copy and paste the SQL above');
    console.log('3. Click "Run" to execute');
    console.log('4. Then re-run the diagnosis script');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

applyP0Fix();