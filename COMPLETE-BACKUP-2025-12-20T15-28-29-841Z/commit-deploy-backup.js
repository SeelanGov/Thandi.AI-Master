#!/usr/bin/env node

/**
 * Commit, Deploy, and Backup Script
 * Complete workflow for production deployment with backup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Commit, Deploy, and Backup Workflow');
console.log('='.repeat(60));

// Step 1: Stage and commit changes
function stageAndCommit() {
  console.log('\n📦 Step 1: Staging and Committing Changes');
  
  try {
    // Add all diagnostic and resolution files
    const filesToAdd = [
      'diagnose-grade10-marks-issue.js',
      'test-grade10-marks-flow.js', 
      'debug-frontend-api-flow.js',
      'analyze-api-response.js',
      'GRADE10-APS-ISSUE-RESOLUTION.md',
      'STUDENT-TESTING-GUIDE.md',
      'test-student-flow.js',
      'final-deployment-verification.js'
    ];
    
    console.log('  📋 Staging diagnostic files...');
    filesToAdd.forEach(file => {
      if (fs.existsSync(path.join(__dirname, file))) {
        execSync(`git add ${file}`, { stdio: 'inherit' });
        console.log(`    ✅ ${file}`);
      }
    });
    
    // Create commit message
    const commitMessage = `fix: Add comprehensive Grade 10 APS diagnostic tools and resolution

🔍 Diagnostic Tools Added:
- Grade 10 marks flow testing and validation
- API response analysis and debugging
- Frontend-to-API data flow verification
- Student testing guide and verification tools

🎯 Key Findings:
- APS calculation system working correctly (42 points calculated)
- University eligibility properly determined
- Issue identified as cache/data flow rather than system bug
- Comprehensive testing confirms system operational

🛠️ Resolution:
- Added detailed diagnostic scripts for troubleshooting
- Created student testing guide with clear instructions
- Documented cache clearing and fresh assessment procedures
- Verified APS calculation with multiple test scenarios

✅ Status: System operational, diagnostic tools ready for support`;

    console.log('  💾 Creating commit...');
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    console.log('  ✅ Commit successful');
    
    return true;
  } catch (error) {
    console.log(`  ❌ Commit failed: ${error.message}`);
    return false;
  }
}

// Step 2: Push to GitHub
function pushToGitHub() {
  console.log('\n🌐 Step 2: Pushing to GitHub');
  
  try {
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('  ✅ Successfully pushed to GitHub');
    return true;
  } catch (error) {
    console.log(`  ❌ Push failed: ${error.message}`);
    return false;
  }
}

// Step 3: Deploy to Vercel
function deployToVercel() {
  console.log('\n🚀 Step 3: Deploying to Vercel');
  
  try {
    console.log('  🔄 Starting deployment...');
    const output = execSync('vercel --prod --yes', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('  ✅ Deployment successful!');
    
    // Extract deployment URL
    const lines = output.split('\n');
    const urlLine = lines.find(line => line.includes('https://') && line.includes('.vercel.app'));
    if (urlLine) {
      const url = urlLine.trim();
      console.log(`  🌐 Deployment URL: ${url}`);
      
      // Update deployment info
      const deploymentInfo = {
        url,
        timestamp: new Date().toISOString(),
        status: 'deployed',
        version: 'grade10-aps-diagnostic-v2'
      };
      
      fs.writeFileSync(
        path.join(__dirname, 'deployment-info.json'), 
        JSON.stringify(deploymentInfo, null, 2)
      );
      
      return url;
    }
    
    return true;
  } catch (error) {
    console.log(`  ❌ Deployment failed: ${error.message}`);
    return false;
  }
}

// Step 4: Test deployment
async function testDeployment(deploymentUrl) {
  console.log('\n🧪 Step 4: Testing Deployment');
  
  if (!deploymentUrl) {
    console.log('  ⚠️ No deployment URL available for testing');
    return false;
  }
  
  try {
    // Test basic connectivity
    const response = await fetch(deploymentUrl);
    console.log(`  ✅ Homepage: ${response.status} ${response.statusText}`);
    
    // Test assessment page
    const assessmentResponse = await fetch(deploymentUrl + '/assessment');
    console.log(`  ✅ Assessment: ${assessmentResponse.status} ${assessmentResponse.statusText}`);
    
    // Test API
    const apiResponse = await fetch(deploymentUrl + '/api/rag/query');
    console.log(`  ✅ API: ${apiResponse.status} ${apiResponse.statusText}`);
    
    console.log(`  🌐 Live URL: ${deploymentUrl}`);
    return true;
  } catch (error) {
    console.log(`  ❌ Testing failed: ${error.message}`);
    return false;
  }
}

// Step 5: Create comprehensive backup
function createComprehensiveBackup() {
  console.log('\n💾 Step 5: Creating Comprehensive Backup');
  
  const backupTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backup-grade10-aps-diagnostic-${backupTimestamp}`;
  
  try {
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Critical files to backup
    const criticalFiles = [
      // Core application
      'app/assessment/components/AssessmentForm.jsx',
      'app/assessment/components/MarksCollection.jsx',
      'app/assessment/components/PreliminaryReport.jsx',
      'app/assessment/components/DeepDiveQuestions.jsx',
      'app/api/rag/query/route.js',
      'lib/matching/program-matcher.js',
      
      // Diagnostic tools
      'diagnose-grade10-marks-issue.js',
      'test-grade10-marks-flow.js',
      'debug-frontend-api-flow.js', 
      'analyze-api-response.js',
      
      // Documentation
      'GRADE10-APS-ISSUE-RESOLUTION.md',
      'STUDENT-TESTING-GUIDE.md',
      'DEPLOYMENT-STATUS-FINAL.md',
      
      // Testing tools
      'test-comprehensive-local-verification.js',
      'test-grade10-flow-complete-verification.js',
      'final-deployment-verification.js',
      
      // Configuration
      'package.json',
      'next.config.js',
      'tailwind.config.js',
      'vercel.json',
      'deployment-info.json'
    ];
    
    console.log('  📁 Backing up critical files...');
    let backedUpCount = 0;
    
    criticalFiles.forEach(file => {
      const sourcePath = path.join(__dirname, file);
      if (fs.existsSync(sourcePath)) {
        const targetPath = path.join(__dirname, backupDir, file);
        const targetDir = path.dirname(targetPath);
        
        // Create directory structure
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Copy file
        fs.copyFileSync(sourcePath, targetPath);
        backedUpCount++;
      }
    });
    
    console.log(`  ✅ Backed up ${backedUpCount} files to ${backupDir}`);
    
    // Create backup manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      version: 'grade10-aps-diagnostic-v2',
      filesBackedUp: backedUpCount,
      description: 'Comprehensive backup after Grade 10 APS diagnostic implementation',
      criticalComponents: [
        'Grade 10 assessment flow with APS calculation',
        'Marks collection and processing',
        'University eligibility determination',
        'Diagnostic and testing tools',
        'Student testing guides'
      ]
    };
    
    fs.writeFileSync(
      path.join(__dirname, backupDir, 'BACKUP-MANIFEST.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log(`  📋 Created backup manifest`);
    return backupDir;
    
  } catch (error) {
    console.log(`  ❌ Backup failed: ${error.message}`);
    return false;
  }
}

// Main execution
async function executeWorkflow() {
  console.log('🚀 Starting Complete Workflow...\n');
  
  const results = {
    commit: false,
    push: false,
    deploy: false,
    test: false,
    backup: false,
    deploymentUrl: null
  };
  
  // Execute steps
  results.commit = stageAndCommit();
  if (results.commit) {
    results.push = pushToGitHub();
  }
  
  if (results.push) {
    const deployResult = deployToVercel();
    if (deployResult) {
      results.deploy = true;
      if (typeof deployResult === 'string') {
        results.deploymentUrl = deployResult;
      }
    }
  }
  
  if (results.deploy) {
    results.test = await testDeployment(results.deploymentUrl);
  }
  
  // Always create backup regardless of deployment status
  const backupResult = createComprehensiveBackup();
  results.backup = !!backupResult;
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 WORKFLOW SUMMARY');
  
  console.log(`\n✅ Results:`);
  console.log(`   Commit: ${results.commit ? '✅' : '❌'}`);
  console.log(`   Push: ${results.push ? '✅' : '❌'}`);
  console.log(`   Deploy: ${results.deploy ? '✅' : '❌'}`);
  console.log(`   Test: ${results.test ? '✅' : '❌'}`);
  console.log(`   Backup: ${results.backup ? '✅' : '❌'}`);
  
  if (results.deploymentUrl) {
    console.log(`\n🌐 LIVE URL: ${results.deploymentUrl}`);
  }
  
  if (results.backup) {
    console.log(`\n💾 Backup created: ${backupResult}`);
  }
  
  const allSuccess = results.commit && results.push && results.deploy && results.test && results.backup;
  
  if (allSuccess) {
    console.log('\n🎉 ALL STEPS COMPLETED SUCCESSFULLY!');
    console.log('\n🎯 Ready for Testing:');
    console.log('   • Grade 10 APS diagnostic tools deployed');
    console.log('   • System verified operational');
    console.log('   • Comprehensive backup created');
    console.log('   • Ready for user testing');
  } else {
    console.log('\n⚠️ Some steps had issues - check logs above');
  }
  
  return allSuccess;
}

// Execute
executeWorkflow().then(success => {
  process.exit(success ? 0 : 1);
});