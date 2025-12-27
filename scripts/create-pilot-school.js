// Create a pilot school for testing
import { config } from 'dotenv';
import { getSupabaseAdmin } from '../lib/supabase.js';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabase = getSupabaseAdmin();
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

async function createPilotSchool() {
  try {
    console.log('🏫 Creating pilot school for testing...\n');
    
    // 1. Create the school
    const schoolData = {
      name: 'THANDI Pilot High School',
      emis_number: 'PILOT001',
      province: 'KwaZulu-Natal',
      district: 'eThekwini',
      principal_email: 'principal@pilot.thandi.ai',
      lo_teacher_email: 'counselor@pilot.thandi.ai',
      primary_color: '#0d9488',
      subscription_tier: 'pilot'
    };
    
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .upsert(schoolData, { onConflict: 'emis_number' })
      .select()
      .single();
    
    if (schoolError) throw schoolError;
    
    console.log('✅ School created:', school.name);
    console.log('   School ID:', school.id);
    
    // 2. Create Supabase auth user for counselor
    const counselorEmail = 'counselor@pilot.thandi.ai';
    const { data: authData, error: userError } = await supabase.auth.admin.createUser({
      email: counselorEmail,
      email_confirm: true,
      user_metadata: { 
        role: 'counselor', 
        school_id: school.id,
        name: 'Ms. Pilot Counselor'
      }
    });
    
    if (userError && !userError.message.includes('already registered')) {
      throw userError;
    }
    
    const userId = authData?.user?.id || 'existing-user';
    console.log('✅ Counselor user created/found');
    
    // 3. Link user to school
    if (authData?.user) {
      await supabase.from('school_users').upsert({
        school_id: school.id,
        user_id: authData.user.id,
        role: 'counselor'
      }, { onConflict: 'school_id,user_id' });
      console.log('✅ User linked to school');
    }
    
    // 4. Generate magic token
    const token = crypto.createHash('sha256')
      .update((authData?.user?.id || 'test-user') + process.env.MAGIC_LINK_SECRET + Date.now())
      .digest('hex').substring(0, 32);
    
    // 5. Store token in Redis
    await redis.set(`magic:${token}`, JSON.stringify({
      userId: authData?.user?.id || 'test-user-id',
      schoolId: school.id,
      schoolName: school.name,
      counselorName: 'Ms. Pilot Counselor',
      createdAt: Date.now()
    }), { ex: 86400 }); // 24 hours for testing
    
    // 6. Create some test students
    console.log('\n👥 Creating test students...');
    
    const testStudents = [
      {
        name: 'Sipho Mthembu',
        email: 'sipho@pilot.thandi.ai',
        grade: 10,
        school_id: school.id,
        class_name: '10A',
        enrollment_status: 'active'
      },
      {
        name: 'Nomsa Dlamini',
        email: 'nomsa@pilot.thandi.ai', 
        grade: 11,
        school_id: school.id,
        class_name: '11B',
        enrollment_status: 'active'
      },
      {
        name: 'Thabo Nkosi',
        email: 'thabo@pilot.thandi.ai',
        grade: 12,
        school_id: school.id,
        class_name: '12A',
        enrollment_status: 'active'
      }
    ];
    
    for (const student of testStudents) {
      const { error: studentError } = await supabase
        .from('students')
        .upsert(student, { onConflict: 'email' });
      
      if (studentError) {
        console.log(`⚠️  Student ${student.name} error:`, studentError.message);
      } else {
        console.log(`✅ Created student: ${student.name} (Grade ${student.grade})`);
      }
    }
    
    // 7. Generate the magic link
    const magicLink = `http://localhost:3000/school/dashboard?token=${token}`;
    
    console.log('\n🎉 PILOT SCHOOL SETUP COMPLETE!');
    console.log('================================');
    console.log(`🏫 School: ${school.name}`);
    console.log(`📧 Counselor: counselor@pilot.thandi.ai`);
    console.log(`🔗 Magic Link: ${magicLink}`);
    console.log(`🎫 Token: ${token}`);
    console.log('\n📝 TESTING INSTRUCTIONS:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Open the magic link above');
    console.log('3. Test the dashboard functionality');
    console.log('4. Check API endpoints work');
    
    return { school, token, magicLink };
    
  } catch (error) {
    console.error('❌ Error creating pilot school:', error.message);
    throw error;
  }
}

createPilotSchool();