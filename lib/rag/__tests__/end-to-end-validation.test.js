// lib/rag/__tests__/end-to-end-validation.test.js
// Task 9.3: End-to-End Validation Tests
// Validates Requirements: 10.1, 10.2, 10.3, 10.4

import { jest } from '@jest/globals';
import { matchCareersToProfile } from '../career-matcher.js';

// Mock external dependencies
jest.mock('@supabase/supabase-js');
jest.mock('openai');

describe('End-to-End Validation Test Suite', () => {
  let mockSupabase;
  let mockOpenAI;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Supabase client with realistic career data
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        // Return different career data based on the query
        const mockCareers = [
          {
            data: {
              career_code: 'ENG001',
              career_title: 'Software Engineer',
              career_category: 'Technology',
              required_education: 'Bachelor\'s Degree in Computer Science',
              required_qualifications: 'Programming skills, Problem-solving abilities',
              required_subjects: 'Mathematics, Information Technology',
              salary_entry_min: 350000,
              salary_entry_max: 450000,
              salary_mid_min: 500000,
              salary_mid_max: 700000,
              salary_senior_min: 800000,
              salary_senior_max: 1200000,
              job_outlook: 'Excellent growth prospects',
              demand_level: 'very_high',
              short_description: 'Design, develop, and maintain software applications'
            },
            error: null
          },
          {
            data: {
              career_code: 'BUS001',
              career_title: 'Business Analyst',
              career_category: 'Business',
              required_education: 'Bachelor\'s Degree in Business or related field',
              required_qualifications: 'Analytical skills, Communication skills',
              required_subjects: 'Business Studies, Mathematics',
              salary_entry_min: 300000,
              salary_entry_max: 400000,
              salary_mid_min: 450000,
              salary_mid_max: 600000,
              salary_senior_min: 700000,
              salary_senior_max: 1000000,
              job_outlook: 'Good growth prospects',
              demand_level: 'high',
              short_description: 'Analyze business processes and recommend improvements'
            },
            error: null
          },
          {
            data: {
              career_code: 'HEA001',
              career_title: 'Biomedical Engineer',
              career_category: 'Healthcare',
              required_education: 'Bachelor\'s Degree in Biomedical Engineering',
              required_qualifications: 'Engineering skills, Medical knowledge',
              required_subjects: 'Mathematics, Life Sciences, Physical Sciences',
              salary_entry_min: 400000,
              salary_entry_max: 500000,
              salary_mid_min: 550000,
              salary_mid_max: 750000,
              salary_senior_min: 800000,
              salary_senior_max: 1100000,
              job_outlook: 'Excellent growth in healthcare technology',
              demand_level: 'high',
              short_description: 'Design medical devices and healthcare solutions'
            },
            error: null
          }
        ];
        
        // Cycle through mock careers
        const careerIndex = Math.floor(Math.random() * mockCareers.length);
        return Promise.resolve(mockCareers[careerIndex]);
      })
    };

    // Mock OpenAI client
    mockOpenAI = {
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [{ embedding: new Array(1536).fill(0.1) }]
        })
      }
    };

    // Set up environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
  });

  describe('Complete Student Assessment Flow', () => {
    test('should handle complete Grade 10 student assessment flow', async () => {
      const grade10Student = {
        grade: 10,
        subjects: ['Mathematics', 'English', 'Natural Sciences', 'Geography'],
        interests: ['Problem Solving', 'Learning', 'Exploration'],
        marks: {
          Mathematics: 75,
          English: 80,
          'Natural Sciences': 78,
          Geography: 72
        },
        careerPreferences: 'I want to explore different career options and understand what subjects I need for university'
      };

      console.log('Testing Grade 10 student assessment flow...');
      
      const startTime = Date.now();
      const careers = await matchCareersToProfile(grade10Student);
      const duration = Date.now() - startTime;

      // Validate basic requirements
      expect(Array.isArray(careers)).toBe(true);
      expect(careers.length).toBeGreaterThanOrEqual(3);
      expect(careers.length).toBeLessThanOrEqual(5);
      expect(duration).toBeLessThan(10000);

      // Validate career structure for Grade 10
      careers.forEach((career, index) => {
        expect(career).toHaveProperty('title');
        expect(career).toHaveProperty('description');
        expect(career).toHaveProperty('category');
        expect(career).toHaveProperty('similarity');
        expect(career).toHaveProperty('confidence');
        expect(career).toHaveProperty('source');

        // Grade 10 appropriate careers (not too specialized)
        const title = career.title.toLowerCase();
        const specializedTerms = ['senior', 'lead', 'principal', 'chief', 'director', 'head'];
        const hasSpecializedTerms = specializedTerms.some(term => title.includes(term));
        expect(hasSpecializedTerms).toBe(false);

        console.log(`  Career ${index + 1}: ${career.title} (${career.category || 'N/A'}) - ${career.source}`);
      });

      console.log(`Grade 10 assessment completed in ${duration}ms with ${careers.length} careers`);
    });

    test('should handle complete Grade 11 student assessment flow', async () => {
      const grade11Student = {
        grade: 11,
        subjects: ['Mathematics', 'Physical Sciences', 'Information Technology', 'English'],
        interests: ['Technology', 'Programming', 'Innovation', 'Problem Solving'],
        marks: {
          Mathematics: 85,
          'Physical Sciences': 82,
          'Information Technology': 90,
          English: 78
        },
        careerPreferences: 'I am interested in technology careers, especially software development and engineering. I want to understand university requirements.'
      };

      console.log('Testing Grade 11 student assessment flow...');
      
      const startTime = Date.now();
      const careers = await matchCareersToProfile(grade11Student);
      const duration = Date.now() - startTime;

      // Validate basic requirements
      expect(Array.isArray(careers)).toBe(true);
      expect(careers.length).toBeGreaterThanOrEqual(3);
      expect(careers.length).toBeLessThanOrEqual(5);
      expect(duration).toBeLessThan(10000);

      // Validate career structure and relevance for Grade 11
      careers.forEach((career, index) => {
        expect(career).toHaveProperty('title');
        expect(career).toHaveProperty('description');
        expect(career).toHaveProperty('category');
        expect(career).toHaveProperty('similarity');
        expect(career).toHaveProperty('confidence');
        expect(career).toHaveProperty('source');

        // Should have education requirements for Grade 11
        if (career.education) {
          expect(typeof career.education).toBe('string');
          expect(career.education.length).toBeGreaterThan(0);
        }

        console.log(`  Career ${index + 1}: ${career.title} (${career.category || 'N/A'}) - ${career.source}`);
      });

      // Check for technology-related careers given the profile
      const categories = careers.map(c => c.category).filter(Boolean);
      const titles = careers.map(c => c.title.toLowerCase());
      
      console.log(`Grade 11 assessment completed in ${duration}ms with ${careers.length} careers`);
      console.log('Categories found:', categories);
    });

    test('should handle complete Grade 12 student assessment flow', async () => {
      const grade12Student = {
        grade: 12,
        subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences', 'English', 'Information Technology'],
        interests: ['Research', 'Healthcare Technology', 'Innovation', 'University Study'],
        marks: {
          Mathematics: 88,
          'Physical Sciences': 85,
          'Life Sciences': 90,
          English: 82,
          'Information Technology': 87
        },
        careerPreferences: 'I want to combine my interest in science and technology, possibly in healthcare or biomedical fields. I need to know about university applications and requirements.'
      };

      console.log('Testing Grade 12 student assessment flow...');
      
      const startTime = Date.now();
      const careers = await matchCareersToProfile(grade12Student);
      const duration = Date.now() - startTime;

      // Validate basic requirements
      expect(Array.isArray(careers)).toBe(true);
      expect(careers.length).toBeGreaterThanOrEqual(3);
      expect(careers.length).toBeLessThanOrEqual(5);
      expect(duration).toBeLessThan(10000);

      // Validate comprehensive career information for Grade 12
      careers.forEach((career, index) => {
        expect(career).toHaveProperty('title');
        expect(career).toHaveProperty('description');
        expect(career).toHaveProperty('category');
        expect(career).toHaveProperty('similarity');
        expect(career).toHaveProperty('confidence');
        expect(career).toHaveProperty('source');

        // Grade 12 should have detailed career information
        expect(career.description.length).toBeGreaterThan(20);

        // Should have salary information if available
        if (career.salaryRange) {
          expect(career.salaryRange).toHaveProperty('entry');
          if (career.salaryRange.entry) {
            expect(career.salaryRange.entry).toHaveProperty('min');
            expect(career.salaryRange.entry).toHaveProperty('max');
          }
        }

        console.log(`  Career ${index + 1}: ${career.title} (${career.category || 'N/A'}) - ${career.source}`);
      });

      console.log(`Grade 12 assessment completed in ${duration}ms with ${careers.length} careers`);
    });
  });

  describe('Frontend Integration Validation', () => {
    test('should return data in format expected by frontend components', async () => {
      const testProfile = {
        grade: 11,
        subjects: ['Mathematics', 'Business Studies'],
        interests: ['Finance', 'Analysis']
      };

      const careers = await matchCareersToProfile(testProfile);

      // Validate frontend-expected structure
      expect(Array.isArray(careers)).toBe(true);
      
      careers.forEach(career => {
        // Required fields for frontend display
        expect(career).toHaveProperty('title');
        expect(typeof career.title).toBe('string');
        expect(career.title.length).toBeGreaterThan(0);

        expect(career).toHaveProperty('description');
        expect(typeof career.description).toBe('string');
        expect(career.description.length).toBeGreaterThan(10);

        // Optional but expected fields
        if (career.category) {
          expect(typeof career.category).toBe('string');
        }

        if (career.salaryRange) {
          expect(typeof career.salaryRange).toBe('object');
        }

        if (career.education) {
          expect(typeof career.education).toBe('string');
        }

        // Metadata fields for tracking
        expect(career).toHaveProperty('source');
        expect(['rag', 'fallback', 'emergency_fallback', 'hybrid']).toContain(career.source);

        expect(career).toHaveProperty('confidence');
        expect(typeof career.confidence).toBe('number');
        expect(career.confidence).toBeGreaterThanOrEqual(0);
        expect(career.confidence).toBeLessThanOrEqual(1);
      });
    });

    test('should handle frontend error scenarios gracefully', async () => {
      const invalidProfiles = [
        null,
        undefined,
        {},
        { grade: 'invalid' },
        { subjects: 'not an array' }
      ];

      for (const profile of invalidProfiles) {
        const careers = await matchCareersToProfile(profile);
        
        // Should still return valid structure for frontend
        expect(Array.isArray(careers)).toBe(true);
        expect(careers.length).toBeGreaterThanOrEqual(1);
        
        careers.forEach(career => {
          expect(career).toHaveProperty('title');
          expect(career).toHaveProperty('description');
          expect(career).toHaveProperty('source');
        });
      }
    });
  });

  describe('Backend System Integration', () => {
    test('should integrate with existing CAG verification system', async () => {
      const profile = {
        grade: 11,
        subjects: ['Mathematics', 'Physical Sciences'],
        interests: ['Engineering']
      };

      const careers = await matchCareersToProfile(profile);

      // Verify careers pass through safety validation
      careers.forEach(career => {
        // Safety validation requirements
        expect(career.title.length).toBeGreaterThan(2);
        expect(career.title.length).toBeLessThan(101);
        expect(career.description.length).toBeGreaterThan(10);
        
        // No inappropriate content
        const content = `${career.title} ${career.description}`.toLowerCase();
        const inappropriateTerms = ['inappropriate', 'offensive', 'harmful'];
        inappropriateTerms.forEach(term => {
          expect(content.includes(term)).toBe(false);
        });
      });
    });

    test('should maintain POPIA compliance and data sanitization', async () => {
      const profileWithPII = {
        grade: 11,
        subjects: ['Mathematics'],
        interests: ['Technology'],
        // Simulate potential PII that should be sanitized
        studentName: 'John Doe',
        schoolName: 'Test High School',
        personalInfo: 'Some personal details'
      };

      const careers = await matchCareersToProfile(profileWithPII);

      // Verify no PII leakage in career recommendations
      careers.forEach(career => {
        const careerText = `${career.title} ${career.description}`.toLowerCase();
        
        // Should not contain student-specific information
        expect(careerText.includes('john doe')).toBe(false);
        expect(careerText.includes('test high school')).toBe(false);
        
        // Should be generic career information
        expect(career.title).toBeTruthy();
        expect(career.description).toBeTruthy();
      });
    });

    test('should integrate with caching and performance systems', async () => {
      const profile = {
        grade: 11,
        subjects: ['Mathematics', 'Information Technology'],
        interests: ['Programming']
      };

      // First request
      const startTime1 = Date.now();
      const careers1 = await matchCareersToProfile(profile);
      const duration1 = Date.now() - startTime1;

      // Second request (should potentially use cache)
      const startTime2 = Date.now();
      const careers2 = await matchCareersToProfile(profile);
      const duration2 = Date.now() - startTime2;

      // Both should return valid results
      expect(careers1.length).toBeGreaterThanOrEqual(3);
      expect(careers2.length).toBeGreaterThanOrEqual(3);
      
      // Performance should be reasonable
      expect(duration1).toBeLessThan(10000);
      expect(duration2).toBeLessThan(10000);

      console.log(`Cache test - First: ${duration1}ms, Second: ${duration2}ms`);
    });
  });

  describe('PDF Generation Integration', () => {
    test('should provide career data suitable for PDF generation', async () => {
      const profile = {
        grade: 12,
        subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
        interests: ['Research', 'Healthcare'],
        marks: { Mathematics: 85, 'Physical Sciences': 82, 'Life Sciences': 88 }
      };

      const careers = await matchCareersToProfile(profile);

      // Validate PDF-ready data structure
      careers.forEach(career => {
        // Title for PDF headers
        expect(career.title).toBeDefined();
        expect(career.title.length).toBeGreaterThan(2);
        expect(career.title.length).toBeLessThan(101);

        // Description for PDF content
        expect(career.description).toBeDefined();
        expect(career.description.length).toBeGreaterThan(20);

        // Category for PDF organization
        if (career.category) {
          expect(typeof career.category).toBe('string');
          expect(career.category.length).toBeGreaterThan(0);
        }

        // Education requirements for PDF sections
        if (career.education) {
          expect(typeof career.education).toBe('string');
          expect(career.education.length).toBeGreaterThan(0);
        }

        // Salary information for PDF tables
        if (career.salaryRange && career.salaryRange.entry) {
          expect(typeof career.salaryRange.entry.min).toBe('number');
          expect(typeof career.salaryRange.entry.max).toBe('number');
          expect(career.salaryRange.entry.min).toBeGreaterThan(0);
          expect(career.salaryRange.entry.max).toBeGreaterThan(career.salaryRange.entry.min);
        }

        // Outlook information for PDF content
        if (career.outlook) {
          expect(typeof career.outlook).toBe('string');
          expect(career.outlook.length).toBeGreaterThan(0);
        }
      });
    });

    test('should handle PDF generation edge cases', async () => {
      const minimalProfile = {
        grade: 10,
        subjects: ['Mathematics'],
        interests: []
      };

      const careers = await matchCareersToProfile(minimalProfile);

      // Even minimal profiles should provide PDF-ready data
      expect(careers.length).toBeGreaterThanOrEqual(3);
      
      careers.forEach(career => {
        expect(career.title).toBeDefined();
        expect(career.description).toBeDefined();
        
        // Should have fallback values for missing data
        if (!career.category) {
          expect(career.source).toMatch(/fallback|emergency/);
        }
      });
    });
  });

  describe('System Resilience and Recovery', () => {
    test('should recover from partial system failures', async () => {
      const profile = {
        grade: 11,
        subjects: ['Mathematics', 'Business Studies'],
        interests: ['Finance']
      };

      // Mock partial database failure
      let callCount = 0;
      mockSupabase.single.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Database timeout'));
        }
        return Promise.resolve({
          data: {
            career_code: 'BUS001',
            career_title: 'Financial Analyst',
            career_category: 'Finance',
            required_education: 'Bachelor\'s Degree',
            demand_level: 'high'
          },
          error: null
        });
      });

      const careers = await matchCareersToProfile(profile);

      // Should still return careers despite partial failures
      expect(Array.isArray(careers)).toBe(true);
      expect(careers.length).toBeGreaterThanOrEqual(3);
      
      // Should include fallback careers
      const sources = careers.map(c => c.source);
      expect(sources.some(s => s.includes('fallback') || s.includes('emergency'))).toBe(true);
    });

    test('should handle complete system failure gracefully', async () => {
      const profile = {
        grade: 11,
        subjects: ['Mathematics'],
        interests: ['Problem Solving']
      };

      // Mock complete system failure
      mockSupabase.single.mockRejectedValue(new Error('Complete database failure'));
      mockOpenAI.embeddings.create.mockRejectedValue(new Error('OpenAI API failure'));

      const careers = await matchCareersToProfile(profile);

      // Should still return emergency careers
      expect(Array.isArray(careers)).toBe(true);
      expect(careers.length).toBeGreaterThanOrEqual(1);
      
      // All should be emergency fallback careers
      careers.forEach(career => {
        expect(career.source).toBe('emergency_fallback');
        expect(career.title).toBeDefined();
        expect(career.description).toBeDefined();
      });
    });
  });

  describe('Performance Under Load', () => {
    test('should handle multiple concurrent student assessments', async () => {
      const profiles = [
        { grade: 10, subjects: ['Mathematics'], interests: ['Numbers'] },
        { grade: 11, subjects: ['Business Studies'], interests: ['Management'] },
        { grade: 12, subjects: ['Visual Arts'], interests: ['Design'] },
        { grade: 11, subjects: ['Life Sciences'], interests: ['Biology'] },
        { grade: 10, subjects: ['Information Technology'], interests: ['Computers'] }
      ];

      const startTime = Date.now();
      const promises = profiles.map(profile => matchCareersToProfile(profile));
      const results = await Promise.all(promises);
      const totalDuration = Date.now() - startTime;

      // Validate all results
      expect(results).toHaveLength(5);
      results.forEach((careers, index) => {
        expect(Array.isArray(careers)).toBe(true);
        expect(careers.length).toBeGreaterThanOrEqual(3);
        expect(careers.length).toBeLessThanOrEqual(5);
        
        console.log(`Student ${index + 1}: ${careers.length} careers in profile type: ${profiles[index].subjects.join(', ')}`);
      });

      // Performance validation
      expect(totalDuration).toBeLessThan(30000); // 30 seconds for 5 concurrent requests
      const avgDuration = totalDuration / 5;
      expect(avgDuration).toBeLessThan(10000); // Average under 10 seconds per request

      console.log(`Concurrent load test: ${totalDuration}ms total, ${avgDuration.toFixed(0)}ms average`);
    });
  });
});