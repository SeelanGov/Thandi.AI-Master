// lib/rag/__tests__/minimum-career-count.property.test.js
// Property-based test for minimum career count guarantee
// Validates: Requirements 1.1, 1.2, 3.1

import { matchCareersToProfile } from '../career-matcher.js';

/**
 * Property Test 1: Minimum Career Count Guarantee
 * Validates: Requirements 1.1, 1.2, 3.1
 * 
 * Property: The system must always return at least 3 career recommendations
 * for any valid student profile, using intelligent fallbacks when necessary.
 */
export async function testMinimumCareerCountGuarantee() {
  console.log('🧪 Property Test 1: Minimum Career Count Guarantee');
  
  const results = [];
  const testProfiles = generateTestProfiles(100); // Generate 100 diverse profiles
  
  for (let i = 0; i < testProfiles.length; i++) {
    const profile = testProfiles[i];
    
    try {
      const startTime = Date.now();
      const careers = await matchCareersToProfile(profile, {
        limit: 5,
        minSimilarity: 0.6,
        useHybrid: true
      });
      const duration = Date.now() - startTime;
      
      const careerCount = careers ? careers.length : 0;
      const hasMinimum = careerCount >= 3;
      
      // Check career quality
      const validCareers = careers ? careers.filter(career => 
        career && 
        career.title && 
        career.title.length > 0 &&
        career.description &&
        career.source
      ) : [];
      
      const validCareerCount = validCareers.length;
      const hasValidMinimum = validCareerCount >= 3;
      
      // Check source diversity (should have mix of RAG and fallback when needed)
      const sources = careers ? [...new Set(careers.map(c => c.source))] : [];
      const hasFallbacks = sources.includes('fallback') || sources.includes('emergency_fallback');
      
      results.push({
        iteration: i,
        profile: {
          grade: profile.grade,
          subjectCount: profile.subjects ? profile.subjects.length : 0,
          hasInterests: profile.interests && profile.interests.length > 0
        },
        careerCount,
        validCareerCount,
        hasMinimum,
        hasValidMinimum,
        hasFallbacks,
        sources,
        duration,
        success: true
      });
      
    } catch (error) {
      results.push({
        iteration: i,
        profile: {
          grade: profile.grade,
          subjectCount: profile.subjects ? profile.subjects.length : 0
        },
        error: error.message,
        success: false
      });
    }
  }
  
  // Analyze results
  const successfulResults = results.filter(r => r.success);
  const failedResults = results.filter(r => !r.success);
  
  console.log(`   📊 Results from ${results.length} test profiles:`);
  console.log(`   ✅ Successful queries: ${successfulResults.length}/${results.length} (${(successfulResults.length / results.length * 100).toFixed(1)}%)`);
  
  if (failedResults.length > 0) {
    console.log(`   ❌ Failed queries: ${failedResults.length}`);
    console.log(`   🔍 Sample errors: ${failedResults.slice(0, 3).map(r => r.error).join(', ')}`);
  }
  
  // Career count analysis
  const careerCounts = successfulResults.map(r => r.careerCount);
  const validCareerCounts = successfulResults.map(r => r.validCareerCount);
  
  const minCareerCount = Math.min(...careerCounts);
  const maxCareerCount = Math.max(...careerCounts);
  const avgCareerCount = careerCounts.reduce((sum, c) => sum + c, 0) / careerCounts.length;
  
  const minValidCareerCount = Math.min(...validCareerCounts);
  const avgValidCareerCount = validCareerCounts.reduce((sum, c) => sum + c, 0) / validCareerCounts.length;
  
  console.log(`   📈 Career count statistics:`);
  console.log(`      - Min careers: ${minCareerCount}`);
  console.log(`      - Max careers: ${maxCareerCount}`);
  console.log(`      - Avg careers: ${avgCareerCount.toFixed(1)}`);
  console.log(`      - Min valid careers: ${minValidCareerCount}`);
  console.log(`      - Avg valid careers: ${avgValidCareerCount.toFixed(1)}`);
  
  // Minimum requirement compliance
  const profilesWithMinimum = successfulResults.filter(r => r.hasMinimum).length;
  const profilesWithValidMinimum = successfulResults.filter(r => r.hasValidMinimum).length;
  const minimumCompliance = (profilesWithMinimum / successfulResults.length) * 100;
  const validMinimumCompliance = (profilesWithValidMinimum / successfulResults.length) * 100;
  
  console.log(`   🎯 Minimum requirement compliance:`);
  console.log(`      - Profiles with ≥3 careers: ${profilesWithMinimum}/${successfulResults.length} (${minimumCompliance.toFixed(1)}%)`);
  console.log(`      - Profiles with ≥3 valid careers: ${profilesWithValidMinimum}/${successfulResults.length} (${validMinimumCompliance.toFixed(1)}%)`);
  
  // Fallback system usage
  const profilesWithFallbacks = successfulResults.filter(r => r.hasFallbacks).length;
  const fallbackUsage = (profilesWithFallbacks / successfulResults.length) * 100;
  
  console.log(`   🔄 Fallback system usage:`);
  console.log(`      - Profiles using fallbacks: ${profilesWithFallbacks}/${successfulResults.length} (${fallbackUsage.toFixed(1)}%)`);
  
  // Source diversity analysis
  const allSources = [...new Set(successfulResults.flatMap(r => r.sources))];
  console.log(`   🎨 Source diversity: ${allSources.join(', ')}`);
  
  // Performance analysis
  const durations = successfulResults.map(r => r.duration);
  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const maxDuration = Math.max(...durations);
  
  console.log(`   ⏱️ Performance:`);
  console.log(`      - Avg response time: ${avgDuration.toFixed(0)}ms`);
  console.log(`      - Max response time: ${maxDuration}ms`);
  
  // Property validation
  const property1Valid = 
    successfulResults.length >= results.length * 0.95 && // 95% success rate
    validMinimumCompliance >= 95 && // 95% of profiles get ≥3 valid careers
    minValidCareerCount >= 3 && // Absolute minimum is 3 valid careers
    avgValidCareerCount >= 3.5; // Average should be above minimum
  
  console.log(`   🎯 Property 1 (Minimum Career Count): ${property1Valid ? '✅ VALID' : '❌ INVALID'}`);
  
  if (!property1Valid) {
    console.log(`   ⚠️ Violations:`);
    if (successfulResults.length < results.length * 0.95) {
      console.log(`      - Success rate too low: ${(successfulResults.length / results.length * 100).toFixed(1)}%`);
    }
    if (validMinimumCompliance < 95) {
      console.log(`      - Valid minimum compliance too low: ${validMinimumCompliance.toFixed(1)}%`);
    }
    if (minValidCareerCount < 3) {
      console.log(`      - Absolute minimum too low: ${minValidCareerCount} valid careers`);
    }
    if (avgValidCareerCount < 3.5) {
      console.log(`      - Average too low: ${avgValidCareerCount.toFixed(1)} valid careers`);
    }
  }
  
  return property1Valid;
}

