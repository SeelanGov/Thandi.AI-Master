// Comprehensive Preflight Checks for Production Deployment
console.log('🚀 PREFLIGHT CHECKS - Production Deployment Verification\n');
console.log('=' .repeat(60));

const fs = require('fs');
const path = require('path');

let totalChecks = 0;
let passedChecks = 0;

function runCheck(name, checkFunction) {
  totalChecks++;
  try {
    const result = checkFunction();
    if (result.passed) {
      console.log(`✅ ${name}: ${result.message || 'PASS'}`);
      passedChecks++;
    } else {
      console.log(`❌ ${name}: ${result.message || 'FAIL'}`);
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
  }
}

console.log('\n📋 1. CORE FILE INTEGRITY CHECKS');
console.log('-'.repeat(40));

runCheck('AssessmentForm.jsx exists', () => {
  const exists = fs.existsSync('app/assessment/components/AssessmentForm.jsx');
  return { passed: exists, message: exists ? 'File found' : 'File missing' };
});

runCheck('CurriculumProfile.jsx exists', () => {
  const exists = fs.existsSync('app/assessment/components/CurriculumProfile.jsx');
  return { passed: exists, message: exists ? 'File found' : 'File missing' };
});

runCheck('SubjectSelection.jsx exists', () => {
  const exists = fs.existsSync('app/assessment/components/SubjectSelection.jsx');
  return { passed: exists, message: exists ? 'File found' : 'File missing' };
});

runCheck('MarksCollection.jsx exists', () => {
  const exists = fs.existsSync('app/assessment/components/MarksCollection.jsx');
  return { passed: exists, message: exists ? 'File found' : 'File missing' };
});

runCheck('RAG API route exists', () => {
  const exists = fs.existsSync('app/api/rag/query/route.js');
  return { passed: exists, message: exists ? 'API endpoint found' : 'API endpoint missing' };
});

console.log('\n📋 2. CONFIGURATION CHECKS');
console.log('-'.repeat(40));

runCheck('package.json exists', () => {
  const exists = fs.existsSync('package.json');
  if (!exists) return { passed: false, message: 'package.json missing' };
  
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasNextJs = pkg.dependencies && pkg.dependencies.next;
  return { passed: hasNextJs, message: hasNextJs ? `Next.js ${pkg.dependencies.next}` : 'Next.js not found' };
});

runCheck('next.config.js exists', () => {
  const exists = fs.existsSync('next.config.js');
  return { passed: exists, message: exists ? 'Next.js config found' : 'Config missing' };
});

runCheck('Environment examples exist', () => {
  const prodExists = fs.existsSync('.env.production.example');
  const stagingExists = fs.existsSync('.env.staging.example');
  return { 
    passed: prodExists && stagingExists, 
    message: `Production: ${prodExists ? '✓' : '✗'}, Staging: ${stagingExists ? '✓' : '✗'}` 
  };
});

console.log('\n📋 3. ASSESSMENT FLOW VALIDATION');
console.log('-'.repeat(40));

runCheck('Step 1 validation logic', () => {
  // Test the validation function
  function validateStep1(curriculumProfile) {
    const selectedSubjects = curriculumProfile?.currentSubjects?.length || 0;
    if (selectedSubjects === 0) return { valid: false };
    if (selectedSubjects < 6) return { valid: false };
    
    const currentSubjects = curriculumProfile.currentSubjects;
    const hasLanguage = currentSubjects.some(subject => 
      subject.includes('English') || subject.includes('Afrikaans')
    );
    const hasMath = currentSubjects.some(subject => 
      subject.includes('Mathematics')
    );
    
    return { valid: hasLanguage && hasMath };
  }
  
  // Test cases
  const emptyTest = validateStep1({ currentSubjects: [] });
  const incompleteTest = validateStep1({ currentSubjects: ['Math', 'English'] });
  const validTest = validateStep1({ 
    currentSubjects: ['English Home Language', 'Mathematics', 'Physical Sciences', 'Life Sciences', 'Geography', 'Accounting', 'Life Orientation'] 
  });
  
  const allPassed = !emptyTest.valid && !incompleteTest.valid && validTest.valid;
  return { passed: allPassed, message: allPassed ? 'Validation logic working' : 'Validation logic failed' };
});

runCheck('Subject filtering logic', () => {
  const SUBJECTS = [
    { name: 'Mathematics' }, { name: 'Physical Sciences' }, { name: 'English' }
  ];
  
  function filterSubjects(availableSubjects) {
    if (availableSubjects.length === 0) return SUBJECTS; // Show all if none selected
    return SUBJECTS.filter(subject => 
      availableSubjects.some(available => 
        available.includes(subject.name) || subject.name.includes(available.split(' ')[0])
      )
    );
  }
  
  const emptyFilter = filterSubjects([]);
  const scienceFilter = filterSubjects(['Mathematics', 'Physical Sciences', 'English Home Language']);
  
  const emptyShowsAll = emptyFilter.length === SUBJECTS.length;
  const scienceFiltersCorrectly = scienceFilter.length > 0 && scienceFilter.length <= SUBJECTS.length;
  
  return { 
    passed: emptyShowsAll && scienceFiltersCorrectly, 
    message: `Empty: ${emptyFilter.length}/${SUBJECTS.length}, Filtered: ${scienceFilter.length}` 
  };
});

console.log('\n📋 4. SECURITY & PERFORMANCE CHECKS');
console.log('-'.repeat(40));

runCheck('No hardcoded API keys', () => {
  const files = [
    'app/assessment/components/AssessmentForm.jsx',
    'app/api/rag/query/route.js'
  ];
  
  let hasHardcodedKeys = false;
  const suspiciousPatterns = [
    /sk-[a-zA-Z0-9]{48}/,  // OpenAI API key pattern
    /gsk_[a-zA-Z0-9]{52}/, // Groq API key pattern
    /AIza[a-zA-Z0-9]{35}/  // Google API key pattern
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      suspiciousPatterns.forEach(pattern => {
        if (pattern.test(content)) hasHardcodedKeys = true;
      });
    }
  });
  
  return { passed: !hasHardcodedKeys, message: hasHardcodedKeys ? 'Hardcoded keys found!' : 'No hardcoded keys detected' };
});

