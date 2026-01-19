/**
 * DISCOVERY SCRIPT: Complete Database State Analysis
 * Purpose: Discover ALL tables, columns, and policies before attempting fix
 * Date: January 14, 2026
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function discoverCompleteState() {
  console.log('🔍 DISCOVERING COMPLETE DATABASE STATE');
  console.log('=====================================\n');

  const discoveries = {
    timestamp: new Date().toISOString(),
    tables_with_school_id: [],
    all_policies: [],
    policies_referencing_school_id: [],
    column_details: [],
    foreign_keys: [],
    indexes: []
  };

  try {
    // 1. Discover ALL tables with school_id columns
    console.log('1️⃣ Discovering tables with school_id columns...');
    const { data: schoolIdColumns, error: colError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          table_name, 
          column_name, 
          data_type,
          udt_name,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE column_name = 'school_id'
        AND table_schema = 'public'
        ORDER BY table_name;
      `
    });

    if (colError) {
      // Try direct query if RPC doesn't work
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('*')
        .eq('column_name', 'school_id')
        .eq('table_schema', 'public');
      
      if (!error && data) {
        discoveries.tables_with_school_id = data;
        console.log(`✅ Found ${data.length} tables with school_id column`);
        data.forEach(col => {
          console.log(`   - ${col.table_name}.${col.column_name}: ${col.data_type} (${col.udt_name})`);
        });
      }
    } else if (schoolIdColumns) {
      discoveries.tables_with_school_id = schoolIdColumns;
      console.log(`✅ Found ${schoolIdColumns.length} tables with school_id column`);
      schoolIdColumns.forEach(col => {
        console.log(`   - ${col.table_name}.${col.column_name}: ${col.data_type} (${col.udt_name})`);
      });
    }

    // 2. Discover ALL policies on ALL tables
    console.log('\n2️⃣ Discovering ALL RLS policies...');
    const { data: allPolicies, error: polError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual::text as qual_text,
          with_check::text as with_check_text
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname;
      `
    });

    if (!polError && allPolicies) {
      discoveries.all_policies = allPolicies;
      console.log(`✅ Found ${allPolicies.length} total RLS policies`);
      
      // Group by table
      const policiesByTable = {};
      allPolicies.forEach(pol => {
        if (!policiesByTable[pol.tablename]) {
          policiesByTable[pol.tablename] = [];
        }
        policiesByTable[pol.tablename].push(pol.policyname);
      });
      
      Object.entries(policiesByTable).forEach(([table, policies]) => {
        console.log(`   - ${table}: ${policies.length} policies`);
        policies.forEach(p => console.log(`     • ${p}`));
      });
    }

    // 3. Discover policies that reference school_id
    console.log('\n3️⃣ Discovering policies that reference school_id...');
    if (allPolicies) {
      const schoolIdPolicies = allPolicies.filter(pol => 
        (pol.qual_text && pol.qual_text.includes('school_id')) ||
        (pol.with_check_text && pol.with_check_text.includes('school_id'))
      );
      
      discoveries.policies_referencing_school_id = schoolIdPolicies;
      console.log(`✅ Found ${schoolIdPolicies.length} policies referencing school_id`);
      schoolIdPolicies.forEach(pol => {
        console.log(`   - ${pol.tablename}.${pol.policyname}`);
      });
    }

    // 4. Discover foreign key constraints
    console.log('\n4️⃣ Discovering foreign key constraints on school_id...');
    const { data: fkConstraints, error: fkError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'school_id'
          AND tc.table_schema = 'public'
        ORDER BY tc.table_name;
      `
    });

    if (!fkError && fkConstraints) {
      discoveries.foreign_keys = fkConstraints;
      console.log(`✅ Found ${fkConstraints.length} foreign key constraints`);
      fkConstraints.forEach(fk => {
        console.log(`   - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    }

    // 5. Discover indexes on school_id
    console.log('\n5️⃣ Discovering indexes on school_id columns...');
    const { data: indexes, error: idxError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          t.relname AS table_name,
          i.relname AS index_name,
          a.attname AS column_name,
          ix.indisunique AS is_unique,
          ix.indisprimary AS is_primary
        FROM pg_class t
        JOIN pg_index ix ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
        WHERE t.relkind = 'r'
          AND a.attname = 'school_id'
          AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ORDER BY t.relname, i.relname;
      `
    });

    if (!idxError && indexes) {
      discoveries.indexes = indexes;
      console.log(`✅ Found ${indexes.length} indexes on school_id`);
      indexes.forEach(idx => {
        console.log(`   - ${idx.table_name}: ${idx.index_name} ${idx.is_unique ? '(UNIQUE)' : ''}`);
      });
    }

    // 6. Check student_assessments table specifically
    console.log('\n6️⃣ Checking student_assessments table structure...');
    const { data: assessmentCols, error: assError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          column_name,
          data_type,
          udt_name,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'student_assessments'
        AND table_schema = 'public'
        AND column_name IN ('school_id', 'student_profile_id', 'id')
        ORDER BY ordinal_position;
      `
    });

    if (!assError && assessmentCols) {
      console.log('✅ student_assessments key columns:');
      assessmentCols.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.udt_name})`);
      });
    }

    // 7. Check recommendations table (discovered from error)
    console.log('\n7️⃣ Checking recommendations table structure...');
    const { data: recCols, error: recError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          column_name,
          data_type,
          udt_name,
          character_maximum_length,
          is_nullable
        FROM information_schema.columns
        WHERE table_name = 'recommendations'
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (!recError && recCols) {
      console.log('✅ recommendations table columns:');
      recCols.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.udt_name})`);
      });
      
      // Check if it has school_id
      const hasSchoolId = recCols.some(col => col.column_name === 'school_id');
      if (hasSchoolId) {
        console.log('   ⚠️  recommendations table HAS school_id column');
      } else {
        console.log('   ℹ️  recommendations table does NOT have school_id column');
      }
    }

    // Save discoveries to file
    const fs = require('fs');
    fs.writeFileSync(
      'database-discovery-results-jan-14-2026.json',
      JSON.stringify(discoveries, null, 2)
    );

    console.log('\n✅ Discovery complete! Results saved to database-discovery-results-jan-14-2026.json');
    
    // Generate summary
    console.log('\n📊 DISCOVERY SUMMARY');
    console.log('===================');
    console.log(`Tables with school_id: ${discoveries.tables_with_school_id.length}`);
    console.log(`Total RLS policies: ${discoveries.all_policies.length}`);
    console.log(`Policies referencing school_id: ${discoveries.policies_referencing_school_id.length}`);
    console.log(`Foreign key constraints: ${discoveries.foreign_keys.length}`);
    console.log(`Indexes on school_id: ${discoveries.indexes.length}`);

    return discoveries;

  } catch (error) {
    console.error('❌ Discovery failed:', error);
    throw error;
  }
}

// Run discovery
if (require.main === module) {
  discoverCompleteState()
    .then(() => {
      console.log('\n✅ Discovery script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Discovery script failed:', error);
      process.exit(1);
    });
}

module.exports = { discoverCompleteState };
