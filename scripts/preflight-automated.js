// Automated Preflight Checks
// Runs all critical checks before deployment

console.log('🚀 AUTOMATED PREFLIGHT CHECKS\n');
console.log('Running 8 critical checks...\n');

let allPassed = true;
const results = [];

// Check 1: Environment Variables
console.log('═══ CHECK 1: ENVIRONMENT VARIABLES ═══');
try {
  const requiredVars = [
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
    'GROQ_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.log('❌ FAIL: Missing environment variables:', missing.join(', '));
    allPassed = false;
    results.push({ check: 'Environment Variables', status: 'FAIL', reason: `Missing: ${missing.join(', ')}` });
  } else {
    console.log('✅ PASS: All environment variables present');
    results.push({ check: 'Environment Variables', status: 'PASS' });
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
  results.push({ check: 'Environment Variables', status: 'FAIL', reason: error.message });
}

// Check 2: Node Modules
console.log('\n═══ CHECK 2: NODE MODULES ═══');
try {
  const fs = require('fs');
  const path = require('path');
  
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ FAIL: node_modules not found. Run: npm install');
    allPassed = false;
    results.push({ check: 'Node Modules', status: 'FAIL', reason: 'node_modules not found' });
  } else {
    console.log('✅ PASS: node_modules present');
    results.push({ check: 'Node Modules', status: 'PASS' });
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
  results.push({ check: 'Node Modules', status: 'FAIL', reason: error.message });
}

// Check 3: Critical Files
console.log('\n═══ CHECK 3: CRITICAL FILES ═══');
try {
  const fs = require('fs');
  const criticalFiles = [
    'app/api/rag/query/route.js',
    'app/assessment/components/AssessmentForm.jsx',
    'app/assessment/components/ConsentCheckbox.jsx',
    'lib/compliance/consent-gate.js',
    'lib/compliance/popia-sanitiser.js',
    'lib/llm/guarded-client.js',
    'lib/llm/llm-adapter.js'
  ];

  const missing = criticalFiles.filter(file => !fs.existsSync(file));

  if (missing.length > 0) {
    console.log('❌ FAIL: Missing critical files:', missing.join(', '));
    allPassed = false;
    results.push({ check: 'Critical Files', status: 'FAIL', reason: `Missing: ${missing.join(', ')}` });
  } else {
    console.log('✅ PASS: All critical files present');
    results.push({ check: 'Critical Files', status: 'PASS' });
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
  results.push({ check: 'Critical Files', status: 'FAIL', reason: error.message });
}

// Check 4: API Version
console.log('\n═══ CHECK 4: API VERSION ═══');
try {
  const fs = require('fs');
  const routeContent = fs.readFileSync('app/api/rag/query/route.js', 'utf8');
  
  if (!routeContent.includes('2.0.0-compliance')) {
    console.log('❌ FAIL: API version not set to 2.0.0-compliance');
    allPassed = false;
    results.push({ check: 'API Version', status: 'FAIL', reason: 'Version not 2.0.0-compliance' });
  } else if (!routeContent.includes('ConsentGate')) {
    console.log('❌ FAIL: ConsentGate not imported');
    allPassed = false;
    results.push({ check: 'API Version', status: 'FAIL', reason: 'ConsentGate not imported' });
  } else if (!routeContent.includes('POPIASanitiser')) {
    console.log('❌ FAIL: POPIASanitiser not imported');
    allPassed = false;
    results.push({ check: 'API Version', status: 'FAIL', reason: 'POPIASanitiser not imported' });
  } else {
    console.log('✅ PASS: API version correct, blockers imported');
    results.push({ check: 'API Version', status: 'PASS' });
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
  results.push({ check: 'API Version', status: 'FAIL', reason: error.message });
}

// Check 5: Consent Checkbox Integration
console.log('\n═══ CHECK 5: CONSENT CHECKBOX INTEGRATION ═══');
try {
  const fs = require('fs');
  const formContent = fs.readFileSync('app/assessment/components/AssessmentForm.jsx', 'utf8');
  
  if (!formContent.includes('ConsentCheckbox')) {
    console.log('❌ FAIL: ConsentCheckbox not imported');
    allPassed = false;
    results.push({ check: 'Consent Checkbox', status: 'FAIL', reason: 'Not imported' });
  } else if (!formContent.includes('externalProcessingConsent')) {
    console.log('❌ FAIL: Consent not sent to API');
    allPassed = false;
    results.push({ check: 'Consent Checkbox', status: 'FAIL', reason: 'Not sent to API' });
  } else {
    console.log('✅ PASS: Consent checkbox integrated');
    results.push({ check: 'Consent Checkbox', status: 'PASS' });
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
  results.push({ check: 'Consent Checkbox', status: 'FAIL', reason: error.message });
}

// Check 6: Package.json Scripts
console.log('\n═══ CHECK 6: PACKAGE.JSON SCRIPTS ═══');
try {
  const fs = require('fs');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['dev', 'build', 'start'];
  const missing = requiredScripts.filter(script => !packageJson.scripts[script]);

  if (missing.length > 0) {
    console.log('❌ FAIL: Missing scripts:', missing.join(', '));
    allPassed = false;
    results.push({ check: 'Package Scripts', status: 'FAIL', reason: `Missing: ${missing.join(', ')}` });
  } else {
    console.log('✅ PASS: All required scripts present');
    results.push({ check: 'Package Scripts', status: 'PASS' });
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
  results.push({ check: 'Package Scripts', status: 'FAIL', reason: error.message });
}

// Check 7: Git Status
console.log('\n═══ CHECK 7: GIT STATUS ═══');
try {
  const { execSync } = require('child_process');
  
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (status.trim().length > 0) {
      console.log('⚠️  WARNING: Uncommitted changes detected');
      console.log('Run: git add . && git commit -m "feat: compliance integration"');
      results.push({ check: 'Git Status', status: 'WARNING', reason: 'Uncommitted changes' });
    } else {
      console.log('✅ PASS: No uncommitted changes');
      results.push({ check: 'Git Status', status: 'PASS' });
    }
  } catch (gitError) {
    console.log('⚠️  WARNING: Git not available or not a git repository');
    results.push({ check: 'Git Status', status: 'WARNING', reason: 'Git not available' });
  }
} catch (error) {
  console.log('⚠️  WARNING:', error.message);
  results.push({ check: 'Git Status', status: 'WARNING', reason: error.message });
}

// Check 8: Next.js Config
console.log('\n═══ CHECK 8: NEXT.JS CONFIG ═══');
try {
  const fs = require('fs');
  
  if (!fs.existsSync('next.config.js')) {
    console.log('❌ FAIL: next.config.js not found');
    allPassed = false;
    results.push({ check: 'Next.js Config', status: 'FAIL', reason: 'Config file not found' });
  } else {
    console.log('✅ PASS: next.config.js present');
    results.push({ check: 'Next.js Config', status: 'PASS' });
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
  results.push({ check: 'Next.js Config', status: 'FAIL', reason: error.message });
}

// Summary
console.log('\n═══════════════════════════════════════');
console.log('📊 PREFLIGHT SUMMARY');
console.log('═══════════════════════════════════════');

results.forEach((result, index) => {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
  console.log(`${icon} Check ${index + 1}: ${result.check} - ${result.status}`);
  if (result.reason) {
    console.log(`   Reason: ${result.reason}`);
  }
});

console.log('\n═══════════════════════════════════════');

if (allPassed) {
  console.log('✅ ALL CHECKS PASSED');
  console.log('🚀 READY FOR DEPLOYMENT');
  console.log('\nNext steps:');
  console.log('1. Run: npm run build');
  console.log('2. Run: node scripts/test-blockers-unit.js');
  console.log('3. Run: node scripts/test-integration-compliance.js');
  console.log('4. Deploy: git push origin main');
  process.exit(0);
} else {
  console.log('❌ PREFLIGHT FAILED');
  console.log('🚫 DO NOT DEPLOY');
  console.log('\nFix the issues above before deploying.');
  process.exit(1);
}
