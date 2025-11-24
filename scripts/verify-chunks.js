#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyChunks() {
  // Total chunks
  const { count: totalCount, error: countError } = await supabase
    .from('knowledge_chunks')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n📊 Total chunks: ${totalCount}`)
  if (countError) console.log(`Error: ${countError.message}`)
  
  // Healthcare chunks
  const { data: healthcareChunks, error: healthError } = await supabase
    .from('knowledge_chunks')
    .select('chunk_metadata')
    .ilike('chunk_text', '%physiotherap%')
  
  console.log(`🏥 Physiotherapy chunks: ${healthcareChunks?.length || 0}`)
  if (healthError) console.log(`Error: ${healthError.message}`)
  
  // Check module
  const { data: modules, error: modError } = await supabase
    .from('knowledge_modules')
    .select('*')
    .eq('module_name', 'healthcare_extended')
  
  if (modules && modules.length > 0) {
    console.log(`✅ Healthcare module exists (ID: ${modules[0].id})`)
  } else {
    console.log(`❌ Healthcare module not found`)
    if (modError) console.log(`Error: ${modError.message}`)
  }
  
  // Show sample physiotherapy chunk
  if (healthcareChunks && healthcareChunks.length > 0) {
    console.log(`\n📄 Sample chunk metadata:`)
    console.log(JSON.stringify(healthcareChunks[0].chunk_metadata, null, 2))
  }
}

verifyChunks()
