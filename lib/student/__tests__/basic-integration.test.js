/**
 * Basic Integration Test for Student Understanding Enhancement
 * 
 * This test validates that our new classes work together correctly
 * and address the critical questionnaire integration gap.
 */

import { StudentProfileBuilder } from '../StudentProfileBuilder.js';
import { QueryContextStructurer } from '../QueryContextStructurer.js';

describe('Student Understanding Enhancement - Basic Integration', () => {
  let profileBuilder;
  let contextStructurer;

  beforeEach(() => {
    profileBuilder = new StudentProfileBuilder();
    contextStructurer = new QueryContextStructurer();
  });

  test('should build complete profile from form data', () => {
    // Arrange - Simulate form data from AssessmentForm
    const formData = {
      grade: 11,
      enjoyedSubjects: ['Mathematics', 'Physical Sciences'],
      interests: ['Technology', 'Problem Solving'],
      openQuestions: {
        motivation: 'I love solving complex problems and building things that help people',
        concerns: 'I am worried about whether I can afford university and if I will find a good job',
        careerInterests: 'I want to be a software engineer or data scientist'
      },
      constraints: {
        money: 'limited budget',
        location: 'prefer to stay local',
        familyBackground: 'no'
      },
      curriculumProfile: {
        framework: 'CAPS'
      }
    };

    // Act
    const profile = profileBuilder.buildProfile(formData);

    // Assert - Profile should capture all data
    expect(profile).toBeDefined();
    expect(profile.demographics.grade).toBe(11);
    expect(profile.academic.enjoyedSubjects).toEqual(['Mathematics', 'Physical Sciences']);
    
    // CRITICAL: Previously ignored data should now be captured
    expect(profile.motivations.hasContent).toBe(true);
    expect(profile.motivations.rawText).toBe('I love solving complex problems and building things that help people');
    expect(profile.motivations.extractedThemes).toContain('problem-solving');
    
    expect(profile.concerns.hasContent).toBe(true);
    expect(profile.concerns.rawText).toBe('I am worried about whether I can afford university and if I will find a good job');
    expect(profile.concerns.concernCategories).toContain('financial');
    expect(profile.concerns.concernCategories).toContain('career-uncertainty');
    
    expect(profile.careerInterests.hasContent).toBe(true);
    expect(profile.careerInterests.rawText).toBe('I want to be a software engineer or data scientist');
    
    expect(profile.metadata.profileCompleteness).toBeGreaterThan(80);
  });

  test('should structure query context with all questionnaire data', () => {
    // Arrange
    const formData = {
      grade: 12,
      enjoyedSubjects: ['Mathematics', 'Information Technology'],
      openQuestions: {
        motivation: 'I am passionate about technology and want to make a difference',
        concerns: 'I worry about getting into university with my current marks',
        careerInterests: 'Software development or cybersecurity'
      }
    };

    const profile = profileBuilder.buildProfile(formData);

    // Act
    const context = contextStructurer.buildContext(profile);

    // Assert - Context should include ALL questionnaire data
    expect(context.structuredQuery).toBeDefined();
    expect(context.structuredQuery.length).toBeGreaterThan(0);
    
    // Should include base context
    expect(context.structuredQuery).toContain('Grade 12');
    expect(context.structuredQuery).toContain('Mathematics, Information Technology');
    
    // CRITICAL: Should include previously ignored motivation
    expect(context.structuredQuery).toContain('WHAT MOTIVATES ME');
    expect(context.structuredQuery).toContain('I am passionate about technology and want to make a difference');
    
    // CRITICAL: Should include previously ignored concerns
    expect(context.structuredQuery).toContain('MY CONCERNS ABOUT THE FUTURE');
    expect(context.structuredQuery).toContain('I worry about getting into university with my current marks');
    
    // Should maintain existing career interests emphasis
    expect(context.structuredQuery).toContain('CRITICAL STUDENT REQUEST');
    expect(context.structuredQuery).toContain('Software development or cybersecurity');
    
    // Should have proper instructions for LLM
    expect(context.structuredQuery).toContain('INSTRUCTION:');
  });

  test('should handle empty questionnaire fields gracefully', () => {
    // Arrange - Minimal data (like current system)
    const formData = {
      grade: 10,
      enjoyedSubjects: ['English', 'History'],
      openQuestions: {
        motivation: '',
        concerns: '',
        careerInterests: 'Teaching'
      }
    };

    const profile = profileBuilder.buildProfile(formData);
    const context = contextStructurer.buildContext(profile);

    // Assert - Should work without errors
    expect(profile.motivations.hasContent).toBe(false);
    expect(profile.concerns.hasContent).toBe(false);
    expect(profile.careerInterests.hasContent).toBe(true);
    
    expect(context.structuredQuery).toContain('Grade 10');
    expect(context.structuredQuery).toContain('Teaching');
    expect(context.motivationContext).toBe('');
    expect(context.concernsContext).toBe('');
  });

  test('should demonstrate improvement over current system', () => {
    // Arrange - Rich questionnaire data that was previously ignored
    const formData = {
      grade: 11,
      enjoyedSubjects: ['Mathematics', 'Physical Sciences'],
      openQuestions: {
        motivation: 'I love solving complex engineering problems and want to build sustainable technology solutions',
        concerns: 'I am worried about the cost of engineering degrees and whether I can get into a good university',
        careerInterests: 'Mechanical or electrical engineering'
      }
    };

    const profile = profileBuilder.buildProfile(formData);
    const context = contextStructurer.buildContext(profile);

    // Assert - Demonstrate comprehensive data utilization
    const query = context.structuredQuery;
    
    // Should use 100% of questionnaire data (vs previous 33%)
    expect(query).toContain('solving complex engineering problems'); // From motivation
    expect(query).toContain('cost of engineering degrees'); // From concerns  
    expect(query).toContain('Mechanical or electrical engineering'); // From career interests
    
    // Should have structured sections for LLM optimization
    expect(query).toMatch(/=== WHAT MOTIVATES ME ===/);
    expect(query).toMatch(/=== MY CONCERNS ABOUT THE FUTURE ===/);
    expect(query).toMatch(/CRITICAL STUDENT REQUEST/);
    
    // Should have specific instructions for personalization
    expect(query).toContain('consider these motivations when suggesting careers');
    expect(query).toContain('address these specific concerns');
    expect(query).toContain('acknowledge their stated interest directly');
    
    // Context should be comprehensive
    expect(context.metadata.sectionsIncluded).toBeGreaterThanOrEqual(3);
    expect(context.metadata.priorityRequestsCount).toBeGreaterThanOrEqual(2);
  });

  test('should maintain backward compatibility', () => {
    // Arrange - Legacy form data structure (no openQuestions)
    const legacyFormData = {
      grade: 12,
      enjoyedSubjects: ['Mathematics', 'Science'],
      interests: ['Technology']
      // No openQuestions field
    };

    // Act & Assert - Should not throw errors
    expect(() => {
      const profile = profileBuilder.buildProfile(legacyFormData);
      const context = contextStructurer.buildContext(profile);
      
      expect(profile).toBeDefined();
      expect(context.structuredQuery).toContain('Grade 12');
      expect(context.structuredQuery).toContain('Mathematics, Science');
    }).not.toThrow();
  });
});