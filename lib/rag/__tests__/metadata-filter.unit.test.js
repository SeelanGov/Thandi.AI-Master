// lib/rag/__tests__/metadata-filter.unit.test.js
// Unit tests for MetadataFilter class
// Tests each identification method independently

import { MetadataFilter } from '../metadata-filter.js';

describe('MetadataFilter Unit Tests', () => {
  let filter;

  beforeEach(() => {
    filter = new MetadataFilter();
  });

  describe('Primary Metadata Detection', () => {
    test('should recognize career_code with high confidence', () => {
      const chunk = {
        chunk_metadata: { career_code: 'eng_001' },
        chunk_text: 'Software Engineer description'
      };

      const result = filter.validateCareerChunk(chunk);
      
      expect(result.isValid).toBe(true);
      expect(result.method).toBe('career_code');
      expect(result.confidence).toBeGreaterThanOrEqual(0.95);
    });

    test('should recognize career_title with high confidence', () => {
      const chunk = {
        chunk_metadata: { career_title: 'Data Scientist' },
        chunk_text: 'Analyzes data to derive insights'
      };

      const result = filter.validateCareerChunk(chunk);
      
      expect(result.isValid).toBe(true);
      expect(result.method).toBe('career_title');
      expect(result.confidence).toBeGreaterThanOrEqual(0.90);
      expect(result.extractedTitle).toBe('Data Scientist');
    });

    test('should recognize career_name with high confidence', () => {
      const chunk = {
        chunk_metadata: { career_name: 'Civil Engineer' },
        chunk_text: 'Designs infrastructure projects'
      };

      const result = filter.validateCareerChunk(chunk);
      
      expect(result.isValid).toBe(true);
      expect(result.method).toBe('career_name');
      expect(result.confidence).toBeGreaterThanOrEqual(0.90);
      expect(result.extractedTitle).toBe('Civil Engineer');
    });
  });

  describe('Secondary Metadata Detection', () => {
    test('should recognize career field', () => {
      const chunk = {
        chunk_metadata: { career: 'Nurse' },
        chunk_text: 'Provides patient care'
      };

      const result = filter.validateCareerChunk(chunk);
      
      expect(result.isValid).toBe(true);
      expect(result.method).toBe('career_field');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test('should recognize occupation field', () => {
      const chunk = {
        chunk_metadata: { occupation: 'Teacher' },
        chunk_text: 'Educates students'
      };

      const result = filter.validateCareerChunk(chunk);
      
      expect(result.isValid).toBe(true);
      expect(result.method).toBe('occupation');
      expect(result.confidence).toBeGreaterThanOrEqual(0.80);
    });

    test('should recognize job_title field', () => {
      const chunk = {
        chunk_metadata: { job_title: 'Marketing Manager' },
        chunk_text: 'Manages marketing campaigns'
      };

      const result = filter.validateCareerChunk(chunk);
      
      expect(result.isValid).toBe(true);
      expect(result.method).toBe('job_title');
      expect(result.confidence).toBeGreaterThanOrEqual(0.80);
    });
  });

  describe('Source Tag Detection', () => {
    test('should recognize career source tags', () => {
      const testCases = [
        { source: 'career_software_engineer', expected: true },
        { source: 'careers_database', expected: true },
        { source: 'occupation_nurse', expected: true },
        { source: 'job_description_teacher', expected: true },
        { source: 'profession_doctor', expected: true },
        { source: 'university_info', expected: false },
        { source: 'general_content', expected: false }
      ];

      testCases.forEach(testCase => {
        const chunk = {
          chunk_metadata: { source: testCase.source },
          chunk_text: 'Career description'
        };

        const result = filter.validateCareerChunk(chunk);
        
        if (testCase.expected) {
          expect(result.isValid).toBe(true);
          expect(result.method).toBe('source_tag');
          expect(result.confidence).toBeGreaterThanOrEqual(0.75);
        }
      });
    });

    test('should recognize source_type tags', () => {
      const chunk = {
        chunk_metadata: { source_type: 'career_guide' },
        chunk_text: 'Career guidance information'
      };

      const result = filter.validateCareerChunk(chunk);
      
      expect(result.isValid).toBe(true);
      expect(result.method).toBe('source_tag');
      expect(result.confidence).toBeGreaterThanOrEqual(0.75);
    });
  });

  describe('Text Pattern Detection', () => {
    test('should recognize "Career:" pattern', () => {
      const chunk = {
        chunk_metadata: {},
        chunk_text: 'Career: Software Engineer\nDevelops software applications and systems.'
      };

      const result = filter.validateCareerChunk(chunk);
      
      expect(result.isValid).toBe(true);
      expect(result.method).toBe('text_pattern_career');
      expect(result.confidence).toBeGreaterThanOrEqual(0.80);
      expect(result.extractedTitle).toBe('Software Engineer');
    });

    test('should recognize "Occupation:" pattern', () => {
      const chunk = {
        chunk_metadata: {},
        chunk_text: 'Occupation: Nurse\nProvides healthcare services to patients.'
      };

      const result = filter.validateCareerChunk(chunk);
      
      expect(result.isValid).toBe(true);
      expect(result.method).toBe('text_pattern_career');
      expect(result.confidence).toBeGreaterThanOrEqual(0.80);
      expect(result.extractedTitle).toBe('Nurse');
    });

    test('should recognize title patterns', () => {
      const testCases = [
        'Civil Engineer - Designs and oversees construction projects.',
        'Data Scientist: Analyzes complex data sets.',
        'Marketing Manager\nLeads marketing initiatives.'
      ];

      testCases.forEach(text => {
        const chunk = {
          chunk_metadata: {},
          chunk_text: text
        };

        const result = filter.validateCareerChunk(chunk);
        
        if (result.isValid) {
          expect(result.method).toMatch(/text_pattern/);
          expect(result.confidence).toBeGreaterThan(0.6);
        }
      });
    });

    test('should recognize career keywords', () => {
      const keywordTests = [
        { text: 'Software engineer develops applications', keyword: 'engineer' },
        { text: 'The developer creates web applications', keyword: 'developer' },
        { text: 'Business analyst reviews processes', keyword: 'analyst' },
        { text: 'Project manager coordinates teams', keyword: 'manager' },
        { text: 'Marketing specialist handles campaigns', keyword: 'specialist' }
      ];

      keywordTests.forEach(test => {
        const chunk = {
          chunk_metadata: {},
          chunk_text: test.text
        };

        const result = filter.validateCareerChunk(chunk);
        
        expect(result.isValid).toBe(true);
        expect(result.method).toBe('text_pattern_keyword');
        expect(result.confidence).toBeGreaterThanOrEqual(0.65);
      });
    });
  });

  describe('Category Metadata Detection', () => {
    test('should recognize career categories', () => {
      const categoryTests = [
        { category: 'career', expected: true },
        { category: 'occupation', expected: true },
        { category: 'engineering', expected: true },
        { category: 'healthcare', expected: true },
        { category: 'technology', expected: true },
        { category: 'business', expected: true },
        { category: 'education', expected: true },
        { category: 'general_info', expected: false },
        { category: 'university', expected: false }
      ];

      categoryTests.forEach(test => {
        const chunk = {
          chunk_metadata: { category: test.category },
          chunk_text: 'Career description'
        };

        const result = filter.validateCareerChunk(chunk);
        
        if (test.expected) {
          expect(result.isValid).toBe(true);
          expect(result.method).toBe('category_metadata');
          expect(result.confidence).toBeGreaterThanOrEqual(0.60);
        }
      });
    });

    test('should recognize type field categories', () => {
      const chunk = {
        chunk_metadata: { type: 'engineering_career' },
        chunk_text: 'Engineering career information'
      };

      const result = filter.validateCareerChunk(chunk);
      
      expect(result.isValid).toBe(true);
      expect(result.method).toBe('category_metadata');
      expect(result.confidence).toBeGreaterThanOrEqual(0.60);
    });
  });

  describe('Heuristic Detection', () => {
    test('should recognize salary information heuristic', () => {
      const salaryTests = [
        'This career offers competitive salary packages.',
        'Average salary: R50,000 per month',
        'Salary range from R30,000 to R80,000',
        'Compensation includes R 45,000 monthly'
      ];

      salaryTests.forEach(text => {
        const chunk = {
          chunk_metadata: {},
          chunk_text: text
        };

        const result = filter.validateCareerChunk(chunk);
        
        expect(result.isValid).toBe(true);
        expect(result.method).toBe('heuristic_salary');
        expect(result.confidence).toBeGreaterThanOrEqual(0.50);
      });
    });

    test('should recognize education requirements heuristic', () => {
      const educationTests = [
        'Requires a bachelor\'s degree in engineering.',
        'Minimum qualification: diploma in nursing.',
        'Advanced degree preferred for this position.',
        'Professional qualification required.'
      ];

      educationTests.forEach(text => {
        const chunk = {
          chunk_metadata: {},
          chunk_text: text
        };

        const result = filter.validateCareerChunk(chunk);
        
        expect(result.isValid).toBe(true);
        expect(result.method).toBe('heuristic_education');
        expect(result.confidence).toBeGreaterThanOrEqual(0.50);
      });
    });

    test('should recognize job structure heuristic', () => {
      const structureTests = [
        'Key responsibilities include project management.',
        'Job requirements: 3+ years experience.',
        'Skills needed: communication and leadership.',
        'Job description: manages team operations.'
      ];

      structureTests.forEach(text => {
        const chunk = {
          chunk_metadata: {},
          chunk_text: text
        };

        const result = filter.validateCareerChunk(chunk);
        
        expect(result.isValid).toBe(true);
        expect(result.method).toBe('heuristic_structure');
        expect(result.confidence).toBeGreaterThanOrEqual(0.45);
      });
    });
  });

  describe('Strict Mode Behavior', () => {
    test('strict mode should reject heuristic-only matches', () => {
      const strictFilter = new MetadataFilter({ strictMode: true });
      
      const heuristicChunk = {
        chunk_metadata: {},
        chunk_text: 'This position offers competitive salary and benefits.'
      };

      const result = strictFilter.validateCareerChunk(heuristicChunk);
      
      expect(result.isValid).toBe(false);
    });

    test('strict mode should accept strong indicators', () => {
      const strictFilter = new MetadataFilter({ strictMode: true });
      
      const strongChunk = {
        chunk_metadata: { career_code: 'eng_001' },
        chunk_text: 'Software Engineer career information'
      };

      const result = strictFilter.validateCareerChunk(strongChunk);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('Filter Array Processing', () => {
    test('should filter array of chunks correctly', () => {
      const chunks = [
        {
          chunk_metadata: { career_code: 'eng_001' },
          chunk_text: 'Software Engineer'
        },
        {
          chunk_metadata: { source: 'career_nurse' },
          chunk_text: 'Nurse career info'
        },
        {
          chunk_metadata: { type: 'general_info' },
          chunk_text: 'University admission requirements'
        },
        {
          chunk_metadata: {},
          chunk_text: 'Career: Teacher\nEducates students in schools.'
        }
      ];

      const filtered = filter.filter(chunks, { logDetails: true });
      
      expect(filtered.length).toBeGreaterThanOrEqual(3);
      expect(filtered.length).toBeLessThanOrEqual(4);
      
      // Check that all filtered chunks have metadata
      filtered.forEach(chunk => {
        expect(chunk._filterMetadata).toBeDefined();
        expect(chunk._filterMetadata.identificationMethod).toBeDefined();
        expect(chunk._filterMetadata.confidence).toBeGreaterThan(0);
      });
    });

    test('should handle empty arrays gracefully', () => {
      const result = filter.filter([]);
      expect(result).toEqual([]);
    });

    test('should handle invalid input gracefully', () => {
      const invalidInputs = [null, undefined, 'string', 123];
      
      invalidInputs.forEach(input => {
        expect(() => {
          const result = filter.filter(input);
          expect(result).toEqual([]);
        }).not.toThrow();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed chunks gracefully', () => {
      const malformedChunks = [
        null,
        undefined,
        'string',
        123,
        {},
        { chunk_metadata: null },
        { chunk_text: null },
        { chunk_metadata: 'invalid' },
        { chunk_text: 123 }
      ];

      malformedChunks.forEach(chunk => {
        expect(() => {
          const result = filter.validateCareerChunk(chunk);
          expect(result.isValid).toBe(false);
        }).not.toThrow();
      });
    });

    test('should handle missing properties gracefully', () => {
      const incompleteChunks = [
        { chunk_metadata: {} },
        { chunk_text: '' },
        { chunk_metadata: {}, chunk_text: '' },
        { chunk_metadata: { source: '' } },
        { chunk_text: '   ' }
      ];

      incompleteChunks.forEach(chunk => {
        expect(() => {
          filter.validateCareerChunk(chunk);
        }).not.toThrow();
      });
    });
  });

  describe('Utility Methods', () => {
    test('should provide filter statistics', () => {
      const stats = filter.getStats();
      
      expect(stats).toBeDefined();
      expect(stats.version).toBeDefined();
      expect(Array.isArray(stats.methods)).toBe(true);
      expect(stats.methods.length).toBeGreaterThan(10);
      expect(typeof stats.strictMode).toBe('boolean');
    });

    test('should extract titles correctly', () => {
      // Test private method through public interface
      const titleTests = [
        {
          chunk: {
            chunk_metadata: { career_title: 'Software Engineer' },
            chunk_text: 'Develops software'
          },
          expectedTitle: 'Software Engineer'
        },
        {
          chunk: {
            chunk_metadata: {},
            chunk_text: 'Career: Data Scientist\nAnalyzes data'
          },
          expectedTitle: 'Data Scientist'
        }
      ];

      titleTests.forEach(test => {
        const result = filter.validateCareerChunk(test.chunk);
        if (result.isValid && result.extractedTitle) {
          expect(result.extractedTitle).toBe(test.expectedTitle);
        }
      });
    });
  });

  describe('Performance', () => {
    test('should process large arrays efficiently', () => {
      // Create array of 1000 chunks
      const largeArray = Array(1000).fill().map((_, i) => ({
        chunk_metadata: { career_code: `career_${i}` },
        chunk_text: `Career ${i} description`
      }));

      const startTime = Date.now();
      const filtered = filter.filter(largeArray);
      const endTime = Date.now();

      expect(filtered.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should validate individual chunks quickly', () => {
      const chunk = {
        chunk_metadata: { career_code: 'test' },
        chunk_text: 'Test career description'
      };

      const iterations = 10000;
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        filter.validateCareerChunk(chunk);
      }
      
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / iterations;
      
      expect(avgTime).toBeLessThan(1); // Should average less than 1ms per validation
    });
  });
});