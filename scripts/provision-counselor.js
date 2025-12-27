// Run this once per pilot school (you send link via WhatsApp)
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

async function provisionCounselor({ schoolName, counselorName, counselorEmail, principalEmail }) {
  try {
    // 1. Check if school already exists
    let { data: existingSchool } = await supabase
      .from('schools')
      .select('*')
      .eq('name', schoolName)
      .single();
    
    let school;
    if (existingSchool) {
      console.log(`📋 School "${schoolName}" already exists, using existing record`);
      school = existingSchool;
    } else {
      // Create new school
      const { data: newSchool, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: schoolName,
          emis_number: Math.random().toString(36).substr(2, 6).toUpperCase(), // Temp EMIS
          lo_teacher_email: counselorEmail,
          principal_email: principalEmail,
          primary_color: '#0d9488'
        })
        .select()
        .single();

      if (schoolError) throw schoolError;
      school = newSchool;
    }

    // 2. Create or get existing user
    let authData;
    console.log(`🔄 Setting up user for "${counselorEmail}"`);
    
    try {
      const { data: newAuthData, error: userError } = await supabase.auth.admin.createUser({
        email: counselorEmail,
        email_confirm: true,
        user_metadata: { 
          role: 'counselor', 
          school_id: school.id,
          name: counselorName
        }
      });

      if (userError) throw userError;
      authData = newAuthData;
      console.log(`✅ Created new user for "${counselorEmail}"`);
      
    } catch (userError) {
      if (userError.message.includes('already been registered') || userError.code === 'email_exists') {
        console.log(`👤 User "${counselorEmail}" already exists, continuing with existing user`);
        // Create a consistent user ID for existing users
        authData = { 
          user: { 
            id: crypto.createHash('sha256').update(counselorEmail + school.id).digest('hex').substring(0, 36),
            email: counselorEmail 
          } 
        };
      } else {
        throw userError;
      }
    }

    // 3. Link user to school (upsert to handle existing relationships)
    await supabase.from('school_users').upsert({
      school_id: school.id,
      user_id: authData.user.id,
      role: 'counselor'
    }, { onConflict: 'school_id,user_id' });

    // 4. Generate magic token (secure hash)
    const token = crypto.createHash('sha256')
      .update(authData.user.id + process.env.MAGIC_LINK_SECRET + Date.now())
      .digest('hex').substring(0, 32);

    // 5. Store token in Redis (1 year expiration for pilots)
    await redis.set(`magic:${token}`, JSON.stringify({
      userId: authData.user.id,
      schoolId: school.id,
      schoolName: schoolName,
      counselorName: counselorName,
      createdAt: Date.now()
    }), { ex: 31536000 }); // 1 year

    // 6. Generate magic link
    const link = `https://thandiai.vercel.app/school/dashboard?token=${token}`;

    console.log(`\n✅ ${schoolName} provisioned successfully!`);
    console.log(`📧 Send this to ${counselorName} (${counselorEmail}):`);
    console.log(`\n📱 WhatsApp Message:`);
    console.log(`Hi ${counselorName}! Your THANDI dashboard is ready:`);
    console.log(`${link}`);
    console.log(`This link works forever. Save it to your bookmarks.`);
    console.log(`\n💾 Token: ${token}`);
    console.log(`🏫 School ID: ${school.id}`);
    console.log(`👤 User ID: ${authData.user.id}`);

    return { school, user: authData.user, link, token };

  } catch (error) {
    console.error(`❌ Error provisioning ${schoolName}:`, error.message);
    throw error;
  }
}

// Usage examples - uncomment one at a time and run
/*
provisionCounselor({
  schoolName: 'Morningside High School',
  counselorName: 'Mrs. Zulu',
  counselorEmail: 'counselor@morningsidehigh.co.za',
  principalEmail: 'principal@morningsidehigh.co.za'
});
*/

/*
provisionCounselor({
  schoolName: 'Westville Boys High School',
  counselorName: 'Mr. Smith',
  counselorEmail: 'counselor@wbhs.co.za',
  principalEmail: 'principal@wbhs.co.za'
});
*/

/*
provisionCounselor({
  schoolName: 'Durban Girls College',
  counselorName: 'Ms. Patel',
  counselorEmail: 'counselor@dgc.co.za',
  principalEmail: 'principal@dgc.co.za'
});
*/

export { provisionCounselor };