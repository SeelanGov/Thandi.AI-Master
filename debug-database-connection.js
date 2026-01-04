#!/usr/bin/env node

/**
 * Debug Database Connection Issues
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🔍 Debugging Database Connection...\n');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugDatabase() {
  try {
    console.log('📡 Testing Supabase connection...');
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('school_master')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.log('❌ Connection failed:', connectionError.message);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test each table individually
    console.log('\n📊 Testing individual tables...');
    
    // Schools table
    try {
      const { data: schools, error: schoolsError } = await supabase
        .from('school_master')
        .select('school_id, name')
        .limit(3);
      
      if (schoolsError) {
        console.log('❌ Schools table error:', schoolsError.message);
      } else {
        console.log(`✅ Schools table: ${schools?.length || 0} records`);
        if (schools?.length > 0) {
          console.log(`   Sample: ${schools[0].school_id} - ${schools[0].name}`);
        }
      }
    } catch (error) {
      console.log('❌ Schools table exception:', error.message);
    }
    
    // Students table
    try {
      const { data: students, error: studentsError } = await supabase
        .from('student_registrations')
        .select('id, created_at')
        .limit(3);
      
      if (studentsError) {
        console.log('❌ Students table error:', studentsError.message);
      } else {
        console.log(`✅ Students table: ${students?.length || 0} records`);
      }
    } catch (error) {
      console.log('❌ Students table exception:', error.message);
    }
    
    // Embeddings table
    try {
      const { data: embeddings, error: embeddingsError } = await supabase
        .from('knowledge_base_embeddings')
        .select('id, content')
        .limit(3);
      
      if (embeddingsError) {
        console.log('❌ Embeddings table error:', embeddingsError.message);
      } else {
        console.log(`✅ Embeddings table: ${embeddings?.length || 0} records`);
      }
    } catch (error) {
      console.log('❌ Embeddings table exception:', error.message);
    }
    
    return true;
    
  } catch (error) {
    console.log('💥 Database debug failed:', error.message);
    return false;
  }
}

debugDatabase().then(success => {
  if (success) {
    console.log('\n✅ Database debugging complete');
  } else {
    console.log('\n❌ Database issues detected');
  }
}).catch(error => {
  console.error('💥 Debug execution failed:', error);
});