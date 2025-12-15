/**
 * QueryContextStructurer - Optimal LLM query context construction
 * 
 * Transforms student profiles into structured, hierarchical query contexts
 * that maximize LLM comprehension and personalization quality.
 * 
 * Key improvements:
 * - Logical section organization for optimal LLM processing
 * - Priority-based information emphasis
 * - Explicit guidance requests for motivation and concerns
 * - Academic performance integration with realistic feasibility analysis
 */

class QueryContextStructurer {
  constructor() {
    this.sectionOrder = [
      'demographics',
      'academicPerformance', 
      'careerPriorities',
      'motivationAlignment',
      'concernsGuidance',
      'constraintsConsideration'
    ];
  }

  /**
   * Build comprehensive query context from student profile
   * @param {Object} studentProfile - Structured student profile from StudentProfileBuilder
   * @returns {Object} Optimized query context for LLM
   */
  buildContext(studentProfile) {
    try {
      const context = {
        sections: this.buildSections(studentProfile),
        instructions: this.buildInstructions(studentProfile),
        metadata: this.buildContextMetadata(studentProfile)
      };

      return this.formatForLLM(context);
    } catch (error) {
      console.error('QueryContextStructurer: Error building context:', error);
      return this.buildFallbackContext(studentProfile);
    }
  }

  /**
   * Build all context sections in logical order
   */
  buildSections(profile) {
    return {
      demographics: this.buildDemographicsSection(profile),
      academicPerformance: this.buildAcademicSection(profile),
      careerPriorities: this.buildCareerPrioritiesSection(profile),
      motivationAlignment: this.buildMotivationSection(profile),
      concernsGuidance: this.buildConcernsSection(profile),
      constraintsConsideration: this.buildConstraintsSection(profile)
    };
  }

  /**
   * Build demographics section with timeline context
   */
  buildDemographicsSection(profile) {
    const { demographics } = profile;
    
    let section = `STUDENT DEMOGRAPHICS:\n`;
    section += `- Grade: ${demographics.grade}\n`;
    section += `- Timeline Context: ${demographics.timelineContext}\n`;
    section += `- Academic Phase: ${demographics.academicCalendarPhase}\n`;
    section += `- Curriculum: ${demographics.curriculum}\n`;
    
    return section;
  }

  /**
   * Build academic performance section with APS integration
   */
  buildAcademicSection(profile) {
    const { academic } = profile;
    
    let section = `ACADEMIC PERFORMANCE:\n`;
    
    // Subjects
    if (academic.enjoyedSubjects.length > 0) {
      section += `- Enjoyed Subjects: ${academic.enjoyedSubjects.join(', ')}\n`;
    }
    
    // Marks and APS if available
    if (academic.hasMarks && academic.apsData) {
      section += `- Current Marks Available: Yes\n`;
      section += `- Current APS Score: ${academic.apsData.currentAPS}\n`;
      section += `- Average Percentage: ${academic.apsData.averagePercentage}%\n`;
      
      if (academic.apsData.projectedAPS !== academic.apsData.currentAPS) {
        section += `- Projected Final APS: ${academic.apsData.projectedAPS}\n`;
      }
      
      section += `- University Eligible: ${academic.apsData.universityEligible ? 'Yes' : 'Needs Improvement'}\n`;
      
      // Add specific marks for context
      section += `- Subject Performance:\n`;
      academic.currentMarks.forEach(mark => {
        section += `  * ${mark.subject}: ${mark.percentage}% (${mark.apsPoints} APS points)\n`;
      });
    } else {
      section += `- Current Marks: Not provided\n`;
      section += `- Note: Guidance will be general without specific performance analysis\n`;
    }
    
    return section;
  }

  /**
   * Build career priorities section with graduated weighting strategy
   */
  buildCareerPrioritiesSection(profile) {
    const { careerInterests, demographics } = profile;
    
    // Build graduated weighting strategy based on grade
    const weightingStrategy = this.buildCareerWeightingStrategy(profile);
    
    let section = `CAREER PRIORITIES:\n`;
    
    if (careerInterests.hasCareerInterests) {
      section += `CRITICAL STUDENT REQUEST: "${careerInterests.rawText}"\n`;
      
      if (careerInterests.specificCareers.length > 0) {
        section += `- Specific Careers Mentioned: ${careerInterests.specificCareers.join(', ')}\n`;
      }
      
      if (careerInterests.careerFields.length > 0) {
        section += `- Career Fields of Interest: ${careerInterests.careerFields.join(', ')}\n`;
      }
      
      section += `- Priority Level: ${careerInterests.priorityLevel.toUpperCase()}\n`;
      
      // Add graduated weighting strategy
      section += `\nGRADUATED WEIGHTING STRATEGY:\n`;
      section += `- Grade Level: ${demographics.grade}\n`;
      section += `- Strategy: ${weightingStrategy.strategy}\n`;
      section += `- Primary Interest Weight: ${weightingStrategy.primaryWeight}%\n`;
      section += `- Alternative Careers Weight: ${weightingStrategy.alternativeWeight}%\n`;
      section += `- Guidance Approach: ${weightingStrategy.guidance}\n`;
      section += `- Student Message: ${weightingStrategy.messaging}\n`;
      
    } else {
      section += `- No specific career interests provided\n`;
      section += `- Request: Provide broad career exploration based on academic strengths\n`;
      section += `\nGRADUATED WEIGHTING STRATEGY:\n`;
      section += `- Strategy: exploration_based (no stated interests)\n`;
      section += `- Primary Interest Weight: 0%\n`;
      section += `- Alternative Careers Weight: 100%\n`;
      section += `- Guidance: Focus on academic strengths and subject enjoyment\n`;
    }
    
    return section;
  }

