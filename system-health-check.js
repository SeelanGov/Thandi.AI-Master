// Comprehensive System Health Check
// Check all critical components before building new features

console.log('🔍 THANDI SYSTEM HEALTH CHECK');
console.log('='.repeat(60));

const fs = require('fs');
const path = require('path');

// Health check results
const healthCheck = {
  critical: [],
  warnings: [],
  passed: [],
  summary: {}
};

function addResult(type, component, status, message) {
  const result = { component, status, message, timestamp: new Date().toISOString() };
  healthCheck[type].push(result);
  console.log(`${status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌'} ${component}: ${message}`);
}

// 1. Check Core Files Exist
console.log('\n📁 CHECKING CORE FILES...');

const coreFiles = [
  'package.json',
  'next.config.js',
  '.env.local',
  'app/layout.js',
  'app/page.js',
  'app/assessment/page.jsx',
  'app/results/page.jsx',
  'lib/rag/search.js',
  'lib/supabase/client.js'
];

coreFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      addResult('passed', `Core File: ${file}`, 'PASS', 'File exists');
    } else {
      addResult('critical', `Core File: ${file}`, 'FAIL', 'File missing');
    }
  } catch (error) {
    addResult('critical', `Core File: ${file}`, 'FAIL', `Error checking: ${error.message}`);
  }
});

// 2. Check Environment Variables
console.log('\n🔐 CHECKING ENVIRONMENT VARIABLES...');

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'GROQ_API_KEY',
  'ANTHROPIC_API_KEY'
];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    addResult('passed', `Env Var: ${envVar}`, 'PASS', 'Variable set');
  } else {
    addResult('critical', `Env Var: ${envVar}`, 'FAIL', 'Variable missing');
  }
});

// 3. Check Package.json Dependencies
console.log('\n📦 CHECKING DEPENDENCIES...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const criticalDeps = [
    '@supabase/supabase-js',
    'next',
    'react',
    'openai',
    'tailwindcss'
  ];

  criticalDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      addResult('passed', `Dependency: ${dep}`, 'PASS', 'Dependency present');
    } else {
      addResult('critical', `Dependency: ${dep}`, 'FAIL', 'Dependency missing');
    }
  });

  addResult('passed', 'Package.json', 'PASS', 'Valid JSON structure');
} catch (error) {
  addResult('critical', 'Package.json', 'FAIL', `Parse error: ${error.message}`);
}

// 4. Check Next.js Configuration
console.log('\n⚙️ CHECKING NEXT.JS CONFIGURATION...');

try {
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  if (nextConfig.includes('experimental')) {
    addResult('passed', 'Next.js Config', 'PASS', 'Configuration file present');
  } else {
    addResult('warnings', 'Next.js Config', 'WARN', 'Basic configuration detected');
  }
} catch (error) {
  addResult('critical', 'Next.js Config', 'FAIL', `Configuration error: ${error.message}`);
}

// 5. Check App Structure
console.log('\n🏗️ CHECKING APP STRUCTURE...');

const appStructure = [
  'app/layout.js',
  'app/page.js',
  'app/assessment',
  'app/results',
  'app/components',
  'lib',
  'components'
];

appStructure.forEach(item => {
  try {
    const stats = fs.statSync(item);
    if (stats.isDirectory() || stats.isFile()) {
      addResult('passed', `App Structure: ${item}`, 'PASS', 'Structure exists');
    }
  } catch (error) {
    addResult('critical', `App Structure: ${item}`, 'FAIL', 'Missing structure');
  }
});

// 6. Check for Syntax Errors in Key Files
console.log('\n🔍 CHECKING SYNTAX ERRORS...');

const keyFiles = [
  'app/assessment/page.jsx',
  'app/results/page.jsx',
  'lib/rag/search.js'
];

keyFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      // Basic syntax checks
      if (content.includes('import') && content.includes('export')) {
        addResult('passed', `Syntax: ${file}`, 'PASS', 'Basic syntax valid');
      } else {
        addResult('warnings', `Syntax: ${file}`, 'WARN', 'Unusual file structure');
      }
    }
  } catch (error) {
    addResult('critical', `Syntax: ${file}`, 'FAIL', `Syntax error: ${error.message}`);
  }
});

