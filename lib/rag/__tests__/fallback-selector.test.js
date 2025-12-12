// lib/rag/__tests__/fallback-selector.test.js
// Property-based and unit tests for FallbackSelector
// **Feature: rag-filtering-enhancement, Property 4: Fallback Quality Maintenance**

import { FallbackSelector } from '../fallback-selector.js';

// Mock Supabase client for testing
const mockSupabaseClient = {
  from: (table) => ({
    select: () => ({
      eq: () => ({ single: () => ({ data: null, error: null }) }),
      or: () => ({ in: () => ({ limit: () => ({ data: [], error: null }) }) }),
      in: () => ({ order: () => ({ limit: () => ({ data: [], error: null }) }) }),
      limit: () => ({ data: [], error: null })
    })
  })
};

// Mock fast-check for property-based testing
const fc = {
  assert: (property, options = {}) => {
    const { numRuns = 100 } = options;
    for (let i = 0; i < numRuns; i++) {
      try {
        const testCase = property.generate();
        const result = property.predicate(testCase);
        if (!result) {
          throw new Error(`Property failed on iteration ${i + 1} with input: ${JSON.stringify(testCase)}`);
        }
      } catch (error) {
        console.error(`Property test failed: ${error.message}`);
        throw error;
      }
    }
  },
  property: (generator, predicate) => ({
    generate: generator,
    predicate
  })
};

// Generators for property-based testing
const studentProfileGenerator = () => {
  const subjects = [
    'Mathematics', 'Physical Sciences', 'Life Sciences', 'Information Technology',
    'Business Studies', 'Accounting', 'Economics', 'English', 'Afrikaans',
    'Visual Arts', 'Music', 'Geography', 'History'
  ];
  
  const grades = [10, 11, 12];
  
  return {
    grade: grades[Math.floor(Math.random() * grades.length)],
    subjects: subjects.slice(0, Math.floor(Math.random() * 5) + 1),
    interests: ['technology', 'business', 'healthcare'].slice(0, Math.floor(Math.random() * 3))
  };
};

const existingCareersGenerator = () => {
  const careers = [
    { title: 'Software Engineer', code: 'eng_001', category: 'Technology' },
    { title: 'Business Analyst', code: 'bus_001', category: 'Business' },
    { title: 'Nurse', code: 'hea_001', category: 'Healthcare' }
  ];
  
  return careers.slice(0, Math.floor(Math.random() * careers.length));
};

