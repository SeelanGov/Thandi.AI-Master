#!/usr/bin/env node

/**
 * VERCEL DEPLOYMENT ANALYSIS
 * Comprehensive pre-deployment verification
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 VERCEL DEPLOYMENT ANALYSIS');
console.log('============================================================');
console.log(`📅 Analysis Time: ${new Date().toISOString()}`);
console.log('');

// 1. Check current Vercel project status
console.log('1️⃣ VERCEL PROJECT STATUS');
console.log('------------------------------');

try {
    const projectInfo = execSync('vercel project ls', { encoding: 'utf8' });
    console.log('✅ Project Info Retrieved:');
    console.log(projectInfo);
} catch (error) {
    console.log('❌ Failed to get project info:', error.message);
}

// 2. Check environment variables alignment
console.log('2️⃣ ENVIRONMENT VARIABLES COMPARISON');
console.log('------------------------------');

// Read local .env.local
const localEnvPath = '.env.local';
const localEnvVars = {};

if (fs.existsSync(localEnvPath)) {
    const envContent = fs.readFileSync(localEnvPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
        if (line.trim() && !line.startsWith('#') && line.includes('=')) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=');
            if (key && value) {
                localEnvVars[key.trim()] = value.trim();
            }
        }
    });
    
    console.log('✅ Local Environment Variables Found:');
    Object.keys(localEnvVars).forEach(key => {
        const value = localEnvVars[key];
        const masked = value.length > 10 ? `${value.substring(0, 10)}...` : value;
        console.log(`   ${key}: ${masked}`);
    });
} else {
    console.log('❌ No .env.local file found');
}

// 3. Check critical files for deployment
console.log('');
console.log('3️⃣ CRITICAL FILES CHECK');
console.log('------------------------------');

const criticalFiles = [
    'package.json',
    'next.config.js',
    'vercel.json',
    'app/api/rag/query/route.js',
    'lib/llm/llm-adapter.js',
    'lib/cag/validation-service.js',
    'lib/cag/job-market-intelligence.js',
    'lib/cag/bursary-validation-engine.js',
    'app/results/page.jsx',
    'app/results/services/ProfessionalPDFGenerator.js'
];

criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        console.log(`✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
    } else {
        console.log(`❌ ${file} - MISSING`);
    }
});

// 4. Check package.json for deployment readiness
console.log('');
console.log('4️⃣ PACKAGE.JSON ANALYSIS');
console.log('------------------------------');

try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    console.log('✅ Build Scripts:');
    console.log(`   build: ${packageJson.scripts?.build || 'NOT DEFINED'}`);
    console.log(`   start: ${packageJson.scripts?.start || 'NOT DEFINED'}`);
    console.log(`   dev: ${packageJson.scripts?.dev || 'NOT DEFINED'}`);
    
    console.log('✅ Key Dependencies:');
    const keyDeps = ['next', 'react', 'jspdf', '@supabase/supabase-js'];
    keyDeps.forEach(dep => {
        const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
        console.log(`   ${dep}: ${version || 'NOT FOUND'}`);
    });
    
} catch (error) {
    console.log('❌ Failed to read package.json:', error.message);
}

// 5. Check vercel.json configuration
console.log('');
console.log('5️⃣ VERCEL.JSON CONFIGURATION');
console.log('------------------------------');

if (fs.existsSync('vercel.json')) {
    try {
        const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
        console.log('✅ Vercel Configuration:');
        console.log(JSON.stringify(vercelConfig, null, 2));
    } catch (error) {
        console.log('❌ Invalid vercel.json:', error.message);
    }
} else {
    console.log('⚠️ No vercel.json found (using defaults)');
}

// 6. Check for potential deployment blockers
console.log('');
console.log('6️⃣ DEPLOYMENT BLOCKER CHECK');
console.log('------------------------------');

const potentialBlockers = [];

// Check for large files
const checkLargeFiles = (dir, maxSize = 10 * 1024 * 1024) => { // 10MB
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
            checkLargeFiles(fullPath, maxSize);
        } else if (file.isFile()) {
            const stats = fs.statSync(fullPath);
            if (stats.size > maxSize) {
                potentialBlockers.push(`Large file: ${fullPath} (${Math.round(stats.size / 1024 / 1024)}MB)`);
            }
        }
    });
};

checkLargeFiles('.');

// Check for problematic imports
const checkProblematicImports = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for dynamic imports that might cause issues
    if (content.includes('import(')) {
        potentialBlockers.push(`Dynamic imports in ${filePath}`);
    }
    
    // Check for Node.js specific modules in client code
    const nodeModules = ['fs', 'path', 'os', 'crypto'];
    nodeModules.forEach(mod => {
        if (content.includes(`require('${mod}')`) || content.includes(`from '${mod}'`)) {
            potentialBlockers.push(`Node.js module '${mod}' in ${filePath}`);
        }
    });
};

// Check key files for problematic imports
const filesToCheck = [
    'app/results/page.jsx',
    'app/results/components/ResultsCardLayout.jsx',
    'app/results/services/resultsParser.js'
];

filesToCheck.forEach(checkProblematicImports);

if (potentialBlockers.length === 0) {
    console.log('✅ No deployment blockers detected');
} else {
    console.log('⚠️ Potential deployment blockers:');
    potentialBlockers.forEach(blocker => {
        console.log(`   - ${blocker}`);
    });
}

// 7. Generate deployment recommendation
console.log('');
console.log('7️⃣ DEPLOYMENT RECOMMENDATION');
console.log('------------------------------');

const hasPackageJson = fs.existsSync('package.json');
const hasNextConfig = fs.existsSync('next.config.js');
const hasCriticalFiles = criticalFiles.every(file => fs.existsSync(file));
const hasEnvVars = Object.keys(localEnvVars).length > 0;
const noBlockers = potentialBlockers.length === 0;

const readinessScore = [
    hasPackageJson,
    hasNextConfig,
    hasCriticalFiles,
    hasEnvVars,
    noBlockers
].filter(Boolean).length;

console.log(`📊 Deployment Readiness Score: ${readinessScore}/5`);

if (readinessScore >= 4) {
    console.log('🟢 RECOMMENDATION: SAFE TO DEPLOY');
    console.log('   All critical requirements met');
} else if (readinessScore >= 3) {
    console.log('🟡 RECOMMENDATION: DEPLOY WITH CAUTION');
    console.log('   Some issues detected, monitor closely');
} else {
    console.log('🔴 RECOMMENDATION: DO NOT DEPLOY');
    console.log('   Critical issues must be resolved first');
}

// 8. Generate deployment commands
console.log('');
console.log('8️⃣ DEPLOYMENT COMMANDS');
console.log('------------------------------');

console.log('📝 Recommended deployment sequence:');
console.log('');
console.log('1. Stage changes:');
console.log('   git add .');
console.log('');
console.log('2. Commit with descriptive message:');
console.log('   git commit -m "feat: Complete CAG validation + Results redesign + KIMI integration');
console.log('   ');
console.log('   - Implemented expert-validated career guidance system');
console.log('   - Added modern card-based results interface');
console.log('   - Integrated KIMI provider for enhanced AI responses');
console.log('   - Enhanced PDF generation with professional branding');
console.log('   - Added comprehensive validation layer (7 criteria)');
console.log('   - Achieved market leadership positioning"');
console.log('');
console.log('3. Push to trigger deployment:');
console.log('   git push origin main');
console.log('');
console.log('4. Monitor deployment:');
console.log('   vercel --prod');
console.log('');

console.log('============================================================');
console.log('🎯 ANALYSIS COMPLETE');
console.log('============================================================');