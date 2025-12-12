#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  console.log('📊 Checking current database state...\n');

  // Check institution_gates
  const { data: instData, error: instError } = await supabase
    .from('institution_gates')
    .select('*');

  if (instError) {
    console.log('❌ Error querying institution_gates:', instError.message);
  } else {
    console.log(`✅ institution_gates: ${instData?.length || 0} records`);
    if (instData && instData.length > 0) {
      console.log('   Qualifications present:');
      const quals = [...new Set(instData.map(r => r.qualification_id))];
      quals.forEach(q => {
        const count = instData.filter(r => r.qualification_id === q).length;
        console.log(`   - ${q}: ${count} institutions`);
      });
    }
  }

  // Check g12_logistics
  const { data: logData, error: logError } = await supabase
    .from('g12_logistics')
    .select('*');

  if (logError) {
    console.log('❌ Error querying g12_logistics:', logError.message);
  } else {
    console.log(`\n✅ g12_logistics: ${logData?.length || 0} records`);
    if (logData && logData.length > 0) {
      logData.forEach(r => {
        console.log(`   - ${r.qualification_id}`);
      });
    }
  }

  // Check g10_correction_gates
  const { data: g10Data, error: g10Error } = await supabase
    .from('g10_correction_gates')
    .select('*');

  if (g10Error) {
    console.log('❌ Error querying g10_correction_gates:', g10Error.message);
  } else {
    console.log(`\n✅ g10_correction_gates: ${g10Data?.length || 0} records`);
  }

  console.log('\n📝 Summary:');
  console.log(`   Total records: ${(instData?.length || 0) + (logData?.length || 0) + (g10Data?.length || 0)}`);
  console.log(`   Ready for Batch 1: ${(instData?.length || 0) === 0 ? 'YES (clean slate)' : 'NEEDS CLEANUP'}`);
}

checkData().catch(console.error);
