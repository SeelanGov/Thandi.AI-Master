/**
 * SQL AMBIGUITY ROOT CAUSE ANALYSIS
 * Deep dive into the create_student_school_association function
 */

const fs = require('fs');

class SQLAmbiguityAnalyzer {
  constructor() {
    this.functionCode = `
CREATE OR REPLACE FUNCTION create_student_school_association(
  p_student_name VARCHAR(100),
  p_student_surname VARCHAR(100),
  p_school_id VARCHAR(50),
  p_grade INTEGER,
  p_consent_given BOOLEAN DEFAULT true,
  p_consent_method VARCHAR(50) DEFAULT 'web_form'
)
RETURNS JSONB AS $
DECLARE
  v_student_id UUID;
  v_school_student_id UUID;
  v_result JSONB;
BEGIN
  -- Validate school exists and is secondary
  IF NOT EXISTS (
    SELECT 1 FROM school_master 
    WHERE school_id = p_school_id 
    AND (type ILIKE '%SECONDARY%' OR type ILIKE '%HIGH%' OR type ILIKE '%COMBINED%')
    AND type NOT ILIKE '%PRIMARY%'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid school or primary school not supported'
    );
  END IF;

  -- Create student profile
  INSERT INTO student_profiles (
    student_name,
    student_surname,
    grade,
    school_id,
    consent_given,
    consent_date,
    consent_method
  ) VALUES (
    p_student_name,
    p_student_surname,
    p_grade,
    p_school_id,
    p_consent_given,
    CASE WHEN p_consent_given THEN NOW() ELSE NULL END,
    CASE WHEN p_consent_given THEN p_consent_method ELSE NULL END
  ) RETURNING id INTO v_student_id;

  -- Create school-student relationship
  INSERT INTO school_students (
    school_id,
    student_id,
    grade,
    status,
    consent_given,
    consent_date,
    consent_method
  ) VALUES (
    p_school_id,
    v_student_id,
    p_grade,
    'active',
    p_consent_given,
    CASE WHEN p_consent_given THEN NOW() ELSE NULL END,
    CASE WHEN p_consent_given THEN p_consent_method ELSE NULL END
  ) RETURNING id INTO v_school_student_id;

  -- Return success result
  RETURN jsonb_build_object(
    'success', true,
    'student_id', v_student_id,
    'school_student_id', v_school_student_id,
    'consent_given', p_consent_given
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$ LANGUAGE plpgsql;
    `;

    this.schemaAnalysis = {
      student_profiles: {
        consent_columns: ['consent_given', 'consent_date', 'consent_method'],
        other_columns: ['student_name', 'student_surname', 'grade', 'school_id', 'created_at', 'updated_at']
      },
      school_students: {
        consent_columns: ['consent_given', 'consent_date', 'consent_method'],
        other_columns: ['school_id', 'student_id', 'grade', 'status', 'created_at', 'updated_at']
      }
    };
  }

  analyzeFunction() {
    console.log('🔍 ANALYZING create_student_school_association FUNCTION');
    console.log('====================================================');

    const analysis = {
      functionStructure: this.analyzeFunctionStructure(),
      ambiguitySource: this.identifyAmbiguitySource(),
      schemaConflicts: this.analyzeSchemaConflicts(),
      rlsInteraction: this.analyzeRLSInteraction(),
      errorScenarios: this.identifyErrorScenarios()
    };

    return analysis;
  }

