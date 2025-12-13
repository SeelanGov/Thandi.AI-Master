// lib/rag/__tests__/broad-profile-handling.property.test.js
// Property-based test for broad profile handling
// **Feature: rag-filtering-enhancement, Property 8: Broad Profile Handling**
// **Validates: Requirements 1.4, 1.5**

import { matchCareersToProfile, analyzeProfileComplexity } from '../career-matcher.js';

/**
 * Property Test 8: Broad Profile Handling
 * **Feature: rag-filtering-enhancement, Property 8: Broad Profile Handling**
 * **Validates: Requirements 1.4, 1.5**
 * 
 * Property: For any student with comprehensive subject profiles, the system should 
 * return up to 5 career recommendations without artificial limits
 */
export async function testBroadProfileHandling() {
  console.log('🧪 Property Test 8: Broad Profile Handling');
  console.log('**Feature: rag-filtering-enhancement, Property 8: Broad Profile Handling**');
  console.log('**Validates: Requirements 1.4, 1.5**\n');
  
  const results = [];
  const testProfiles = generateBroadProfileTestCases(100); // Generate 100 diverse broad profiles
  
  for (let i = 0; i < testProfiles.length; i++) {
    const profile = testProfiles[i];
    
    try {
      const startTime = Date.now();
      
      // Analyze profile complexity first
      const complexity = analyzeProfileComplexity(profile);
      
      // Match careers with the profile
      const careers = await matchCareersToProfile(profile, {
        minSimilarity: 0.6,
        useHybrid: true
      });
      
      const duration = Date.now() - startTime;
      
      const careerCount = careers ? careers.length : 0;
      
      // Validate career quality
      const validCareers = careers ? careers.filter(career => 
        career && 
        career.title && 
        career.title.length > 0 &&
        career.description &&
        career.source &&
        career.confidence !== undefined
      ) : [];
      
      const validCareerCount = validCareers.length;
      
      // Check if profile meets broad/comprehensive criteria
      const isBroadProfile = complexity.profileType === 'broad' || complexity.profileType === 'comprehensive';
      const isComprehensiveProfile = complexity.profileType === 'comprehensive';
      
      // Property validations
      const meetsMinimum = careerCount >= 3; // Always at least 3
      const respectsMaximum = careerCount <= 5; // Never more than 5
      const noArtificialLimit = careerCount > 2; // No artificial 2-career limit (Req 1.5)
      const appropriateForComplexity = 
        (complexity.profileType === 'basic' && careerCount >= 3) ||
        (complexity.profileType === 'moderate' && careerCount >= 3) ||
        (complexity.profileType === 'broad' && careerCount >= 4) ||
        (complexity.profileType === 'comprehensive' && careerCount >= 4);
      
      // Comprehensive profiles should get up to 5 careers (Req 1.4)
      const comprehensiveHandling = !isComprehensiveProfile || careerCount <= 5;
      
      // Check career diversity for broad profiles
      const categories = careers ? [...new Set(careers.map(c => c.category).filter(Boolean))] : [];
      const hasDiversity = categories.length >= Math.min(2, careerCount);
      
      // Check source diversity (should use both RAG and fallback when needed)
      const sources = careers ? [...new Set(careers.map(c => c.source))] : [];
      const hasSourceDiversity = sources.length >= 1;
      
      results.push({
        iteration: i,
        profile: {
          grade: profile.grade,
          subjectCount: profile.subjects ? profile.subjects.length : 0,
          interestCount: profile.interests ? profile.interests.length : 0,
          hasMarks: !!profile.marks,
          hasPreferences: !!profile.careerPreferences
        },
        complexity: {
          score: complexity.score,
          type: complexity.profileType,
          recommendedCount: complexity.recommendedCount
        },
        careerCount,
        validCareerCount,
        categories: categories.length,
        sources: sources.length,
        isBroadProfile,
        isComprehensiveProfile,
        meetsMinimum,
        respectsMaximum,
        noArtificialLimit,
        appropriateForComplexity,
        comprehensiveHandling,
        hasDiversity,
        hasSourceDiversity,
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
  
  console.log(`   📊 Results from ${results.length} broad profile test cases:`);
  console.log(`   ✅ Successful queries: ${successfulResults.length}/${results.length} (${(successfulResults.length / results.length * 100).toFixed(1)}%)`);
  
  if (failedResults.length > 0) {
    console.log(`   ❌ Failed queries: ${failedResults.length}`);
    console.log(`   🔍 Sample errors: ${failedResults.slice(0, 3).map(r => r.error).join(', ')}`);
  }
  
  // Profile complexity distribution
  const profileTypes = ['basic', 'moderate', 'broad', 'comprehensive'];
  console.log(`   📈 Profile complexity distribution:`);
  profileTypes.forEach(type => {
    const count = successfulResults.filter(r => r.complexity.type === type).length;
    const percentage = (count / successfulResults.length * 100).toFixed(1);
    console.log(`      - ${type}: ${count} (${percentage}%)`);
  });
  
  // Career count analysis by profile type
  console.log(`   📊 Career count analysis by profile type:`);
  profileTypes.forEach(type => {
    const typeResults = successfulResults.filter(r => r.complexity.type === type);
    if (typeResults.length > 0) {
      const careerCounts = typeResults.map(r => r.careerCount);
      const minCount = Math.min(...careerCounts);
      const maxCount = Math.max(...careerCounts);
      const avgCount = (careerCounts.reduce((sum, c) => sum + c, 0) / careerCounts.length).toFixed(1);
      
      console.log(`      - ${type}: min=${minCount}, max=${maxCount}, avg=${avgCount}`);
    }
  });
  
  // Property validation metrics
  const meetsMinimumCount = successfulResults.filter(r => r.meetsMinimum).length;
  const respectsMaximumCount = successfulResults.filter(r => r.respectsMaximum).length;
  const noArtificialLimitCount = successfulResults.filter(r => r.noArtificialLimit).length;
  const appropriateForComplexityCount = successfulResults.filter(r => r.appropriateForComplexity).length;
  const comprehensiveHandlingCount = successfulResults.filter(r => r.comprehensiveHandling).length;
  const hasDiversityCount = successfulResults.filter(r => r.hasDiversity).length;
  
  console.log(`   🎯 Property validation metrics:`);
  console.log(`      - Meets minimum (≥3): ${meetsMinimumCount}/${successfulResults.length} (${(meetsMinimumCount / successfulResults.length * 100).toFixed(1)}%)`);
  console.log(`      - Respects maximum (≤5): ${respectsMaximumCount}/${successfulResults.length} (${(respectsMaximumCount / successfulResults.length * 100).toFixed(1)}%)`);
  console.log(`      - No artificial limit (>2): ${noArtificialLimitCount}/${successfulResults.length} (${(noArtificialLimitCount / successfulResults.length * 100).toFixed(1)}%)`);
  console.log(`      - Appropriate for complexity: ${appropriateForComplexityCount}/${successfulResults.length} (${(appropriateForComplexityCount / successfulResults.length * 100).toFixed(1)}%)`);
  console.log(`      - Comprehensive handling: ${comprehensiveHandlingCount}/${successfulResults.length} (${(comprehensiveHandlingCount / successfulResults.length * 100).toFixed(1)}%)`);
  console.log(`      - Has diversity: ${hasDiversityCount}/${successfulResults.length} (${(hasDiversityCount / successfulResults.length * 100).toFixed(1)}%)`);
  
  // Specific analysis for comprehensive profiles (Requirement 1.4)
  const comprehensiveResults = successfulResults.filter(r => r.isComprehensiveProfile);
  if (comprehensiveResults.length > 0) {
    const comprehensiveCareerCounts = comprehensiveResults.map(r => r.careerCount);
    const avgComprehensiveCareers = (comprehensiveCareerCounts.reduce((sum, c) => sum + c, 0) / comprehensiveCareerCounts.length).toFixed(1);
    const maxComprehensiveCareers = Math.max(...comprehensiveCareerCounts);
    const comprehensiveGetsUpTo5 = comprehensiveResults.filter(r => r.careerCount <= 5 && r.careerCount >= 4).length;
    
    console.log(`   🎯 Comprehensive profile analysis (Requirement 1.4):`);
    console.log(`      - Comprehensive profiles tested: ${comprehensiveResults.length}`);
    console.log(`      - Average careers for comprehensive: ${avgComprehensiveCareers}`);
    console.log(`      - Max careers for comprehensive: ${maxComprehensiveCareers}`);
    console.log(`      - Gets 4-5 careers: ${comprehensiveGetsUpTo5}/${comprehensiveResults.length} (${(comprehensiveGetsUpTo5 / comprehensiveResults.length * 100).toFixed(1)}%)`);
  }
  
  // Performance analysis
  const durations = successfulResults.map(r => r.duration);
  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const maxDuration = Math.max(...durations);
  
  console.log(`   ⏱️ Performance:`);
  console.log(`      - Avg response time: ${avgDuration.toFixed(0)}ms`);
  console.log(`      - Max response time: ${maxDuration}ms`);
  
  // Overall property validation
  const successRate = successfulResults.length / results.length;
  const minimumCompliance = meetsMinimumCount / successfulResults.length;
  const maximumCompliance = respectsMaximumCount / successfulResults.length;
  const noArtificialLimitCompliance = noArtificialLimitCount / successfulResults.length;
  const complexityCompliance = appropriateForComplexityCount / successfulResults.length;
  const comprehensiveCompliance = comprehensiveHandlingCount / successfulResults.length;
  
  const property8Valid = 
    successRate >= 0.95 && // 95% success rate
    minimumCompliance >= 0.95 && // 95% meet minimum
    maximumCompliance >= 0.98 && // 98% respect maximum
    noArtificialLimitCompliance >= 0.95 && // 95% avoid artificial 2-career limit
    complexityCompliance >= 0.90 && // 90% appropriate for complexity
    comprehensiveCompliance >= 0.98; // 98% handle comprehensive profiles correctly
  
  console.log(`   🎯 Property 8 (Broad Profile Handling): ${property8Valid ? '✅ VALID' : '❌ INVALID'}`);
  
  if (!property8Valid) {
    console.log(`   ⚠️ Violations:`);
    if (successRate < 0.95) {
      console.log(`      - Success rate too low: ${(successRate * 100).toFixed(1)}%`);
    }
    if (minimumCompliance < 0.95) {
      console.log(`      - Minimum compliance too low: ${(minimumCompliance * 100).toFixed(1)}%`);
    }
    if (maximumCompliance < 0.98) {
      console.log(`      - Maximum compliance too low: ${(maximumCompliance * 100).toFixed(1)}%`);
    }
    if (noArtificialLimitCompliance < 0.95) {
      console.log(`      - Artificial limit avoidance too low: ${(noArtificialLimitCompliance * 100).toFixed(1)}%`);
    }
    if (complexityCompliance < 0.90) {
      console.log(`      - Complexity appropriateness too low: ${(complexityCompliance * 100).toFixed(1)}%`);
    }
    if (comprehensiveCompliance < 0.98) {
      console.log(`      - Comprehensive handling too low: ${(comprehensiveCompliance * 100).toFixed(1)}%`);
    }
  }
  
  return property8Valid;
}

/**
 * Generate diverse broad profile test cases for property testing
 * @param {number} count - Number of profiles to generate
 * @returns {Array} - Array of broad profile test cases
 */
function generateBroadProfileTestCases(count) {
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
    'creative arts', 'science', 'finance', 'sports', 'environment',
    'research', 'innovation', 'leadership', 'entrepreneurship', 'design'
  ];
  
  // Generate profiles with varying complexity levels
  for (let i = 0; i < count; i++) {
    const grade = 10 + (i % 3); // Grades 10-12
    
    // Generate profiles with different complexity levels
    let subjectCount, interestCount, hasDetailedPreferences, highPerformanceCount;
    
    const complexityLevel = i % 4;
    switch (complexityLevel) {
      case 0: // Basic profiles (25%)
        subjectCount = 2 + (i % 2); // 2-3 subjects
        interestCount = 0 + (i % 2); // 0-1 interests
        hasDetailedPreferences = false;
        highPerformanceCount = 1 + (i % 2); // 1-2 high performance
        break;
      case 1: // Moderate profiles (25%)
        subjectCount = 3 + (i % 2); // 3-4 subjects
        interestCount = 1 + (i % 2); // 1-2 interests
        hasDetailedPreferences = i % 3 === 0;
        highPerformanceCount = 2 + (i % 2); // 2-3 high performance
        break;
      case 2: // Broad profiles (25%)
        subjectCount = 4 + (i % 2); // 4-5 subjects
        interestCount = 2 + (i % 3); // 2-4 interests
        hasDetailedPreferences = i % 2 === 0;
        highPerformanceCount = 3 + (i % 3); // 3-5 high performance
        break;
      case 3: // Comprehensive profiles (25%)
        subjectCount = 5 + (i % 3); // 5-7 subjects
        interestCount = 3 + (i % 3); // 3-5 interests
        hasDetailedPreferences = true;
        highPerformanceCount = 4 + (i % 3); // 4-6 high performance
        break;
    }
    
    // Select subjects
    const shuffledSubjects = [...allSubjects].sort(() => Math.random() - 0.5);
    const subjects = shuffledSubjects.slice(0, subjectCount);
    
    // Select interests
    const shuffledInterests = [...interests].sort(() => Math.random() - 0.5);
    const profileInterests = shuffledInterests.slice(0, interestCount);
    
    // Generate marks with specified high performance count
    const marks = {};
    subjects.forEach((subject, index) => {
      if (index < highPerformanceCount) {
        marks[subject] = 70 + (i * 3) % 30; // 70-99 for high performance
      } else {
        marks[subject] = 50 + (i * 2) % 20; // 50-69 for moderate performance
      }
    });
    
    // Generate career preferences
    let careerPreferences = '';
    if (hasDetailedPreferences) {
      const preferenceTemplates = [
        'I have diverse interests spanning multiple disciplines and am looking for innovative career opportunities.',
        'My comprehensive academic background allows me to explore interdisciplinary career paths.',
        'I am interested in careers that combine my strengths in multiple subject areas.',
        'I seek challenging roles that utilize my broad skill set and diverse academic interests.',
        'My goal is to find a career that leverages my multidisciplinary knowledge and interests.'
      ];
      careerPreferences = preferenceTemplates[i % preferenceTemplates.length];
    }
    
    profiles.push({
      grade,
      subjects,
      interests: profileInterests,
      marks,
      careerPreferences: hasDetailedPreferences ? careerPreferences : undefined,
      mathMark: marks['Mathematics'] || marks['Mathematical Literacy'] || 60,
      mathType: subjects.includes('Mathematics') ? 'Mathematics' : 'Mathematical Literacy',
      province: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape'][i % 4],
      budgetLimit: ['low', 'medium', 'high'][i % 3]
    });
  }
  
  // Add specific edge cases for comprehensive testing
  profiles.push(
    // Maximum comprehensive profile
    {
      grade: 12,
      subjects: allSubjects.slice(0, 8),
      interests: interests.slice(0, 6),
      marks: Object.fromEntries(allSubjects.slice(0, 8).map(s => [s, 85 + Math.random() * 15])),
      careerPreferences: 'I have comprehensive interests across all academic disciplines including STEM, business, arts, and humanities. I am particularly interested in innovative, interdisciplinary careers that offer leadership opportunities and the chance to make a significant impact across multiple sectors.'
    },
    
    // STEM comprehensive profile
    {
      grade: 11,
      subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences', 'Information Technology', 'Computer Applications Technology'],
      interests: ['technology', 'engineering', 'science', 'research', 'innovation'],
      marks: { 'Mathematics': 90, 'Physical Sciences': 88, 'Life Sciences': 85, 'Information Technology': 92, 'Computer Applications Technology': 87 },
      careerPreferences: 'Strong STEM background with interests in cutting-edge technology and scientific research.'
    },
    
    // Business comprehensive profile
    {
      grade: 12,
      subjects: ['Mathematics', 'Business Studies', 'Accounting', 'Economics', 'English', 'Geography'],
      interests: ['business', 'finance', 'entrepreneurship', 'leadership', 'economics'],
      marks: { 'Mathematics': 82, 'Business Studies': 88, 'Accounting': 90, 'Economics': 85, 'English': 78, 'Geography': 80 },
      careerPreferences: 'Comprehensive business education with strong analytical skills and leadership aspirations.'
    },
    
    // Creative comprehensive profile
    {
      grade: 11,
      subjects: ['English', 'Visual Arts', 'Drama', 'Music', 'Design', 'History'],
      interests: ['creative arts', 'design', 'media', 'education', 'culture'],
      marks: { 'English': 85, 'Visual Arts': 92, 'Drama': 88, 'Music': 90, 'Design': 94, 'History': 82 },
      careerPreferences: 'Passionate about creative expression with diverse artistic talents and cultural interests.'
    }
  );
  
  return profiles;
}

/**
 * Run broad profile handling property test
 */
export async function runBroadProfileHandlingTest() {
  console.log('🧪 Running Broad Profile Handling Property Test...\n');
  
  try {
    const result = await testBroadProfileHandling();
    
    console.log(`\n🎯 Property Test Result: ${result ? '✅ PASSED' : '❌ FAILED'}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Property test execution failed:', error);
    return false;
  }
}

// Export for use in test runners
export default {
  testBroadProfileHandling,
  runBroadProfileHandlingTest
};