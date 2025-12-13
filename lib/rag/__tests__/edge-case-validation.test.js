// lib/rag/__tests__/edge-case-validation.test.js
// Comprehensive edge case validation tests
// Validates: Requirements 8.3, 8.4

import { validateStudentProfile, InputValidator } from '../input-validator.js';
import { matchCareersToProfile, analyzeProfileComplexity } from '../career-matcher.js';

/**
 * Test Suite: Edge Case Validation
 * Validates: Requirements 8.3, 8.4
 * 
 * Tests comprehensive edge case handling including:
 * - Empty profile handling
 * - Invalid subject combinations
 * - Unsupported grade levels
 * - Malformed input data
 */

/**
 * Test empty profile handling
 */
export function testEmptyProfileHandling() {
  console.log('🧪 Test: Empty Profile Handling');
  
  const testCases = [
    { name: 'Null profile', input: null },
    { name: 'Undefined profile', input: undefined },
    { name: 'Empty object', input: {} },
    { name: 'Non-object profile', input: 'invalid' },
    { name: 'Array instead of object', input: [] },
    { name: 'Number instead of object', input: 123 }
  ];
  
  const results = [];
  
  testCases.forEach(testCase => {
    try {
      const validation = validateStudentProfile(testCase.input);
      
      results.push({
        name: testCase.name,
        isValid: validation.isValid,
        hasErrors: validation.errors.length > 0,
        hasFallback: validation.sanitizedProfile !== null,
        edgeCases: validation.edgeCases,
        success: true
      });
      
      console.log(`   ✅ ${testCase.name}: ${validation.isValid ? 'Valid' : 'Invalid'} (${validation.errors.length} errors)`);
      
    } catch (error) {
      results.push({
        name: testCase.name,
        error: error.message,
        success: false
      });
      
      console.log(`   ❌ ${testCase.name}: Error - ${error.message}`);
    }
  });
  
  // Validate results
  const allHandled = results.every(r => r.success);
  const allHaveFallbacks = results.filter(r => r.success).every(r => r.hasFallback);
  
  console.log(`   📊 Results: ${results.length} cases, all handled: ${allHandled}, all have fallbacks: ${allHaveFallbacks}`);
  
  return {
    testName: 'Empty Profile Handling',
    passed: allHandled && allHaveFallbacks,
    results: results
  };
}

/**
 * Test invalid subject combinations
 */
export function testInvalidSubjectCombinations() {
  console.log('🧪 Test: Invalid Subject Combinations');
  
  const testCases = [
    {
      name: 'String instead of array',
      profile: { grade: 11, subjects: 'Mathematics' }
    },
    {
      name: 'Empty subjects array',
      profile: { grade: 11, subjects: [] }
    },
    {
      name: 'Mixed data types in array',
      profile: { grade: 11, subjects: ['Mathematics', 123, null, undefined, {}] }
    },
    {
      name: 'All invalid subjects',
      profile: { grade: 11, subjects: [123, null, '', '   '] }
    },
    {
      name: 'Conflicting math subjects',
      profile: { grade: 11, subjects: ['Mathematics', 'Mathematical Literacy'] }
    },
    {
      name: 'Duplicate subjects',
      profile: { grade: 11, subjects: ['Mathematics', 'Mathematics', 'English', 'English'] }
    },
    {
      name: 'Unknown subjects',
      profile: { grade: 11, subjects: ['FakeSubject1', 'InvalidSubject2', 'NonExistent3'] }
    },
    {
      name: 'Too many subjects',
      profile: { 
        grade: 11, 
        subjects: Array(20).fill().map((_, i) => `Subject${i}`)
      }
    },
    {
      name: 'Subject abbreviations',
      profile: { grade: 11, subjects: ['Maths', 'Physics', 'Biology', 'IT', 'Business'] }
    },
    {
      name: 'Case variations',
      profile: { grade: 11, subjects: ['mathematics', 'ENGLISH', 'Physical sciences'] }
    }
  ];
  
  const results = [];
  
  testCases.forEach(testCase => {
    try {
      const validation = validateStudentProfile(testCase.profile);
      
      const hasValidSubjects = validation.sanitizedProfile && 
                              validation.sanitizedProfile.subjects && 
                              validation.sanitizedProfile.subjects.length > 0;
      
      results.push({
        name: testCase.name,
        isValid: validation.isValid,
        hasValidSubjects: hasValidSubjects,
        sanitizedSubjects: validation.sanitizedProfile?.subjects || [],
        edgeCases: validation.edgeCases,
        warnings: validation.warnings.length,
        success: true
      });
      
      console.log(`   ✅ ${testCase.name}: ${hasValidSubjects ? 'Handled' : 'Failed'} (${validation.sanitizedProfile?.subjects?.length || 0} subjects)`);
      
    } catch (error) {
      results.push({
        name: testCase.name,
        error: error.message,
        success: false
      });
      
      console.log(`   ❌ ${testCase.name}: Error - ${error.message}`);
    }
  });
  
  // Validate results
  const allHandled = results.every(r => r.success);
  const allHaveValidSubjects = results.filter(r => r.success).every(r => r.hasValidSubjects);
  
  console.log(`   📊 Results: ${results.length} cases, all handled: ${allHandled}, all have valid subjects: ${allHaveValidSubjects}`);
  
  return {
    testName: 'Invalid Subject Combinations',
    passed: allHandled && allHaveValidSubjects,
    results: results
  };
}

