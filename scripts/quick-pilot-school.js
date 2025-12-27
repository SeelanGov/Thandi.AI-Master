// Quick pilot school creation - no testing, just do it
import { config } from 'dotenv';
import { getSupabaseAdmin } from '../lib/supabase.js';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

config({ path: '.env.local' });

const supabase = getSupabaseAdmin();
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

async function createPilotSchool() {
  console.log('🚀 Creating pilot school...');
  
  // 1. Create school
  const { data: school } = await supabase.from('schools').upsert({
    name: 'Morningside High School',
    emis_number: 'MHS001',
    lo_teacher_email: 'counselor@morningsidehigh.co.za',
    principal_email: 'principal@morningsidehigh.co.za',
    province: 'KwaZulu-Natal',
    primary_color: '#0d9488'
  }, { onConflict: 'emis_number' }).select().single();

  // 2. Create auth user
  const { data: authData } = await supabase.auth.admin.createUser({
    email: 'counselor@morningsidehigh.co.za',
    email_confirm: true,
    user_metadata: { 
      role: 'counselor', 
      school_id: school.id,
      name: 'Mrs. Zulu'
    }
  });

  // 3. Link user to school
  await supabase.from('school_users').upsert({
    school_id: school.id,
    user_id: authData.user.id,
    role: 'counselor'
  });

  // 4. Generate magic link
  const token = crypto.createHash('sha256')
    .update(authData.user.id + process.env.MAGIC_LINK_SECRET + Date.now())
    .digest('hex').substring(0, 32);

  await redis.set(`magic:${token}`, JSON.stringify({
    userId: authData.user.id,
    schoolId: school.id,
    schoolName: school.name,
    counselorName: 'Mrs. Zulu',
    createdAt: Date.now()
  }), { ex: 31536000 });

  const link = `http://localhost:3000/school/dashboard?token=${token}`;

  console.log('\n✅ PILOT SCHOOL READY!');
  console.log('🏫 School:', school.name);
  console.log('👤 Counselor: Mrs. Zulu');
  console.log('🔗 Magic Link:', link);
  console.log('\n📋 COPY THIS LINK TO TEST:');
  console.log(link);
}

createPilotSchool().catch(console.error);