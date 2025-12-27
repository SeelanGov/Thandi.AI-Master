#!/usr/bin/env node

/**
 * Check current school database state before updating
 */

import { getSupabase } from '../lib/supabase.js';

const supabase = getSupabase();

console.log('🔍 Checking Current School Database State...\n');

async function checkDatabase() {
  try {
    // Get total count and distribution
    const { data: schools, error } = await supabase
      .from('school_master')
      .select('school_id, name, type, status, province');

    if (error) throw error;

    console.log(`📊 Total schools in database: ${schools.length}\n`);

    // Analyze by type
    const typeDistribution = {};
    const statusDistribution = {};
    const provinceDistribution = {};

    schools.forEach(school => {
      // Type analysis
      typeDistribution[school.type] = (typeDistribution[school.type] || 0) + 1;
      
      // Status analysis
      statusDistribution[school.status] = (statusDistribution[school.status] || 0) + 1;
      
      // Province analysis
      provinceDistribution[school.province] = (provinceDistribution[school.province] || 0) + 1;
    });

    // Show type distribution with primary school highlighting
    console.log('🏫 School Type Distribution:');
    Object.entries(typeDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        const isPrimary = type.includes('PRIMARY');
        const isSecondary = type.includes('SECONDARY') || type.includes('HIGH') || type.includes('COMBINED');
        
        let indicator = '⚠️';
        if (isPrimary) indicator = '❌ PRIMARY';
        if (isSecondary) indicator = '✅ SECONDARY';
        
        console.log(`   ${indicator} ${type}: ${count}`);
      });

    // Show status distribution
    console.log('\n📋 Status Distribution:');
    Object.entries(statusDistribution).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // Show claimed schools
    const claimedSchools = schools.filter(s => s.status === 'claimed');
    if (claimedSchools.length > 0) {
      console.log('\n🏫 Claimed Schools (WILL BE PRESERVED):');
      claimedSchools.forEach(school => {
        const isPrimary = school.type.includes('PRIMARY');
        const indicator = isPrimary ? '❌ PRIMARY' : '✅ SECONDARY';
        console.log(`   ${indicator} ${school.name} (${school.type})`);
      });
    }

    // Show province distribution (top 5)
    console.log('\n🌍 Top Provinces:');
    Object.entries(provinceDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([province, count]) => {
        console.log(`   ${province}: ${count} schools`);
      });

    // Test search functionality
    console.log('\n🔍 Testing Current Search (with primary filter):');
    const { data: searchResults, error: searchError } = await supabase
      .from('school_master')
      .select('school_id, name, type')
      .not('type', 'ilike', '%PRIMARY%')
      .ilike('name', '%currie%')
      .limit(5);

    if (!searchError && searchResults) {
      console.log(`   Found ${searchResults.length} results for "currie" (excluding primaries):`);
      searchResults.forEach(school => {
        console.log(`   ✅ ${school.name} (${school.type})`);
      });
    }

    // Summary and recommendations
    const primaryCount = Object.entries(typeDistribution)
      .filter(([type]) => type.includes('PRIMARY'))
      .reduce((sum, [, count]) => sum + count, 0);

    const secondaryCount = Object.entries(typeDistribution)
      .filter(([type]) => type.includes('SECONDARY') || type.includes('HIGH') || type.includes('COMBINED'))
      .reduce((sum, [, count]) => sum + count, 0);

    console.log('\n📊 Summary:');
    console.log(`   Primary schools: ${primaryCount} (should be removed)`);
    console.log(`   Secondary schools: ${secondaryCount} (keep these)`);
    console.log(`   Claimed schools: ${claimedSchools.length} (will be preserved)`);
    console.log(`   Total to update: ${schools.length - claimedSchools.length} unclaimed schools`);

    if (primaryCount > 0) {
      console.log('\n⚠️  Issues Found:');
      console.log(`   - ${primaryCount} primary schools in database`);
      console.log('   - These should be filtered out for THANDI (Grades 10-12 focus)');
      console.log('   - Update recommended with secondary schools only');
    }

    console.log('\n📋 Ready for Update:');
    console.log('   1. Place your corrected school data in thandi_master_school name file/');
    console.log('   2. Run: node scripts/analyze-master-school-folder.js');
    console.log('   3. Run: node scripts/update-school-master-data.js "path/to/your/file"');

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase();