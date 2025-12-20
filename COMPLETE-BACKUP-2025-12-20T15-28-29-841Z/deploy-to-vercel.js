#!/usr/bin/env node

/**
 * Deploy to Vercel
 * Automated deployment script with environment setup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Deploy to Vercel');
console.log('='.repeat(50));

// Step 1: Check Vercel CLI
function checkVercelCLI() {
  console.log('\n🔧 Step 1: Checking Vercel CLI');
  
  try {
    const version = execSync('vercel --version', { encoding: 'utf8' }).trim();
    console.log(`  ✅ Vercel CLI installed: ${version}`);
    return true;
  } catch (error) {
    console.log('  ❌ Vercel CLI not found');
    console.log('  💡 Install with: npm i -g vercel');
    return false;
  }
}

// Step 2: Check if logged in
function checkVercelAuth() {
  console.log('\n🔐 Step 2: Checking Vercel Authentication');
  
  try {
    const whoami = execSync('vercel whoami', { encoding: 'utf8' }).trim();
    console.log(`  ✅ Logged in as: ${whoami}`);
    return true;
  } catch (error) {
    console.log('  ❌ Not logged in to Vercel');
    console.log('  💡 Login with: vercel login');
    return false;
  }
}

// Step 3: Prepare environment variables
function prepareEnvironmentVariables() {
  console.log('\n⚙️ Step 3: Preparing Environment Variables');
  
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('  ❌ .env.local not found');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = [];
  
  // Extract environment variables
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.includes('=') && !line.startsWith('#') && line.trim()) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      if (key && value && !key.startsWith('#')) {
        envVars.push({ key: key.trim(), value: value.trim() });
      }
    }
  }
  
  console.log(`  📋 Found ${envVars.length} environment variables:`);
  envVars.forEach(env => {
    const maskedValue = env.value.length > 10 ? 
      env.value.substring(0, 8) + '...' : 
      '***';
    console.log(`    ${env.key}=${maskedValue}`);
  });
  
  // Create vercel env setup script
  const envScript = envVars.map(env => 
    `vercel env add ${env.key} production`
  ).join('\n');
  
  fs.writeFileSync(path.join(__dirname, 'setup-vercel-env.sh'), envScript);
  console.log('  ✅ Created setup-vercel-env.sh');
  
  return envVars;
}

// Step 4: Create vercel.json if needed
function createVercelConfig() {
  console.log('\n📄 Step 4: Creating Vercel Configuration');
  
  const vercelConfigPath = path.join(__dirname, 'vercel.json');
  
  if (fs.existsSync(vercelConfigPath)) {
    console.log('  ✅ vercel.json already exists');
    return true;
  }
  
  const vercelConfig = {
    "version": 2,
    "env": {
      "NODE_ENV": "production"
    },
    "functions": {
      "app/api/rag/query/route.js": {
        "maxDuration": 30
      }
    }
  };
  
  fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
  console.log('  ✅ Created vercel.json');
  return true;
}

// Step 5: Deploy to Vercel
function deployToVercel() {
  console.log('\n🚀 Step 5: Deploying to Vercel');
  
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
      
      // Save deployment info
      const deploymentInfo = {
        url,
        timestamp: new Date().toISOString(),
        status: 'deployed'
      };
      
      fs.writeFileSync(
        path.join(__dirname, 'deployment-info.json'), 
        JSON.stringify(deploymentInfo, null, 2)
      );
      
      return url;
    }
    
    return true;
  } catch (error) {
    console.log('  ❌ Deployment failed');
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

// Step 6: Post-deployment verification
function postDeploymentCheck(deploymentUrl) {
  console.log('\n🔍 Step 6: Post-Deployment Verification');
  
  if (!deploymentUrl) {
    console.log('  ⚠️ No deployment URL available for verification');
    return false;
  }
  
  console.log(`  🌐 Testing: ${deploymentUrl}`);
  console.log('  📋 Manual verification checklist:');
  console.log('    1. Visit the deployment URL');
  console.log('    2. Test Grade 10 assessment flow');
  console.log('    3. Test Grade 11-12 assessment flow');
  console.log('    4. Verify API responses');
  console.log('    5. Check mobile responsiveness');
  
  return true;
}

// Main deployment function
async function deployToVercelMain() {
  console.log('🚀 Starting Vercel Deployment Process...\n');
  
  const steps = [
    { name: 'Check Vercel CLI', fn: checkVercelCLI, required: true },
    { name: 'Check Authentication', fn: checkVercelAuth, required: true },
    { name: 'Prepare Environment Variables', fn: prepareEnvironmentVariables, required: true },
    { name: 'Create Vercel Config', fn: createVercelConfig, required: false },
    { name: 'Deploy to Vercel', fn: deployToVercel, required: true },
  ];
  
  let deploymentUrl = null;
  let canProceed = true;
  
  for (const step of steps) {
    const result = step.fn();
    
    if (step.name === 'Deploy to Vercel' && result && typeof result === 'string') {
      deploymentUrl = result;
    }
    
    if (!result && step.required) {
      console.log(`\n❌ Required step failed: ${step.name}`);
      canProceed = false;
      break;
    }
  }
  
  if (canProceed && deploymentUrl) {
    postDeploymentCheck(deploymentUrl);
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (canProceed) {
    console.log('✅ VERCEL DEPLOYMENT COMPLETE!');
    console.log('\n🎯 Summary:');
    console.log('  • Vercel CLI verified');
    console.log('  • Authentication confirmed');
    console.log('  • Environment variables prepared');
    console.log('  • Configuration created');
    console.log('  • Deployment successful');
    
    if (deploymentUrl) {
      console.log(`\n🌐 Live URL: ${deploymentUrl}`);
    }
    
    console.log('\n📋 Next Steps:');
    console.log('  1. Set up environment variables in Vercel dashboard');
    console.log('  2. Test all assessment flows');
    console.log('  3. Verify API functionality');
    console.log('  4. Monitor performance');
    
    return true;
  } else {
    console.log('❌ Deployment failed or incomplete');
    console.log('\n🔧 Manual Deployment Options:');
    console.log('  1. Vercel Dashboard: https://vercel.com/dashboard');
    console.log('  2. Import GitHub repository');
    console.log('  3. Configure environment variables');
    console.log('  4. Deploy manually');
    
    return false;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  deployToVercelMain().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { deployToVercelMain };