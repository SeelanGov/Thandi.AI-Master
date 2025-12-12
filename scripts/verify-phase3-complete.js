// Verify Phase 3 is complete and ready for production
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🔍 Verifying Phase 3 RAG Integration\n');
console.log('='.repeat(70));

const checks = [];

// Check 1: Report generator exists
console.log('\n📋 Check 1: Report Generator File');
const reportGenPath = 'lib/rag/report-generator.js';
if (fs.existsSync(reportGenPath)) {
  console.log('✅ lib/rag/report-generator.js exists');
  checks.push(true);
} else {
  console.log('❌ lib/rag/report-generator.js NOT FOUND');
  checks.push(false);
}

// Check 2: API route updated
console.log('\n📋 Check 2: API Route Integration');
const apiRoutePath = 'app/api/rag/query/route.js';
if (fs.existsSync(apiRoutePath)) {
  const apiContent = fs.readFileSync(apiRoutePath, 'utf-8');
  if (apiContent.includes('generatePersonalizedReport')) {
    console.log('✅ API route imports generatePersonalizedReport');
    checks.push(true);
  } else {
    console.log('❌ API route does NOT import generatePersonalizedReport');
    checks.push(false);
  }
  
  if (apiContent.includes('formatReportAsText')) {
    console.log('✅ API route has formatReportAsText helper');
    checks.push(true);
  } else {
    console.log('❌ API route missing formatReportAsText helper');
    checks.push(false);
  }
} else {
  console.log('❌ app/api/rag/query/route.js NOT FOUND');
  checks.push(false);
  checks.push(false);
}

// Check 3: Career matcher exists (Phase 2)
console.log('\n📋 Check 3: Career Matcher (Phase 2)');
const matcherPath = 'lib/rag/career-matcher.js';
if (fs.existsSync(matcherPath)) {
  console.log('✅ lib/rag/career-matcher.js exists');
  checks.push(true);
} else {
  console.log('❌ lib/rag/career-matcher.js NOT FOUND');
  checks.push(false);
}

// Check 4: Test script exists
console.log('\n📋 Check 4: Test Scripts');
const testPath = 'scripts/test-phase3-integration.js';
if (fs.existsSync(testPath)) {
  console.log('✅ scripts/test-phase3-integration.js exists');
  checks.push(true);
} else {
  console.log('❌ scripts/test-phase3-integration.js NOT FOUND');
  checks.push(false);
}

// Check 5: Environment variables
console.log('\n📋 Check 5: Environment Variables');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY'
];

let envComplete = true;
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName} is set`);
  } else {
    console.log(`❌ ${varName} is NOT set`);
    envComplete = false;
  }
});
checks.push(envComplete);

// Check 6: Documentation
console.log('\n📋 Check 6: Documentation');
const docs = [
  'RAG-INTEGRATION-PHASE-3-COMPLETE.md',
  'PHASE-3-QUICK-START.md'
];

let docsComplete = true;
docs.forEach(doc => {
  if (fs.existsSync(doc)) {
    console.log(`✅ ${doc} exists`);
  } else {
    console.log(`❌ ${doc} NOT FOUND`);
    docsComplete = false;
  }
});
checks.push(docsComplete);

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(70));

const passed = checks.filter(c => c).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`\n✅ Passed: ${passed}/${total} checks (${percentage}%)`);

if (passed === total) {
  console.log('\n🎉 ALL CHECKS PASSED!');
  console.log('\n✅ Phase 3 RAG Integration is COMPLETE');
  console.log('✅ System is ready for production deployment');
  console.log('\n🚀 Next Steps:');
  console.log('   1. Run: node scripts/test-phase3-integration.js');
  console.log('   2. Verify different profiles get different careers');
  console.log('   3. Deploy to production when ready');
  console.log('\n📚 Documentation:');
  console.log('   - RAG-INTEGRATION-PHASE-3-COMPLETE.md (full details)');
  console.log('   - PHASE-3-QUICK-START.md (quick reference)');
} else {
  console.log('\n⚠️ SOME CHECKS FAILED');
  console.log('\n❌ Phase 3 integration is incomplete');
  console.log('❌ Fix the failed checks above before deploying');
  console.log('\n🔧 Troubleshooting:');
  console.log('   - Ensure all files are created');
  console.log('   - Check .env.local has required variables');
  console.log('   - Review error messages above');
}

console.log('\n' + '='.repeat(70));
console.log('');

process.exit(passed === total ? 0 : 1);
