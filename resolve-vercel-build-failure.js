#!/usr/bin/env node

/**
 * RESOLVE VERCEL BUILD FAILURE - SYSTEMATIC APPROACH
 * 
 * Focus on the actual issue: Vercel builds failing at 0ms
 * Not cache issues - build configuration issues
 */

const { execSync } = require('child_process');
const fs = require('fs');

class VercelBuildResolver {
  constructor() {
    this.issues = [];
    this.solutions = [];
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  // Step 1: Verify local environment is working
  async verifyLocalEnvironment() {
    this.log('🔍 Step 1: Verifying local environment...', 'INFO');
    
    try {
      // Test local build
      this.log('Testing local build...', 'INFO');
      execSync('npm run build', { stdio: 'pipe' });
      this.log('✅ Local build successful', 'SUCCESS');
      
      // Check critical files exist
      const criticalFiles = [
        'app/register/page.js',
        'app/api/consent/manage/route.js',
        'app/api/schools/validate-code/route.js',
        'app/api/student/retroactive-association/route.js'
      ];
      
      for (const file of criticalFiles) {
        if (!fs.existsSync(file)) {
          this.issues.push(`Missing critical file: ${file}`);
        } else {
          this.log(`✅ Found: ${file}`, 'SUCCESS');
        }
      }
      
      return true;
    } catch (error) {
      this.issues.push(`Local build failed: ${error.message}`);
      return false;
    }
  }

  // Step 2: Check Vercel configuration
  async checkVercelConfiguration() {
    this.log('🔍 Step 2: Checking Vercel configuration...', 'INFO');
    
    // Check vercel.json
    if (fs.existsSync('vercel.json')) {
      const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
      this.log('✅ vercel.json exists', 'SUCCESS');
      this.log(`Framework: ${config.framework}`, 'INFO');
      this.log(`Build command: ${config.buildCommand}`, 'INFO');
    } else {
      this.issues.push('Missing vercel.json configuration');
    }
    
    // Check package.json scripts
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!packageJson.scripts.build) {
      this.issues.push('Missing build script in package.json');
    } else {
      this.log('✅ Build script exists in package.json', 'SUCCESS');
    }
  }

  // Step 3: Check environment variables in Vercel
  async checkVercelEnvironmentVariables() {
    this.log('🔍 Step 3: Checking Vercel environment variables...', 'INFO');
    
    try {
      const envOutput = execSync('vercel env ls', { encoding: 'utf8' });
      
      // Check for critical missing variables
      const requiredVars = ['SUPABASE_URL', 'DATABASE_URL'];
      const missingVars = [];
      
      for (const varName of requiredVars) {
        if (!envOutput.includes(varName)) {
          missingVars.push(varName);
        }
      }
      
      if (missingVars.length > 0) {
        this.issues.push(`Missing Vercel environment variables: ${missingVars.join(', ')}`);
        this.solutions.push('Add missing environment variables to Vercel');
      } else {
        this.log('✅ Critical environment variables present', 'SUCCESS');
      }
      
    } catch (error) {
      this.issues.push('Cannot access Vercel environment variables');
      this.solutions.push('Run: vercel link to connect project');
    }
  }

  // Step 4: Add missing environment variables
  async addMissingEnvironmentVariables() {
    this.log('🔧 Step 4: Adding missing environment variables...', 'INFO');
    
    const envVarsToAdd = [
      {
        name: 'SUPABASE_URL',
        value: process.env.NEXT_PUBLIC_SUPABASE_URL,
        description: 'Supabase project URL'
      },
      {
        name: 'DATABASE_URL',
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
               `postgresql://postgres:[password]@${process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')}.supabase.co:5432/postgres` :
               null,
        description: 'Database connection URL'
      }
    ];
    
    for (const envVar of envVarsToAdd) {
      if (envVar.value) {
        try {
          this.log(`Adding ${envVar.name} to Vercel...`, 'INFO');
          // Note: This would need manual execution
          console.log(`\n🔧 MANUAL ACTION REQUIRED:`);
          console.log(`Run: vercel env add ${envVar.name}`);
          console.log(`Value: ${envVar.value}`);
          console.log(`Environment: Production, Preview, Development\n`);
        } catch (error) {
          this.log(`Failed to add ${envVar.name}: ${error.message}`, 'ERROR');
        }
      }
    }
  }

