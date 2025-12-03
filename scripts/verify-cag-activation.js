/**
 * CAG Layer Activation Verification Script
 * Confirms that CAG is properly integrated into production route
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 CAG Layer Activation Verification\n');

// Check 1: Verify CAG files exist
console.log('1️⃣ Checking CAG layer files...');
const cagFiles = [
  'lib/cag/index.cjs',
  'lib/cag/cag-layer.cjs',
  'lib/cag/decision-maker.cjs',
  'lib/cag/llm-verifier.cjs',
  'lib/cag/types.cjs'
];

let allFilesExist = true;
cagFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check 2: Verify production route integration
console.log('\n2️⃣ Checking production route integration...');
const routePath = 'app/api/rag/query/route.js';
const routeContent = fs.readFileSync(routePath, 'utf8');

const checks = [
  { name: 'CAG import', pattern: /const\s+\{\s*CAGLayer\s*\}\s*=\s*require\(['"].*\/lib\/cag/ },
  { name: 'CAG initialization', pattern: /const\s+cag\s*=\s*new\s+CAGLayer\(\)/ },
  { name: 'Profile field compatibility', pattern: /const\s+studentProfile\s*=\s*curriculumProfile\s*\|\|\s*profile/ },
  { name: 'CAG verification call', pattern: /const\s+cagResult\s*=\s*await\s+cag\.verify/ },
  { name: 'CAG metadata in response', pattern: /cag:\s*\{[\s\S]*decision:\s*cagResult\.decision/ },
  { name: 'Version 3.0.0-cag', pattern: /version:\s*['"]3\.0\.0-cag['"]/ },
  { name: 'CAG in blockers array', pattern: /blockers:\s*\[.*['"]cag-layer['"].*\]/ }
];

let allChecksPass = true;
checks.forEach(check => {
  const passed = check.pattern.test(routeContent);
  console.log(`   ${passed ? '✅' : '❌'} ${check.name}`);
  if (!passed) allChecksPass = false;
});

// Check 3: Verify health endpoint
console.log('\n3️⃣ Checking health endpoint...');
if (routeContent.includes('cag: {') && routeContent.includes('enabled: true')) {
  console.log('   ✅ CAG enabled in health response');
} else {
  console.log('   ❌ CAG not enabled in health response');
  allChecksPass = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allFilesExist && allChecksPass) {
  console.log('✅ ALL CHECKS PASSED - CAG Layer is properly activated!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Test locally: npm run dev');
  console.log('   2. Check health: curl http://localhost:3000/api/rag/query');
  console.log('   3. Deploy: git add . && git commit -m "feat: activate CAG layer" && git push');
} else {
  console.log('❌ SOME CHECKS FAILED - Review issues above');
  process.exit(1);
}
console.log('='.repeat(50));
