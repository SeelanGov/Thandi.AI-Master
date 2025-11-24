#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

console.log('Script starting...')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('Supabase client created')

async function test() {
  console.log('Test function running...')
  
  const { count } = await supabase
    .from('knowledge_chunks')
    .select('*', { count: 'exact', head: true })
  
  console.log(`Total chunks: ${count}`)
}

test().catch(err => {
  console.error('Error:', err.message)
})
