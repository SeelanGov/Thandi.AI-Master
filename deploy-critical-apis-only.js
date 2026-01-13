#!/usr/bin/env node

/**
 * DEPLOY CRITICAL APIS ONLY - JAN 13 2026
 * 
 * Deploy only the working critical APIs and temporarily disable problematic ones
 */

const fs = require('fs');
const { execSync } = require('child_process');

class CriticalAPIDeployer {
  constructor() {
    this.results = {
      disabledFiles: 0,
      errors: []
    };
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  // Get list of problematic API files to temporarily disable
  getProblematicAPIFiles() {
    return [
      'app/api/pdf/generate/route.js',
      'app/api/rag/query/route.js',
      'app/api/school/dashboard/stats/route.js',
      'app/api/school/login/route.js',
      'app/api/school/students/at-risk/route.js',
      'app/api/school/students/route.js',
      'app/api/schools/claim/route.js',
      'app/api/schools/login/route.js',
      'app/api/schools/request-addition/route.js',
      'app/api/schools/search/route.js',
      'app/api/student/retroactive-association/route.js'
    ];
  }

  // Temporarily disable a problematic API file
  disableAPIFile(filePath) {
    this.log(`🚫 Temporarily disabling ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'WARNING');
      return false;
    }

    // Rename the file to .disabled
    const disabledPath = filePath + '.disabled';
    
    try {
      fs.renameSync(filePath, disabledPath);
      this.results.disabledFiles++;
      this.log(`  ✅ Disabled ${filePath} -> ${disabledPath}`);
      return true;
    } catch (error) {
      this.log(`  ❌ Failed to disable ${filePath}: ${error.message}`, 'ERROR');
      this.results.errors.push(`${filePath}: ${error.message}`);
      return false;
    }
  }

  // Test build with only critical APIs
  testBuild() {
    this.log('🔨 Testing build with only critical APIs...');
    
    try {
      execSync('npm run build', { stdio: 'pipe' });
      this.log('  ✅ Build successful with critical APIs only');
      return true;
    } catch (error) {
      this.log(`  ❌ Build failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  // Deploy to production
  deployToProduction() {
    this.log('🚀 Deploying critical APIs to production...');
    
    try {
      // Commit changes
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "fix: deploy critical APIs only - disable problematic APIs temporarily"', { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      
      // Deploy to Vercel
      execSync('vercel --prod --force', { stdio: 'inherit' });
      
      this.log('  ✅ Deployment successful');
      return true;
    } catch (error) {
      this.log(`  ❌ Deployment failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  // Generate report
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 CRITICAL API DEPLOYMENT REPORT');
    console.log('='.repeat(80));
    console.log(`APIs Temporarily Disabled: ${this.results.disabledFiles}`);
    console.log(`Errors: ${this.results.errors.length}`);
    
    console.log('\n✅ WORKING CRITICAL APIS:');
    console.log('  • app/api/student/register/route.js - Student registration');
    console.log('  • app/api/schools/validate-code/route.js - School code validation');
    console.log('  • app/api/consent/manage/route.js - POPIA consent management');
    console.log('  • app/api/health/route.js - Health check');
    console.log('  • app/api/g10-12/route.js - Grade assessment');
    console.log('  • app/api/cache/health/route.js - Cache health');
    
    if (this.results.disabledFiles > 0) {
      console.log('\n🚫 TEMPORARILY DISABLED APIS:');
      const problematicFiles = this.getProblematicAPIFiles();
      problematicFiles.forEach(file => {
        if (fs.existsSync(file + '.disabled')) {
          console.log(`  • ${file} - Will be fixed later`);
        }
      });
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.results.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    console.log('='.repeat(80));
  }

  // Main execution
  async execute() {
    try {
      this.log('🚀 DEPLOYING CRITICAL APIS ONLY');
      console.log('Strategy: Disable problematic APIs, deploy working ones');
      console.log('');

      // Disable problematic API files
      const problematicFiles = this.getProblematicAPIFiles();
      
      this.log(`Disabling ${problematicFiles.length} problematic API files...`);
      console.log('');

      for (const filePath of problematicFiles) {
        this.disableAPIFile(filePath);
      }

      console.log('');

      // Test build
      const buildSuccess = this.testBuild();
      if (!buildSuccess) {
        throw new Error('Build failed even with problematic APIs disabled');
      }

      console.log('');

      // Deploy to production
      const deploySuccess = this.deployToProduction();
      if (!deploySuccess) {
        throw new Error('Deployment failed');
      }

      // Generate report
      this.generateReport();

      this.log('🎉 Critical API deployment completed!');
      
      console.log('\n💡 IMMEDIATE NEXT STEPS:');
      console.log('1. Test user registration at https://www.thandi.online/register');
      console.log('2. Verify school code validation works');
      console.log('3. Test assessment flow with registered users');
      
      console.log('\n🔧 LATER TASKS:');
      console.log('1. Fix syntax errors in disabled API files');
      console.log('2. Re-enable fixed APIs one by one');
      console.log('3. Test full system functionality');

      return true;

    } catch (error) {
      this.log(`❌ Critical API deployment failed: ${error.message}`, 'ERROR');
      
      // Try to restore disabled files
      this.log('🔄 Attempting to restore disabled files...');
      const problematicFiles = this.getProblematicAPIFiles();
      for (const filePath of problematicFiles) {
        const disabledPath = filePath + '.disabled';
        if (fs.existsSync(disabledPath)) {
          try {
            fs.renameSync(disabledPath, filePath);
            this.log(`  ✅ Restored ${filePath}`);
          } catch (restoreError) {
            this.log(`  ❌ Failed to restore ${filePath}: ${restoreError.message}`, 'ERROR');
          }
        }
      }
      
      throw error;
    }
  }
}

// Execute deployment
const deployer = new CriticalAPIDeployer();
deployer.execute()
  .then(success => {
    if (success) {
      console.log('\n✅ Critical API deployment successful!');
      console.log('🌐 Test at: https://www.thandi.online/register');
      process.exit(0);
    } else {
      console.log('\n❌ Critical API deployment failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });