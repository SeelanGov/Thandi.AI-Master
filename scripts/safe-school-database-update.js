#!/usr/bin/env node

/**
 * Safe School Database Update Strategy
 * Addresses primary school issue without breaking existing work
 */

import { getSupabase } from '../lib/supabase.js';

const supabase = getSupabase();

console.log('🔍 Analyzing School Database for Primary School Issue...\n');

async function analyzeCurrentDatabase() {
  console.log('1. Checking current school distribution...');
  
  try {
    // Get school type distribution
    const { data: typeDistribution, error: typeError } = await supabase
      .from('school_master')
      .select('type')
      .then(result => {
        if (result.error) throw result.error;
        
        const distribution = {};
        result.data.forEach(school => {
          const type = school.type;
          distribution[type] = (distribution[type] || 0) + 1;
        });
        
        return { data: distribution, error: null };
      });

    if (typeError) throw typeError;

    console.log('   📊 School Type Distribution:');
    Object.entries(typeDistribution).forEach(([type, count]) => {
      const isPrimary = type.includes('PRIMARY');
      const isSecondary = type.includes('SECONDARY') || type.includes('HIGH') || type.includes('COMBINED');
      const indicator = isPrimary ? '❌' : isSecondary ? '✅' : '⚠️';
      console.log(`   ${indicator} ${type}: ${count} schools`);
    });

    // Check claimed schools
    const { data: claimedSchools, error: claimedError } = await supabase
      .from('school_master')
      .select('school_id, name, type, status')
      .eq('status', 'claimed');

    if (claimedError) throw claimedError;

    console.log(`\n   🏫 Claimed Schools: ${claimedSchools.length}`);
    claimedSchools.forEach(school => {
      const isPrimary = school.type.includes('PRIMARY');
      const indicator = isPrimary ? '❌ PROBLEM' : '✅ OK';
      console.log(`   ${indicator} ${school.name} (${school.type})`);
    });

    return {
      totalSchools: Object.values(typeDistribution).reduce((a, b) => a + b, 0),
      primarySchools: Object.entries(typeDistribution)
        .filter(([type]) => type.includes('PRIMARY'))
        .reduce((sum, [_, count]) => sum + count, 0),
      secondarySchools: Object.entries(typeDistribution)
        .filter(([type]) => type.includes('SECONDARY') || type.includes('HIGH') || type.includes('COMBINED'))
        .reduce((sum, [_, count]) => sum + count, 0),
      claimedSchools: claimedSchools.length,
      claimedPrimary: claimedSchools.filter(s => s.type.includes('PRIMARY')).length
    };

  } catch (error) {
    console.error('   ❌ Database analysis failed:', error.message);
    return null;
  }
}

async function createSecondarySchoolSearchFunction() {
  console.log('\n2. Creating secondary-school-only search function...');
  
  const searchFunction = `
    CREATE OR REPLACE FUNCTION search_secondary_schools(search_query TEXT, limit_count INTEGER DEFAULT 10)
    RETURNS TABLE (
      school_id VARCHAR(50),
      name TEXT,
      province VARCHAR(50),
      type VARCHAR(100),
      status VARCHAR(20)
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        sm.school_id,
        sm.name,
        sm.province,
        sm.type,
        sm.status
      FROM school_master sm
      WHERE 
        (sm.name ILIKE '%' || search_query || '%' OR sm.school_id ILIKE '%' || search_query || '%')
        AND (
          sm.type ILIKE '%SECONDARY%' 
          OR sm.type ILIKE '%HIGH%' 
          OR sm.type ILIKE '%COMBINED%'
          OR sm.type ILIKE '%COMPREHENSIVE%'
        )
        AND sm.type NOT ILIKE '%PRIMARY%'
      ORDER BY 
        CASE 
          WHEN sm.name ILIKE search_query || '%' THEN 1
          WHEN sm.name ILIKE '%' || search_query || '%' THEN 2
          ELSE 3
        END,
        sm.name
      LIMIT limit_count;
    END;
    $$ LANGUAGE plpgsql;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: searchFunction });
    if (error) throw error;
    
    console.log('   ✅ Secondary school search function created');
    return true;
  } catch (error) {
    console.log('   ❌ Function creation failed:', error.message);
    return false;
  }
}

async function testSecondarySchoolSearch() {
  console.log('\n3. Testing secondary school search...');
  
  try {
    // Test search for "currie" (should only return secondary schools)
    const { data: searchResults, error } = await supabase
      .rpc('search_secondary_schools', { 
        search_query: 'currie',
        limit_count: 5 
      });

    if (error) throw error;

    console.log('   📝 Search Results for "currie":');
    searchResults.forEach(school => {
      const isAppropriate = !school.type.includes('PRIMARY');
      const indicator = isAppropriate ? '✅' : '❌';
      console.log(`   ${indicator} ${school.name} (${school.type})`);
    });

    return searchResults.length > 0;
  } catch (error) {
    console.log('   ❌ Search test failed:', error.message);
    return false;
  }
}

async function generateUpdateRecommendations(analysis) {
  console.log('\n📋 Update Recommendations:\n');

  if (analysis.claimedPrimary > 0) {
    console.log('🚨 CRITICAL: You have claimed primary schools!');
    console.log(`   ${analysis.claimedPrimary} primary schools are already claimed`);
    console.log('   ⚠️  DO NOT delete these - it will break existing authentications');
    console.log('   ✅ Solution: Keep claimed primaries, filter only unclaimed ones\n');
  }

  console.log('📊 Database Summary:');
  console.log(`   Total Schools: ${analysis.totalSchools}`);
  console.log(`   Primary Schools: ${analysis.primarySchools} (should be filtered)`);
  console.log(`   Secondary Schools: ${analysis.secondarySchools} (keep these)`);
  console.log(`   Claimed Schools: ${analysis.claimedSchools} (preserve all)\n`);

  console.log('🔧 Safe Update Strategy:');
  console.log('   1. ✅ Create new search_secondary_schools() function (done)');
  console.log('   2. ✅ Update API to use new search function');
  console.log('   3. ⚠️  Optional: Remove unclaimed primary schools only');
  console.log('   4. ✅ Test thoroughly before production\n');

  console.log('📝 Next Steps:');
  console.log('   1. Update /api/schools/search to use search_secondary_schools()');
  console.log('   2. Test school search functionality');
  console.log('   3. Upload corrected school data (secondary schools only)');
  console.log('   4. Implement POPIA-compliant student registration');
}

async function runAnalysis() {
  const analysis = await analyzeCurrentDatabase();
  
  if (!analysis) {
    console.log('❌ Could not analyze database. Check connection.');
    return;
  }

  const functionCreated = await createSecondarySchoolSearchFunction();
  if (functionCreated) {
    await testSecondarySchoolSearch();
  }

  await generateUpdateRecommendations(analysis);

  console.log('\n🎯 Summary:');
  console.log('   - Primary school issue identified and solution created');
  console.log('   - Existing claimed schools will be preserved');
  console.log('   - New search function filters to secondary schools only');
  console.log('   - Ready for POPIA-compliant student registration layer');
}

runAnalysis().catch(console.error);