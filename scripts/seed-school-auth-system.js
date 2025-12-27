import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

async function seedSchoolAuthSystem() {
  try {
    console.log('=== SEEDING SCHOOL AUTHENTICATION SYSTEM ===\n');
    
    // Read the CSV data
    const csvPath = path.join(__dirname, '..', 'auth_ready_schools.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const header = lines[0];
    const dataLines = lines.slice(1);
    
    console.log(`📊 Processing ${dataLines.length.toLocaleString()} schools...`);
    
    // Parse CSV data
    const schools = dataLines.map(line => {
      const [school_id, institution_name, province, type, onboarding_status] = line.split(',');
      return {
        school_id: school_id.replace(/"/g, ''),
        name: institution_name.replace(/"/g, ''),
        province: province.replace(/"/g, ''),
        type: type.replace(/"/g, ''),
        status: onboarding_status.replace(/"/g, ''),
        created_at: new Date().toISOString()
      };
    });
    
    // Check if school_master table exists by trying to query it
    console.log('🔍 Checking database schema...');
    let tableExists = false;
    try {
      const { data, error } = await supabase
        .from('school_master')
        .select('count', { count: 'exact' })
        .limit(1);
      
      tableExists = !error;
    } catch (e) {
      tableExists = false;
    }
    
    if (!tableExists) {
      console.log('📋 Please run the migration first:');
      console.log('   supabase migration up --file 20251224_add_school_auth_master.sql');
      console.log('   Or apply it manually in the Supabase dashboard');
      return;
    }
    
    // Clear existing data (for fresh seed)
    console.log('🧹 Clearing existing school data...');
    const { error: deleteError } = await supabase
      .from('school_master')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.error('❌ Error clearing data:', deleteError);
      return;
    }
    
    // Insert schools in batches
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < schools.length; i += batchSize) {
      const batch = schools.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('school_master')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
        continue;
      }
      
      inserted += batch.length;
      console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${inserted.toLocaleString()}/${schools.length.toLocaleString()} schools`);
    }
    
    // Verify insertion
    const { data: countData, error: countError } = await supabase
      .from('school_master')
      .select('count', { count: 'exact' });
    
    if (countError) {
      console.error('❌ Error counting records:', countError);
      return;
    }
    
    console.log(`\n✅ Successfully seeded ${inserted.toLocaleString()} schools`);
    console.log(`📊 Database contains ${countData.length} total records`);
    
    // Test search functionality
    console.log('\n🔍 Testing search functionality...');
    const { data: searchTest, error: searchError } = await supabase
      .from('school_master')
      .select('school_id, name, province, type')
      .ilike('name', '%SECONDARY%')
      .limit(5);
    
    if (searchError) {
      console.error('❌ Search test failed:', searchError);
    } else {
      console.log('✅ Search test successful:');
      searchTest.forEach(school => {
        console.log(`  ${school.school_id} | ${school.name} | ${school.province}`);
      });
    }
    
    // Province statistics
    console.log('\n📈 Province distribution:');
    const { data: provinceStats, error: statsError } = await supabase
      .from('school_master')
      .select('province, count(*)')
      .group('province');
    
    if (!statsError && provinceStats) {
      provinceStats.forEach(stat => {
        console.log(`  ${stat.province}: ${stat.count} schools`);
      });
    }
    
    console.log('\n🎯 School authentication system ready!');
    console.log('Next steps:');
    console.log('1. Test the search API: GET /api/schools/search?q=secondary');
    console.log('2. Test the claim flow: POST /api/schools/claim');
    console.log('3. Configure email domain validation');
    console.log('4. Set up magic link authentication');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run seeding
seedSchoolAuthSystem();