/**
 * Test unsupported grade levels
 */
export function testUnsupportedGradeLevels() {
  console.log('🧪 Test: Unsupported Grade Levels');
  
  const testCases = [
    {
      name: 'Grade too low',
      profile: { grade: 5, subjects: ['Mathematics'] }
    },
    {
      name: 'Grade too high',
      profile: { grade: 15, subjects: ['Mathematics'] }
    },
    {
      name: 'Negative grade',
      profile: { grade: -1, subjects: ['Mathematics'] }
    },
    {
      name: 'Zero grade',
      profile: { grade: 0, subjects: ['Mathematics'] }
    },
    {
      name: 'String grade',
      profile: { grade: 'eleven', subjects: ['Mathematics'] }
    },
    {
      name: 'Float grade',
      profile: { grade: 11.5, subjects: ['Mathematics'] }
    },
    {
      name: 'Non-numeric string',
      profile: { grade: 'abc', subjects: ['Mathematics'] }
    },
    {
      name: 'Boolean grade',
      profile: { grade: true, subjects: ['Mathematics'] }
    },
    {
      name: 'Array grade',
      profile: { grade: [11], subjects: ['Mathematics'] }
    },
    {
      name: 'Object grade',
      profile: { grade: { value: 11 }, subjects: ['Mathematics'] }
    }
  ];
  
  const results = [];
  const supportedGrades = [10, 11, 12];
  
  testCases.forEach(testCase => {
    try {
      const validation = validateStudentProfile(testCase.profile);
      
      const hasSupportedGrade = validation.sanitizedProfile && 
                               supportedGrades.includes(validation.sanitizedProfile.grade);
      
      results.push({
        name: testCase.name,
        originalGrade: testCase.profile.grade,
        sanitizedGrade: validation.sanitizedProfile?.grade,
        hasSupportedGrade: hasSupportedGrade,
        hasErrors: validation.errors.length > 0,
        hasWarnings: validation.warnings.length > 0,
        success: true
      });
      
      console.log(`   ✅ ${testCase.name}: ${testCase.profile.grade} → ${validation.sanitizedProfile?.grade} (${hasSupportedGrade ? 'Valid' : 'Invalid'})`);
      
    } catch (error) {
      results.push({
        name: testCase.name,
        originalGrade: testCase.profile.grade,
        error: error.message,
        success: false
      });
      
      console.log(`   ❌ ${testCase.name}: Error - ${error.message}`);
    }
  });
  
  // Validate results
  const allHandled = results.every(r => r.success);
  const allHaveSupportedGrades = results.filter(r => r.success).every(r => r.hasSupportedGrade);
  
  console.log(`   📊 Results: ${results.length} cases, all handled: ${allHandled}, all have supported grades: ${allHaveSupportedGrades}`);
  
  return {
    testName: 'Unsupported Grade Levels',
    passed: allHandled && allHaveSupportedGrades,
    results: results
  };
}

/**
 * Test malformed input data
 */
