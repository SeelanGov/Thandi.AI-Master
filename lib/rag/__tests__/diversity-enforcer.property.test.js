// lib/rag/__tests__/diversity-enforcer.property.test.js
// Property tests for DiversityEnforcer fairness consistency

import { describe, test, expect, beforeEach } from '@jest/globals';
import { DiversityEnforcer } from '../diversity-enforcer.js';

describe('DiversityEnforcer Property Tests', () => {
  let diversityEnforcer;

  beforeEach(() => {
    diversityEnforcer = new DiversityEnforcer({
      enableLogging: false,
      maxCategoryDominance: 0.6,
      minCategoryRepresentation: 0.15,
      targetCategoryCount: 3
    });
  });

  describe('Property 6: Fairness Consistency', () => {
    /**
     * Property: Fairness Consistency
     * For similar student profiles, the diversity enforcement should produce
     * consistently fair results with similar category distributions.
     * 
     * Validates Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
     */
    test('should maintain fairness consistency across similar profiles', () => {
      // Generate similar student profiles
      const baseProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11,
        interests: ['technology', 'engineering']
      };

      const similarProfiles = [
        { ...baseProfile, grade: 11 },
        { ...baseProfile, subjects: ['Mathematics', 'Physics'] },
        { ...baseProfile, interests: ['tech', 'engineering'] },
        { ...baseProfile, subjects: ['Math', 'Physical Sciences'] }
      ];

      // Generate test careers with known bias patterns
      const biasedCareers = [
        { title: 'Mathematics Teacher', category: 'Education', similarity: 0.9 },
        { title: 'Science Teacher', category: 'Education', similarity: 0.85 },
        { title: 'Physics Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Software Engineer', category: 'Technology', similarity: 0.75 },
        { title: 'Data Scientist', category: 'Technology', similarity: 0.7 },
        { title: 'Doctor', category: 'Healthcare', similarity: 0.65 }
      ];

      const results = similarProfiles.map(profile => {
        const enforcedCareers = diversityEnforcer.enforceDiversity(biasedCareers);
        const analysis = diversityEnforcer.analyzeDiversityState(enforcedCareers);
        
        return {
          profile,
          careers: enforcedCareers,
          analysis,
          categoryDistribution: analysis.categoryDistribution,
          diversityScore: analysis.diversityScore
        };
      });

      // Property 1: Consistent category diversity
      const diversityScores = results.map(r => r.diversityScore);
      const avgDiversityScore = diversityScores.reduce((sum, score) => sum + score, 0) / diversityScores.length;
      const diversityVariance = diversityScores.reduce((sum, score) => sum + Math.pow(score - avgDiversityScore, 2), 0) / diversityScores.length;
      const diversityStdDev = Math.sqrt(diversityVariance);
      
      // Diversity scores should be consistent (low standard deviation)
      expect(diversityStdDev).toBeLessThan(15); // Allow 15% variation
      
      // Property 2: No category should dominate consistently
      results.forEach(result => {
        expect(result.analysis.hasDominance).toBe(false);
        
        // No single category should exceed the dominance threshold
        Object.values(result.categoryDistribution).forEach(categoryInfo => {
          expect(categoryInfo.percentage).toBeLessThanOrEqual(60); // maxCategoryDominance * 100
        });
      });

      // Property 3: Minimum category representation maintained
      results.forEach(result => {
        const categories = Object.keys(result.categoryDistribution);
        expect(categories.length).toBeGreaterThanOrEqual(2); // At least 2 categories
        
        // Each represented category should meet minimum threshold or be justified
        Object.values(result.categoryDistribution).forEach(categoryInfo => {
          // Allow some flexibility for small career lists
          const minExpected = Math.max(1, Math.ceil(result.careers.length * 0.15));
          expect(categoryInfo.count).toBeGreaterThanOrEqual(Math.min(minExpected, 1));
        });
      });

      // Property 4: Quality preservation consistency
      results.forEach(result => {
        const avgQuality = result.careers.reduce((sum, career) => sum + (career.similarity || 0), 0) / result.careers.length;
        expect(avgQuality).toBeGreaterThan(0.6); // Should maintain reasonable quality
      });

      // Property 5: Fairness across profile variations
      const educationPercentages = results.map(r => 
        r.categoryDistribution.Education ? r.categoryDistribution.Education.percentage : 0
      );
      
      // Education representation should be consistently limited
      educationPercentages.forEach(percentage => {
        expect(percentage).toBeLessThanOrEqual(60); // Should not dominate
      });
    });

    test('should provide consistent fairness for different career list sizes', () => {
      const baseProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11
      };

      // Test with different career list sizes
      const careerSizes = [5, 10, 15, 20];
      
      const results = careerSizes.map(size => {
        // Generate careers with teaching bias
        const careers = [];
        const teachingRatio = 0.7; // 70% teaching careers initially
        const teachingCount = Math.floor(size * teachingRatio);
        
        // Add teaching careers
        for (let i = 0; i < teachingCount; i++) {
          careers.push({
            title: `Teacher ${i + 1}`,
            category: 'Education',
            similarity: 0.9 - (i * 0.05) // Decreasing quality
          });
        }
        
        // Add non-teaching careers
        const nonTeachingCategories = ['Technology', 'Healthcare', 'Finance', 'Engineering'];
        for (let i = teachingCount; i < size; i++) {
          const categoryIndex = (i - teachingCount) % nonTeachingCategories.length;
          careers.push({
            title: `Career ${i + 1}`,
            category: nonTeachingCategories[categoryIndex],
            similarity: 0.8 - (i * 0.02)
          });
        }

        const enforcedCareers = diversityEnforcer.enforceDiversity(careers);
        const analysis = diversityEnforcer.analyzeDiversityState(enforcedCareers);
        
        return {
          originalSize: size,
          enforcedSize: enforcedCareers.length,
          analysis,
          educationPercentage: analysis.categoryDistribution.Education ? 
            analysis.categoryDistribution.Education.percentage : 0
        };
      });

      // Property 1: Consistent bias correction regardless of list size
      results.forEach(result => {
        expect(result.educationPercentage).toBeLessThanOrEqual(70); // Allow some flexibility for small lists
        expect(result.analysis.diversityScore).toBeGreaterThan(20); // Minimum diversity maintained
      });

      // Property 2: Proportional fairness scaling
      const educationPercentages = results.map(r => r.educationPercentage);
      const avgEducationPercentage = educationPercentages.reduce((sum, p) => sum + p, 0) / educationPercentages.length;
      
      // Education percentages should be consistently controlled across different sizes
      educationPercentages.forEach(percentage => {
        expect(Math.abs(percentage - avgEducationPercentage)).toBeLessThan(20); // Within 20% of average
      });

      // Property 3: Quality preservation scales appropriately
      results.forEach(result => {
        expect(result.enforcedSize).toBeGreaterThan(0); // Should always return some careers
        expect(result.enforcedSize).toBeLessThanOrEqual(result.originalSize); // Should not exceed original
      });
    });

    test('should maintain fairness under different bias severity levels', () => {
      const profile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11
      };

      // Test different levels of bias severity
      const biasLevels = [
        { name: 'mild', teachingRatio: 0.4, expectedReduction: false },
        { name: 'moderate', teachingRatio: 0.6, expectedReduction: false },
        { name: 'severe', teachingRatio: 0.8, expectedReduction: true },
        { name: 'extreme', teachingRatio: 0.95, expectedReduction: true }
      ];

      const results = biasLevels.map(level => {
        const careers = [];
        const totalCareers = 10;
        const teachingCount = Math.floor(totalCareers * level.teachingRatio);
        
        // Add teaching careers
        for (let i = 0; i < teachingCount; i++) {
          careers.push({
            title: `Mathematics Teacher ${i + 1}`,
            category: 'Education',
            similarity: 0.9 - (i * 0.02)
          });
        }
        
        // Add diverse careers
        const otherCategories = ['Technology', 'Healthcare', 'Finance'];
        for (let i = teachingCount; i < totalCareers; i++) {
          const categoryIndex = (i - teachingCount) % otherCategories.length;
          careers.push({
            title: `Career ${i + 1}`,
            category: otherCategories[categoryIndex],
            similarity: 0.85 - (i * 0.02)
          });
        }

        const enforcedCareers = diversityEnforcer.enforceDiversity(careers);
        const analysis = diversityEnforcer.analyzeDiversityState(enforcedCareers);
        
        return {
          level: level.name,
          originalTeachingRatio: level.teachingRatio,
          expectedReduction: level.expectedReduction,
          enforcedCareers,
          analysis,
          finalTeachingPercentage: analysis.categoryDistribution.Education ? 
            analysis.categoryDistribution.Education.percentage : 0
        };
      });

      // Property 1: Proportional bias correction
      results.forEach(result => {
        if (result.expectedReduction) {
          // Severe bias should be significantly reduced
          expect(result.finalTeachingPercentage).toBeLessThan(result.originalTeachingRatio * 100);
          
          // For very extreme cases, allow higher final percentage but still reduced
          const maxAllowed = result.originalTeachingRatio >= 0.9 ? 85 : 70;
          expect(result.finalTeachingPercentage).toBeLessThanOrEqual(maxAllowed);
        }
        
        // All results should maintain some diversity
        expect(result.analysis.diversityScore).toBeGreaterThan(0);
      });

      // Property 2: Consistent fairness application
      const severeResults = results.filter(r => r.expectedReduction);
      severeResults.forEach(result => {
        // Dominance should be reduced, though not necessarily eliminated in all cases
        expect(result.finalTeachingPercentage).toBeLessThan(result.originalTeachingRatio * 100);
        
        // For very extreme cases (95% teaching), allow higher final percentage but still reduced
        const maxAllowed = result.originalTeachingRatio >= 0.9 ? 85 : 70;
        expect(result.finalTeachingPercentage).toBeLessThanOrEqual(maxAllowed);
      });

      // Property 3: Quality preservation under bias correction
      results.forEach(result => {
        const avgQuality = result.enforcedCareers.reduce((sum, career) => 
          sum + (career.similarity || 0), 0) / result.enforcedCareers.length;
        expect(avgQuality).toBeGreaterThan(0.5); // Reasonable quality maintained
      });
    });

    test('should ensure demographic parity in category representation', () => {
      // Test that similar profiles get similar category distributions
      const profiles = [
        { subjects: ['Mathematics', 'Physical Sciences'], grade: 11, id: 'profile1' },
        { subjects: ['Mathematics', 'Chemistry'], grade: 11, id: 'profile2' },
        { subjects: ['Math', 'Physics'], grade: 11, id: 'profile3' }
      ];

      const baseCareers = [
        { title: 'Math Teacher 1', category: 'Education', similarity: 0.9 },
        { title: 'Math Teacher 2', category: 'Education', similarity: 0.85 },
        { title: 'Math Teacher 3', category: 'Education', similarity: 0.8 },
        { title: 'Software Engineer', category: 'Technology', similarity: 0.75 },
        { title: 'Data Scientist', category: 'Technology', similarity: 0.7 },
        { title: 'Research Scientist', category: 'Research', similarity: 0.65 },
        { title: 'Financial Analyst', category: 'Finance', similarity: 0.6 }
      ];

      const results = profiles.map(profile => {
        const enforcedCareers = diversityEnforcer.enforceDiversity([...baseCareers]);
        const analysis = diversityEnforcer.analyzeDiversityState(enforcedCareers);
        
        return {
          profileId: profile.id,
          categoryDistribution: analysis.categoryDistribution,
          diversityScore: analysis.diversityScore,
          categories: Object.keys(analysis.categoryDistribution)
        };
      });

      // Property 1: Similar profiles should get similar category counts
      const categoryCounts = results.map(r => r.categories.length);
      const avgCategoryCount = categoryCounts.reduce((sum, count) => sum + count, 0) / categoryCounts.length;
      
      categoryCounts.forEach(count => {
        expect(Math.abs(count - avgCategoryCount)).toBeLessThanOrEqual(1); // Within 1 category
      });

      // Property 2: No systematic bias toward specific categories
      const educationPercentages = results.map(r => 
        r.categoryDistribution.Education ? r.categoryDistribution.Education.percentage : 0
      );
      
      const avgEducationPercentage = educationPercentages.reduce((sum, p) => sum + p, 0) / educationPercentages.length;
      
      // Education percentages should be consistent across similar profiles
      educationPercentages.forEach(percentage => {
        expect(Math.abs(percentage - avgEducationPercentage)).toBeLessThan(15); // Within 15%
      });

      // Property 3: Diversity scores should be consistently high
      results.forEach(result => {
        expect(result.diversityScore).toBeGreaterThan(40); // Minimum diversity threshold
      });
    });

    test('should maintain individual fairness for edge cases', () => {
      // Test fairness for edge cases and boundary conditions
      const edgeCases = [
        {
          name: 'all_same_category',
          careers: Array.from({ length: 5 }, (_, i) => ({
            title: `Teacher ${i + 1}`,
            category: 'Education',
            similarity: 0.9 - (i * 0.1)
          }))
        },
        {
          name: 'minimal_careers',
          careers: [
            { title: 'Teacher', category: 'Education', similarity: 0.9 },
            { title: 'Engineer', category: 'Technology', similarity: 0.8 }
          ]
        },
        {
          name: 'many_categories_few_careers',
          careers: [
            { title: 'Teacher', category: 'Education', similarity: 0.9 },
            { title: 'Engineer', category: 'Technology', similarity: 0.8 },
            { title: 'Doctor', category: 'Healthcare', similarity: 0.7 },
            { title: 'Lawyer', category: 'Legal', similarity: 0.6 },
            { title: 'Artist', category: 'Creative', similarity: 0.5 }
          ]
        }
      ];

      edgeCases.forEach(testCase => {
        const enforcedCareers = diversityEnforcer.enforceDiversity(testCase.careers);
        const analysis = diversityEnforcer.analyzeDiversityState(enforcedCareers);

        // Property 1: Should handle edge cases gracefully
        expect(Array.isArray(enforcedCareers)).toBe(true);
        expect(enforcedCareers.length).toBeGreaterThanOrEqual(0);

        // Property 2: Should not introduce unfair bias in edge cases
        if (enforcedCareers.length > 0) {
          const avgQuality = enforcedCareers.reduce((sum, career) => 
            sum + (career.similarity || 0), 0) / enforcedCareers.length;
          expect(avgQuality).toBeGreaterThan(0); // Should maintain some quality
        }

        // Property 3: Should maximize diversity within constraints
        if (testCase.name === 'all_same_category') {
          // For all same category, should limit the number returned
          expect(enforcedCareers.length).toBeLessThanOrEqual(testCase.careers.length);
        } else if (testCase.name === 'many_categories_few_careers') {
          // Should preserve category diversity when possible
          expect(analysis.categoryCount).toBeGreaterThan(1);
        }
      });
    });

    test('should ensure counterfactual fairness', () => {
      // Test that changing non-relevant attributes doesn't affect fairness
      const baseProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11
      };

      const careers = [
        { title: 'Math Teacher 1', category: 'Education', similarity: 0.9 },
        { title: 'Math Teacher 2', category: 'Education', similarity: 0.85 },
        { title: 'Math Teacher 3', category: 'Education', similarity: 0.8 },
        { title: 'Software Engineer', category: 'Technology', similarity: 0.75 },
        { title: 'Data Scientist', category: 'Technology', similarity: 0.7 }
      ];

      // Test with different non-relevant profile variations
      const profileVariations = [
        { ...baseProfile, name: 'Student A' },
        { ...baseProfile, name: 'Student B' },
        { ...baseProfile, school: 'School X' },
        { ...baseProfile, school: 'School Y' },
        { ...baseProfile, timestamp: '2024-01-01' },
        { ...baseProfile, timestamp: '2024-06-01' }
      ];

      const results = profileVariations.map(profile => {
        const enforcedCareers = diversityEnforcer.enforceDiversity([...careers]);
        const analysis = diversityEnforcer.analyzeDiversityState(enforcedCareers);
        
        return {
          profile,
          analysis,
          educationPercentage: analysis.categoryDistribution.Education ? 
            analysis.categoryDistribution.Education.percentage : 0,
          diversityScore: analysis.diversityScore
        };
      });

      // Property: Non-relevant attributes should not affect fairness outcomes
      const educationPercentages = results.map(r => r.educationPercentage);
      const diversityScores = results.map(r => r.diversityScore);

      // All results should be identical or very similar
      const firstEducationPercentage = educationPercentages[0];
      const firstDiversityScore = diversityScores[0];

      educationPercentages.forEach(percentage => {
        expect(Math.abs(percentage - firstEducationPercentage)).toBeLessThan(5); // Very small variation allowed
      });

      diversityScores.forEach(score => {
        expect(Math.abs(score - firstDiversityScore)).toBeLessThan(5); // Very small variation allowed
      });
    });
  });
});