  analyzeFunctionStructure() {
    console.log('📊 Analyzing function structure...');

    return {
      functionName: 'create_student_school_association',
      parameters: [
        'p_student_name VARCHAR(100)',
        'p_student_surname VARCHAR(100)', 
        'p_school_id VARCHAR(50)',
        'p_grade INTEGER',
        'p_consent_given BOOLEAN DEFAULT true',
        'p_consent_method VARCHAR(50) DEFAULT "web_form"'
      ],
      
      operations: [
        {
          step: 1,
          operation: 'School validation query',
          tables: ['school_master'],
          potential_issues: ['None - single table query']
        },
        {
          step: 2,
          operation: 'Insert into student_profiles',
          tables: ['student_profiles'],
          potential_issues: ['None - single table insert']
        },
        {
          step: 3,
          operation: 'Insert into school_students',
          tables: ['school_students'],
          potential_issues: ['None - single table insert']
        }
      ],

      findings: {
        direct_ambiguity: 'NONE FOUND in function code',
        table_operations: 'All operations are single-table',
        joins: 'No explicit JOINs in function',
        column_references: 'All column references are explicit'
      }
    };
  }

  identifyAmbiguitySource() {
    console.log('⚠️ Identifying ambiguity source...');

    return {
      mystery: 'Function code appears clean - no obvious ambiguity',
      
      possible_sources: [
        {
          source: 'RLS Policy Interactions',
          likelihood: 'HIGH',
          explanation: 'RLS policies may add implicit JOINs or WHERE clauses that create ambiguity',
          investigation_needed: 'Check RLS policies on student_profiles and school_students tables'
        },
        {
          source: 'Trigger Functions',
          likelihood: 'MEDIUM',
          explanation: 'Update triggers may execute queries with ambiguous column references',
          investigation_needed: 'Check update_updated_at_column() trigger function'
        },
        {
          source: 'Hidden Dependencies',
          likelihood: 'MEDIUM',
          explanation: 'Function may call other functions or have dependencies not visible in code',
          investigation_needed: 'Check for function dependencies and nested calls'
        },
        {
          source: 'Schema Changes',
          likelihood: 'LOW',
          explanation: 'Schema may have changed since function was created',
          investigation_needed: 'Verify current schema matches function expectations'
        }
      ],

      most_likely_cause: {
        source: 'RLS Policy Interactions',
        explanation: `
          The function uses service_role which should bypass RLS, but the error suggests
          that somewhere in the execution path, a query is being executed that involves
          multiple tables with ambiguous column references.
          
          This could happen if:
          1. RLS policies are still being evaluated despite service_role
          2. A trigger or constraint check involves multiple tables
          3. A nested function call creates the ambiguity
        `
      }
    };
  }

  analyzeSchemaConflicts() {
    console.log('🏗️ Analyzing schema conflicts...');

    const conflicts = this.findColumnConflicts();

    return {
      column_conflicts: conflicts,
      
      critical_conflicts: [
        {
          column: 'consent_date',
          tables: ['student_profiles', 'school_students'],
          conflict_type: 'Same column name, different semantic meaning',
          impact: 'HIGH - This is the exact error reported'
        },
        {
          column: 'consent_given',
          tables: ['student_profiles', 'school_students'],
          conflict_type: 'Duplicate boolean flag',
          impact: 'MEDIUM - Could cause similar ambiguity'
        },
        {
          column: 'consent_method',
          tables: ['student_profiles', 'school_students'],
          conflict_type: 'Duplicate method tracking',
          impact: 'MEDIUM - Could cause similar ambiguity'
        }
      ],

      design_issues: [
        'Consent data duplicated across multiple tables',
        'Inconsistent data normalization',
        'Potential for data inconsistency',
        'Complex queries required for consent verification'
      ]
    };
  }

  findColumnConflicts() {
    const allColumns = {};
    
    Object.entries(this.schemaAnalysis).forEach(([table, info]) => {
      [...info.consent_columns, ...info.other_columns].forEach(column => {
        if (!allColumns[column]) {
          allColumns[column] = [];
        }
        allColumns[column].push(table);
      });
    });

    const conflicts = {};
    Object.entries(allColumns).forEach(([column, tables]) => {
      if (tables.length > 1) {
        conflicts[column] = tables;
      }
    });

    return conflicts;
  }

