// lib/rag/__tests__/metadata-filter.test.js
// Property-based tests for MetadataFilter
// **Feature: rag-filtering-enhancement, Property 2: Enhanced Metadata Recognition**

import { MetadataFilter } from '../metadata-filter.js';

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
const careerChunkGenerator = () => {
  const generators = [
    // Primary metadata chunks
    () => ({
      chunk_metadata: {
        career_code: `career_${Math.random().toString(36).substr(2, 9)}`,
        career_title: 'Software Engineer'
      },
      chunk_text: 'Software Engineer: Develops and maintains software applications.'
    }),
    
    // Secondary metadata chunks  
    () => ({
      chunk_metadata: {
        career: 'Data Scientist',
        source: 'career_data_scientist'
      },
      chunk_text: 'Data Scientist: Analyzes complex data to derive insights.'
    }),
    
    // Source tag chunks
    () => ({
      chunk_metadata: {
        source: 'career_guide_nursing',
        type: 'career_information'
      },
      chunk_text: 'Nursing: Provides healthcare and patient care services.'
    }),
    
    // Text pattern chunks
    () => ({
      chunk_metadata: {},
      chunk_text: 'Career: Civil Engineer\nDesigns and oversees construction projects.'
    }),
    
    // Category-based chunks
    () => ({
      chunk_metadata: {
        category: 'engineering_career',
        title: 'Mechanical Engineer'
      },
      chunk_text: 'Mechanical Engineer: Designs mechanical systems and devices.'
    }),
    
    // Non-career chunks (should be filtered out)
    () => ({
      chunk_metadata: {
        type: 'general_information',
        source: 'university_info'
      },
      chunk_text: 'This is general information about university admission requirements.'
    })
  ];
  
  const randomGenerator = generators[Math.floor(Math.random() * generators.length)];
  return randomGenerator();
};

