#!/usr/bin/env node

/**
 * Check Actual Database Schema
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Checking Actual Database Schema...\n');

async function checkSchema() {
  try {
    // Get list of all tables
    const { data: tables, error } = await supabase
      .rpc('get_schema_tables');
    
    if (error) {
      console.log('Using alternative method to check tables...');
      
      // Try common table names
      const commonTables = [
        'school_master',
        'students',
        'student_data', 
        'registrations',
        'embeddings',
        'knowledge_base',
        'rag_embeddings',
        'thandi_embeddings'
      ];
      
      console.log('📊 Testing common table names:');
      
      for (const tableName of commonTables) {
        try {
          const { data, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!tableError) {
            console.log(`✅ ${tableName}: EXISTS (${data?.length || 0} sample records)`);
          }
        } catch (e) {
          // Table doesn't exist, skip
        }
      }
      
      return;
    }
    
    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
  } catch (error) {
    console.log('💥 Schema check failed:', error.message);
  }
}

checkSchema();