  /**
   * Build graduated career weighting strategy based on student grade and interests
   * @param {Object} profile - Student profile
   * @returns {Object} Weighting strategy configuration
   */
  buildCareerWeightingStrategy(profile) {
    const grade = profile.demographics.grade;
    const hasCareerInterests = profile.careerInterests.hasCareerInterests;
    
    if (!hasCareerInterests) {
      return {
        strategy: 'exploration_based',
        primaryWeight: 0,
        alternativeWeight: 100,
        guidance: 'Provide broad career exploration based on academic strengths and subject enjoyment',
        messaging: 'Explore diverse career options that match your academic strengths'
      };
    }
    
    // Graduated weighting based on grade level
    if (grade <= 11) {
      return {
        strategy: 'exploration_focused',
        primaryWeight: 40,
        alternativeWeight: 60,
        guidance: 'Balance stated interests with extensive alternatives for exploration. Emphasize that students have time to explore and change direction.',
        messaging: 'You have time to explore - here are options aligned with your interests plus exciting alternatives to consider',
        phase: 'exploration',
        rationale: 'Grade 10-11 students benefit from broad exploration while respecting stated interests'
      };
    } else {
      return {
        strategy: 'decision_focused', 
        primaryWeight: 60,
        alternativeWeight: 40,
        guidance: 'Prioritize stated interests while providing realistic alternatives and backup options',
        messaging: 'Focus on your stated interests with practical backup options for Grade 12 decision-making',
        phase: 'decision',
        rationale: 'Grade 12 students need focused guidance while maintaining some alternatives'
      };
    }
  }

  /**
   * Build motivation alignment section (PREVIOUSLY IGNORED - 33% data loss)
   */
  buildMotivationSection(profile) {
    const { motivations } = profile;
    
    let section = `MOTIVATION ALIGNMENT:\n`;
    
    if (motivations.hasMotivation) {
      section += `STUDENT MOTIVATION: "${motivations.rawText}"\n`;
      
      if (motivations.extractedThemes.length > 0) {
        section += `- Key Motivation Themes: ${motivations.extractedThemes.join(', ')}\n`;
      }
      
      if (motivations.careerAlignment.length > 0) {
        section += `- Career Field Alignment: ${motivations.careerAlignment.join(', ')}\n`;
      }
      
      section += `\nIMPORTANT: Please ensure career recommendations align with and reflect these motivations. `;
      section += `Explain how suggested careers fulfill the student's intrinsic motivations.\n`;
    } else {
      section += `- No specific motivations provided\n`;
      section += `- Note: Career suggestions will focus on academic strengths and interests\n`;
    }
    
    return section;
  }

  /**
   * Build concerns guidance section (PREVIOUSLY IGNORED - 33% data loss)
   */
  buildConcernsSection(profile) {
    const { concerns } = profile;
    
    let section = `CONCERNS AND GUIDANCE NEEDS:\n`;
    
    if (concerns.hasConcerns) {
      section += `STUDENT CONCERNS: "${concerns.rawText}"\n`;
      
      if (concerns.concernCategories.length > 0) {
        section += `- Concern Categories: ${concerns.concernCategories.join(', ')}\n`;
      }
      
      if (concerns.addressingStrategies.length > 0) {
        section += `- Addressing Strategies Needed:\n`;
        concerns.addressingStrategies.forEach(strategy => {
          section += `  * ${strategy}\n`;
        });
      }
      
      section += `\nCRITICAL: Please directly address these specific concerns in your response. `;
      section += `Provide practical advice and reassurance for each concern mentioned.\n`;
    } else {
      section += `- No specific concerns provided\n`;
      section += `- Note: Provide general guidance and encouragement\n`;
    }
    
    return section;
  }