// 7. Check for Conflicting Calendar Files
console.log('\n📅 CHECKING CALENDAR SYSTEM CONFLICTS...');

const calendarFiles = [
  'lib/academic/emergency-calendar.js',
  'lib/academic/comprehensive-calendar.js',
  'lib/academic/pure-commonjs-calendar.js'
];

let calendarFileCount = 0;
calendarFiles.forEach(file => {
  if (fs.existsSync(file)) {
    calendarFileCount++;
    addResult('warnings', `Calendar File: ${file}`, 'WARN', 'Multiple calendar files detected');
  }
});

if (calendarFileCount > 1) {
  addResult('critical', 'Calendar System', 'FAIL', `${calendarFileCount} calendar files found - potential conflicts`);
} else if (calendarFileCount === 1) {
  addResult('passed', 'Calendar System', 'PASS', 'Single calendar file found');
} else {
  addResult('critical', 'Calendar System', 'FAIL', 'No calendar files found');
}

// 8. Check for Build Issues
console.log('\n🔨 CHECKING BUILD CONFIGURATION...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.scripts?.build && packageJson.scripts?.dev) {
    addResult('passed', 'Build Scripts', 'PASS', 'Build and dev scripts present');
  } else {
    addResult('critical', 'Build Scripts', 'FAIL', 'Missing build or dev scripts');
  }
} catch (error) {
  addResult('critical', 'Build Scripts', 'FAIL', `Script check error: ${error.message}`);
}

// 9. Check for Deployment Issues
console.log('\n🚀 CHECKING DEPLOYMENT CONFIGURATION...');

const deploymentFiles = [
  'vercel.json',
  '.vercelignore'
];

deploymentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    addResult('passed', `Deployment: ${file}`, 'PASS', 'Deployment file present');
  } else {
    addResult('warnings', `Deployment: ${file}`, 'WARN', 'Deployment file missing');
  }
});

// 10. Summary
console.log('\n📊 HEALTH CHECK SUMMARY');
console.log('='.repeat(60));

healthCheck.summary = {
  critical: healthCheck.critical.length,
  warnings: healthCheck.warnings.length,
  passed: healthCheck.passed.length,
  total: healthCheck.critical.length + healthCheck.warnings.length + healthCheck.passed.length
};

console.log(`✅ Passed: ${healthCheck.summary.passed}`);
console.log(`⚠️  Warnings: ${healthCheck.summary.warnings}`);
console.log(`❌ Critical: ${healthCheck.summary.critical}`);
console.log(`📊 Total Checks: ${healthCheck.summary.total}`);

// Overall Health Status
let overallStatus = 'HEALTHY';
if (healthCheck.summary.critical > 0) {
  overallStatus = 'CRITICAL';
} else if (healthCheck.summary.warnings > 3) {
  overallStatus = 'UNSTABLE';
}

console.log(`\n🎯 OVERALL SYSTEM STATUS: ${overallStatus}`);

// Critical Issues Report
if (healthCheck.critical.length > 0) {
  console.log('\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:');
  healthCheck.critical.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.component}: ${issue.message}`);
  });
}

// Warnings Report
if (healthCheck.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS TO ADDRESS:');
  healthCheck.warnings.forEach((warning, index) => {
    console.log(`${index + 1}. ${warning.component}: ${warning.message}`);
  });
}

// Recommendations
console.log('\n💡 RECOMMENDATIONS:');
if (healthCheck.summary.critical > 0) {
  console.log('- 🚨 STOP: Fix critical issues before proceeding');
  console.log('- 🔧 Address missing files and configurations');
  console.log('- 🧪 Run tests after fixes');
}

if (healthCheck.summary.warnings > 0) {
  console.log('- ⚠️  Review warnings for potential issues');
  console.log('- 🧹 Clean up conflicting files');
  console.log('- 📝 Update configurations as needed');
}

if (overallStatus === 'HEALTHY') {
  console.log('- ✅ System appears healthy - safe to proceed with feature development');
} else {
  console.log('- ❌ System has issues - resolve before building new features');
}

console.log('\n' + '='.repeat(60));

// Export results for further analysis
module.exports = healthCheck;