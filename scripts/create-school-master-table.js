import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSchoolMasterTable() {
  try {
    console.log('=== CREATING SCHOOL MASTER TABLE ===\n');
    
    console.log('📋 Please run this SQL in your Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/sql/new');
    console.log('\n--- COPY THIS SQL ---');
    
    const sql = `
-- School Authentication Master Data
CREATE TABLE IF NOT EXISTS school_master (
  id SERIAL PRIMARY KEY,
  school_id VARCHAR(50) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  province VARCHAR(50) NOT NULL,
  type VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'unclaimed',
  principal_email VARCHAR(255),
  contact_phone VARCHAR(20),
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_school_master_school_id ON school_master(school_id);
CREATE INDEX IF NOT EXISTS idx_school_master_province ON school_master(province);
CREATE INDEX IF NOT EXISTS idx_school_master_status ON school_master(status);

-- Enable RLS
ALTER TABLE school_master ENABLE ROW LEVEL SECURITY;

-- Allow public read access for search/claim functionality
CREATE POLICY "Allow public read access" ON school_master FOR SELECT USING (true);
CREATE POLICY "Allow claiming schools" ON school_master FOR UPDATE USING (status = 'unclaimed');
`;
    
    console.log(sql);
    console.log('--- END SQL ---\n');
    
    console.log('After running the SQL, press Enter to test the table...');
    
    // Wait for user input
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async () => {
      console.log('\n🔍 Testing school_master table...');
      
      const { data, error } = await supabase
        .from('school_master')
        .select('count', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.error('❌ Table test failed:', error);
        console.log('\nPlease make sure you ran the SQL in Supabase dashboard first.');
      } else {
        console.log('✅ school_master table is ready!');
        console.log(`Current record count: ${data.length}`);
        console.log('\n🚀 Ready to seed data!');
        console.log('Run: node scripts/seed-school-auth-system.js');
      }
      
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run
createSchoolMasterTable();