  /**
   * Build constraints consideration section
   */
  buildConstraintsSection(profile) {
    const { constraints } = profile;
    
    let section = `CONSTRAINTS AND LIMITATIONS:\n`;
    
    if (constraints.hasConstraints) {
      if (constraints.financial) {
        section += `- Financial: ${constraints.financial}\n`;
      }
      if (constraints.geographic) {
        section += `- Geographic: ${constraints.geographic}\n`;
      }
      if (constraints.time) {
        section += `- Time: ${constraints.time}\n`;
      }
      if (constraints.family) {
        section += `- Family: ${constraints.family}\n`;
      }
      
      section += `\nNote: Please consider these constraints when providing career and education recommendations.\n`;
    } else {
      section += `- No specific constraints mentioned\n`;
    }
    
    return section;
  }

  /**
   * Build LLM instructions for optimal response generation with graduated weighting
   */
  buildInstructions(profile) {
    const instructions = [];
    
    // Base instruction
    instructions.push('Provide personalized career guidance based on the complete student profile above.');
    
    // Graduated weighting strategy instructions
    const weightingStrategy = this.buildCareerWeightingStrategy(profile);
    if (profile.careerInterests.hasCareerInterests) {
      instructions.push(`CRITICAL WEIGHTING STRATEGY: Apply ${weightingStrategy.primaryWeight}% weight to stated career interests and ${weightingStrategy.alternativeWeight}% weight to alternative careers.`);
      instructions.push(`GRADE-SPECIFIC APPROACH: ${weightingStrategy.guidance}`);
      instructions.push(`STUDENT MESSAGING: Include this message - "${weightingStrategy.messaging}"`);
      
      if (weightingStrategy.phase === 'exploration') {
        instructions.push('EXPLORATION PHASE: Emphasize career discovery, skill development, and multiple pathways. Students have time to change direction.');
      } else {
        instructions.push('DECISION PHASE: Focus on realistic pathways, specific requirements, and practical backup options for immediate post-school planning.');
      }
    }
    
    // Motivation-specific instructions
    if (profile.motivations.hasMotivation) {
      instructions.push('CRITICAL: Reflect the student\'s stated motivations in your career recommendations and explain alignment.');
    }
    
    // Concerns-specific instructions
    if (profile.concerns.hasConcerns) {
      instructions.push('CRITICAL: Directly address each concern mentioned by the student with practical advice.');
    }
    
    // Academic performance instructions
    if (profile.academic.hasMarks) {
      instructions.push('Use the APS scores and marks to provide realistic university admission guidance.');
      instructions.push('Include specific mark improvement targets if needed for desired career paths.');
    }
    
    // Institute diversity instructions
    instructions.push('INSTITUTE DIVERSITY: Include diverse pathways - Universities, TVET colleges, SETAs, and private institutes as appropriate.');
    
    // Personalization quality instruction
    instructions.push('Ensure your response demonstrates understanding of this specific student\'s unique situation.');
    
    return {
      personalizationRequests: instructions,
      responseStructure: this.buildResponseStructure(profile),
      validationCriteria: this.buildValidationCriteria(profile),
      weightingStrategy: weightingStrategy
    };
  }

  /**
   * Build suggested response structure
   */
  buildResponseStructure(profile) {
    const structure = [
      '1. Personal Acknowledgment (reflect student\'s motivations and concerns)',
      '2. Career Recommendations (aligned with interests and academic performance)',
      '3. Educational Pathway (realistic based on APS/marks if available)',
      '4. Addressing Concerns (specific responses to stated worries)',
      '5. Action Steps (practical next steps for the student)'
    ];
    
    return structure;
  }

  /**
   * Build validation criteria for response quality
   */
  buildValidationCriteria(profile) {
    const criteria = [];
    
    if (profile.motivations.hasMotivation) {
      criteria.push('Response reflects student\'s stated motivations');
    }
    
    if (profile.concerns.hasConcerns) {
      criteria.push('Response addresses student\'s specific concerns');
    }
    
    if (profile.careerInterests.hasCareerInterests) {
      criteria.push('Response acknowledges student\'s career interests');
    }
    
    if (profile.academic.hasMarks) {
      criteria.push('Response includes realistic academic guidance based on marks');
    }
    
    criteria.push('Response demonstrates personalization (not generic advice)');
    
    return criteria;
  }

