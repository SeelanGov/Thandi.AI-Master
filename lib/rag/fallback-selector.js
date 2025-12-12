// lib/rag/fallback-selector.js
// Intelligent Fallback Career Selector
// Provides subject-based career selection when RAG results are insufficient

import { createClient } from '@supabase/supabase-js';

/**
 * Intelligent fallback selector for career recommendations
 * Uses subject-based prioritization and grade-appropriate selection
 */
export class FallbackSelector {
  constructor(options = {}) {
    this.options = {
      maxFallbacks: 5,
      minConfidence: 0.4,
      diversityThreshold: 0.7,
      ...options
    };
    
    this.supabase = null;
  }

  /**
   * Get Supabase client (lazy initialization)
   * @private
   */
  _getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    }
    return this.supabase;
  }

  /**
   * Select fallback careers to reach target count
   * @param {Object} profile - Student profile
   * @param {Array} existingCareers - Already found careers
   * @param {number} targetCount - Target total number of careers
   * @returns {Promise<Array>} - Fallback careers
   */
  async selectFallbacks(profile, existingCareers = [], targetCount = 3) {
    const neededCount = Math.max(0, targetCount - existingCareers.length);
    
    if (neededCount === 0) {
      return [];
    }

    console.log(`[FallbackSelector] Need ${neededCount} fallback careers`);

    try {
      // Get all potential fallback careers
      const candidates = await this._getAllFallbackCandidates(profile, existingCareers);
      
      if (candidates.length === 0) {
        console.log('[FallbackSelector] No candidates found, using emergency fallbacks');
        return this._getEmergencyFallbacks(profile, existingCareers, neededCount);
      }

      // Prioritize and select best candidates
      const prioritized = this.prioritizeBySubjects(candidates, profile.subjects || []);
      const selected = this._selectDiverseCareers(prioritized, neededCount);

      console.log(`[FallbackSelector] Selected ${selected.length} fallback careers`);
      return selected;

    } catch (error) {
      console.error('[FallbackSelector] Error selecting fallbacks:', error);
      return this._getEmergencyFallbacks(profile, existingCareers, neededCount);
    }
  }

  /**
   * Get all potential fallback candidates
   * @private
   */
  async _getAllFallbackCandidates(profile, existingCareers) {
    const client = this._getSupabaseClient();
    const existingCodes = new Set(existingCareers.map(c => c.code).filter(Boolean));
    const existingTitles = new Set(existingCareers.map(c => c.title).filter(Boolean));

    const candidates = [];

    // Strategy 1: Subject-based careers
    if (profile.subjects && profile.subjects.length > 0) {
      const subjectCareers = await this._getSubjectBasedCareers(profile.subjects, client);
      candidates.push(...subjectCareers.filter(c => 
        !existingCodes.has(c.career_code) && !existingTitles.has(c.career_title)
      ));
    }

    // Strategy 2: High-demand careers for grade level
    const demandCareers = await this._getHighDemandCareers(profile.grade, client);
    candidates.push(...demandCareers.filter(c => 
      !existingCodes.has(c.career_code) && !existingTitles.has(c.career_title)
    ));

    // Strategy 3: Popular careers by category
    const categoryCareers = await this._getCategoryBasedCareers(profile, client);
    candidates.push(...categoryCareers.filter(c => 
      !existingCodes.has(c.career_code) && !existingTitles.has(c.career_title)
    ));

    // Remove duplicates by career_code
    const uniqueCandidates = Array.from(
      new Map(candidates.map(c => [c.career_code, c])).values()
    );

    console.log(`[FallbackSelector] Found ${uniqueCandidates.length} unique candidates`);
    return uniqueCandidates;
  }

  /**
   * Get careers based on student subjects
   * @private
   */
  async _getSubjectBasedCareers(subjects, client) {
    const subjectCategories = subjects.map(s => this._getSubjectCategory(s));
    const uniqueCategories = [...new Set(subjectCategories)];

    if (uniqueCategories.length === 0) {
      return [];
    }

    try {
      // Query careers that match subject categories
      const { data, error } = await client
        .from('careers')
        .select('*')
        .or(uniqueCategories.map(cat => `career_category.ilike.%${cat}%`).join(','))
        .in('demand_level', ['very_high', 'high', 'medium'])
        .limit(20);

      if (error) {
        console.error('[FallbackSelector] Subject-based query error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[FallbackSelector] Subject-based careers error:', error);
      return [];
    }
  }

  /**
   * Get high-demand careers appropriate for grade level
   * @private
   */
  async _getHighDemandCareers(grade, client) {
    try {
      const { data, error } = await client
        .from('careers')
        .select('*')
        .in('demand_level', ['very_high', 'high'])
        .order('demand_level', { ascending: false })
        .limit(15);

      if (error) {
        console.error('[FallbackSelector] High-demand query error:', error);
        return [];
      }

      // Filter by grade appropriateness
      return (data || []).filter(career => this._isGradeAppropriate(career, grade));
    } catch (error) {
      console.error('[FallbackSelector] High-demand careers error:', error);
      return [];
    }
  }

  /**
   * Get careers by category diversity
   * @private
   */
  async _getCategoryBasedCareers(profile, client) {
    const targetCategories = ['Engineering', 'Technology', 'Business', 'Healthcare', 'Education'];
    
    try {
      const { data, error } = await client
        .from('careers')
        .select('*')
        .in('career_category', targetCategories)
        .in('demand_level', ['very_high', 'high', 'medium'])
        .limit(25);

      if (error) {
        console.error('[FallbackSelector] Category-based query error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[FallbackSelector] Category-based careers error:', error);
      return [];
    }
  }

  /**
   * Prioritize careers by subject relevance
   * @param {Array} careers - Career candidates
   * @param {Array} subjects - Student subjects
   * @returns {Array} - Prioritized careers
   */
  prioritizeBySubjects(careers, subjects = []) {
    if (!Array.isArray(careers) || careers.length === 0) {
      return [];
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return careers; // No subjects to prioritize by
    }

    // Calculate subject relevance scores
    const scoredCareers = careers.map(career => {
      const score = this._calculateSubjectRelevance(career, subjects);
      return {
        ...career,
        subjectRelevanceScore: score
      };
    });

    // Sort by relevance score (descending)
    return scoredCareers.sort((a, b) => b.subjectRelevanceScore - a.subjectRelevanceScore);
  }

  /**
   * Calculate subject relevance score for a career
   * @private
   */
  _calculateSubjectRelevance(career, subjects) {
    let score = 0;
    const careerCategory = (career.career_category || '').toLowerCase();
    const careerTitle = (career.career_title || '').toLowerCase();
    const requiredSubjects = String(career.required_subjects || '').toLowerCase();

    // Score based on subject-category mapping
    subjects.forEach(subject => {
      const category = this._getSubjectCategory(subject).toLowerCase();
      
      // Direct category match
      if (careerCategory.includes(category)) {
        score += 3;
      }
      
      // Subject mentioned in requirements
      if (requiredSubjects.includes(subject.toLowerCase())) {
        score += 2;
      }
      
      // Subject mentioned in title
      if (careerTitle.includes(subject.toLowerCase())) {
        score += 1;
      }
    });

    return score;
  }

  /**
   * Select diverse careers from prioritized list
   * @private
   */
  _selectDiverseCareers(careers, count) {
    if (!Array.isArray(careers) || careers.length === 0) {
      return [];
    }

    const selected = [];
    const usedCategories = new Set();

    // First pass: select one from each category
    for (const career of careers) {
      if (selected.length >= count) break;
      
      const category = career.career_category || 'General';
      if (!usedCategories.has(category)) {
        selected.push(this._formatCareerForOutput(career, 'fallback'));
        usedCategories.add(category);
      }
    }

    // Second pass: fill remaining slots with best remaining careers
    for (const career of careers) {
      if (selected.length >= count) break;
      
      const alreadySelected = selected.some(s => s.code === career.career_code);
      if (!alreadySelected) {
        selected.push(this._formatCareerForOutput(career, 'fallback'));
      }
    }

    return selected.slice(0, count);
  }

  /**
   * Format career data for output
   * @private
   */
  _formatCareerForOutput(career, source = 'fallback') {
    return {
      title: career.career_title || 'Unknown Career',
      code: career.career_code,
      category: career.career_category || 'General',
      description: career.short_description || career.description || `${career.career_title} career information`,
      similarity: 0.4, // Lower similarity for fallback
      confidence: 0.6, // Moderate confidence for fallback
      source: source,
      
      // Career details
      education: career.required_education,
      qualifications: career.required_qualifications,
      subjects: career.required_subjects,
      salaryRange: career.salary_entry_min ? {
        entry: { min: career.salary_entry_min, max: career.salary_entry_max },
        mid: { min: career.salary_mid_min, max: career.salary_mid_max },
        senior: { min: career.salary_senior_min, max: career.salary_senior_max }
      } : null,
      outlook: career.job_outlook,
      demand: career.demand_level,
      
      // Metadata
      fullData: career
    };
  }

  /**
   * Get subject category mapping
   * @private
   */
  _getSubjectCategory(subject) {
    const categoryMap = {
      'Mathematics': 'Engineering',
      'Physical Sciences': 'Engineering',
      'Life Sciences': 'Healthcare',
      'Information Technology': 'Technology',
      'Computer Applications Technology': 'Technology',
      'Business Studies': 'Business',
      'Accounting': 'Finance',
      'Economics': 'Business',
      'English': 'Education',
      'Afrikaans': 'Education',
      'Visual Arts': 'Creative',
      'Music': 'Creative',
      'Drama': 'Creative',
      'Design': 'Creative',
      'Geography': 'Science',
      'History': 'Education',
      'Tourism': 'Business',
      'Consumer Studies': 'Business',
      'Agricultural Sciences': 'Agriculture'
    };

    return categoryMap[subject] || 'General';
  }

  /**
   * Check if career is appropriate for grade level
   * @private
   */
  _isGradeAppropriate(career, grade) {
    if (!grade) return true;

    const title = (career.career_title || '').toLowerCase();
    
    // Exclude very senior positions for Grade 10
    if (grade === 10) {
      const seniorKeywords = ['senior', 'lead', 'principal', 'chief', 'director', 'head'];
      if (seniorKeywords.some(keyword => title.includes(keyword))) {
        return false;
      }
    }

    // All other careers are appropriate
    return true;
  }

  /**
   * Emergency fallback when database queries fail
   * @private
   */
  _getEmergencyFallbacks(profile, existingCareers, count) {
    console.log('[FallbackSelector] Using emergency fallback careers');

    const emergencyCareers = [
      {
        career_title: 'Software Engineer',
        career_code: 'emergency_001',
        career_category: 'Technology',
        short_description: 'Design and develop software applications and systems.',
        demand_level: 'very_high'
      },
      {
        career_title: 'Business Analyst',
        career_code: 'emergency_002', 
        career_category: 'Business',
        short_description: 'Analyze business processes and recommend improvements.',
        demand_level: 'high'
      },
      {
        career_title: 'Teacher',
        career_code: 'emergency_003',
        career_category: 'Education',
        short_description: 'Educate and inspire students in various subjects.',
        demand_level: 'high'
      },
      {
        career_title: 'Nurse',
        career_code: 'emergency_004',
        career_category: 'Healthcare', 
        short_description: 'Provide healthcare services and patient care.',
        demand_level: 'very_high'
      },
      {
        career_title: 'Civil Engineer',
        career_code: 'emergency_005',
        career_category: 'Engineering',
        short_description: 'Design and oversee construction of infrastructure projects.',
        demand_level: 'high'
      }
    ];

    const existingTitles = new Set(existingCareers.map(c => c.title));
    const availableEmergency = emergencyCareers.filter(c => !existingTitles.has(c.career_title));
    
    return availableEmergency
      .slice(0, count)
      .map(career => this._formatCareerForOutput(career, 'emergency_fallback'));
  }

  /**
   * Get selector statistics
   * @returns {Object} - Selector performance statistics
   */
  getStats() {
    return {
      version: '1.0.0',
      maxFallbacks: this.options.maxFallbacks,
      minConfidence: this.options.minConfidence,
      diversityThreshold: this.options.diversityThreshold,
      strategies: ['subject_based', 'high_demand', 'category_based', 'emergency'],
      subjectCategories: [
        'Engineering', 'Technology', 'Healthcare', 'Business', 'Finance',
        'Education', 'Creative', 'Science', 'Agriculture', 'General'
      ]
    };
  }
}

// Export singleton instance for convenience
export const fallbackSelector = new FallbackSelector();

// Export class for custom instances
export default FallbackSelector;