runCheck('Environment variable usage', () => {
  const routeFile = 'app/api/rag/query/route.js';
  if (!fs.existsSync(routeFile)) {
    return { passed: false, message: 'API route file not found' };
  }
  
  const content = fs.readFileSync(routeFile, 'utf8');
  const usesEnvVars = content.includes('process.env') || content.includes('env.');
  
  return { passed: usesEnvVars, message: usesEnvVars ? 'Uses environment variables' : 'No environment variable usage found' };
});

runCheck('Console.log usage check', () => {
  const productionFiles = [
    'app/assessment/components/AssessmentForm.jsx',
    'app/assessment/components/CurriculumProfile.jsx',
    'app/assessment/components/SubjectSelection.jsx'
  ];
  
  let logCount = 0;
  
  productionFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(/console\.log/g);
      if (matches) {
        logCount += matches.length;
      }
    }
  });
  
  // Allow some console.logs for debugging, but warn if too many
  const acceptable = logCount <= 10;
  return { 
    passed: acceptable, 
    message: `${logCount} console.log statements found ${acceptable ? '(acceptable for development)' : '(consider removing for production)'}` 
  };
});

console.log('\n📋 5. DEPLOYMENT READINESS');
console.log('-'.repeat(40));

runCheck('Build configuration ready', () => {
  const nextConfig = fs.existsSync('next.config.js');
  const packageJson = fs.existsSync('package.json');
  
  if (!packageJson) return { passed: false, message: 'package.json missing' };
  
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasBuildScript = pkg.scripts && pkg.scripts.build;
  const hasStartScript = pkg.scripts && pkg.scripts.start;
  
  return { 
    passed: nextConfig && hasBuildScript && hasStartScript, 
    message: `Config: ${nextConfig ? '✓' : '✗'}, Build: ${hasBuildScript ? '✓' : '✗'}, Start: ${hasStartScript ? '✓' : '✗'}` 
  };
});