  /**
   * Build context metadata for tracking and validation
   */
  buildContextMetadata(profile) {
    return {
      profileCompleteness: profile.metadata.completionLevel,
      dataQuality: profile.metadata.dataQuality,
      personalizationPotential: profile.metadata.personalizationPotential,
      sectionsIncluded: this.getSectionsIncluded(profile),
      expectedPersonalizationScore: this.calculateExpectedScore(profile),
      contextLength: 0, // Will be calculated after formatting
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get list of sections that have meaningful content
   */
  getSectionsIncluded(profile) {
    const sections = [];
    
    sections.push('demographics', 'academicPerformance');
    
    if (profile.careerInterests.hasCareerInterests) sections.push('careerPriorities');
    if (profile.motivations.hasMotivation) sections.push('motivationAlignment');
    if (profile.concerns.hasConcerns) sections.push('concernsGuidance');
    if (profile.constraints.hasConstraints) sections.push('constraintsConsideration');
    
    return sections;
  }

  /**
   * Calculate expected personalization score based on available data
   */
  calculateExpectedScore(profile) {
    let score = 40; // Base score for demographics and academic
    
    if (profile.careerInterests.hasCareerInterests) score += 20;
    if (profile.motivations.hasMotivation) score += 20;
    if (profile.concerns.hasConcerns) score += 15;
    if (profile.academic.hasMarks) score += 5;
    
    return Math.min(100, score);
  }

  /**
   * Format complete context for LLM consumption
   */
  formatForLLM(context) {
    let formattedContext = '';
    
    // Add header
    formattedContext += '=== STUDENT CAREER GUIDANCE REQUEST ===\n\n';
    
    // Add sections in logical order
    Object.entries(context.sections).forEach(([sectionName, sectionContent]) => {
      if (sectionContent && sectionContent.trim()) {
        formattedContext += sectionContent + '\n';
      }
    });
    
    // Add instructions
    formattedContext += '\n=== GUIDANCE INSTRUCTIONS ===\n';
    context.instructions.personalizationRequests.forEach((instruction, index) => {
      formattedContext += `${index + 1}. ${instruction}\n`;
    });
    
    // Add response structure
    formattedContext += '\n=== SUGGESTED RESPONSE STRUCTURE ===\n';
    context.instructions.responseStructure.forEach(item => {
      formattedContext += `${item}\n`;
    });
    
    // Add validation criteria
    formattedContext += '\n=== RESPONSE VALIDATION CRITERIA ===\n';
    context.instructions.validationCriteria.forEach(criterion => {
      formattedContext += `- ${criterion}\n`;
    });
    
    // Update context length
    context.metadata.contextLength = formattedContext.length;
    
    return {
      formattedContext,
      metadata: context.metadata,
      sections: context.sections,
      instructions: context.instructions
    };
  }

  /**
   * Build fallback context for error scenarios
   */
  buildFallbackContext(profile) {
    const fallbackContext = `=== STUDENT CAREER GUIDANCE REQUEST ===

STUDENT DEMOGRAPHICS:
- Grade: ${profile?.demographics?.grade || 12}
- Timeline Context: Career exploration phase

ACADEMIC PERFORMANCE:
- Subjects: ${profile?.academic?.enjoyedSubjects?.join(', ') || 'Not specified'}
- Performance Data: Limited information available

CAREER PRIORITIES:
- Interests: ${profile?.careerInterests?.rawText || 'General career exploration requested'}

=== GUIDANCE INSTRUCTIONS ===
1. Provide general career guidance based on available information
2. Focus on broad career exploration and educational pathways
3. Include encouragement and practical next steps

Please provide personalized career guidance based on the available student information.`;

    return {
      formattedContext: fallbackContext,
      metadata: {
        profileCompleteness: 30,
        dataQuality: 30,
        personalizationPotential: 'basic',
        sectionsIncluded: ['demographics', 'academicPerformance'],
        expectedPersonalizationScore: 40,
        contextLength: fallbackContext.length,
        timestamp: new Date().toISOString(),
        fallback: true
      }
    };
  }

  /**
   * Validate context quality and completeness
   */
  validateContext(context, originalProfile) {
    const validation = {
      isValid: true,
      warnings: [],
      dataUtilization: {},
      qualityScore: 0
    };

    // Check data utilization
    if (originalProfile.motivations.hasMotivation) {
      validation.dataUtilization.motivation = context.formattedContext.includes(originalProfile.motivations.rawText);
    }
    
    if (originalProfile.concerns.hasConcerns) {
      validation.dataUtilization.concerns = context.formattedContext.includes(originalProfile.concerns.rawText);
    }
    
    if (originalProfile.careerInterests.hasCareerInterests) {
      validation.dataUtilization.careerInterests = context.formattedContext.includes(originalProfile.careerInterests.rawText);
    }

    // Calculate quality score
    const utilizationCount = Object.values(validation.dataUtilization).filter(Boolean).length;
    const totalFields = Object.keys(validation.dataUtilization).length;
    validation.qualityScore = totalFields > 0 ? (utilizationCount / totalFields) * 100 : 100;

    // Add warnings for missing data
    Object.entries(validation.dataUtilization).forEach(([field, utilized]) => {
      if (!utilized) {
        validation.warnings.push(`${field} data not properly included in context`);
      }
    });

    if (validation.warnings.length > 0) {
      validation.isValid = false;
    }

    return validation;
  }
}

export default QueryContextStructurer;