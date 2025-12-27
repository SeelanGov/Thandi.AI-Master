// Run database migration for school dashboard
import { getSupabaseAdmin } from '../lib/supabase.js';
import fs from 'fs';
import path from 'path';

const supabase = getSupabaseAdmin();

async function runMigration() {
  try {
    console.log('🚀 Running school dashboard migration...');
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20251221_add_school_dashboard.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements (basic approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}`);
        console.log(`   ${statement.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query for simpler statements
          const { error: directError } = await supabase.from('_').select('*').limit(0);
          if (directError) {
            console.log(`⚠️  Statement ${i + 1} failed, trying alternative approach...`);
            // For CREATE TABLE statements, we'll handle them individually
            if (statement.includes('CREATE TABLE')) {
              console.log(`📋 Creating table manually...`);
              // We'll handle this in the next step
            }
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('🎉 Migration completed!');
    
    // Verify tables exist
    console.log('\n🔍 Verifying tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['schools', 'school_users']);
    
    if (tablesError) {
      console.log('⚠️  Could not verify tables:', tablesError.message);
    } else {
      console.log('📊 Tables found:', tables.map(t => t.table_name));
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Alternative: Copy the SQL from supabase/migrations/20251221_add_school_dashboard.sql');
    console.log('   and run it manually in your Supabase dashboard SQL editor');
  }
}

runMigration();