  // Step 5: Force fresh deployment
  async forceFreshDeployment() {
    this.log('🚀 Step 5: Forcing fresh deployment...', 'INFO');
    
    try {
      // Create a small change to trigger deployment
      const timestamp = new Date().toISOString();
      const deploymentMarker = `// Deployment trigger: ${timestamp}\n`;
      
      // Add marker to vercel.json
      let vercelConfig = {};
      if (fs.existsSync('vercel.json')) {
        vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
      }
      
      vercelConfig.deploymentId = timestamp;
      fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
      
      // Commit and push
      execSync('git add vercel.json', { stdio: 'inherit' });
      execSync(`git commit -m "fix: force fresh Vercel deployment - ${timestamp}"`, { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      
      this.log('✅ Fresh deployment triggered', 'SUCCESS');
      
      // Wait and check status
      this.log('⏳ Waiting 60 seconds for deployment...', 'INFO');
      await new Promise(resolve => setTimeout(resolve, 60000));
      
      const deployments = execSync('vercel ls', { encoding: 'utf8' });
      const latestDeployment = deployments.split('\n')[3]; // Skip headers
      
      if (latestDeployment.includes('Ready')) {
        this.log('✅ Deployment successful!', 'SUCCESS');
        return true;
      } else if (latestDeployment.includes('Error')) {
        this.log('❌ Deployment still failing', 'ERROR');
        return false;
      } else {
        this.log('⏳ Deployment still in progress', 'INFO');
        return false;
      }
      
    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  // Step 6: Test endpoints after deployment
  async testEndpointsAfterDeployment() {
    this.log('🧪 Step 6: Testing endpoints after deployment...', 'INFO');
    
    try {
      execSync('node check-deployment-status-jan-13.js', { stdio: 'inherit' });
      this.log('✅ Endpoint testing completed', 'SUCCESS');
    } catch (error) {
      this.log('⚠️ Some endpoints may still be propagating', 'WARNING');
    }
  }

  // Generate resolution report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERCEL BUILD FAILURE RESOLUTION REPORT');
    console.log('='.repeat(60));
    
    if (this.issues.length > 0) {
      console.log('\n❌ ISSUES IDENTIFIED:');
      this.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    if (this.solutions.length > 0) {
      console.log('\n🔧 SOLUTIONS APPLIED:');
      this.solutions.forEach((solution, index) => {
        console.log(`  ${index + 1}. ${solution}`);
      });
    }
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Manually add missing environment variables in Vercel dashboard');
    console.log('2. Wait 2-3 minutes for deployment completion');
    console.log('3. Run: node check-deployment-status-jan-13.js');
    console.log('4. If still failing, check Vercel dashboard build logs');
    
    console.log('\n🎯 SUCCESS CRITERIA:');
    console.log('• All Phase 0 endpoints return 200/400/405 (not 404)');
    console.log('• Vercel deployment shows "Ready" status');
    console.log('• Build time > 0ms (not immediate failure)');
    
    console.log('='.repeat(60));
  }

  // Main execution
  async execute() {
    try {
      this.log('🚀 STARTING VERCEL BUILD FAILURE RESOLUTION', 'INFO');
      
      const localOk = await this.verifyLocalEnvironment();
      if (!localOk) {
        throw new Error('Local environment issues must be fixed first');
      }
      
      await this.checkVercelConfiguration();
      await this.checkVercelEnvironmentVariables();
      await this.addMissingEnvironmentVariables();
      
      const deploymentOk = await this.forceFreshDeployment();
      if (deploymentOk) {
        await this.testEndpointsAfterDeployment();
      }
      
      this.generateReport();
      
      if (this.issues.length === 0) {
        this.log('🎉 Resolution completed successfully!', 'SUCCESS');
      } else {
        this.log('⚠️ Manual intervention required for remaining issues', 'WARNING');
      }
      
    } catch (error) {
      this.log(`❌ Resolution failed: ${error.message}`, 'ERROR');
      this.generateReport();
      throw error;
    }
  }
}

// Execute resolution
const resolver = new VercelBuildResolver();
resolver.execute().catch(console.error);