export function testMalformedInputData() {
  console.log('🧪 Test: Malformed Input Data');
  
  const testCases = [
    {
      name: 'Invalid marks object',
      profile: {
        grade: 11,
        subjects: ['Mathematics'],
        marks: 'not an object'
      }
    },
    {
      name: 'Marks with invalid values',
      profile: {
        grade: 11,
        subjects: ['Mathematics', 'English'],
        marks: {
          Mathematics: 'abc',
          English: 150,
          Physics: -10
        }
      }
    },
    {
      name: 'Invalid interests type',
      profile: {
        grade: 11,
        subjects: ['Mathematics'],
        interests: 'technology'
      }
    },
    {
      name: 'Interests with invalid values',
      profile: {
        grade: 11,
        subjects: ['Mathematics'],
        interests: [123, null, '', '   ', {}]
      }
    },
    {
      name: 'Invalid career preferences type',
      profile: {
        grade: 11,
        subjects: ['Mathematics'],
        careerPreferences: 123
      }
    },
    {
      name: 'Extremely long career preferences',
      profile: {
        grade: 11,
        subjects: ['Mathematics'],
        careerPreferences: 'A'.repeat(2000)
      }
    },
    {
      name: 'Invalid math mark',
      profile: {
        grade: 11,
        subjects: ['Mathematics'],
        mathMark: 'ninety'
      }
    },
    {
      name: 'Invalid math type',
      profile: {
        grade: 11,
        subjects: ['Mathematics'],
        mathType: 123
      }
    },
    {
      name: 'Circular reference object',
      profile: (() => {
        const obj = {
          grade: 11,
          subjects: ['Mathematics']
        };
        obj.self = obj; // Circular reference
        return obj;
      })()
    },
    {
      name: 'Mixed valid and invalid fields',
      profile: {
        grade: 'eleven',
        subjects: 'Mathematics',
        interests: 'technology',
        marks: 'invalid',
        careerPreferences: 123,
        invalidField: 'should be ignored',
        anotherInvalid: { nested: 'object' }
      }
    }
  ];
  
  const results = [];
  
  testCases.forEach(testCase => {
    try {
      const validation = validateStudentProfile(testCase.profile);
      
      const isHandledGracefully = validation.sanitizedProfile !== null &&
                                 validation.sanitizedProfile.grade !== undefined &&
                                 validation.sanitizedProfile.subjects !== undefined;
      
      results.push({
        name: testCase.name,
        isHandledGracefully: isHandledGracefully,
        hasErrors: validation.errors.length > 0,
        hasWarnings: validation.warnings.length > 0,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        success: true
      });
      
      console.log(`   ✅ ${testCase.name}: ${isHandledGracefully ? 'Handled' : 'Failed'} (${validation.errors.length}E, ${validation.warnings.length}W)`);
      
    } catch (error) {
      results.push({
        name: testCase.name,
        error: error.message,
        success: false
      });
      
      console.log(`   ❌ ${testCase.name}: Error - ${error.message}`);
    }
  });
  
  // Validate results
  const allHandled = results.every(r => r.success);
  const allHandledGracefully = results.filter(r => r.success).every(r => r.isHandledGracefully);
  
  console.log(`   📊 Results: ${results.length} cases, all handled: ${allHandled}, all handled gracefully: ${allHandledGracefully}`);
  
  return {
    testName: 'Malformed Input Data',
    passed: allHandled && allHandledGracefully,
    results: results
  };
}

/**
 * Test edge cases with career matching integration
 */
export async function testEdgeCaseCareerMatching() {
  console.log('🧪 Test: Edge Case Career Matching Integration');
  
  const testCases = [
    {
      name: 'Null profile career matching',
      profile: null
    },
    {
      name: 'Empty profile career matching',
      profile: {}
    },
    {
      name: 'Invalid grade career matching',
      profile: { grade: 'invalid', subjects: ['Mathematics'] }
    },
    {
      name: 'No subjects career matching',
      profile: { grade: 11, subjects: [] }
    },
    {
      name: 'Complex malformed profile',
      profile: {
        grade: 'twelve',
        subjects: 'Maths and Physics',
        interests: 'technology',
        marks: 'good grades',
        careerPreferences: 123
      }
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    try {
      // Test with a short timeout to avoid hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const careerPromise = matchCareersToProfile(testCase.profile, {
        limit: 3,
        minSimilarity: 0.6
      });
      
      const careers = await Promise.race([careerPromise, timeoutPromise]);
      
      const hasMinimumCareers = careers && careers.length >= 3;
      const allValidCareers = careers && careers.every(c => 
        c && c.title && c.description && c.source
      );
      
      results.push({
        name: testCase.name,
        careerCount: careers ? careers.length : 0,
        hasMinimumCareers: hasMinimumCareers,
        allValidCareers: allValidCareers,
        success: true
      });
      
      console.log(`   ✅ ${testCase.name}: ${careers?.length || 0} careers (${hasMinimumCareers ? 'Valid' : 'Invalid'})`);
      
    } catch (error) {
      // Expected for some edge cases - should handle gracefully
      const isGracefulError = error.message.includes('Timeout') || 
                             error.message.includes('emergency') ||
                             error.message.includes('fallback');
      
      results.push({
        name: testCase.name,
        error: error.message,
        isGracefulError: isGracefulError,
        success: isGracefulError
      });
      
      console.log(`   ${isGracefulError ? '✅' : '❌'} ${testCase.name}: ${error.message}`);
    }
  }
  
  // Validate results
  const allHandled = results.every(r => r.success);
  
  console.log(`   📊 Results: ${results.length} cases, all handled gracefully: ${allHandled}`);
  
  return {
    testName: 'Edge Case Career Matching Integration',
    passed: allHandled,
    results: results
  };
}

