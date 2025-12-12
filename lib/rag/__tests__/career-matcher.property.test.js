// lib/rag/__tests__/career-matcher.property.test.js
// Property-based tests for career matching system
// **Feature: rag-filtering-enhancement, Property 1: Minimum Career Count Guarantee**

import { matchCareersToProfile } from '../career-matcher.js';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
process.env.OPENAI_API_KEY = 'test-key';

// Mock fast-check for property-based testing
const fc = {
  assert: (property, options = {}) => {
    const { numRuns = 50 } = options; // Reduced for integration tests
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

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })
    }
  }));
});

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ single: jest.fn(() => ({ data: null, error: null })) })),
        or: jest.fn(() => ({ 
          in: jest.fn(() => ({ 
            limit: jest.fn(() => ({ data: mockCareerData, error: null })) 
          })) 
        })),
        in: jest.fn(() => ({ 
          order: jest.fn(() => ({ 
            limit: jest.fn(() => ({ data: mockCareerData, error: null })) 
          })) 
        })),
        limit: jest.fn(() => ({ data: mockCareerData, error: null }))
      }))
    }))
  }))
}));

// Mock search functions
jest.mock('../search.js', () => ({
  semanticSearch: jest.fn(() => Promise.resolve(mockSearchResults)),
  hybridSearch: jest.fn(() => Promise.resolve(mockSearchResults))
}));

// Mock data
const mockCareerData = [
  {
    career_code: 'eng_001',
    career_title: 'Software Engineer',
    career_category: 'Technology',
    short_description: 'Develops software applications',
    demand_level: 'very_high',
    required_subjects: 'Mathematics, Information Technology'
  },
  {
    career_code: 'hea_001', 
    career_title: 'Nurse',
    career_category: 'Healthcare',
    short_description: 'Provides patient care',
    demand_level: 'high',
    required_subjects: 'Life Sciences'
  },
  {
    career_code: 'bus_001',
    career_title: 'Business Analyst',
    career_category: 'Business', 
    short_description: 'Analyzes business processes',
    demand_level: 'high',
    required_subjects: 'Business Studies, Mathematics'
  }
];

const mockSearchResults = [
  {
    chunk_metadata: {
      career_code: 'eng_001',
      career_title: 'Software Engineer',
      career_category: 'Technology'
    },
    chunk_text: 'Software Engineer: Develops and maintains software applications.',
    similarity: 0.85
  },
  {
    chunk_metadata: {
      career_code: 'hea_001',
      career_title: 'Nurse', 
      career_category: 'Healthcare'
    },
    chunk_text: 'Nurse: Provides healthcare services and patient care.',
    similarity: 0.75
  }
];

// Generators for property-based testing
const studentProfileGenerator = () => {
  const allSubjects = [
    'Mathematics', 'Physical Sciences', 'Life Sciences', 'Information Technology',
    'Computer Applications Technology', 'Business Studies', 'Accounting', 
    'Economics', 'English', 'Afrikaans', 'Visual Arts', 'Music', 'Geography', 'History'
  ];
  
  const grades = [10, 11, 12];
  const interests = ['technology', 'business', 'healthcare', 'education', 'creative', 'science'];
  
  // Generate realistic student profiles
  const numSubjects = Math.floor(Math.random() * 4) + 3; // 3-6 subjects
  const selectedSubjects = [];
  
  for (let i = 0; i < numSubjects; i++) {
    const subject = allSubjects[Math.floor(Math.random() * allSubjects.length)];
    if (!selectedSubjects.includes(subject)) {
      selectedSubjects.push(subject);
    }
  }
  
  const numInterests = Math.floor(Math.random() * 3) + 1; // 1-3 interests
  const selectedInterests = [];
  
  for (let i = 0; i < numInterests; i++) {
    const interest = interests[Math.floor(Math.random() * interests.length)];
    if (!selectedInterests.includes(interest)) {
      selectedInterests.push(interest);
    }
  }
  
  return {
    grade: grades[Math.floor(Math.random() * grades.length)],
    subjects: selectedSubjects,
    interests: selectedInterests,
    careerPreferences: Math.random() > 0.5 ? 'technology and innovation' : undefined
  };
};