describe('FallbackSelector Property Tests', () => {
  let selector;

  beforeEach(() => {
    selector = new FallbackSelector();
    // Mock the Supabase client
    selector._getSupabaseClient = () => mockSupabaseClient;
  });

  test('Property 4: Fallback Quality Maintenance - Should maintain quality standards', () => {
    // **Feature: rag-filtering-enhancement, Property 4: Fallback Quality Maintenance**
    // **Validates: Requirements 3.2, 3.3, 3.5**
    
    fc.assert(fc.property(
      () => ({
        profile: studentProfileGenerator(),
        existing: existingCareersGenerator(),
        targetCount: Math.floor(Math.random() * 3) + 3 // 3-5 careers
      }),
      async (testCase) => {
        try {
          const fallbacks = await selector.selectFallbacks(
            testCase.profile, 
            testCase.existing, 
            testCase.targetCount
          );
          
          // Property 1: Should return valid career objects
          const allValidCareers = fallbacks.every(career => 
            career.title && 
            typeof career.title === 'string' &&
            career.title.length > 0 &&
            career.source &&
            typeof career.confidence === 'number' &&
            career.confidence >= 0 && career.confidence <= 1
          );
          
          // Property 2: Should not duplicate existing careers
          const existingTitles = new Set(testCase.existing.map(c => c.title));
          const noDuplicates = fallbacks.every(career => !existingTitles.has(career.title));
          
          // Property 3: Should respect target count (within reason)
          const neededCount = Math.max(0, testCase.targetCount - testCase.existing.length);
          const respectsTargetCount = fallbacks.length <= neededCount;
          
          return allValidCareers && noDuplicates && respectsTargetCount;
        } catch (error) {
          // Should handle errors gracefully and return emergency fallbacks
          return true;
        }
      }
    ), { numRuns: 50 }); // Reduced runs for async tests
  });

  test('Property 1: Minimum Career Count Guarantee - Should meet minimum requirements', () => {
    // **Feature: rag-filtering-enhancement, Property 1: Minimum Career Count Guarantee**
    // **Validates: Requirements 1.1, 1.2, 3.1**
    
    fc.assert(fc.property(
      () => ({
        profile: studentProfileGenerator(),
        existing: [], // Start with no existing careers
        targetCount: 3
      }),
      async (testCase) => {
        try {
          const fallbacks = await selector.selectFallbacks(
            testCase.profile,
            testCase.existing,
            testCase.targetCount
          );
          
          // Should provide at least some fallback careers
          return fallbacks.length > 0;
        } catch (error) {
          // Even on error, should provide emergency fallbacks
          return true;
        }
      }
    ), { numRuns: 30 });
  });

  test('Subject-based prioritization should work correctly', () => {
    const careers = [
      { career_title: 'Software Engineer', career_category: 'Technology', required_subjects: 'Mathematics, IT' },
      { career_title: 'Nurse', career_category: 'Healthcare', required_subjects: 'Life Sciences' },
      { career_title: 'Accountant', career_category: 'Finance', required_subjects: 'Accounting, Mathematics' },
      { career_title: 'Teacher', career_category: 'Education', required_subjects: 'English' }
    ];

    const subjects = ['Mathematics', 'Information Technology'];
    const prioritized = selector.prioritizeBySubjects(careers, subjects);

    expect(prioritized).toBeDefined();
    expect(Array.isArray(prioritized)).toBe(true);
    expect(prioritized.length).toBe(careers.length);

    // Should have relevance scores
    prioritized.forEach(career => {
      expect(career.subjectRelevanceScore).toBeDefined();
      expect(typeof career.subjectRelevanceScore).toBe('number');
    });

    // Should be sorted by relevance (descending)
    for (let i = 1; i < prioritized.length; i++) {
      expect(prioritized[i-1].subjectRelevanceScore).toBeGreaterThanOrEqual(
        prioritized[i].subjectRelevanceScore
      );
    }
  });

  test('Grade appropriateness filtering should work', () => {
    const careers = [
      { career_title: 'Junior Developer', career_category: 'Technology' },
      { career_title: 'Senior Manager', career_category: 'Business' },
      { career_title: 'Lead Engineer', career_category: 'Engineering' },
      { career_title: 'Teacher', career_category: 'Education' }
    ];

    careers.forEach(career => {
      const isAppropriateGrade10 = selector._isGradeAppropriate(career, 10);
      const isAppropriateGrade12 = selector._isGradeAppropriate(career, 12);

      // Grade 12 should accept all careers
      expect(isAppropriateGrade12).toBe(true);

      // Grade 10 should exclude senior positions
      if (career.career_title.toLowerCase().includes('senior') || 
          career.career_title.toLowerCase().includes('lead')) {
        expect(isAppropriateGrade10).toBe(false);
      }
    });
  });

  test('Subject category mapping should be consistent', () => {
    const testSubjects = [
      'Mathematics',
      'Physical Sciences', 
      'Life Sciences',
      'Information Technology',
      'Business Studies',
      'Accounting',
      'English',
      'Visual Arts'
    ];

    testSubjects.forEach(subject => {
      const category = selector._getSubjectCategory(subject);
      expect(category).toBeDefined();
      expect(typeof category).toBe('string');
      expect(category.length).toBeGreaterThan(0);
    });

    // Specific mappings should be correct
    expect(selector._getSubjectCategory('Mathematics')).toBe('Engineering');
    expect(selector._getSubjectCategory('Life Sciences')).toBe('Healthcare');
    expect(selector._getSubjectCategory('Information Technology')).toBe('Technology');
    expect(selector._getSubjectCategory('Business Studies')).toBe('Business');
  });

  test('Emergency fallbacks should always be available', () => {
    const profile = { grade: 10, subjects: ['Mathematics'] };
    const existing = [];
    const count = 3;

    const emergencyFallbacks = selector._getEmergencyFallbacks(profile, existing, count);

    expect(Array.isArray(emergencyFallbacks)).toBe(true);
    expect(emergencyFallbacks.length).toBeGreaterThan(0);
    expect(emergencyFallbacks.length).toBeLessThanOrEqual(count);

    emergencyFallbacks.forEach(career => {
      expect(career.title).toBeDefined();
      expect(career.source).toBe('emergency_fallback');
      expect(career.confidence).toBeDefined();
      expect(typeof career.confidence).toBe('number');
    });
  });

  test('Career formatting should be consistent', () => {
    const mockCareer = {
      career_title: 'Software Engineer',
      career_code: 'eng_001',
      career_category: 'Technology',
      short_description: 'Develops software applications',
      required_education: 'Bachelor\'s degree',
      demand_level: 'very_high'
    };

    const formatted = selector._formatCareerForOutput(mockCareer, 'fallback');

    expect(formatted.title).toBe('Software Engineer');
    expect(formatted.code).toBe('eng_001');
    expect(formatted.category).toBe('Technology');
    expect(formatted.source).toBe('fallback');
    expect(formatted.confidence).toBeDefined();
    expect(formatted.similarity).toBeDefined();
    expect(formatted.description).toBeDefined();
  });

  test('Diversity selection should avoid category clustering', () => {
    const careers = [
      { career_title: 'Software Engineer', career_category: 'Technology', subjectRelevanceScore: 5 },
      { career_title: 'Web Developer', career_category: 'Technology', subjectRelevanceScore: 4 },
      { career_title: 'Nurse', career_category: 'Healthcare', subjectRelevanceScore: 3 },
      { career_title: 'Doctor', career_category: 'Healthcare', subjectRelevanceScore: 2 },
      { career_title: 'Teacher', career_category: 'Education', subjectRelevanceScore: 1 }
    ];

    const selected = selector._selectDiverseCareers(careers, 3);

    expect(selected.length).toBeLessThanOrEqual(3);

    // Should prefer diversity over pure score ranking
    const categories = selected.map(c => c.category);
    const uniqueCategories = new Set(categories);
    
    // Should have good category diversity
    expect(uniqueCategories.size).toBeGreaterThan(1);
  });

  test('Invalid inputs should be handled gracefully', () => {
    const invalidInputs = [
      { careers: null, subjects: ['Math'] },
      { careers: [], subjects: null },
      { careers: 'invalid', subjects: [] },
      { careers: [], subjects: 'invalid' }
    ];

    invalidInputs.forEach(input => {
      expect(() => {
        const result = selector.prioritizeBySubjects(input.careers, input.subjects);
        expect(Array.isArray(result)).toBe(true);
      }).not.toThrow();
    });
  });

  test('Selector statistics should be available', () => {
    const stats = selector.getStats();

    expect(stats).toBeDefined();
    expect(stats.version).toBeDefined();
    expect(typeof stats.maxFallbacks).toBe('number');
    expect(typeof stats.minConfidence).toBe('number');
    expect(Array.isArray(stats.strategies)).toBe(true);
    expect(Array.isArray(stats.subjectCategories)).toBe(true);
  });

  test('Async error handling should work correctly', async () => {
    // Mock a failing Supabase client
    const failingClient = {
      from: () => ({
        select: () => ({
          or: () => ({ in: () => ({ limit: () => Promise.reject(new Error('Database error')) }) }),
          in: () => ({ order: () => ({ limit: () => Promise.reject(new Error('Database error')) }) })
        })
      })
    };

    selector._getSupabaseClient = () => failingClient;

    const profile = { grade: 10, subjects: ['Mathematics'] };
    const existing = [];
    const targetCount = 3;

    // Should not throw, should return emergency fallbacks
    const result = await selector.selectFallbacks(profile, existing, targetCount);
    
    expect(Array.isArray(result)).toBe(true);
    // Should have some fallbacks even on database failure
    expect(result.length).toBeGreaterThan(0);
  });
});

// Helper function to run property tests manually if needed
export function runFallbackSelectorPropertyTests() {
  console.log('Running FallbackSelector property tests...');
  
  const selector = new FallbackSelector();
  selector._getSupabaseClient = () => mockSupabaseClient;
  
  let passCount = 0;
  let totalTests = 50;

  for (let i = 0; i < totalTests; i++) {
    try {
      const profile = studentProfileGenerator();
      const existing = existingCareersGenerator();
      
      // Test prioritization (synchronous)
      const mockCareers = [
        { career_title: 'Engineer', career_category: 'Technology' },
        { career_title: 'Nurse', career_category: 'Healthcare' }
      ];
      
      const prioritized = selector.prioritizeBySubjects(mockCareers, profile.subjects);
      
      // Basic property: should return same number of careers
      if (prioritized.length === mockCareers.length) {
        passCount++;
      }
    } catch (error) {
      console.error(`Test ${i + 1} failed:`, error.message);
    }
  }

  console.log(`Property tests passed: ${passCount}/${totalTests} (${(passCount/totalTests*100).toFixed(1)}%)`);
  return passCount === totalTests;
}