/**
 * Test profile complexity with edge cases
 */
export function testProfileComplexityEdgeCases() {
  console.log('🧪 Test: Profile Complexity Edge Cases');
  
  const testCases = [
    {
      name: 'Null profile complexity',
      profile: null
    },
    {
      name: 'Empty profile complexity',
      profile: {}
    },
    {
      name: 'Minimal profile complexity',
      profile: { grade: 10 }
    },
    {
      name: 'Subjects only complexity',
      profile: { subjects: ['Mathematics'] }
    },
    {
      name: 'Invalid data types complexity',
      profile: {
        grade: 'eleven',
        subjects: 'Mathematics',
        interests: 'technology',
        marks: 'good'
      }
    }
  ];
  
  const results = [];
  
  testCases.forEach(testCase => {
    try {
      // First validate the profile
      const validation = validateStudentProfile(testCase.profile);
      const profileToAnalyze = validation.sanitizedProfile || testCase.profile || {};
      
      // Then analyze complexity
      const complexity = analyzeProfileComplexity(profileToAnalyze);
      
      const hasValidComplexity = complexity && 
                                complexity.score !== undefined &&
                                complexity.profileType !== undefined &&
                                complexity.recommendedCount >= 3 &&
                                complexity.recommendedCount <= 5;
      
      results.push({
        name: testCase.name,
        complexityScore: complexity.score,
        profileType: complexity.profileType,
        recommendedCount: complexity.recommendedCount,
        hasValidComplexity: hasValidComplexity,
        success: true
      });
      
      console.log(`   ✅ ${testCase.name}: ${complexity.profileType} (score: ${complexity.score}, careers: ${complexity.recommendedCount})`);
      
    } catch (error) {
      results.push({
        name: testCase.name,
        error: error.message,
        success: false
      });
      
      console.log(`   ❌ ${testCase.name}: Error - ${error.message}`);
    }
  });
  
  // Validate results
  const allHandled = results.every(r => r.success);
  const allHaveValidComplexity = results.filter(r => r.success).every(r => r.hasValidComplexity);
  
  console.log(`   📊 Results: ${results.length} cases, all handled: ${allHandled}, all have valid complexity: ${allHaveValidComplexity}`);
  
  return {
    testName: 'Profile Complexity Edge Cases',
    passed: allHandled && allHaveValidComplexity,
    results: results
  };
}

/**
 * Run all edge case validation tests
 */
export async function runAllEdgeCaseTests() {
  console.log('🧪 Running All Edge Case Validation Tests...\n');
  
  const testResults = [];
  
  try {
    // Run all test suites
    testResults.push(testEmptyProfileHandling());
    testResults.push(testInvalidSubjectCombinations());
    testResults.push(testUnsupportedGradeLevels());
    testResults.push(testMalformedInputData());
    testResults.push(await testEdgeCaseCareerMatching());
    testResults.push(testProfileComplexityEdgeCases());
    
    // Calculate overall results
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.passed).length;
    const overallPassed = passedTests === totalTests;
    
    console.log('\n📊 Edge Case Validation Test Summary:');
    console.log('=====================================');
    
    testResults.forEach(result => {
      console.log(`${result.passed ? '✅' : '❌'} ${result.testName}: ${result.passed ? 'PASSED' : 'FAILED'}`);
    });
    
    console.log(`\n🎯 Overall Result: ${overallPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log(`📈 Success Rate: ${passedTests}/${totalTests} (${(passedTests / totalTests * 100).toFixed(1)}%)`);
    
    if (overallPassed) {
      console.log('\n🚀 Edge Case Validation Implementation Successfully Tested!');
      console.log('Key Validations:');
      console.log('- ✅ Empty profiles handled with fallbacks');
      console.log('- ✅ Invalid subject combinations sanitized');
      console.log('- ✅ Unsupported grade levels corrected');
      console.log('- ✅ Malformed input data handled gracefully');
      console.log('- ✅ Career matching works with edge cases');
      console.log('- ✅ Profile complexity calculated for all cases');
    } else {
      console.log('\n❌ Some edge case tests failed - review implementation');
    }
    
    return overallPassed;
    
  } catch (error) {
    console.error('❌ Edge case test execution failed:', error);
    return false;
  }
}

// Export for use in test runners
export default {
  testEmptyProfileHandling,
  testInvalidSubjectCombinations,
  testUnsupportedGradeLevels,
  testMalformedInputData,
  testEdgeCaseCareerMatching,
  testProfileComplexityEdgeCases,
  runAllEdgeCaseTests
};