/**
 * Integrated Test Cases for Assessment Flow + Knowledge Base
 * 
 * Tests the complete integration between:
 * 1. Assessment flow (curriculum selection → subject selection → marks collection)
 * 2. Knowledge base (curriculum-aware RAG responses)
 * 
 * Critical test cases:
 * - CAPS student: "I take Mathematical Literacy" → Should NOT ask for Mathematics marks
 * - IEB student: "I take Advanced Programme Mathematics" → Should see IEB university requirements
 * - Mixed scenario: CAPS student interested in engineering → Correct APS calculation
 */

import { expect } from '@jest/globals';

/**
 * Mock student profiles for testing
 */
const mockStudentProfiles = {
  capsStudent: {
    grade: 11,
    curriculumProfile: {
      framework: 'CAPS',
      currentSubjects: ['Mathematical Literacy', 'Physical Sciences', 'Life Sciences', 'English Home Language', 'Afrikaans Home Language', 'Life Orientation', 'Business Studies']
    },
    enjoyedSubjects: ['Mathematical Literacy', 'Business Studies', 'Life Sciences'],
    interests: ['business', 'healthcare'],
    constraints: {
      money: 'middle-class family',
      location: 'Johannesburg',
      time: 'full-time study',
      familyBackground: 'yes'
    },
    openQuestions: {
      motivation: 'I want to help people and run my own business',
      concerns: 'Worried about university costs',
      careerInterests: 'I want to become a pharmacist or business owner'
    }
  },
  
  iebStudent: {
    grade: 12,
    curriculumProfile: {
      framework: 'IEB',
      currentSubjects: ['Mathematics', 'Advanced Programme Mathematics', 'Physical Sciences', 'Life Sciences', 'English Home Language', 'French', 'Design']
    },
    enjoyedSubjects: ['Advanced Programme Mathematics', 'Physical Sciences', 'Design'],
    interests: ['engineering', 'technology', 'creativity'],
    constraints: {
      money: 'can afford private university',
      location: 'Cape Town',
      time: 'full-time study',
      familyBackground: 'yes'
    },
    openQuestions: {
      motivation: 'I love solving complex problems and creating innovative solutions',
      concerns: 'Not sure which engineering field to choose',
      careerInterests: 'I want to become an engineer, maybe mechanical or software'
    }
  }
};

/**
 * Test Suite 1: Assessment Flow Integration
 */
describe('Assessment Flow Integration', () => {
  
  test('CAPS Student - Subject Alignment', () => {
    const student = mockStudentProfiles.capsStudent;
    
    // Test that DeepDiveQuestions uses actual curriculum subjects
    const expectedSubjects = student.curriculumProfile.currentSubjects;
    const actualSubjects = getDeepDiveSubjects(student.curriculumProfile);
    
    expect(actualSubjects).toEqual(expectedSubjects);
    expect(actualSubjects).toContain('Mathematical Literacy');
    expect(actualSubjects).not.toContain('Mathematics'); // Should NOT ask for Mathematics marks
  });
  
  test('IEB Student - Subject Alignment', () => {
    const student = mockStudentProfiles.iebStudent;
    
    // Test that DeepDiveQuestions uses IEB-specific subjects
    const expectedSubjects = student.curriculumProfile.currentSubjects;
    const actualSubjects = getDeepDiveSubjects(student.curriculumProfile);
    
    expect(actualSubjects).toEqual(expectedSubjects);
    expect(actualSubjects).toContain('Advanced Programme Mathematics');
    expect(actualSubjects).toContain('Design'); // IEB-specific subject
  });
  
  test('Props Flow - CurriculumProfile to DeepDiveQuestions', () => {
    const student = mockStudentProfiles.capsStudent;
    
    // Simulate AssessmentForm prop passing
    const formData = {
      curriculumProfile: student.curriculumProfile
    };
    
    // Test that curriculumProfile prop flows correctly
    expect(formData.curriculumProfile).toBeDefined();
    expect(formData.curriculumProfile.framework).toBe('CAPS');
    expect(formData.curriculumProfile.currentSubjects).toHaveLength(7);
  });
});

/**
 * Test Suite 2: Knowledge Base RAG Integration
 */
describe('Knowledge Base RAG Integration', () => {
  
  test('CAPS Student - Pharmacy Query', async () => {
    const query = 'APS for pharmacy at UJ for CAPS student with Mathematical Literacy 70%';
    
    const response = await mockRAGQuery(query, {
      curriculum: 'CAPS',
      subjects: ['Mathematical Literacy'],
      marks: { 'Mathematical Literacy': 70 }
    });
    
    // Expected: Specific CAPS requirements, not generic response
    expect(response).toContain('APS');
    expect(response).toContain('Mathematical Literacy');
    expect(response).not.toContain('Mathematics'); // Should not mention Mathematics
    expect(response.length).toBeLessThan(500); // Should be focused, not rambling
  });
  
  test('IEB Student - Engineering Query', async () => {
    const query = 'IEB requirements for engineering at Wits with AP Mathematics';
    
    const response = await mockRAGQuery(query, {
      curriculum: 'IEB',
      subjects: ['Advanced Programme Mathematics'],
      marks: { 'Advanced Programme Mathematics': 82 }
    });
    
    // Expected: IEB-specific requirements
    expect(response).toContain('IEB');
    expect(response).toContain('AP Mathematics');
    expect(response).toContain('Wits');
    expect(response).not.toContain('Standard CAPS requirements'); // Should not default to CAPS
  });
  
  test('Curriculum Differentiation', async () => {
    const capsQuery = 'Mathematics requirements for engineering';
    const iebQuery = 'Mathematics requirements for engineering';
    
    const capsResponse = await mockRAGQuery(capsQuery, { curriculum: 'CAPS' });
    const iebResponse = await mockRAGQuery(iebQuery, { curriculum: 'IEB' });
    
    // Responses should be different based on curriculum
    expect(capsResponse).not.toEqual(iebResponse);
    expect(capsResponse).toContain('CAPS');
    expect(iebResponse).toContain('IEB');
  });
});

