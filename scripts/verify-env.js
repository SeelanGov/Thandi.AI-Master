// scripts/verify-env.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.SUPABASE_ACCESS_TOKEN;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

console.log('Environment Check:');
console.log('✓ NEXT_PUBLIC_SUPABASE_URL:', url ? 'Found' : 'MISSING');
console.log('✓ SUPABASE_ACCESS_TOKEN:', token ? `${token.slice(0, 8)}...` : 'MISSING');

if (!token) {
  console.error('\n❌ Token not accessible. Check:');
  console.error('1. .env.local exists in project root');
  console.error('2. Contains: SUPABASE_ACCESS_TOKEN=your_token');
  console.error('3. File is not in .gitignore (should be ignored!)');
  process.exit(1);
}

console.log('\n✅ All credentials present. Run deploy script now.');