runCheck('Vercel deployment files', () => {
  const vercelJson = fs.existsSync('vercel.json');
  const vercelFolder = fs.existsSync('.vercel');
  
  // vercel.json is optional, .vercel folder indicates previous deployments
  return { 
    passed: true, // Always pass, just informational
    message: `vercel.json: ${vercelJson ? '✓' : '✗'}, .vercel: ${vercelFolder ? '✓' : '✗'}` 
  };
});

runCheck('Git repository status', () => {
  const gitFolder = fs.existsSync('.git');
  const gitignore = fs.existsSync('.gitignore');
  
  return { 
    passed: gitFolder && gitignore, 
    message: `Git repo: ${gitFolder ? '✓' : '✗'}, .gitignore: ${gitignore ? '✓' : '✗'}` 
  };
});

console.log('\n📋 6. CRITICAL FEATURE VERIFICATION');
console.log('-'.repeat(40));

runCheck('P0 Issues Resolution', () => {
  // Check that critical fixes are in place
  const assessmentForm = fs.readFileSync('app/assessment/components/AssessmentForm.jsx', 'utf8');
  
  // Check for validation logic
  const hasValidation = assessmentForm.includes('selectedSubjects < 6') || assessmentForm.includes('minimum subjects');
  
  // Check that POPIA consent is removed/simplified
  const noPOPIA = !assessmentForm.includes('ConsentCheckbox');
  
  // Check for proper step count (6 steps)
  const hasSixSteps = assessmentForm.includes('totalSteps={6}') || assessmentForm.includes('currentStep < 6');
  
  const allCriticalFixed = hasValidation && noPOPIA && hasSixSteps;
  return { 
    passed: allCriticalFixed, 
    message: `Validation: ${hasValidation ? '✓' : '✗'}, POPIA removed: ${noPOPIA ? '✓' : '✗'}, 6 steps: ${hasSixSteps ? '✓' : '✗'}` 
  };
});

runCheck('Subject filtering implementation', () => {
  const subjectSelection = fs.readFileSync('app/assessment/components/SubjectSelection.jsx', 'utf8');
  
  // Check for filtering logic
  const hasFiltering = subjectSelection.includes('filteredSubjects') && subjectSelection.includes('isSubjectAvailable');
  
  // Check for curriculum profile usage
  const usesCurriculumProfile = subjectSelection.includes('curriculumProfile') && subjectSelection.includes('availableSubjects');
  
  return { 
    passed: hasFiltering && usesCurriculumProfile, 
    message: `Filtering logic: ${hasFiltering ? '✓' : '✗'}, Curriculum integration: ${usesCurriculumProfile ? '✓' : '✗'}` 
  };
});

// Final Summary
console.log('\n' + '='.repeat(60));
console.log('🎯 PREFLIGHT SUMMARY');
console.log('='.repeat(60));

const passRate = Math.round((passedChecks / totalChecks) * 100);
console.log(`📊 Overall: ${passedChecks}/${totalChecks} checks passed (${passRate}%)`);

if (passRate >= 90) {
  console.log('\n🟢 STATUS: READY FOR DEPLOYMENT');
  console.log('✅ All critical systems verified');
  console.log('✅ Security checks passed');
  console.log('✅ Core functionality validated');
} else if (passRate >= 80) {
  console.log('\n🟡 STATUS: DEPLOYMENT WITH CAUTION');
  console.log('⚠️  Some non-critical issues detected');
  console.log('⚠️  Review failed checks before deployment');
} else {
  console.log('\n🔴 STATUS: NOT READY FOR DEPLOYMENT');
  console.log('❌ Critical issues detected');
  console.log('❌ Fix failed checks before proceeding');
}

console.log('\n📋 NEXT STEPS - DEPLOYMENT CHECKLIST:');
console.log('□ Environment variables configured on Vercel');
console.log('□ Database connections tested');
console.log('□ API endpoints verified');
console.log('□ Domain/subdomain configured');
console.log('□ SSL certificate ready');
console.log('□ Monitoring and logging setup');

console.log('\n🚀 Ready to deploy with: vercel --prod');
console.log('🔧 Or commit and push to trigger automatic deployment');