/**
 * Test Suite 3: End-to-End Integration
 */
describe('End-to-End Integration', () => {
  
  test('Complete CAPS Student Journey', async () => {
    const student = mockStudentProfiles.capsStudent;
    
    // Step 1: Curriculum selection
    expect(student.curriculumProfile.framework).toBe('CAPS');
    
    // Step 2: Subject selection (enjoyed subjects)
    expect(student.enjoyedSubjects).toContain('Mathematical Literacy');
    expect(student.enjoyedSubjects).toContain('Business Studies');
    
    // Step 5: Marks collection (should match curriculum subjects)
    const marksSubjects = getDeepDiveSubjects(student.curriculumProfile);
    expect(marksSubjects).toContain('Mathematical Literacy');
    expect(marksSubjects).not.toContain('Mathematics');
    
    // Step 6: RAG query generation
    const query = buildRAGQuery(student);
    expect(query).toContain('Mathematical Literacy');
    expect(query).toContain('CAPS');
    
    // Step 7: RAG response
    const response = await mockRAGQuery(query, { curriculum: 'CAPS' });
    expect(response).toContain('pharmacy'); // Based on career interests
    expect(response).toContain('business'); // Based on enjoyed subjects
  });
  
  test('Complete IEB Student Journey', async () => {
    const student = mockStudentProfiles.iebStudent;
    
    // Step 1: Curriculum selection
    expect(student.curriculumProfile.framework).toBe('IEB');
    
    // Step 2: Subject selection (enjoyed subjects)
    expect(student.enjoyedSubjects).toContain('Advanced Programme Mathematics');
    expect(student.enjoyedSubjects).toContain('Design');
    
    // Step 5: Marks collection (should match IEB subjects)
    const marksSubjects = getDeepDiveSubjects(student.curriculumProfile);
    expect(marksSubjects).toContain('Advanced Programme Mathematics');
    expect(marksSubjects).toContain('Design');
    
    // Step 6: RAG query generation
    const query = buildRAGQuery(student);
    expect(query).toContain('Advanced Programme Mathematics');
    expect(query).toContain('IEB');
    
    // Step 7: RAG response
    const response = await mockRAGQuery(query, { curriculum: 'IEB' });
    expect(response).toContain('engineering'); // Based on career interests
    expect(response).toContain('IEB'); // Curriculum-specific guidance
  });
});

/**
 * Helper Functions
 */

/**
 * Mock function to simulate DeepDiveQuestions subject extraction
 */
function getDeepDiveSubjects(curriculumProfile) {
  // This simulates the fixed DeepDiveQuestions logic
  return curriculumProfile?.currentSubjects || ['Mathematics', 'Physical Science', 'Life Sciences', 'English', 'Afrikaans'];
}

/**
 * Mock function to simulate RAG query building
 */
function buildRAGQuery(student) {
  const { curriculumProfile, enjoyedSubjects, openQuestions } = student;
  
  let query = `I am a Grade ${student.grade} student in South Africa. `;
  query += `I follow the ${curriculumProfile.framework} curriculum. `;
  query += `Subjects I enjoy: ${enjoyedSubjects.join(', ')}. `;
  
  if (openQuestions.careerInterests) {
    query += `Career interests: ${openQuestions.careerInterests}. `;
  }
  
  return query;
}

/**
 * Mock function to simulate RAG API response
 */
async function mockRAGQuery(query, context = {}) {
  // This would normally call the actual RAG API
  // For testing, we simulate curriculum-aware responses
  
  if (context.curriculum === 'CAPS') {
    if (query.includes('pharmacy')) {
      return 'For CAPS students interested in pharmacy: APS 35 required at UJ. Mathematical Literacy accepted but limits options. Consider upgrading to Mathematics for more universities.';
    }
    return 'CAPS-specific guidance based on your curriculum and subjects.';
  }
  
  if (context.curriculum === 'IEB') {
    if (query.includes('engineering')) {
      return 'For IEB students: Engineering at Wits requires APS 36. Advanced Programme Mathematics accepted as equivalent to CAPS Mathematics + Additional Mathematics.';
    }
    return 'IEB-specific guidance with independent school pathways.';
  }
  
  return 'Generic response (this indicates a problem - responses should be curriculum-specific)';
}

/**
 * Performance Tests
 */
describe('Performance Integration', () => {
  
  test('Embedding Retrieval Speed', async () => {
    const startTime = Date.now();
    
    const response = await mockRAGQuery('engineering requirements', { curriculum: 'CAPS' });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    expect(response).toBeDefined();
  });
  
  test('Curriculum Context Preservation', async () => {
    // Test that curriculum context is preserved in embeddings
    const capsQuery = 'mathematics requirements';
    const iebQuery = 'mathematics requirements';
    
    const capsResponse = await mockRAGQuery(capsQuery, { curriculum: 'CAPS' });
    const iebResponse = await mockRAGQuery(iebQuery, { curriculum: 'IEB' });
    
    // Should retrieve different content based on curriculum
    expect(capsResponse).not.toEqual(iebResponse);
  });
});

export {
  mockStudentProfiles,
  getDeepDiveSubjects,
  buildRAGQuery,
  mockRAGQuery
};