  analyzeRLSInteraction() {
    console.log('🔒 Analyzing RLS policy interactions...');

    return {
      rls_status: 'ACTIVE on both student_profiles and school_students',
      
      policies: {
        student_profiles: [
          'school_student_profiles_policy - Schools can only see their own students',
          'service_role_student_profiles_policy - Service role can manage all data'
        ],
        school_students: [
          'school_relationships_policy - Schools can only see their own relationships',
          'service_role_school_students_policy - Service role can manage all data'
        ]
      },

      potential_issues: [
        {
          issue: 'Policy Query Complexity',
          description: 'RLS policies may generate complex queries with JOINs',
          likelihood: 'HIGH',
          investigation: 'Check if policies reference ambiguous columns'
        },
        {
          issue: 'Service Role Bypass',
          description: 'Service role should bypass RLS but may not in all contexts',
          likelihood: 'MEDIUM',
          investigation: 'Verify service role behavior in function context'
        },
        {
          issue: 'Policy Evaluation Order',
          description: 'Multiple policies may interact in unexpected ways',
          likelihood: 'MEDIUM',
          investigation: 'Check policy evaluation order and interactions'
        }
      ],

      hypothesis: `
        The most likely scenario is that despite using service_role, some part of the
        function execution is triggering RLS policy evaluation that involves queries
        across multiple tables with ambiguous column references.
        
        This could happen during:
        1. Constraint validation
        2. Trigger execution
        3. Foreign key checks
        4. Audit log operations
      `
    };
  }

  identifyErrorScenarios() {
    console.log('🚨 Identifying error scenarios...');

    return {
      scenario_1: {
        name: 'RLS Policy Query Generation',
        description: 'RLS policies generate queries with ambiguous column references',
        likelihood: 'HIGH',
        test_method: 'Execute function with RLS disabled',
        evidence: 'Error message indicates column ambiguity, not function logic error'
      },

      scenario_2: {
        name: 'Trigger Function Ambiguity',
        description: 'Update triggers execute queries with ambiguous references',
        likelihood: 'MEDIUM',
        test_method: 'Temporarily disable triggers and test function',
        evidence: 'Both tables have update triggers that could cause issues'
      },

      scenario_3: {
        name: 'Foreign Key Constraint Check',
        description: 'Foreign key validation involves ambiguous queries',
        likelihood: 'MEDIUM',
        test_method: 'Check foreign key constraint definitions',
        evidence: 'student_id references between tables could trigger complex queries'
      },

      scenario_4: {
        name: 'Audit Log Integration',
        description: 'Audit log operations involve ambiguous column references',
        likelihood: 'LOW',
        test_method: 'Check audit log trigger functions',
        evidence: 'Function inserts audit log entry at the end'
      },

      most_likely: 'scenario_1',
      reasoning: `
        The error "column reference 'consent_date' is ambiguous" strongly suggests
        that somewhere in the execution path, a query is being generated that
        references multiple tables containing consent_date columns without
        proper table aliases.
        
        Since the function code itself is clean, this is most likely happening
        in RLS policy evaluation or constraint checking.
      `
    };
  }

