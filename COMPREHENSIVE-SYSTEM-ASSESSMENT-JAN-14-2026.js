// COMPREHENSIVE SYSTEM ASSESSMENT
// Comparing current state vs backed up state vs what should be working

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function comprehensiveAssessment() {
  console.log('🔍 COMPREHENSIVE SYSTEM ASSESSMENT');
  console.log('=' .repeat(80));
  console.log('Purpose: Understand what changed and what broke\n');

  const report = {
    timestamp: new Date().toISOString(),
    currentState: {},
    backupState: {},
    differences: [],
    criticalIssues: [],
    recommendations: []
  };

  // 1. CHECK CURRENT API ROUTES
  console.log('📡 STEP 1: Checking Current API Routes');
  console.log('-'.repeat(80));
  
  const apiRoutes = [
    'app/api/health/route.js',
    'app/api/cache/health/route.js',
    'app/api/student/register/route.js',
    'app/api/schools/validate-code/route.js',
    'app/api/schools/search/route.js',
    'app/api/consent/manage/route.js',
    'app/api/g10-12/route.js',
    'app/api/pdf/[sessionId]/route.js'
  ];

  report.currentState.apiRoutes = {};
  
  for (const route of apiRoutes) {
    try {
      const exists = require('fs').existsSync(route);
      report.currentState.apiRoutes[route] = {
        exists,
        status: exists ? 'FOUND' : 'MISSING'
      };
      console.log(`   ${exists ? '✅' : '❌'} ${route}`);
    } catch (error) {
      report.currentState.apiRoutes[route] = {
        exists: false,
        status: 'ERROR',
        error: error.message
      };
      console.log(`   ❌ ${route} - ERROR`);
    }
  }

  // 2. CHECK DATABASE STATE
  console.log('\n🗄️  STEP 2: Checking Database State');
  console.log('-'.repeat(80));

  const tables = ['schools', 'students', 'consent_records', 'student_school_associations'];
  report.currentState.database = {};

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        report.currentState.database[table] = {
          status: 'ERROR',
          error: error.message
        };
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        report.currentState.database[table] = {
          status: 'OK',
          count
        };
        console.log(`   ✅ ${table}: ${count} records`);
      }
    } catch (error) {
      report.currentState.database[table] = {
        status: 'ERROR',
        error: error.message
      };
      console.log(`   ❌ ${table}: ${error.message}`);
    }
  }

  // 3. CHECK BACKUP FILES
  console.log('\n📦 STEP 3: Checking Backup Files');
  console.log('-'.repeat(80));

  const backupFiles = readdirSync('.')
    .filter(f => f.includes('backup') || f.includes('BACKUP'))
    .sort()
    .reverse()
    .slice(0, 5);

  console.log(`   Found ${backupFiles.length} recent backup files:`);
  backupFiles.forEach(f => console.log(`   - ${f}`));

  report.backupState.files = backupFiles;

  // 4. TEST CRITICAL USER FLOWS
  console.log('\n🔄 STEP 4: Testing Critical User Flows');
  console.log('-'.repeat(80));

  const flows = {
    schoolSearch: {
      name: 'School Search',
      test: async () => {
        const { data, error } = await supabase
          .from('schools')
          .select('name')
          .limit(1);
        return { working: !error && data?.length > 0, error };
      }
    },
    studentRegistration: {
      name: 'Student Registration API',
      test: async () => {
        try {
          const response = await fetch('https://www.thandi.online/api/student/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          return { working: response.status === 400, status: response.status };
        } catch (error) {
          return { working: false, error: error.message };
        }
      }
    },
    healthCheck: {
      name: 'Health Check API',
      test: async () => {
        try {
          const response = await fetch('https://www.thandi.online/api/health');
          return { working: response.status === 200, status: response.status };
        } catch (error) {
          return { working: false, error: error.message };
        }
      }
    }
  };

  report.currentState.flows = {};

  for (const [key, flow] of Object.entries(flows)) {
    console.log(`   Testing: ${flow.name}...`);
    const result = await flow.test();
    report.currentState.flows[key] = result;
    console.log(`   ${result.working ? '✅' : '❌'} ${flow.name}: ${JSON.stringify(result)}`);
  }

  // 5. IDENTIFY CRITICAL ISSUES
  console.log('\n🚨 STEP 5: Identifying Critical Issues');
  console.log('-'.repeat(80));

  // Issue 1: School database
  if (report.currentState.database.schools?.count < 100) {
    const issue = {
      severity: 'CRITICAL',
      component: 'Database - Schools',
      problem: `Only ${report.currentState.database.schools?.count} schools in database`,
      expected: '3,899 schools from seed file',
      impact: 'Students cannot find their schools',
      solution: 'Load seed-school-auth.sql into Supabase'
    };
    report.criticalIssues.push(issue);
    console.log(`   🔴 CRITICAL: ${issue.problem}`);
  }

  // Issue 2: Missing API routes
  const missingRoutes = Object.entries(report.currentState.apiRoutes)
    .filter(([_, info]) => !info.exists)
    .map(([route]) => route);

  if (missingRoutes.length > 0) {
    const issue = {
      severity: 'HIGH',
      component: 'API Routes',
      problem: `${missingRoutes.length} API routes missing`,
      routes: missingRoutes,
      impact: 'API endpoints may not work',
      solution: 'Restore from backup or recreate routes'
    };
    report.criticalIssues.push(issue);
    console.log(`   🟠 HIGH: ${issue.problem}`);
  }

  // Issue 3: Flow failures
  const failedFlows = Object.entries(report.currentState.flows)
    .filter(([_, result]) => !result.working)
    .map(([key]) => key);

  if (failedFlows.length > 0) {
    const issue = {
      severity: 'HIGH',
      component: 'User Flows',
      problem: `${failedFlows.length} critical flows not working`,
      flows: failedFlows,
      impact: 'Users cannot complete key actions',
      solution: 'Debug and fix each flow'
    };
    report.criticalIssues.push(issue);
    console.log(`   🟠 HIGH: ${issue.problem}`);
  }

  // 6. RECOMMENDATIONS
  console.log('\n💡 STEP 6: Recommendations');
  console.log('-'.repeat(80));

  if (report.criticalIssues.length === 0) {
    console.log('   ✅ No critical issues found!');
    report.recommendations.push('System appears healthy - proceed with testing');
  } else {
    console.log(`   Found ${report.criticalIssues.length} critical issues\n`);
    
    // Prioritize recommendations
    const recs = [];
    
    if (report.currentState.database.schools?.count < 100) {
      recs.push({
        priority: 1,
        action: 'Load school database',
        steps: [
          'Open Supabase SQL Editor',
          'Execute seed-school-auth.sql',
          'Verify 3,899 schools loaded'
        ]
      });
    }

    if (missingRoutes.includes('app/api/schools/search/route.js')) {
      recs.push({
        priority: 2,
        action: 'Create school search API',
        steps: [
          'Create app/api/schools/search/route.js',
          'Implement search functionality',
          'Test with sample queries'
        ]
      });
    }

    report.recommendations = recs;
    
    recs.forEach((rec, i) => {
      console.log(`   ${i + 1}. [Priority ${rec.priority}] ${rec.action}`);
      rec.steps.forEach(step => console.log(`      - ${step}`));
    });
  }

  // 7. SAVE REPORT
  console.log('\n📄 STEP 7: Saving Assessment Report');
  console.log('-'.repeat(80));

  const reportPath = `system-assessment-${Date.now()}.json`;
  require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`   ✅ Report saved: ${reportPath}`);

  // 8. SUMMARY
  console.log('\n' + '='.repeat(80));
  console.log('📊 ASSESSMENT SUMMARY');
  console.log('='.repeat(80));
  console.log(`Critical Issues: ${report.criticalIssues.length}`);
  console.log(`Recommendations: ${report.recommendations.length}`);
  console.log(`\nNext Steps:`);
  if (report.recommendations.length > 0) {
    report.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.action}`);
    });
  }
  console.log('\n✅ Assessment complete. Ready to discuss findings.');

  return report;
}

comprehensiveAssessment().catch(console.error);
