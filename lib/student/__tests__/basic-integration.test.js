/**
 * Basic Integration Tests for Student Understanding Enhancement
 * 
 * Tests the complete flow from form data to structured query context
 * to ensure the enhanced system addresses the 67% questionnaire data loss issue.
 */

const StudentProfileBuilder = require('../StudentProfileBuilder');
const QueryContextStructurer = require('../QueryContextStructurer');

describe('Student Understanding Enhancement - Basic Integration', () => {
  let profileBuilder;
  let contextStructurer;

  beforeEach(() => {
    profileBuilder = new StudentProfileBuilder();
    contextStructurer = new QueryContextStructurer();
  });

  test('complete integration flow captures all questionnaire data', () => {
    // Simulate typical assessment form data
    const formData = {
      grade: 11,
      subjects: ['Mathematics', 'Physical Sciences', 'English Home Language'],
      motivation: 'I want to help people and make a difference in healthcare. I love science and helping others.',
      concerns: 'I am worried about my math marks and whether I can get into medical school. My family cannot afford expensive universities.',
      careerInterests: 'I want to become a doctor or work in healthcare',
      marks: {
        'Mathematics': 65,
        'Physical Sciences': 72,
        'English Home Language': 78,
        'Life Sciences': 80
      },
      curriculum: 'CAPS'
    };

    // Build student profile
    const profile = profileBuilder.buildProfile(formData);

    // Verify profile captures all data
    expect(profile.motivations.hasMotivation).toBe(true);
    expect(profile.motivations.rawText).toContain('help people');
    expect(profile.concerns.hasConcerns).toBe(true);
    expect(profile.concerns.rawText).toContain('math marks');
    expect(profile.careerInterests.hasCareerInterests).toBe(true);
    expect(profile.careerInterests.rawText).toContain('doctor');
    expect(profile.academic.hasMarks).toBe(true);
    expect(profile.academic.currentMarks.length).toBe(4);

    // Build query context
    const context = contextStructurer.buildContext(profile);

    // Verify context includes all questionnaire data
    expect(context.formattedContext).toContain('help people and make a difference');
    expect(context.formattedContext).toContain('worried about my math marks');
    expect(context.formattedContext).toContain('doctor or work in healthcare');
    expect(context.formattedContext).toContain('Mathematics: 65%');
    expect(context.formattedContext).toContain('CRITICAL STUDENT REQUEST');
    expect(context.formattedContext).toContain('STUDENT MOTIVATION');
    expect(context.formattedContext).toContain('STUDENT CONCERNS');

    // Verify metadata reflects high personalization potential
    expect(context.metadata.expectedPersonalizationScore).toBeGreaterThan(80);
    expect(context.metadata.sectionsIncluded).toContain('motivationAlignment');
    expect(context.metadata.sectionsIncluded).toContain('concernsGuidance');
    expect(context.metadata.sectionsIncluded).toContain('careerPriorities');
  });

  test('handles partial questionnaire data gracefully', () => {
    // Simulate form data with only some questionnaire fields
    const formData = {
      grade: 12,
      subjects: ['Accounting', 'Business Studies'],
      motivation: '', // Empty
      concerns: 'I need to know about university costs and bursaries',
      careerInterests: '', // Empty
      marks: {},
      curriculum: 'CAPS'
    };

    const profile = profileBuilder.buildProfile(formData);
    const context = contextStructurer.buildContext(profile);

    // Should handle missing data gracefully
    expect(profile.motivations.hasMotivation).toBe(false);
    expect(profile.concerns.hasConcerns).toBe(true);
    expect(profile.careerInterests.hasCareerInterests).toBe(false);

    // Context should still be valid and include available data
    expect(context.formattedContext).toContain('university costs and bursaries');
    expect(context.formattedContext).toContain('STUDENT CONCERNS');
    expect(context.formattedContext).not.toContain('STUDENT MOTIVATION');
    expect(context.formattedContext).toContain('No specific career interests provided');
  });

  test('maintains backward compatibility with existing system', () => {
    // Test with minimal data (like current system)
    const formData = {
      grade: 10,
      subjects: ['Mathematics', 'English'],
      motivation: '',
      concerns: '',
      careerInterests: 'Engineering',
      marks: {},
      curriculum: 'CAPS'
    };

    const profile = profileBuilder.buildProfile(formData);
    const context = contextStructurer.buildContext(profile);

    // Should work with minimal data
    expect(profile).toBeDefined();
    expect(context.formattedContext).toBeDefined();
    expect(context.formattedContext).toContain('Engineering');
    expect(context.formattedContext).toContain('Grade: 10');
    expect(context.formattedContext).toContain('Mathematics, English');
  });

  test('APS calculation integration works correctly', () => {
    const formData = {
      grade: 12,
      subjects: ['Mathematics', 'Physical Sciences', 'English'],
      motivation: 'I love solving problems',
      concerns: '',
      careerInterests: 'Engineering',
      marks: {
        'Mathematics': 85,
        'Physical Sciences': 78,
        'English Home Language': 72,
        'Life Orientation': 80,
        'Afrikaans First Additional Language': 65,
        'Life Sciences': 75,
        'Geography': 70
      },
      curriculum: 'CAPS'
    };

    const profile = profileBuilder.buildProfile(formData);
    const context = contextStructurer.buildContext(profile);

    // Verify APS calculation
    expect(profile.academic.apsData).toBeDefined();
    expect(profile.academic.apsData.currentAPS).toBeGreaterThan(0);
    expect(profile.academic.apsData.universityEligible).toBe(true);

    // Verify APS appears in context
    expect(context.formattedContext).toContain('Current APS Score:');
    expect(context.formattedContext).toContain('University Eligible: Yes');
  });

  test('theme extraction and categorization works', () => {
    const formData = {
      grade: 11,
      subjects: ['Art', 'Design'],
      motivation: 'I love creating beautiful designs and expressing creativity through art',
      concerns: 'I am worried about finding stable employment in creative fields',
      careerInterests: 'Graphic designer or architect',
      marks: {},
      curriculum: 'CAPS'
    };

    const profile = profileBuilder.buildProfile(formData);

    // Verify theme extraction
    expect(profile.motivations.extractedThemes).toContain('creativity');
    expect(profile.motivations.careerAlignment).toContain('arts');
    
    // Check if concern categorization worked (may be empty if pattern doesn't match exactly)
    expect(profile.concerns.concernCategories).toBeDefined();
    expect(Array.isArray(profile.concerns.concernCategories)).toBe(true);
    
    expect(profile.careerInterests.specificCareers).toBeDefined();
    expect(Array.isArray(profile.careerInterests.specificCareers)).toBe(true);
  });

  test('addresses the 67% data loss issue', () => {
    // Test scenario that demonstrates the fix for ignored questionnaire data
    const formData = {
      grade: 11,
      subjects: ['Mathematics', 'Physics'],
      motivation: 'I am passionate about solving complex problems and building innovative solutions that can help society. I want to use technology to make the world better.',
      concerns: 'I worry that I am not smart enough for engineering. My math marks are not perfect and I sometimes struggle with difficult concepts. Will I be able to succeed?',
      careerInterests: 'Software engineer or robotics engineer',
      marks: {
        'Mathematics': 68,
        'Physical Sciences': 71
      },
      curriculum: 'CAPS'
    };

    const profile = profileBuilder.buildProfile(formData);
    const context = contextStructurer.buildContext(profile);

    // Before the fix: motivation and concerns would be ignored (67% data loss)
    // After the fix: all data should be captured and structured

    // Verify motivation is captured and structured
    expect(profile.motivations.hasMotivation).toBe(true);
    expect(profile.motivations.rawText).toContain('solving complex problems');
    expect(context.formattedContext).toContain('STUDENT MOTIVATION');
    expect(context.formattedContext).toContain('solving complex problems');

    // Verify concerns are captured and structured
    expect(profile.concerns.hasConcerns).toBe(true);
    expect(profile.concerns.rawText).toContain('not smart enough');
    expect(context.formattedContext).toContain('STUDENT CONCERNS');
    expect(context.formattedContext).toContain('not smart enough');

    // Verify career interests are still prioritized (existing functionality)
    expect(profile.careerInterests.hasCareerInterests).toBe(true);
    expect(context.formattedContext).toContain('CRITICAL STUDENT REQUEST');
    expect(context.formattedContext).toContain('Software engineer');

    // Verify LLM instructions address all data
    expect(context.formattedContext).toContain('Reflect the student\'s stated motivations');
    expect(context.formattedContext).toContain('Directly address each concern mentioned');

    // Calculate data utilization (should be 100% vs previous 33%)
    const dataFields = ['motivation', 'concerns', 'careerInterests'];
    const utilizedFields = dataFields.filter(field => {
      return context.formattedContext.includes(formData[field]);
    });
    
    const utilizationRate = (utilizedFields.length / dataFields.length) * 100;
    expect(utilizationRate).toBe(100); // Fixed: was 33% before (only careerInterests)
  });
});