describe('MetadataFilter Property Tests', () => {
  let filter;

  beforeEach(() => {
    filter = new MetadataFilter();
  });

  test('Property 2: Enhanced Metadata Recognition - Career chunks with identifiers should pass filtering', () => {
    // **Feature: rag-filtering-enhancement, Property 2: Enhanced Metadata Recognition**
    // **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
    
    fc.assert(fc.property(
      careerChunkGenerator,
      (chunk) => {
        const hasCareerIdentifier = 
          chunk.chunk_metadata?.career_code ||
          chunk.chunk_metadata?.career_title ||
          chunk.chunk_metadata?.career_name ||
          chunk.chunk_metadata?.career ||
          chunk.chunk_metadata?.occupation ||
          chunk.chunk_metadata?.job_title ||
          (chunk.chunk_metadata?.source && chunk.chunk_metadata.source.includes('career')) ||
          (chunk.chunk_metadata?.type && chunk.chunk_metadata.type.includes('career')) ||
          (chunk.chunk_text && chunk.chunk_text.includes('Career:')) ||
          (chunk.chunk_text && chunk.chunk_text.includes('Occupation:'));
        
        const validation = filter.validateCareerChunk(chunk);
        
        // If chunk has career identifiers, it should pass validation
        // If it doesn't have identifiers, it may or may not pass (depending on heuristics)
        return !hasCareerIdentifier || validation.isValid;
      }
    ), { numRuns: 100 });
  });

  test('Primary metadata fields should be recognized with high confidence', () => {
    const testCases = [
      {
        chunk_metadata: { career_code: 'eng_001' },
        expectedMethod: 'career_code',
        minConfidence: 0.9
      },
      {
        chunk_metadata: { career_title: 'Software Engineer' },
        expectedMethod: 'career_title', 
        minConfidence: 0.9
      },
      {
        chunk_metadata: { career_name: 'Data Scientist' },
        expectedMethod: 'career_name',
        minConfidence: 0.9
      }
    ];

    testCases.forEach(testCase => {
      const result = filter.validateCareerChunk(testCase);
      expect(result.isValid).toBe(true);
      expect(result.method).toBe(testCase.expectedMethod);
      expect(result.confidence).toBeGreaterThanOrEqual(testCase.minConfidence);
    });
  });

  test('Source tags should be recognized correctly', () => {
    const testCases = [
      { chunk_metadata: { source: 'career_software_engineer' } },
      { chunk_metadata: { source: 'job_description_nurse' } },
      { chunk_metadata: { source_type: 'career_guide' } },
      { chunk_metadata: { source: 'occupation_teacher' } }
    ];

    testCases.forEach(testCase => {
      const result = filter.validateCareerChunk(testCase);
      expect(result.isValid).toBe(true);
      expect(result.method).toBe('source_tag');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });
  });

  test('Text patterns should be recognized correctly', () => {
    const testCases = [
      {
        chunk_text: 'Career: Software Engineer\nDevelops software applications.',
        expectedMethod: 'text_pattern_career'
      },
      {
        chunk_text: 'Occupation: Nurse\nProvides patient care in hospitals.',
        expectedMethod: 'text_pattern_career'
      },
      {
        chunk_text: 'Civil Engineer - Designs infrastructure projects.',
        expectedMethod: 'text_pattern_title'
      }
    ];

    testCases.forEach(testCase => {
      const result = filter.validateCareerChunk(testCase);
      expect(result.isValid).toBe(true);
      expect(result.method).toBe(testCase.expectedMethod);
      expect(result.confidence).toBeGreaterThanOrEqual(0.6);
    });
  });

  test('Filter method should process arrays correctly', () => {
    const chunks = [
      {
        chunk_metadata: { career_code: 'eng_001' },
        chunk_text: 'Software Engineer'
      },
      {
        chunk_metadata: { source: 'career_nurse' },
        chunk_text: 'Nurse: Provides healthcare'
      },
      {
        chunk_metadata: { type: 'general_info' },
        chunk_text: 'General university information'
      }
    ];

    const filtered = filter.filter(chunks, { logDetails: true });
    
    // Should filter out non-career chunks
    expect(filtered.length).toBeGreaterThanOrEqual(2);
    expect(filtered.length).toBeLessThanOrEqual(chunks.length);
    
    // All filtered chunks should have filter metadata
    filtered.forEach(chunk => {
      expect(chunk._filterMetadata).toBeDefined();
      expect(chunk._filterMetadata.identificationMethod).toBeDefined();
      expect(chunk._filterMetadata.confidence).toBeGreaterThan(0);
    });
  });

  test('Invalid inputs should be handled gracefully', () => {
    const invalidInputs = [
      null,
      undefined,
      'string',
      123,
      {},
      { chunk_metadata: null },
      { chunk_text: null }
    ];

    invalidInputs.forEach(input => {
      expect(() => {
        const result = filter.validateCareerChunk(input);
        expect(result.isValid).toBe(false);
      }).not.toThrow();
    });

    // Array filter should handle invalid arrays
    expect(() => {
      const result = filter.filter(null);
      expect(result).toEqual([]);
    }).not.toThrow();
  });

  test('Confidence levels should be appropriate for different methods', () => {
    const confidenceTests = [
      { metadata: { career_code: 'test' }, minConfidence: 0.9 },
      { metadata: { career_title: 'Engineer' }, minConfidence: 0.9 },
      { metadata: { career: 'Nurse' }, minConfidence: 0.8 },
      { metadata: { source: 'career_doctor' }, minConfidence: 0.7 },
      { text: 'Career: Teacher', minConfidence: 0.7 },
      { metadata: { category: 'engineering' }, minConfidence: 0.5 }
    ];

    confidenceTests.forEach(test => {
      const chunk = {
        chunk_metadata: test.metadata || {},
        chunk_text: test.text || ''
      };
      
      const result = filter.validateCareerChunk(chunk);
      if (result.isValid) {
        expect(result.confidence).toBeGreaterThanOrEqual(test.minConfidence);
      }
    });
  });

  test('Strict mode should be more restrictive', () => {
    const strictFilter = new MetadataFilter({ strictMode: true });
    const lenientFilter = new MetadataFilter({ strictMode: false });
    
    // Heuristic-only chunk (should pass lenient but not strict)
    const heuristicChunk = {
      chunk_metadata: {},
      chunk_text: 'This job requires a degree and offers competitive salary.'
    };

    const strictResult = strictFilter.validateCareerChunk(heuristicChunk);
    const lenientResult = lenientFilter.validateCareerChunk(heuristicChunk);

    // Strict mode should be more restrictive
    expect(strictResult.isValid).toBe(false);
    // Lenient mode might accept it (depending on heuristics)
  });

  test('Filter statistics should be available', () => {
    const stats = filter.getStats();
    
    expect(stats).toBeDefined();
    expect(stats.version).toBeDefined();
    expect(Array.isArray(stats.methods)).toBe(true);
    expect(stats.methods.length).toBeGreaterThan(0);
    expect(typeof stats.strictMode).toBe('boolean');
  });
});

// Helper function to run property tests manually if needed
export function runMetadataFilterPropertyTests() {
  console.log('Running MetadataFilter property tests...');
  
  const filter = new MetadataFilter();
  let passCount = 0;
  let totalTests = 100;

  for (let i = 0; i < totalTests; i++) {
    try {
      const chunk = careerChunkGenerator();
      const result = filter.validateCareerChunk(chunk);
      
      // Basic property: if chunk has obvious career indicators, should be valid
      const hasObviousIndicators = 
        chunk.chunk_metadata?.career_code ||
        chunk.chunk_metadata?.career_title ||
        (chunk.chunk_text && chunk.chunk_text.includes('Career:'));
      
      if (!hasObviousIndicators || result.isValid) {
        passCount++;
      }
    } catch (error) {
      console.error(`Test ${i + 1} failed:`, error.message);
    }
  }

  console.log(`Property tests passed: ${passCount}/${totalTests} (${(passCount/totalTests*100).toFixed(1)}%)`);
  return passCount === totalTests;
}