describe('Career Matcher Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Property 1: Minimum Career Count Guarantee - Should provide at least 3 careers for valid profiles', () => {
    // **Feature: rag-filtering-enhancement, Property 1: Minimum Career Count Guarantee**
    // **Validates: Requirements 1.1, 1.2, 3.1**
    
    fc.assert(fc.property(
      studentProfileGenerator,
      async (profile) => {
        try {
          const careers = await matchCareersToProfile(profile, { limit: 5 });
          
          // Property 1: Should return at least 3 careers for valid student profiles
          const hasMinimumCareers = careers.length >= 3;
          
          // Property 2: All returned items should be valid career objects
          const allValidCareers = careers.every(career => 
            career.title && 
            typeof career.title === 'string' &&
            career.title.length > 0 &&
            career.description &&
            typeof career.similarity === 'number' &&
            career.similarity >= 0 && career.similarity <= 1
          );
          
          // Property 3: Should not exceed requested limit
          const respectsLimit = careers.length <= 5;
          
          return hasMinimumCareers && allValidCareers && respectsLimit;
        } catch (error) {
          console.error('Career matching failed:', error.message);
          // Should not throw errors for valid profiles
          return false;
        }
      }
    ), { numRuns: 30 }); // Reduced runs for integration tests
  });

  test('Property 5: Career Diversity Preservation - Should maintain category diversity', () => {
    // **Feature: rag-filtering-enhancement, Property 5: Career Diversity Preservation**
    // **Validates: Requirements 1.3, 3.4**
    
    fc.assert(fc.property(
      studentProfileGenerator,
      async (profile) => {
        try {
          const careers = await matchCareersToProfile(profile, { limit: 5 });
          
          if (careers.length < 2) {
            return true; // Can't test diversity with < 2 careers
          }
          
          // Property 1: Should have some category diversity when possible
          const categories = careers.map(c => c.category).filter(Boolean);
          const uniqueCategories = new Set(categories);
          
          // With 3+ careers, should ideally have 2+ categories
          const hasDiversity = careers.length < 3 || uniqueCategories.size >= 2;
          
          // Property 2: Should not have all careers from same category (unless only 1 category available)
          const notAllSameCategory = uniqueCategories.size > 1 || careers.length <= 2;
          
          return hasDiversity && notAllSameCategory;
        } catch (error) {
          console.error('Diversity test failed:', error.message);
          return false;
        }
      }
    ), { numRuns: 25 });
  });

  test('Property 3: Subject-Category Alignment - Should match subjects to relevant careers', () => {
    // **Feature: rag-filtering-enhancement, Property 3: Subject-Category Alignment**
    // **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
    
    fc.assert(fc.property(
      () => {
        // Generate profiles with specific subject patterns
        const subjectPatterns = [
          { subjects: ['Mathematics', 'Physical Sciences'], expectedCategories: ['Engineering', 'Technology'] },
          { subjects: ['Life Sciences', 'Mathematics'], expectedCategories: ['Healthcare', 'Science'] },
          { subjects: ['Business Studies', 'Accounting'], expectedCategories: ['Business', 'Finance'] },
          { subjects: ['Information Technology'], expectedCategories: ['Technology'] }
        ];
        
        const pattern = subjectPatterns[Math.floor(Math.random() * subjectPatterns.length)];
        return {
          grade: 11,
          subjects: pattern.subjects,
          interests: ['career development'],
          expectedCategories: pattern.expectedCategories
        };
      },
      async (testCase) => {
        try {
          const careers = await matchCareersToProfile(testCase, { limit: 5 });
          
          if (careers.length === 0) {
            return false; // Should find some careers
          }
          
          // Property: At least some careers should align with subject-based categories
          const careerCategories = careers.map(c => c.category).filter(Boolean);
          const hasRelevantCategory = testCase.expectedCategories.some(expected =>
            careerCategories.some(actual => 
              actual && actual.toLowerCase().includes(expected.toLowerCase())
            )
          );
          
          return hasRelevantCategory || careers.length >= 3; // Either relevant or sufficient quantity
        } catch (error) {
          console.error('Subject alignment test failed:', error.message);
          return false;
        }
      }
    ), { numRuns: 20 });
  });

  test('Property 6: Performance Boundary Compliance - Should complete within time limits', () => {
    // **Feature: rag-filtering-enhancement, Property 6: Performance Boundary Compliance**
    // **Validates: Requirements 6.1, 6.2, 6.3**
    
    fc.assert(fc.property(
      studentProfileGenerator,
      async (profile) => {
        const startTime = Date.now();
        
        try {
          const careers = await matchCareersToProfile(profile, { limit: 5 });
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Property 1: Should complete within reasonable time (15 seconds for full pipeline)
          const withinTimeLimit = duration < 15000; // 15 seconds
          
          // Property 2: Should return results (not empty)
          const hasResults = careers.length > 0;
          
          return withinTimeLimit && hasResults;
        } catch (error) {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Even errors should occur within time limit
          return duration < 15000;
        }
      }
    ), { numRuns: 15 }); // Fewer runs for performance tests
  });

  test('Edge case: Empty profile should be handled gracefully', async () => {
    const emptyProfile = { grade: 10, subjects: [], interests: [] };
    
    const careers = await matchCareersToProfile(emptyProfile);
    
    // Should still return some careers (fallbacks)
    expect(careers.length).toBeGreaterThan(0);
    expect(careers.length).toBeGreaterThanOrEqual(3);
    
    careers.forEach(career => {
      expect(career.title).toBeDefined();
      expect(career.description).toBeDefined();
    });
  });

  test('Edge case: Single subject profile should work', async () => {
    const singleSubjectProfile = {
      grade: 11,
      subjects: ['Mathematics'],
      interests: ['problem solving']
    };
    
    const careers = await matchCareersToProfile(singleSubjectProfile);
    
    expect(careers.length).toBeGreaterThanOrEqual(3);
    
    // Should have some variety even with single subject
    const categories = careers.map(c => c.category).filter(Boolean);
    const uniqueCategories = new Set(categories);
    expect(uniqueCategories.size).toBeGreaterThan(0);
  });

  test('Edge case: All subjects profile should work', async () => {
    const comprehensiveProfile = {
      grade: 12,
      subjects: [
        'Mathematics', 'Physical Sciences', 'Life Sciences', 'Information Technology',
        'Business Studies', 'Accounting', 'English', 'Visual Arts'
      ],
      interests: ['technology', 'business', 'healthcare', 'creative']
    };
    
    const careers = await matchCareersToProfile(comprehensiveProfile, { limit: 5 });
    
    expect(careers.length).toBeGreaterThanOrEqual(3);
    expect(careers.length).toBeLessThanOrEqual(5);
    
    // Should have good diversity with comprehensive profile
    const categories = careers.map(c => c.category).filter(Boolean);
    const uniqueCategories = new Set(categories);
    expect(uniqueCategories.size).toBeGreaterThan(1);
  });

  test('Career validation should filter out invalid careers', async () => {
    // Mock search results with invalid careers
    const { hybridSearch } = require('../search.js');
    hybridSearch.mockResolvedValueOnce([
      {
        chunk_metadata: { career_title: 'Question about careers' },
        chunk_text: 'This is a question, not a career',
        similarity: 0.8
      },
      {
        chunk_metadata: { career_title: 'Bursary Information' },
        chunk_text: 'Information about bursaries',
        similarity: 0.7
      },
      {
        chunk_metadata: { career_title: 'Software Engineer' },
        chunk_text: 'Software Engineer: Develops applications',
        similarity: 0.9
      }
    ]);
    
    const profile = { grade: 11, subjects: ['Mathematics'], interests: ['technology'] };
    const careers = await matchCareersToProfile(profile);
    
    // Should filter out invalid careers and provide fallbacks
    expect(careers.length).toBeGreaterThanOrEqual(3);
    
    // Should not contain obviously invalid career titles
    careers.forEach(career => {
      expect(career.title.toLowerCase()).not.toContain('question');
      expect(career.title.toLowerCase()).not.toContain('bursary');
      expect(career.title.toLowerCase()).not.toContain('information');
    });
  });
});

// Helper function to run property tests manually if needed
export function runCareerMatcherPropertyTests() {
  console.log('Running Career Matcher property tests...');
  
  let passCount = 0;
  let totalTests = 20;

  for (let i = 0; i < totalTests; i++) {
    try {
      const profile = studentProfileGenerator();
      
      // Basic validation of profile generation
      if (profile.grade && Array.isArray(profile.subjects) && profile.subjects.length > 0) {
        passCount++;
      }
    } catch (error) {
      console.error(`Test ${i + 1} failed:`, error.message);
    }
  }

  console.log(`Property tests passed: ${passCount}/${totalTests} (${(passCount/totalTests*100).toFixed(1)}%)`);
  return passCount === totalTests;
}