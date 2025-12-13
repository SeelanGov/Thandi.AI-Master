// lib/rag/data-quality-validator.js
// Task 8.2: Data quality validation utilities
// Tools to analyze knowledge base career coverage and metadata consistency

import { createClient } from '@supabase/supabase-js';

/**
 * Data Quality Validator for Knowledge Base Analysis
 * Provides tools to analyze career coverage, metadata consistency, and data completeness
 */
export class DataQualityValidator {
  constructor(options = {}) {
    this.options = {
      enableLogging: options.enableLogging ?? true,
      enableMetrics: options.enableMetrics ?? true,
      batchSize: options.batchSize ?? 100,
      ...options
    };
    
    this.supabase = null;
    this.metrics = {
      totalCareers: 0,
      categoryCoverage: new Map(),
      metadataCompleteness: new Map(),
      dataQualityScore: 0,
      lastAnalysis: null
    };
  }

  /**
   * Initialize Supabase client
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
   * Log message if logging is enabled
   * @private
   */
  _log(message, level = 'info') {
    if (this.options.enableLogging) {
      const timestamp = new Date().toISOString();
      const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
      console.log(`${prefix} [DataQualityValidator] ${timestamp}: ${message}`);
    }
  }

  /**
   * Analyze career coverage across categories
   * @returns {Promise<Object>} Coverage analysis results
   */
  async analyzeCareeCoverage() {
    this._log('Starting career coverage analysis...');
    
    try {
      const client = this._getSupabaseClient();
      
      // Get all careers with category information
      const { data: careers, error } = await client
        .from('careers')
        .select('career_code, career_title, career_category, career_subcategory, demand_level, required_subjects');
      
      if (error) {
        throw new Error(`Failed to fetch careers: ${error.message}`);
      }

      const analysis = {
        totalCareers: careers.length,
        categories: new Map(),
        subcategories: new Map(),
        demandLevels: new Map(),
        subjectCoverage: new Map(),
        gaps: [],
        recommendations: []
      };

      // Analyze category distribution
      careers.forEach(career => {
        const category = career.career_category || 'Uncategorized';
        const subcategory = career.career_subcategory || 'General';
        const demand = career.demand_level || 'unknown';
        
        // Category stats
        analysis.categories.set(category, (analysis.categories.get(category) || 0) + 1);
        analysis.subcategories.set(subcategory, (analysis.subcategories.get(subcategory) || 0) + 1);
        analysis.demandLevels.set(demand, (analysis.demandLevels.get(demand) || 0) + 1);
        
        // Subject coverage
        if (career.required_subjects) {
          const subjects = Array.isArray(career.required_subjects) 
            ? career.required_subjects 
            : career.required_subjects.split(',').map(s => s.trim());
          
          subjects.forEach(subject => {
            if (subject) {
              analysis.subjectCoverage.set(subject, (analysis.subjectCoverage.get(subject) || 0) + 1);
            }
          });
        }
      });

      // Identify gaps and generate recommendations
      this._identifyGaps(analysis);
      
      // Update metrics
      this.metrics.totalCareers = analysis.totalCareers;
      this.metrics.categoryCoverage = analysis.categories;
      this.metrics.lastAnalysis = new Date().toISOString();

      this._log(`Career coverage analysis complete: ${analysis.totalCareers} careers across ${analysis.categories.size} categories`);
      
      return analysis;
      
    } catch (error) {
      this._log(`Career coverage analysis failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Identify gaps in career coverage
   * @private
   */
  _identifyGaps(analysis) {
    // Check for underrepresented categories
    const avgCareersPerCategory = analysis.totalCareers / analysis.categories.size;
    
    for (const [category, count] of analysis.categories.entries()) {
      if (count < avgCareersPerCategory * 0.5) {
        analysis.gaps.push({
          type: 'underrepresented_category',
          category: category,
          currentCount: count,
          recommendedMinimum: Math.ceil(avgCareersPerCategory * 0.5),
          severity: count < 2 ? 'high' : 'medium'
        });
      }
    }

    // Check for missing high-demand careers
    const highDemandCount = analysis.demandLevels.get('very_high') || 0;
    const totalHighDemand = (analysis.demandLevels.get('very_high') || 0) + (analysis.demandLevels.get('high') || 0);
    
    if (totalHighDemand < analysis.totalCareers * 0.3) {
      analysis.gaps.push({
        type: 'insufficient_high_demand',
        currentCount: totalHighDemand,
        recommendedMinimum: Math.ceil(analysis.totalCareers * 0.3),
        severity: 'medium'
      });
    }

    // Check for subject coverage gaps
    const expectedSubjects = [
      'Mathematics', 'Physical Sciences', 'Life Sciences', 'Information Technology',
      'Business Studies', 'Accounting', 'Economics', 'English', 'Visual Arts'
    ];
    
    expectedSubjects.forEach(subject => {
      const coverage = analysis.subjectCoverage.get(subject) || 0;
      if (coverage < 3) {
        analysis.gaps.push({
          type: 'subject_coverage_gap',
          subject: subject,
          currentCount: coverage,
          recommendedMinimum: 3,
          severity: coverage === 0 ? 'high' : 'low'
        });
      }
    });

    // Generate recommendations
    analysis.recommendations = this._generateRecommendations(analysis.gaps);
  }

  /**
   * Generate recommendations based on identified gaps
   * @private
   */
  _generateRecommendations(gaps) {
    const recommendations = [];
    
    gaps.forEach(gap => {
      switch (gap.type) {
        case 'underrepresented_category':
          recommendations.push({
            priority: gap.severity === 'high' ? 1 : 2,
            action: `Add more careers in ${gap.category} category`,
            details: `Currently ${gap.currentCount} careers, recommend at least ${gap.recommendedMinimum}`,
            category: gap.category
          });
          break;
          
        case 'insufficient_high_demand':
          recommendations.push({
            priority: 2,
            action: 'Add more high-demand careers',
            details: `Currently ${gap.currentCount} high-demand careers, recommend at least ${gap.recommendedMinimum}`,
            category: 'demand_level'
          });
          break;
          
        case 'subject_coverage_gap':
          recommendations.push({
            priority: gap.severity === 'high' ? 1 : 3,
            action: `Add careers requiring ${gap.subject}`,
            details: `Currently ${gap.currentCount} careers, recommend at least ${gap.recommendedMinimum}`,
            category: 'subject_coverage'
          });
          break;
      }
    });
    
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Check metadata consistency across careers
   * @returns {Promise<Object>} Metadata consistency analysis
   */
  async checkMetadataConsistency() {
    this._log('Starting metadata consistency check...');
    
    try {
      const client = this._getSupabaseClient();
      
      // Get all careers with full metadata
      const { data: careers, error } = await client
        .from('careers')
        .select('*');
      
      if (error) {
        throw new Error(`Failed to fetch careers: ${error.message}`);
      }

      const analysis = {
        totalCareers: careers.length,
        fieldCompleteness: new Map(),
        dataTypes: new Map(),
        inconsistencies: [],
        qualityScore: 0,
        recommendations: []
      };

      // Essential fields to check
      const essentialFields = [
        'career_code', 'career_title', 'career_category', 'short_description',
        'required_education', 'required_subjects', 'demand_level'
      ];

      const optionalFields = [
        'career_subcategory', 'detailed_description', 'typical_tasks',
        'work_environment', 'required_qualifications', 'alternative_pathways',
        'salary_entry_min', 'salary_entry_max', 'job_outlook', 'skills_required'
      ];

      // Check field completeness
      [...essentialFields, ...optionalFields].forEach(field => {
        let completeCount = 0;
        let typeConsistency = new Map();
        
        careers.forEach(career => {
          const value = career[field];
          
          if (value !== null && value !== undefined && value !== '') {
            completeCount++;
            
            // Track data types
            const type = Array.isArray(value) ? 'array' : typeof value;
            typeConsistency.set(type, (typeConsistency.get(type) || 0) + 1);
          }
        });
        
        const completeness = completeCount / careers.length;
        analysis.fieldCompleteness.set(field, {
          completeness: completeness,
          completeCount: completeCount,
          totalCount: careers.length,
          isEssential: essentialFields.includes(field),
          typeDistribution: typeConsistency
        });
      });

      // Identify inconsistencies
      this._identifyMetadataInconsistencies(analysis, careers);
      
      // Calculate quality score
      analysis.qualityScore = this._calculateQualityScore(analysis);
      
      // Update metrics
      this.metrics.metadataCompleteness = analysis.fieldCompleteness;
      this.metrics.dataQualityScore = analysis.qualityScore;

      this._log(`Metadata consistency check complete: ${analysis.qualityScore.toFixed(1)}% quality score`);
      
      return analysis;
      
    } catch (error) {
      this._log(`Metadata consistency check failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Identify metadata inconsistencies
   * @private
   */
  _identifyMetadataInconsistencies(analysis, careers) {
    // Check for missing essential fields
    analysis.fieldCompleteness.forEach((stats, field) => {
      if (stats.isEssential && stats.completeness < 0.9) {
        analysis.inconsistencies.push({
          type: 'missing_essential_field',
          field: field,
          completeness: stats.completeness,
          severity: stats.completeness < 0.5 ? 'high' : 'medium',
          affectedCareers: stats.totalCount - stats.completeCount
        });
      }
    });

    // Check for data type inconsistencies
    analysis.fieldCompleteness.forEach((stats, field) => {
      if (stats.typeDistribution.size > 1) {
        const dominantType = [...stats.typeDistribution.entries()]
          .sort((a, b) => b[1] - a[1])[0];
        
        if (dominantType[1] / stats.completeCount < 0.8) {
          analysis.inconsistencies.push({
            type: 'data_type_inconsistency',
            field: field,
            typeDistribution: Object.fromEntries(stats.typeDistribution),
            severity: 'low',
            dominantType: dominantType[0]
          });
        }
      }
    });

    // Check for duplicate career codes
    const careerCodes = new Map();
    careers.forEach((career, index) => {
      const code = career.career_code;
      if (code) {
        if (careerCodes.has(code)) {
          analysis.inconsistencies.push({
            type: 'duplicate_career_code',
            careerCode: code,
            duplicateIndexes: [careerCodes.get(code), index],
            severity: 'high'
          });
        } else {
          careerCodes.set(code, index);
        }
      }
    });

    // Generate recommendations
    analysis.recommendations = this._generateMetadataRecommendations(analysis.inconsistencies);
  }

  /**
   * Generate metadata improvement recommendations
   * @private
   */
  _generateMetadataRecommendations(inconsistencies) {
    const recommendations = [];
    
    inconsistencies.forEach(issue => {
      switch (issue.type) {
        case 'missing_essential_field':
          recommendations.push({
            priority: issue.severity === 'high' ? 1 : 2,
            action: `Complete missing ${issue.field} data`,
            details: `${issue.affectedCareers} careers missing this essential field (${(issue.completeness * 100).toFixed(1)}% complete)`,
            field: issue.field,
            type: 'data_completion'
          });
          break;
          
        case 'data_type_inconsistency':
          recommendations.push({
            priority: 3,
            action: `Standardize ${issue.field} data format`,
            details: `Multiple data types found: ${Object.keys(issue.typeDistribution).join(', ')}`,
            field: issue.field,
            type: 'data_standardization'
          });
          break;
          
        case 'duplicate_career_code':
          recommendations.push({
            priority: 1,
            action: `Resolve duplicate career code: ${issue.careerCode}`,
            details: `Career code appears multiple times in database`,
            field: 'career_code',
            type: 'data_integrity'
          });
          break;
      }
    });
    
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Calculate overall data quality score
   * @private
   */
  _calculateQualityScore(analysis) {
    let totalScore = 0;
    let weightedFields = 0;
    
    analysis.fieldCompleteness.forEach((stats, field) => {
      const weight = stats.isEssential ? 2 : 1;
      totalScore += stats.completeness * weight;
      weightedFields += weight;
    });
    
    const baseScore = (totalScore / weightedFields) * 100;
    
    // Deduct points for high-severity issues
    const highSeverityIssues = analysis.inconsistencies.filter(i => i.severity === 'high').length;
    const mediumSeverityIssues = analysis.inconsistencies.filter(i => i.severity === 'medium').length;
    
    const penalty = (highSeverityIssues * 10) + (mediumSeverityIssues * 5);
    
    return Math.max(0, baseScore - penalty);
  }

  /**
   * Validate career data completeness for specific careers
   * @param {Array<string>} careerCodes - Career codes to validate
   * @returns {Promise<Object>} Validation results
   */
  async validateCareerCompleteness(careerCodes = []) {
    this._log(`Validating completeness for ${careerCodes.length || 'all'} careers...`);
    
    try {
      const client = this._getSupabaseClient();
      
      let query = client.from('careers').select('*');
      
      if (careerCodes.length > 0) {
        query = query.in('career_code', careerCodes);
      }
      
      const { data: careers, error } = await query;
      
      if (error) {
        throw new Error(`Failed to fetch careers: ${error.message}`);
      }

      const validation = {
        totalCareers: careers.length,
        validCareers: [],
        invalidCareers: [],
        warnings: [],
        completenessScore: 0
      };

      const requiredFields = ['career_code', 'career_title', 'career_category', 'short_description'];
      const recommendedFields = ['required_education', 'required_subjects', 'demand_level', 'job_outlook'];

      careers.forEach(career => {
        const careerValidation = {
          career_code: career.career_code,
          career_title: career.career_title,
          issues: [],
          warnings: [],
          completenessScore: 0
        };

        let requiredFieldsComplete = 0;
        let recommendedFieldsComplete = 0;

        // Check required fields
        requiredFields.forEach(field => {
          const value = career[field];
          if (!value || value.toString().trim() === '') {
            careerValidation.issues.push(`Missing required field: ${field}`);
          } else {
            requiredFieldsComplete++;
          }
        });

        // Check recommended fields
        recommendedFields.forEach(field => {
          const value = career[field];
          if (!value || value.toString().trim() === '') {
            careerValidation.warnings.push(`Missing recommended field: ${field}`);
          } else {
            recommendedFieldsComplete++;
          }
        });

        // Calculate completeness score
        const requiredScore = (requiredFieldsComplete / requiredFields.length) * 70; // 70% weight
        const recommendedScore = (recommendedFieldsComplete / recommendedFields.length) * 30; // 30% weight
        careerValidation.completenessScore = requiredScore + recommendedScore;

        // Validate data quality
        this._validateCareerDataQuality(career, careerValidation);

        // Categorize career
        if (careerValidation.issues.length === 0) {
          validation.validCareers.push(careerValidation);
        } else {
          validation.invalidCareers.push(careerValidation);
        }

        if (careerValidation.warnings.length > 0) {
          validation.warnings.push(...careerValidation.warnings.map(w => 
            `${career.career_code}: ${w}`
          ));
        }
      });

      // Calculate overall completeness score
      validation.completenessScore = careers.length > 0 
        ? validation.validCareers.reduce((sum, c) => sum + c.completenessScore, 0) / careers.length
        : 0;

      this._log(`Career completeness validation complete: ${validation.validCareers.length}/${validation.totalCareers} valid careers`);
      
      return validation;
      
    } catch (error) {
      this._log(`Career completeness validation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Validate individual career data quality
   * @private
   */
  _validateCareerDataQuality(career, validation) {
    // Check title quality
    if (career.career_title) {
      const title = career.career_title.toString().trim();
      if (title.length < 3) {
        validation.issues.push('Career title too short');
      }
      if (title.length > 100) {
        validation.warnings.push('Career title very long');
      }
      if (!/^[A-Z]/.test(title)) {
        validation.warnings.push('Career title should start with capital letter');
      }
    }

    // Check description quality
    if (career.short_description) {
      const desc = career.short_description.toString().trim();
      if (desc.length < 20) {
        validation.warnings.push('Short description too brief');
      }
      if (desc.length > 500) {
        validation.warnings.push('Short description too long');
      }
    }

    // Check salary data consistency
    if (career.salary_entry_min && career.salary_entry_max) {
      if (career.salary_entry_min > career.salary_entry_max) {
        validation.issues.push('Entry salary minimum greater than maximum');
      }
    }

    // Check subject format
    if (career.required_subjects) {
      const subjects = career.required_subjects;
      if (typeof subjects === 'string' && subjects.includes(',')) {
        validation.warnings.push('Subjects stored as comma-separated string (consider array format)');
      }
    }
  }

  /**
   * Generate comprehensive data quality report
   * @returns {Promise<Object>} Complete data quality report
   */
  async generateQualityReport() {
    this._log('Generating comprehensive data quality report...');
    
    try {
      const [coverageAnalysis, metadataAnalysis, completenessValidation] = await Promise.all([
        this.analyzeCareeCoverage(),
        this.checkMetadataConsistency(),
        this.validateCareerCompleteness()
      ]);

      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalCareers: coverageAnalysis.totalCareers,
          categories: coverageAnalysis.categories.size,
          dataQualityScore: metadataAnalysis.qualityScore,
          completenessScore: completenessValidation.completenessScore,
          overallScore: (metadataAnalysis.qualityScore + completenessValidation.completenessScore) / 2
        },
        coverage: coverageAnalysis,
        metadata: metadataAnalysis,
        completeness: completenessValidation,
        priorityActions: this._getPriorityActions(coverageAnalysis, metadataAnalysis, completenessValidation)
      };

      this._log(`Data quality report generated: ${report.summary.overallScore.toFixed(1)}% overall score`);
      
      return report;
      
    } catch (error) {
      this._log(`Failed to generate quality report: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Get priority actions from all analyses
   * @private
   */
  _getPriorityActions(coverage, metadata, completeness) {
    const actions = [];
    
    // Add coverage recommendations
    coverage.recommendations.forEach(rec => {
      actions.push({
        ...rec,
        source: 'coverage_analysis',
        impact: rec.priority === 1 ? 'high' : rec.priority === 2 ? 'medium' : 'low'
      });
    });
    
    // Add metadata recommendations
    metadata.recommendations.forEach(rec => {
      actions.push({
        ...rec,
        source: 'metadata_analysis',
        impact: rec.priority === 1 ? 'high' : rec.priority === 2 ? 'medium' : 'low'
      });
    });
    
    // Add completeness issues
    if (completeness.invalidCareers.length > 0) {
      actions.push({
        priority: 1,
        action: 'Fix invalid career data',
        details: `${completeness.invalidCareers.length} careers have data quality issues`,
        source: 'completeness_validation',
        impact: 'high'
      });
    }
    
    return actions.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get current metrics
   * @returns {Object} Current validation metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }
}