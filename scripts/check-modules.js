import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: modules } = await supabase
  .from('knowledge_modules')
  .select('id, module_name')
  .order('module_name');

console.log('Available modules:');
modules.forEach(m => console.log(`  ${m.module_name} -> ${m.id}`));