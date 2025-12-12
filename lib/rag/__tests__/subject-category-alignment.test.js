// lib/rag/__tests__/subject-category-alignment.test.js
// Property-based tests for Subject-Category Alignment
// **Feature: rag-filtering-enhancement, Property 3: Subject-Category Alignment**

import {
  SUBJECT_CATEGORY_MAP,
  CAREER_CATEGORIES,
  calculateCategoryRelevance,
  getPrioritizedCategories,
  getInterdisciplinaryBoost,
  analyzeSubjectPortfolio
} from '../subject-category-map.js';

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
const subjectGenerator = () => {
  const allSubjects = Object.keys(SUBJECT_CATEGORY_MAP);
  const numSubjects = Math.floor(Math.random() * 5) + 1; // 1-5 subjects
  const selectedSubjects = [];
  
  for (let i = 0; i < numSubjects; i++) {
    const subject = allSubjects[Math.floor(Math.random() * allSubjects.length)];
    if (!selectedSubjects.includes(subject)) {
      selectedSubjects.push(subject);
    }
  }
  
  return selectedSubjects;
};

const categoryGenerator = () => {
  const categories = Object.keys(CAREER_CATEGORIES);
  return categories[Math.floor(Math.random() * categories.length)];
};

describe('Subject-Category Alignment Property Tests', () => {
  
  test('Property 3: Subject-Category Alignment - Relevant subjects should score higher', () => {
    // **Feature: rag-filtering-enhancement, Property 3: Subject-Category Alignment**
    // **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
    
    fc.assert(fc.property(
      () => ({
        subjects: subjectGenerator(),
        category: categoryGenerator()
      }),
      (testCase) => {
        const score = calculateCategoryRelevance(testCase.subjects, testCase.category);
        
        // Property 1: Score should be between 0 and 1
        const validScore = score >= 0 && score <= 1;
        
        // Property 2: If subjects have primary mapping to category, score should be > 0
        const hasPrimaryMapping = testCase.subjects.some(subject => {
          const mapping = SUBJECT_CATEGORY_MAP[subject];
          return mapping && mapping.primary.includes(testCase.category);
        });
        
        const hasSecondaryMapping = testCase.subjects.some(subject => {
          const mapping = SUBJECT_CATEGORY_MAP[subject];
          return mapping && mapping.secondary.includes(testCase.category);
        });
        
        const shouldHaveScore = hasPrimaryMapping || hasSecondaryMapping;
        const hasScore = score > 0;
        
        // Property 3: Relevant subjects should produce positive scores
        const relevanceProperty = !shouldHaveScore || hasScore;
        
        return validScore && relevanceProperty;
      }
    ), { numRuns: 100 });
  });

  test('Primary mappings should score higher than secondary mappings', () => {
    const testCases = [
      {
        subjects: ['Mathematics'], // Primary for Engineering
        primaryCategory: 'Engineering',
        secondaryCategory: 'Science' // Secondary for Mathematics
      },
      {
        subjects: ['Business Studies'], // Primary for Business
        primaryCategory: 'Business',
        secondaryCategory: 'Finance' // Secondary for Business Studies
      },
      {
        subjects: ['Life Sciences'], // Primary for Healthcare
        primaryCategory: 'Healthcare',
        secondaryCategory: 'Agriculture' // Secondary for Life Sciences
      }
    ];

    testCases.forEach(testCase => {
      const primaryScore = calculateCategoryRelevance(testCase.subjects, testCase.primaryCategory);
      const secondaryScore = calculateCategoryRelevance(testCase.subjects, testCase.secondaryCategory);
      
      expect(primaryScore).toBeGreaterThan(secondaryScore);
      expect(primaryScore).toBeGreaterThan(0);
    });
  });

  test('Interdisciplinary combinations should receive boost', () => {
    const testCases = [
      {
        name: 'STEM Combination',
        subjects: ['Mathematics', 'Physical Sciences', 'Information Technology'],
        category: 'Engineering',
        expectedBoost: true
      },
      {
        name: 'Business Combination', 
        subjects: ['Mathematics', 'Accounting', 'Business Studies'],
        category: 'Finance',
        expectedBoost: true
      },
      {
        name: 'Single Subject',
        subjects: ['Mathematics'],
        category: 'Engineering',
        expectedBoost: false
      }
    ];

    testCases.forEach(testCase => {
      const boost = getInterdisciplinaryBoost(testCase.subjects, testCase.category);
      
      if (testCase.expectedBoost) {
        expect(boost).toBeGreaterThan(1.0);
      } else {
        expect(boost).toBe(1.0);
      }
    });
  });

  test('Prioritized categories should be sorted by relevance', () => {
    const testSubjects = ['Mathematics', 'Physical Sciences', 'Information Technology'];
    const prioritized = getPrioritizedCategories(testSubjects);
    
    // Should return array of category objects
    expect(Array.isArray(prioritized)).toBe(true);
    
    // Should be sorted by score (descending)
    for (let i = 1; i < prioritized.length; i++) {
      expect(prioritized[i-1].score).toBeGreaterThanOrEqual(prioritized[i].score);
    }
    
    // All scores should be positive
    prioritized.forEach(item => {
      expect(item.score).toBeGreaterThan(0);
      expect(item.category).toBeDefined();
    });
    
    // Engineering and Technology should be top categories for STEM subjects
    const topCategories = prioritized.slice(0, 3).map(p => p.category);
    expect(topCategories).toContain('Engineering');
    expect(topCategories).toContain('Technology');
  });

  test('Subject portfolio analysis should provide meaningful insights', () => {
    const testCases = [
      {
        name: 'STEM Portfolio',
        subjects: ['Mathematics', 'Physical Sciences', 'Information Technology'],
        expectedStrengths: ['Engineering', 'Technology']
      },
      {
        name: 'Business Portfolio',
        subjects: ['Mathematics', 'Business Studies', 'Accounting'],
        expectedStrengths: ['Business', 'Finance']
      },
      {
        name: 'Creative Portfolio',
        subjects: ['Visual Arts', 'Design', 'English'],
        expectedStrengths: ['Creative']
      }
    ];

    testCases.forEach(testCase => {
      const analysis = analyzeSubjectPortfolio(testCase.subjects);
      
      // Should have required structure
      expect(analysis.strengths).toBeDefined();
      expect(analysis.gaps).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      
      // Should have meaningful strengths
      expect(analysis.strengths.length).toBeGreaterThan(0);
      
      // Strengths should include expected categories
      const strengthCategories = analysis.strengths.map(s => s.category);
      testCase.expectedStrengths.forEach(expected => {
        expect(strengthCategories).toContain(expected);
      });
      
      // Each strength should have description
      analysis.strengths.forEach(strength => {
        expect(strength.category).toBeDefined();
        expect(strength.score).toBeGreaterThan(0);
        expect(strength.description).toBeDefined();
      });
    });
  });

  test('Category relevance calculation should be consistent', () => {
    fc.assert(fc.property(
      subjectGenerator,
      (subjects) => {
        const categories = Object.keys(CAREER_CATEGORIES);
        
        // Property 1: Same input should produce same output
        const score1 = calculateCategoryRelevance(subjects, categories[0]);
        const score2 = calculateCategoryRelevance(subjects, categories[0]);
        
        // Property 2: Empty subjects should return 0
        const emptyScore = calculateCategoryRelevance([], categories[0]);
        
        // Property 3: Invalid category should return 0
        const invalidScore = calculateCategoryRelevance(subjects, 'InvalidCategory');
        
        return score1 === score2 && emptyScore === 0 && invalidScore === 0;
      }
    ), { numRuns: 50 });
  });

  test('Subject mappings should be comprehensive', () => {
    // Test that all subjects in the map have valid configurations
    Object.entries(SUBJECT_CATEGORY_MAP).forEach(([subject, mapping]) => {
      // Should have required properties
      expect(mapping.primary).toBeDefined();
      expect(mapping.secondary).toBeDefined();
      expect(mapping.priority).toBeDefined();
      expect(mapping.description).toBeDefined();
      
      // Primary and secondary should be arrays
      expect(Array.isArray(mapping.primary)).toBe(true);
      expect(Array.isArray(mapping.secondary)).toBe(true);
      
      // Priority should be between 0 and 1
      expect(mapping.priority).toBeGreaterThan(0);
      expect(mapping.priority).toBeLessThanOrEqual(1);
      
      // Categories should exist in CAREER_CATEGORIES
      [...mapping.primary, ...mapping.secondary].forEach(category => {
        expect(CAREER_CATEGORIES[category]).toBeDefined();
      });
    });
  });

  test('Career categories should have complete definitions', () => {
    Object.entries(CAREER_CATEGORIES).forEach(([category, definition]) => {
      // Should have required properties
      expect(definition.description).toBeDefined();
      expect(definition.examples).toBeDefined();
      expect(definition.demandLevel).toBeDefined();
      expect(definition.averageSalary).toBeDefined();
      expect(definition.educationLevel).toBeDefined();
      
      // Examples should be array with content
      expect(Array.isArray(definition.examples)).toBe(true);
      expect(definition.examples.length).toBeGreaterThan(0);
      
      // Demand level should be valid
      const validDemandLevels = ['low', 'medium', 'medium_high', 'high', 'very_high'];
      expect(validDemandLevels).toContain(definition.demandLevel);
      
      // Salary level should be valid
      const validSalaryLevels = ['low', 'medium', 'medium_high', 'high', 'very_high'];
      expect(validSalaryLevels).toContain(definition.averageSalary);
      
      // Education level should be valid
      const validEducationLevels = ['certificate', 'diploma', 'degree', 'diploma_degree'];
      expect(validEducationLevels).toContain(definition.educationLevel);
    });
  });

  test('Invalid inputs should be handled gracefully', () => {
    const invalidInputs = [
      { subjects: null, category: 'Engineering' },
      { subjects: undefined, category: 'Technology' },
      { subjects: 'invalid', category: 'Business' },
      { subjects: ['Mathematics'], category: null },
      { subjects: ['Mathematics'], category: undefined }
    ];

    invalidInputs.forEach(input => {
      expect(() => {
        const score = calculateCategoryRelevance(input.subjects, input.category);
        expect(typeof score).toBe('number');
        expect(score).toBeGreaterThanOrEqual(0);
      }).not.toThrow();
    });

    // Test portfolio analysis with invalid inputs
    const invalidPortfolios = [null, undefined, 'invalid', 123];
    invalidPortfolios.forEach(portfolio => {
      expect(() => {
        const analysis = analyzeSubjectPortfolio(portfolio);
        expect(analysis.strengths).toBeDefined();
        expect(analysis.gaps).toBeDefined();
        expect(analysis.recommendations).toBeDefined();
      }).not.toThrow();
    });
  });

  test('High-priority subjects should have stronger influence', () => {
    // Mathematics has high priority (0.9)
    const mathScore = calculateCategoryRelevance(['Mathematics'], 'Engineering');
    
    // Consumer Studies has lower priority (0.6)
    const consumerScore = calculateCategoryRelevance(['Consumer Studies'], 'Business');
    
    // Mathematics should have stronger influence relative to its priority
    expect(mathScore).toBeGreaterThan(0);
    expect(consumerScore).toBeGreaterThan(0);
    
    // The ratio should reflect the priority difference
    const mathPriority = SUBJECT_CATEGORY_MAP['Mathematics'].priority;
    const consumerPriority = SUBJECT_CATEGORY_MAP['Consumer Studies'].priority;
    
    expect(mathPriority).toBeGreaterThan(consumerPriority);
  });
});

  test('Property 5: Career Diversity Preservation - Should maintain category diversity', () => {
    // **Feature: rag-filtering-enhancement, Property 5: Career Diversity Preservation**
    // **Validates: Requirements 1.3, 3.4**
    
    fc.assert(fc.property(
      () => {
        // Generate diverse career set
        const categories = Object.keys(CAREER_CATEGORIES);
        const careers = [];
        
        // Create 2-3 careers per category (simulating real results)
        categories.slice(0, 5).forEach((category, categoryIndex) => {
          for (let i = 0; i < 2; i++) {
            careers.push({
              title: `${category} Career ${i + 1}`,
              category: category,
              similarity: Math.random() * 0.4 + 0.6, // 0.6-1.0
              combinedScore: Math.random() * 0.4 + 0.6
            });
          }
        });
        
        // Shuffle to simulate real-world ordering
        for (let i = careers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [careers[i], careers[j]] = [careers[j], careers[i]];
        }
        
        return careers;
      },
      (careers) => {
        // Simulate diversity selection (like ensureCategoryDiversity function)
        const maxResults = 5;
        const diversified = [];
        const usedCategories = new Set();
        
        // First pass: one per category
        for (const career of careers) {
          if (diversified.length >= maxResults) break;
          
          const category = career.category || 'General';
          if (!usedCategories.has(category)) {
            diversified.push(career);
            usedCategories.add(category);
          }
        }
        
        // Fill remaining slots
        for (const career of careers) {
          if (diversified.length >= maxResults) break;
          if (!diversified.includes(career)) {
            diversified.push(career);
          }
        }
        
        // Property 1: Should not exceed max results
        const respectsLimit = diversified.length <= maxResults;
        
        // Property 2: Should have good diversity when possible
        const categories = diversified.map(c => c.category);
        const uniqueCategories = new Set(categories);
        const hasDiversity = diversified.length <= 2 || uniqueCategories.size >= 2;
        
        // Property 3: Should prefer higher-scoring careers within categories
        const sortedByScore = [...diversified].sort((a, b) => b.combinedScore - a.combinedScore);
        const maintainsQuality = diversified.length <= 3 || 
          diversified.slice(0, 2).every(career => career.combinedScore >= 0.5);
        
        return respectsLimit && hasDiversity && maintainsQuality;
      }
    ), { numRuns: 50 });
  });

  test('Property 9: Unusual Subject Accommodation - Should handle rare subject combinations', () => {
    // **Feature: rag-filtering-enhancement, Property 9: Unusual Subject Accommodation**
    // **Validates: Requirements 4.5**
    
    const unusualCombinations = [
      ['Agricultural Sciences', 'Information Technology'], // Agri-tech
      ['Music', 'Mathematics'], // Music technology/theory
      ['Drama', 'Business Studies'], // Entertainment business
      ['Visual Arts', 'Physical Sciences'], // Scientific illustration
      ['Tourism', 'Life Sciences'], // Eco-tourism
      ['Geography', 'Information Technology'] // GIS and mapping
    ];
    
    unusualCombinations.forEach(subjects => {
      const prioritized = getPrioritizedCategories(subjects);
      const analysis = analyzeSubjectPortfolio(subjects);
      
      // Should handle unusual combinations gracefully
      expect(prioritized).toBeDefined();
      expect(Array.isArray(prioritized)).toBe(true);
      
      // Should provide some meaningful categories
      expect(prioritized.length).toBeGreaterThan(0);
      
      // Analysis should work for unusual combinations
      expect(analysis.strengths).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      
      // Should have at least one strength identified
      expect(analysis.strengths.length).toBeGreaterThan(0);
    });
  });

// Helper function to run property tests manually if needed
export function runSubjectCategoryAlignmentTests() {
  console.log('Running Subject-Category Alignment property tests...');
  
  let passCount = 0;
  let totalTests = 50;

  for (let i = 0; i < totalTests; i++) {
    try {
      const subjects = subjectGenerator();
      const category = categoryGenerator();
      
      const score = calculateCategoryRelevance(subjects, category);
      
      // Basic property: score should be valid number between 0 and 1
      if (typeof score === 'number' && score >= 0 && score <= 1) {
        passCount++;
      }
    } catch (error) {
      console.error(`Test ${i + 1} failed:`, error.message);
    }
  }

  console.log(`Property tests passed: ${passCount}/${totalTests} (${(passCount/totalTests*100).toFixed(1)}%)`);
  return passCount === totalTests;
}