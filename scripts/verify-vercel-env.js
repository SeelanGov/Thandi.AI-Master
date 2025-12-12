// Verify Vercel environment variables are set correctly
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function verifyVercelEnv() {
  console.log('🔍 VERIFYING VERCEL ENVIRONMENT VARIABLES\n');
  console.log('='.repeat(70));
  
  const requiredEnvVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY
  };
  
  let allPresent = true;
  
  console.log('\n📋 Local Environment Check (.env.local):');
  console.log('-'.repeat(70));
  
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    const isPresent = !!value;
    const icon = isPresent ? '✅' : '❌';
    const display = isPresent ? `${value.substring(0, 20)}...` : 'MISSING';
    
    console.log(`${icon} ${key}: ${display}`);
    
    if (!isPresent) {
      allPresent = false;
    }
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (allPresent) {
    console.log('✅ All required environment variables are present locally');
    console.log('\n📝 Next Steps:');
    console.log('1. Verify these are also set in Vercel:');
    console.log('   vercel env ls --prod');
    console.log('\n2. If missing in Vercel, add them:');
    console.log('   vercel env add NEXT_PUBLIC_SUPABASE_URL production');
    console.log('   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production');
    console.log('   vercel env add SUPABASE_SERVICE_ROLE_KEY production');
    console.log('   vercel env add OPENAI_API_KEY production');
  } else {
    console.log('❌ Some environment variables are missing');
    console.log('\n⚠️  Add missing variables to .env.local:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://pvvnxupuukuefajypovz.supabase.co');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=[your-service-key]');
    console.log('   OPENAI_API_KEY=[your-openai-key]');
  }
  
  console.log('='.repeat(70));
  
  return allPresent;
}

verifyVercelEnv()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
