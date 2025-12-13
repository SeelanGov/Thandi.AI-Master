// lib/rag/__tests__/diverse-profile-testing.test.js
// Task 9.2: Diverse Profile Testing Suite
// Validates Requirements: 10.1, 10.2, 10.3

import { jest } from '@jest/globals';
import { matchCareersToProfile, analyzeProfileComplexity } from '../career-matcher.js';

// Mock external dependencies
jest.mock('@supabase/supabase-js');
jest.mock('openai');

describe('Diverse Profile Testing Suite', () => {
  let mockSupabase;
  let mockOpenAI;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          career_code: 'TEST001',
          career_title: 'Test Career',
          career_category: 'Technology',
          required_education: 'Bachelor\'s Degree',
          demand_level: 'high'
        },
        error: null
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

  describe('STEM Profile Testing', () => {
    const stemProfiles = [
      {
        name: 'Mathematics & Physics Focus',
        profile: {
          grade: 11,
          subjects: ['Mathematics', 'Physical Sciences', 'Information Technology'],
          interests: ['Problem Solving', 'Research', 'Technology'],
          marks: { Mathematics: 85, 'Physical Sciences': 82, 'Information Technology': 88 }
        },
        expectedCategories: ['Engineering', 'Technology', 'Science']
      },
      {
        name: 'Life Sciences Specialist',
        profile: {
          grade: 12,
          subjects: ['Life Sciences', 'Mathematics', 'Physical Sciences'],
          interests: ['Biology', 'Research', 'Healthcare'],
          marks: { 'Life Sciences': 90, Mathematics: 78, 'Physical Sciences': 75 }
        },
        expectedCategories: ['Healthcare', 'Science', 'Research']
      },
      {
        name: 'Computer Science Track',
        profile: {
          grade: 11,
          subjects: ['Information Technology', 'Mathematics', 'Physical Sciences'],
          interests: ['Programming', 'Software Development', 'Innovation'],
          marks: { 'Information Technology': 92, Mathematics: 85, 'Physical Sciences': 80 }
        },
        expectedCategories: ['Technology', 'Engineering', 'Digital']
      },
      {
        name: 'Engineering Preparation',
        profile: {
          grade: 10,
          subjects: ['Mathematics', 'Physical Sciences', 'Technical Drawing'],
          interests: ['Design', 'Building', 'Problem Solving'],
          marks: { Mathematics: 88, 'Physical Sciences': 85, 'Technical Drawing': 90 }
        },
        expectedCategories: ['Engineering', 'Technology', 'Design']
      },
      {
        name: 'Pure Sciences Focus',
        profile: {
          grade: 12,
          subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences', 'Chemistry'],
          interests: ['Research', 'Laboratory Work', 'Discovery'],
          marks: { Mathematics: 82, 'Physical Sciences': 88, 'Life Sciences': 85, Chemistry: 90 }
        },
        expectedCategories: ['Science', 'Research', 'Healthcare']
      }
    ];

    stemProfiles.forEach(({ name, profile, expectedCategories }) => {
      test(`should provide appropriate STEM careers for ${name}`, async () => {
        const result = await matchCareersToProfile(profile);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(3);
        expect(result.length).toBeLessThanOrEqual(5);
        
        // Verify career quality
        result.forEach(career => {
          expect(career).toHaveProperty('title');
          expect(career).toHaveProperty('category');
          expect(career).toHaveProperty('description');
          expect(career.title).toBeTruthy();
          expect(career.description).toBeTruthy();
        });
        
        // Check for STEM-related categories
        const categories = result.map(c => c.category).filter(Boolean);
        const hasSTEMCategories = categories.some(cat => 
          expectedCategories.some(expected => 
            cat.toLowerCase().includes(expected.toLowerCase())
          )
        );
        
        if (categories.length > 0) {
          expect(hasSTEMCategories).toBe(true);
        }
        
        console.log(`${name} - Categories found:`, categories);
      });
    });

    test('should handle advanced STEM profile with high complexity', async () => {
      const advancedSTEMProfile = {
        grade: 12,
        subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences', 'Information Technology', 'Chemistry', 'Geography'],
        interests: ['Research', 'Technology', 'Environmental Science', 'Data Analysis', 'Innovation'],
        marks: {
          Mathematics: 95,
          'Physical Sciences': 92,
          'Life Sciences': 88,
          'Information Technology': 94,
          Chemistry: 90,
          Geography: 85
        },
        careerPreferences: 'I want to work in cutting-edge technology that helps solve environmental problems'
      };

      const complexity = analyzeProfileComplexity(advancedSTEMProfile);
      expect(complexity.profileType).toMatch(/comprehensive|broad/);
      expect(complexity.recommendedCount).toBeGreaterThanOrEqual(4);

      const result = await matchCareersToProfile(advancedSTEMProfile);
      
      expect(result.length).toBeGreaterThanOrEqual(4);
      expect(result.length).toBeLessThanOrEqual(5);
      
      // Should have diverse STEM categories
      const categories = result.map(c => c.category).filter(Boolean);
      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Business Profile Testing', () => {
    const businessProfiles = [
      {
        name: 'Business Management Focus',
        profile: {
          grade: 11,
          subjects: ['Business Studies', 'Accounting', 'Economics', 'Mathematics'],
          interests: ['Leadership', 'Management', 'Finance'],
          marks: { 'Business Studies': 88, Accounting: 85, Economics: 82, Mathematics: 78 }
        },
        expectedCategories: ['Business', 'Management', 'Finance']
      },
      {
        name: 'Accounting & Finance Specialist',
        profile: {
          grade: 12,
          subjects: ['Accounting', 'Mathematics', 'Business Studies'],
          interests: ['Numbers', 'Financial Analysis', 'Auditing'],
          marks: { Accounting: 92, Mathematics: 85, 'Business Studies': 80 }
        },
        expectedCategories: ['Finance', 'Business', 'Auditing']
      },
      {
        name: 'Economics & Policy Track',
        profile: {
          grade: 11,
          subjects: ['Economics', 'Business Studies', 'Geography', 'English'],
          interests: ['Policy Making', 'Economic Analysis', 'Research'],
          marks: { Economics: 90, 'Business Studies': 85, Geography: 82, English: 88 }
        },
        expectedCategories: ['Economics', 'Business', 'Policy']
      },
      {
        name: 'Entrepreneurship Preparation',
        profile: {
          grade: 10,
          subjects: ['Business Studies', 'Economics', 'Information Technology'],
          interests: ['Innovation', 'Starting Business', 'Technology'],
          marks: { 'Business Studies': 85, Economics: 80, 'Information Technology': 88 }
        },
        expectedCategories: ['Business', 'Entrepreneurship', 'Technology']
      }
    ];

    businessProfiles.forEach(({ name, profile, expectedCategories }) => {
      test(`should provide appropriate business careers for ${name}`, async () => {
        const result = await matchCareersToProfile(profile);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(3);
        expect(result.length).toBeLessThanOrEqual(5);
        
        // Verify career quality
        result.forEach(career => {
          expect(career).toHaveProperty('title');
          expect(career).toHaveProperty('description');
          expect(career.title).toBeTruthy();
          expect(career.description).toBeTruthy();
        });
        
        console.log(`${name} - Careers found:`, result.map(c => c.title));
      });
    });
  });

  describe('Creative Arts Profile Testing', () => {
    const artsProfiles = [
      {
        name: 'Visual Arts Specialist',
        profile: {
          grade: 11,
          subjects: ['Visual Arts', 'Design', 'English', 'Drama'],
          interests: ['Drawing', 'Design', 'Creative Expression'],
          marks: { 'Visual Arts': 92, Design: 88, English: 85, Drama: 90 }
        },
        expectedCategories: ['Arts', 'Design', 'Creative']
      },
      {
        name: 'Digital Arts & Technology',
        profile: {
          grade: 12,
          subjects: ['Visual Arts', 'Information Technology', 'Design', 'Mathematics'],
          interests: ['Digital Art', 'Animation', 'Technology'],
          marks: { 'Visual Arts': 88, 'Information Technology': 85, Design: 90, Mathematics: 75 }
        },
        expectedCategories: ['Digital', 'Arts', 'Technology']
      },
      {
        name: 'Performing Arts Focus',
        profile: {
          grade: 10,
          subjects: ['Drama', 'Music', 'English', 'Dance'],
          interests: ['Performance', 'Entertainment', 'Storytelling'],
          marks: { Drama: 95, Music: 90, English: 88, Dance: 92 }
        },
        expectedCategories: ['Arts', 'Entertainment', 'Performance']
      },
      {
        name: 'Creative Writing & Media',
        profile: {
          grade: 11,
          subjects: ['English', 'Drama', 'Visual Arts', 'History'],
          interests: ['Writing', 'Journalism', 'Media Production'],
          marks: { English: 92, Drama: 85, 'Visual Arts': 80, History: 88 }
        },
        expectedCategories: ['Media', 'Arts', 'Communications']
      }
    ];

    artsProfiles.forEach(({ name, profile, expectedCategories }) => {
      test(`should provide appropriate creative careers for ${name}`, async () => {
        const result = await matchCareersToProfile(profile);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(3);
        expect(result.length).toBeLessThanOrEqual(5);
        
        // Verify career quality
        result.forEach(career => {
          expect(career).toHaveProperty('title');
          expect(career).toHaveProperty('description');
          expect(career.title).toBeTruthy();
          expect(career.description).toBeTruthy();
        });
        
        console.log(`${name} - Careers found:`, result.map(c => c.title));
      });
    });
  });

  describe('Mixed/Interdisciplinary Profile Testing', () => {
    const mixedProfiles = [
      {
        name: 'STEM + Business Hybrid',
        profile: {
          grade: 12,
          subjects: ['Mathematics', 'Physical Sciences', 'Business Studies', 'Information Technology'],
          interests: ['Technology', 'Management', 'Innovation', 'Analysis'],
          marks: { Mathematics: 85, 'Physical Sciences': 80, 'Business Studies': 88, 'Information Technology': 90 }
        },
        expectedCategories: ['Technology', 'Business', 'Engineering']
      },
      {
        name: 'Arts + Technology Fusion',
        profile: {
          grade: 11,
          subjects: ['Visual Arts', 'Information Technology', 'Design', 'Mathematics'],
          interests: ['Digital Design', 'User Experience', 'Creative Technology'],
          marks: { 'Visual Arts': 90, 'Information Technology': 88, Design: 92, Mathematics: 78 }
        },
        expectedCategories: ['Digital', 'Design', 'Technology']
      },
      {
        name: 'Science + Communication',
        profile: {
          grade: 11,
          subjects: ['Life Sciences', 'English', 'Geography', 'Mathematics'],
          interests: ['Environmental Issues', 'Science Communication', 'Research'],
          marks: { 'Life Sciences': 88, English: 90, Geography: 85, Mathematics: 80 }
        },
        expectedCategories: ['Science', 'Communications', 'Environment']
      },
      {
        name: 'Business + Creative Arts',
        profile: {
          grade: 10,
          subjects: ['Business Studies', 'Visual Arts', 'English', 'Drama'],
          interests: ['Marketing', 'Brand Design', 'Creative Industries'],
          marks: { 'Business Studies': 85, 'Visual Arts': 88, English: 82, Drama: 85 }
        },
        expectedCategories: ['Marketing', 'Creative', 'Business']
      },
      {
        name: 'Comprehensive Multi-Disciplinary',
        profile: {
          grade: 12,
          subjects: ['Mathematics', 'Life Sciences', 'Business Studies', 'Visual Arts', 'Information Technology', 'English'],
          interests: ['Innovation', 'Research', 'Design Thinking', 'Technology', 'Leadership'],
          marks: {
            Mathematics: 85,
            'Life Sciences': 82,
            'Business Studies': 88,
            'Visual Arts': 85,
            'Information Technology': 90,
            English: 87
          },
          careerPreferences: 'I want to work at the intersection of technology, business, and creative problem-solving'
        },
        expectedCategories: ['Technology', 'Business', 'Innovation']
      }
    ];

    mixedProfiles.forEach(({ name, profile, expectedCategories }) => {
      test(`should provide diverse interdisciplinary careers for ${name}`, async () => {
        const complexity = analyzeProfileComplexity(profile);
        
        const result = await matchCareersToProfile(profile);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(3);
        expect(result.length).toBeLessThanOrEqual(5);
        
        // For comprehensive profiles, expect higher career counts
        if (complexity.profileType === 'comprehensive') {
          expect(result.length).toBeGreaterThanOrEqual(4);
        }
        
        // Verify career diversity for mixed profiles
        const categories = result.map(c => c.category).filter(Boolean);
        const uniqueCategories = new Set(categories);
        
        if (categories.length > 0) {
          expect(uniqueCategories.size).toBeGreaterThanOrEqual(2);
        }
        
        // Verify career quality
        result.forEach(career => {
          expect(career).toHaveProperty('title');
          expect(career).toHaveProperty('description');
          expect(career.title).toBeTruthy();
          expect(career.description).toBeTruthy();
        });
        
        console.log(`${name} - Categories:`, Array.from(uniqueCategories));
        console.log(`${name} - Profile Type:`, complexity.profileType);
      });
    });
  });

  describe('Grade-Specific Behavior Testing', () => {
    const gradeSpecificTests = [
      {
        grade: 10,
        description: 'Grade 10 - Early exploration phase',
        profile: {
          grade: 10,
          subjects: ['Mathematics', 'English', 'Natural Sciences'],
          interests: ['Learning', 'Exploration']
        },
        expectations: {
          minCareers: 3,
          maxCareers: 5,
          shouldIncludeBroadCareers: true
        }
      },
      {
        grade: 11,
        description: 'Grade 11 - Subject specialization phase',
        profile: {
          grade: 11,
          subjects: ['Mathematics', 'Physical Sciences', 'Information Technology'],
          interests: ['Technology', 'Problem Solving']
        },
        expectations: {
          minCareers: 3,
          maxCareers: 5,
          shouldIncludeSpecializedCareers: true
        }
      },
      {
        grade: 12,
        description: 'Grade 12 - University preparation phase',
        profile: {
          grade: 12,
          subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences', 'English'],
          interests: ['Research', 'University Study', 'Career Planning'],
          marks: { Mathematics: 85, 'Physical Sciences': 82, 'Life Sciences': 88, English: 80 }
        },
        expectations: {
          minCareers: 3,
          maxCareers: 5,
          shouldIncludeUniversityPathways: true
        }
      }
    ];

    gradeSpecificTests.forEach(({ grade, description, profile, expectations }) => {
      test(`should provide grade-appropriate careers for ${description}`, async () => {
        const result = await matchCareersToProfile(profile);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(expectations.minCareers);
        expect(result.length).toBeLessThanOrEqual(expectations.maxCareers);
        
        // Verify all careers are appropriate for the grade level
        result.forEach(career => {
          expect(career).toHaveProperty('title');
          expect(career).toHaveProperty('description');
          expect(career.title).toBeTruthy();
          expect(career.description).toBeTruthy();
          
          // Grade 10 should not get overly specialized careers
          if (grade === 10) {
            const title = career.title.toLowerCase();
            const specializedTerms = ['senior', 'lead', 'principal', 'chief', 'director'];
            const hasSpecializedTerms = specializedTerms.some(term => title.includes(term));
            expect(hasSpecializedTerms).toBe(false);
          }
        });
        
        console.log(`Grade ${grade} - Careers:`, result.map(c => c.title));
      });
    });
  });

  describe('Edge Case Profile Testing', () => {
    const edgeCaseProfiles = [
      {
        name: 'Single Subject Focus',
        profile: {
          grade: 11,
          subjects: ['Mathematics'],
          interests: ['Numbers']
        }
      },
      {
        name: 'Unusual Subject Combination',
        profile: {
          grade: 12,
          subjects: ['Drama', 'Physical Sciences', 'Accounting'],
          interests: ['Performance', 'Science', 'Finance']
        }
      },
      {
        name: 'No Interests Specified',
        profile: {
          grade: 11,
          subjects: ['Mathematics', 'English'],
          interests: []
        }
      },
      {
        name: 'Very Low Marks',
        profile: {
          grade: 10,
          subjects: ['Mathematics', 'English'],
          interests: ['Learning'],
          marks: { Mathematics: 45, English: 50 }
        }
      },
      {
        name: 'Very High Marks',
        profile: {
          grade: 12,
          subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
          interests: ['Excellence', 'Achievement'],
          marks: { Mathematics: 98, 'Physical Sciences': 96, 'Life Sciences': 95 }
        }
      }
    ];

    edgeCaseProfiles.forEach(({ name, profile }) => {
      test(`should handle edge case: ${name}`, async () => {
        const result = await matchCareersToProfile(profile);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(3);
        expect(result.length).toBeLessThanOrEqual(5);
        
        // Verify career quality even for edge cases
        result.forEach(career => {
          expect(career).toHaveProperty('title');
          expect(career).toHaveProperty('description');
          expect(career.title).toBeTruthy();
          expect(career.description).toBeTruthy();
          expect(career).toHaveProperty('source');
        });
        
        console.log(`${name} - Success:`, result.length, 'careers returned');
      });
    });
  });

  describe('Performance Validation Across Profiles', () => {
    test('should maintain consistent performance across different profile types', async () => {
      const testProfiles = [
        { grade: 10, subjects: ['Mathematics'], interests: ['Numbers'] },
        { grade: 11, subjects: ['Business Studies', 'Accounting'], interests: ['Finance'] },
        { grade: 12, subjects: ['Visual Arts', 'Design'], interests: ['Creativity'] },
        { grade: 11, subjects: ['Life Sciences', 'Mathematics'], interests: ['Research'] },
        { grade: 12, subjects: ['Information Technology', 'Mathematics'], interests: ['Programming'] }
      ];

      const performanceResults = [];

      for (const profile of testProfiles) {
        const startTime = Date.now();
        const result = await matchCareersToProfile(profile);
        const duration = Date.now() - startTime;

        performanceResults.push({
          profile: profile.subjects.join(', '),
          duration,
          careerCount: result.length,
          success: result.length >= 3
        });

        expect(duration).toBeLessThan(10000); // 10 second timeout per profile
        expect(result.length).toBeGreaterThanOrEqual(3);
      }

      // Log performance summary
      const avgDuration = performanceResults.reduce((sum, r) => sum + r.duration, 0) / performanceResults.length;
      const successRate = performanceResults.filter(r => r.success).length / performanceResults.length;

      console.log('Performance Summary:', {
        averageDuration: `${avgDuration.toFixed(0)}ms`,
        successRate: `${(successRate * 100).toFixed(1)}%`,
        results: performanceResults
      });

      expect(successRate).toBe(1.0); // 100% success rate
      expect(avgDuration).toBeLessThan(5000); // Average under 5 seconds
    });
  });
});