/**
 * Generate diverse test profiles for property testing
 * @param {number} count - Number of profiles to generate
 * @returns {Array} - Array of test profiles
 */
function generateTestProfiles(count) {
  const profiles = [];
  
  // South African subjects
  const allSubjects = [
    'Mathematics', 'Physical Sciences', 'Life Sciences', 'Information Technology',
    'Computer Applications Technology', 'Business Studies', 'Accounting', 'Economics',
    'English', 'Afrikaans', 'Visual Arts', 'Music', 'Drama', 'Design',
    'Geography', 'History', 'Tourism', 'Consumer Studies', 'Agricultural Sciences'
  ];
  
  const interests = [
    'technology', 'healthcare', 'business', 'education', 'engineering',
    'creative arts', 'science', 'finance', 'sports', 'environment'
  ];
  
  for (let i = 0; i < count; i++) {
    // Generate random grade (10-12)
    const grade = 10 + (i % 3);
    
    // Generate random subject combination (3-7 subjects)
    const subjectCount = 3 + (i % 5);
    const shuffledSubjects = [...allSubjects].sort(() => Math.random() - 0.5);
    const subjects = shuffledSubjects.slice(0, subjectCount);
    
    // Generate random interests (0-3 interests)
    const interestCount = i % 4;
    const shuffledInterests = [...interests].sort(() => Math.random() - 0.5);
    const profileInterests = shuffledInterests.slice(0, interestCount);
    
    // Generate random marks
    const mathMark = 30 + (i * 7) % 70; // 30-99
    const mathType = i % 2 === 0 ? 'Mathematics' : 'Mathematical Literacy';
    
    profiles.push({
      grade,
      subjects,
      interests: profileInterests,
      mathMark,
      mathType,
      province: ['Gauteng', 'Western Cape', 'KwaZulu-Natal'][i % 3],
      budgetLimit: ['low', 'medium', 'high'][i % 3]
    });
  }
  
  // Add some edge cases
  profiles.push(
    // Minimal profile
    { grade: 10, subjects: ['Mathematics'], interests: [] },
    
    // STEM profile
    { grade: 11, subjects: ['Mathematics', 'Physical Sciences', 'Information Technology'], interests: ['technology', 'engineering'] },
    
    // Business profile
    { grade: 12, subjects: ['Mathematics', 'Business Studies', 'Accounting', 'Economics'], interests: ['business', 'finance'] },
    
    // Creative profile
    { grade: 11, subjects: ['English', 'Visual Arts', 'Drama', 'Music'], interests: ['creative arts'] },
    
    // Mixed profile
    { grade: 12, subjects: ['Mathematics', 'Life Sciences', 'Business Studies', 'Visual Arts'], interests: ['healthcare', 'business', 'creative arts'] },
    
    // Large profile
    { grade: 12, subjects: allSubjects.slice(0, 10), interests: interests.slice(0, 5) }
  );
  
  return profiles;
}

/**
 * Run minimum career count property test
 */
export async function runMinimumCareerCountTest() {
  console.log('🧪 Running Minimum Career Count Property Test...\n');
  
  try {
    const result = await testMinimumCareerCountGuarantee();
    
    console.log(`\n🎯 Property Test Result: ${result ? '✅ PASSED' : '❌ FAILED'}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Property test execution failed:', error);
    return false;
  }
}

// Export for use in test runners
export default {
  testMinimumCareerCountGuarantee,
  runMinimumCareerCountTest
};