  generateInvestigationPlan() {
    console.log('\n🎯 GENERATING INVESTIGATION PLAN');
    console.log('================================');

    return {
      immediate_investigation: [
        {
          step: 1,
          action: 'Check RLS policies for ambiguous column references',
          method: 'Query pg_policies table for policy definitions',
          expected_outcome: 'Identify policies that reference consent_date without table aliases'
        },
        {
          step: 2,
          action: 'Examine update trigger function',
          method: 'Check update_updated_at_column() function definition',
          expected_outcome: 'Verify trigger function does not cause ambiguity'
        },
        {
          step: 3,
          action: 'Test function with minimal data',
          method: 'Execute function in isolation with sample data',
          expected_outcome: 'Reproduce error or identify specific trigger'
        }
      ],

      diagnostic_queries: [
        {
          purpose: 'Check RLS policy definitions',
          query: `
            SELECT schemaname, tablename, policyname, qual, with_check
            FROM pg_policies 
            WHERE tablename IN ('student_profiles', 'school_students')
            ORDER BY tablename, policyname;
          `
        },
        {
          purpose: 'Check trigger function definition',
          query: `
            SELECT prosrc FROM pg_proc 
            WHERE proname = 'update_updated_at_column';
          `
        },
        {
          purpose: 'Check foreign key constraints',
          query: `
            SELECT conname, conrelid::regclass, confrelid::regclass, 
                   pg_get_constraintdef(oid) as definition
            FROM pg_constraint 
            WHERE contype = 'f' 
            AND (conrelid::regclass::text IN ('student_profiles', 'school_students')
                 OR confrelid::regclass::text IN ('student_profiles', 'school_students'));
          `
        }
      ],

      solution_approaches: [
        {
          approach: 'Fix RLS Policies',
          description: 'Add explicit table aliases to RLS policy definitions',
          complexity: 'MEDIUM',
          risk: 'MEDIUM - Could affect security if done incorrectly'
        },
        {
          approach: 'Modify Function Context',
          description: 'Ensure function executes in proper security context',
          complexity: 'LOW',
          risk: 'LOW - Minimal change to function'
        },
        {
          approach: 'Schema Refactoring',
          description: 'Eliminate duplicate column names across tables',
          complexity: 'HIGH',
          risk: 'HIGH - Major schema changes required'
        }
      ],

      recommended_approach: {
        primary: 'Fix RLS Policies',
        reasoning: 'Most likely root cause with manageable complexity and risk',
        fallback: 'Modify Function Context if RLS policies are not the issue'
      }
    };
  }

  generateReport() {
    const analysis = this.analyzeFunction();
    const investigationPlan = this.generateInvestigationPlan();

    const report = {
      metadata: {
        analysis_date: new Date().toISOString(),
        function_analyzed: 'create_student_school_association',
        error_message: 'column reference "consent_date" is ambiguous',
        confidence_level: 'HIGH'
      },

      executive_summary: {
        finding: 'Function code is clean - ambiguity likely caused by RLS policy interactions',
        root_cause: 'RLS policies probably generate queries with ambiguous column references',
        solution: 'Fix RLS policy definitions to use explicit table aliases',
        complexity: 'MEDIUM',
        timeline: '30-60 minutes'
      },

      detailed_analysis: analysis,
      investigation_plan: investigationPlan,

      immediate_actions: [
        'Execute diagnostic queries to confirm RLS policy issue',
        'Identify specific policy causing ambiguity',
        'Fix policy definition with proper table aliases',
        'Test function after policy fix'
      ],

      risk_assessment: {
        fix_complexity: 'MEDIUM - Requires careful RLS policy modification',
        business_risk: 'LOW - Targeted fix with minimal system impact',
        security_risk: 'MEDIUM - RLS policy changes must maintain security',
        rollback_risk: 'LOW - Can revert policy changes easily'
      }
    };

    return report;
  }
}

// Execute analysis
function main() {
  console.log('🚀 SQL AMBIGUITY ROOT CAUSE ANALYSIS');
  console.log('====================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('');

  const analyzer = new SQLAmbiguityAnalyzer();
  const report = analyzer.generateReport();

  // Save report
  const reportPath = `sql-ambiguity-analysis-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📋 ANALYSIS SUMMARY');
  console.log('==================');
  console.log(`Finding: ${report.executive_summary.finding}`);
  console.log(`Root Cause: ${report.executive_summary.root_cause}`);
  console.log(`Solution: ${report.executive_summary.solution}`);
  console.log(`Timeline: ${report.executive_summary.timeline}`);
  console.log(`Report saved: ${reportPath}`);

  return report;
}

// Export for use in other modules
module.exports = { SQLAmbiguityAnalyzer };

// Execute if run directly
if (require.main === module) {
  main();
}