import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetTestSchool() {
  console.log('🔄 Resetting test school...');
  
  // Reset MT CURRIE school
  const { error } = await supabase
    .from('school_master')
    .update({
      status: 'unclaimed',
      principal_email: null,
      contact_phone: null,
      claimed_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('school_id', 'ZAF-P-500215340');
  
  if (error) {
    console.error('❌ Reset failed:', error);
  } else {
    console.log('✅ MT CURRIE SENIOR SECONDARY SCHOOL reset to unclaimed');
  }
  
  // Clear any magic links for this school
  const { error: linkError } = await supabase
    .from('school_magic_links')
    .delete()
    .eq('school_id', 'ZAF-P-500215340');
  
  if (linkError) {
    console.log('⚠️  Magic link cleanup failed:', linkError);
  } else {
    console.log('✅ Magic links cleared');
  }
}

resetTestSchool();