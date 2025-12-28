import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔍 VERCEL BUILD ISSUE DIAGNOSIS');
console.log('   Mission: Identify and fix build issues for Vercel deployment');
console.log('═══════════════════════════════════════════════════════\n');

// Check 1: Package.json integrity
console.log('📦 CHECK 1: PACKAGE.JSON INTEGRITY\n');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Package.json valid`);
  console.log(`   Name: ${packageJson.name}`);
  console.log(`   Version: ${packageJson.version}`);
  console.log(`   Build script: ${packageJson.scripts?.build || 'MISSING'}`);
  
  if (!packageJson.scripts?.build) {
    console.log('❌ Build script missing in package.json');
  }
} catch (error) {
  console.log(`❌ Package.json error: ${error.message}`);
}

// Check 2: Next.js config
console.log('\n⚙️ CHECK 2: NEXT.JS CONFIGURATION\n');

try {
  if (fs.existsSync('next.config.js')) {
    const nextConfig = fs.readFileSync('next.config.js', 'utf8');
    console.log('✅ next.config.js exists');
    
    // Check for potential issues
    if (nextConfig.includes('experimental')) {
      console.log('⚠️ Experimental features detected - may cause build issues');
    }
    if (nextConfig.includes('webpack')) {
      console.log('⚠️ Custom webpack config detected');
    }
  } else {
    console.log('❌ next.config.js missing');
  }
} catch (error) {
  console.log(`❌ Next.js config error: ${error.message}`);
}

// Check 3: Critical files
console.log('\n📁 CHECK 3: CRITICAL FILES\n');

const criticalFiles = [
  'app/layout.js',
  'app/page.js',
  'app/globals.css',
  'tailwind.config.js',
  'middleware.js'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: Exists`);
  } else {
    console.log(`❌ ${file}: Missing`);
  }
});

// Check 4: Dependencies
console.log('\n📚 CHECK 4: DEPENDENCY ANALYSIS\n');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = Object.keys(packageJson.dependencies || {});
  const devDeps = Object.keys(packageJson.devDependencies || {});
  
  console.log(`✅ Dependencies: ${deps.length}`);
  console.log(`✅ Dev Dependencies: ${devDeps.length}`);
  
  // Check for potential problematic dependencies
  const problematicDeps = deps.filter(dep => 
    dep.includes('canvas') || 
    dep.includes('sharp') || 
    dep.includes('sqlite') ||
    dep.includes('node-gyp')
  );
  
  if (problematicDeps.length > 0) {
    console.log(`⚠️ Potentially problematic dependencies: ${problematicDeps.join(', ')}`);
  }
  
} catch (error) {
  console.log(`❌ Dependency check error: ${error.message}`);
}

// Check 5: Environment variables in code
console.log('\n🌍 CHECK 5: ENVIRONMENT VARIABLE USAGE\n');

const filesToCheck = [
  'app/api/rag/query/route.js',
  'app/api/health/route.js',
  'lib/supabase.js'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const envVars = content.match(/process\.env\.\w+/g) || [];
    console.log(`✅ ${file}: ${envVars.length} env vars used`);
    
    // Check for hardcoded values that should be env vars
    if (content.includes('sk-') && !content.includes('process.env')) {
      console.log(`⚠️ ${file}: Potential hardcoded API key detected`);
    }
  } else {
    console.log(`⚠️ ${file}: Not found`);
  }
});

// Check 6: Build output directory
console.log('\n🏗️ CHECK 6: BUILD OUTPUT\n');

if (fs.existsSync('.next')) {
  console.log('✅ .next directory exists (previous build)');
  
  // Check if .next should be in .gitignore
  if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (gitignore.includes('.next')) {
      console.log('✅ .next properly ignored in git');
    } else {
      console.log('⚠️ .next not in .gitignore - may cause issues');
    }
  }
} else {
  console.log('ℹ️ No previous build output');
}

// Check 7: TypeScript/JavaScript consistency
console.log('\n📝 CHECK 7: FILE TYPE CONSISTENCY\n');

const jsFiles = execSync('find app -name "*.js" | wc -l', { encoding: 'utf8' }).trim();
const tsFiles = execSync('find app -name "*.ts" -o -name "*.tsx" | wc -l', { encoding: 'utf8' }).trim();
const jsxFiles = execSync('find app -name "*.jsx" | wc -l', { encoding: 'utf8' }).trim();

console.log(`📊 File types:`);
console.log(`   JavaScript (.js): ${jsFiles}`);
console.log(`   TypeScript (.ts/.tsx): ${tsFiles}`);
console.log(`   JSX (.jsx): ${jsxFiles}`);

if (fs.existsSync('tsconfig.json')) {
  console.log('✅ TypeScript configuration found');
} else {
  console.log('ℹ️ No TypeScript configuration (JavaScript project)');
}

// Recommendations
console.log('\n═══════════════════════════════════════════════════════');
console.log('🎯 DIAGNOSIS COMPLETE');
console.log('═══════════════════════════════════════════════════════');

console.log('\n💡 COMMON VERCEL BUILD ISSUES:');
console.log('   1. Missing environment variables');
console.log('   2. Dependency version conflicts');
console.log('   3. Import/export syntax errors');
console.log('   4. Missing files referenced in code');
console.log('   5. Node.js version mismatch');

console.log('\n🔧 RECOMMENDED FIXES:');
console.log('   1. Clean build: rm -rf .next && npm run build');
console.log('   2. Check all imports are correct');
console.log('   3. Verify environment variables in Vercel dashboard');
console.log('   4. Ensure all dependencies are properly installed');

console.log('\n🚀 NEXT STEPS:');
console.log('   1. Fix any issues identified above');
console.log('   2. Test build locally: npm run build');
console.log('   3. Retry Vercel deployment');
console.log('═══════════════════════════════════════════════════════');