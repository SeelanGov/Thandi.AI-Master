#!/usr/bin/env node

/**
 * Pre-Flight Check for Batch 1 Deployment
 * Validates environment and database connectivity
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

console.log('🔍 Pre-Flight Check for Batch 1 Deployment...\n');

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY'
];

let allPresent = true;
requiredEnvVars.forEach(env => {
  if (!process.env[env]) {
    console.log(`❌ Missing: ${env}`);
    allPresent = false;
  } else {
    console.log(`✅ ${env}: Present`);
  }
});

if (!allPresent) {
  console.log('\n❌ Aborting: Environment variables missing');
  process.exit(1);
}

// Check Supabase connectivity
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n🔌 Testing Supabase connection...');

try {
  const { data, error } = await supabase
    .from('institution_gates')
    .select('count')
    .limit(1);

  if (error) {
    console.log('❌ Supabase connection failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Supabase connection: Active');
  
  // Check current data
  const { data: currentData, error: countError } = await supabase
    .from('institution_gates')
    .select('*');
  
  if (!countError) {
    console.log(`✅ Current institution_gates records: ${currentData?.length || 0}`);
  }

  console.log('\n🚀 Pre-flight checks passed. Ready for deployment.');
  process.exit(0);
} catch (err) {
  console.error('❌ Connection test failed:', err.message);
  process.exit(1);
}
