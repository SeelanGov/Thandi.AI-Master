// Use your existing Supabase pattern
import { getSupabaseAdmin } from '@/lib/supabase.js';

const supabase = getSupabaseAdmin();

const schools = [
  {
    name: 'Morningside High School',
    emis_number: '123456',
    province: 'KwaZulu-Natal',
    principal_email: 'principal@morningsidehigh.co.za',
    lo_teacher_email: 'counselor@morningsidehigh.co.za',
    primary_color: '#0d9488'
  },
  {
    name: 'Westville Boys High School',
    emis_number: '234567',
    province: 'KwaZulu-Natal',
    principal_email: 'principal@wbhs.co.za',
    lo_teacher_email: 'counselor@wbhs.co.za',
    primary_color: '#0d9488'
  },
  {
    name: 'Durban Girls College',
    emis_number: '345678',
    province: 'KwaZulu-Natal',
    principal_email: 'principal@dgc.co.za',
    lo_teacher_email: 'counselor@dgc.co.za',
    primary_color: '#0d9488'
  }
];

async function seedSchools() {
  for (const school of schools) {
    const { error } = await supabase.from('schools').upsert(school, {
      onConflict: 'emis_number'
    });
    if (error) console.error('Error:', error);
    else console.log('✅ Seeded:', school.name);
  }
}

seedSchools();