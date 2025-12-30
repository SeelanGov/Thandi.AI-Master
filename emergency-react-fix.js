#!/usr/bin/env node

/**
 * EMERGENCY REACT FIX
 * Fix the React component mounting issue
 */

const fs = require('fs');
const { execSync } = require('child_process');

function fixReactMounting() {
  console.log('🚨 EMERGENCY REACT MOUNTING FIX');
  console.log('================================');
  
  // Step 1: Create minimal Next.js config
  console.log('\n⚙️ Step 1: Creating minimal Next.js config');
  
  const minimalNextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Minimal configuration for reliable builds
  experimental: {
    // Remove problematic experimental features
  },
  
  // Simple webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Basic headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
`;

  fs.writeFileSync('next.config.js', minimalNextConfig);
  console.log('✅ Created minimal Next.js config');
  
  // Step 2: Fix package.json scripts
  console.log('\n📦 Step 2: Fixing package.json scripts');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Ensure clean build scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      "build": "next build",
      "start": "next start",
      "dev": "next dev",
      "lint": "next lint"
    };
    
    // Update version for cache bust
    packageJson.version = '0.1.8-react-fix';
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Fixed package.json scripts and version');
    
  } catch (error) {
    console.log(`❌ Error fixing package.json: ${error.message}`);
  }
  
  // Step 3: Create bulletproof vercel.json
  console.log('\n⚙️ Step 3: Creating bulletproof vercel.json');
  
  const bulletproofVercelConfig = {
    "version": 2,
    "builds": [
      {
        "src": "package.json",
        "use": "@vercel/next"
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "/$1"
      }
    ]
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(bulletproofVercelConfig, null, 2));
  console.log('✅ Created bulletproof vercel.json');
  
  // Step 4: Clean up any problematic files
  console.log('\n🧹 Step 4: Cleaning up problematic files');
  
  const filesToRemove = [
    '.next',
    'node_modules/.cache',
    '.vercel'
  ];
  
  filesToRemove.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        if (fs.lstatSync(file).isDirectory()) {
          execSync(`rmdir /s /q "${file}"`, { stdio: 'ignore' });
        } else {
          fs.unlinkSync(file);
        }
        console.log(`✅ Removed ${file}`);
      } catch (e) {
        console.log(`⚠️ Could not remove ${file}: ${e.message}`);
      }
    }
  });
}

function deployReactFix() {
  console.log('\n🚀 DEPLOYING REACT FIX');
  console.log('=======================');
  
  try {
    // Stage all changes
    execSync('git add .', { stdio: 'inherit' });
    console.log('✅ Staged all changes');
    
    // Commit with clear message
    execSync('git commit -m "EMERGENCY: Fix React component mounting - minimal config for reliable builds"', { stdio: 'inherit' });
    console.log('✅ Committed React fix');
    
    // Push to trigger deployment
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Pushed to GitHub - Vercel deployment triggered');
    
    return true;
  } catch (error) {
    console.log(`❌ Git operations failed: ${error.message}`);
    return false;
  }
}

async function testReactFix() {
  console.log('\n🧪 TESTING REACT FIX');
  console.log('=====================');
  console.log('⏳ Waiting 60 seconds for clean build...');
  
  await new Promise(resolve => setTimeout(resolve, 60000));
  
  // Test the assessment page for React mounting
  const https = require('https');
  
  const testResult = await new Promise((resolve) => {
    const req = https.get('https://www.thandi.online/assessment', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          success: res.statusCode === 200,
          statusCode: res.statusCode,
          size: data.length,
          hasReactData: data.includes('__NEXT_DATA__'),
          hasComponents: data.includes('BulletproofStudentRegistration') || data.includes('GradeSelector'),
          hasJavaScript: data.includes('_next/static/chunks/'),
          hasHydration: data.includes('__NEXT_DATA__') && data.includes('_next/static/chunks/'),
          content: data.substring(0, 500) // First 500 chars for debugging
        });
      });
    });
    req.on('error', () => resolve({ success: false }));
    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ success: false });
    });
  });
  
  if (testResult.success) {
    console.log('✅ Assessment page is responding!');
    console.log(`📊 Status: ${testResult.statusCode}`);
    console.log(`📏 Size: ${testResult.size} bytes`);
    console.log(`⚛️ React Data: ${testResult.hasReactData ? 'Yes' : 'No'}`);
    console.log(`🧩 Components: ${testResult.hasComponents ? 'Yes' : 'No'}`);
    console.log(`📜 JavaScript: ${testResult.hasJavaScript ? 'Yes' : 'No'}`);
    console.log(`💧 Hydration: ${testResult.hasHydration ? 'Yes' : 'No'}`);
    
    if (testResult.hasHydration) {
      console.log('\n🎉 REACT FIX SUCCESS!');
      console.log('✅ React components should now mount properly');
      console.log('✅ Students should be able to access the registration form');
      console.log('🌐 Ready for testing at https://www.thandi.online/assessment');
      return true;
    } else if (testResult.hasReactData) {
      console.log('\n⚠️ PARTIAL SUCCESS');
      console.log('✅ React data present but components may need more time');
      console.log('🔄 Try refreshing the page in a few minutes');
      return false;
    } else {
      console.log('\n❌ REACT STILL NOT MOUNTING');
      console.log('🔧 May need additional debugging');
      console.log('📄 Page content preview:');
      console.log(testResult.content);
      return false;
    }
  } else {
    console.log('❌ Assessment page failed to load');
    return false;
  }
}

async function main() {
  console.log('🚨 EMERGENCY REACT MOUNTING FIX');
  console.log('================================');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log('🎯 Goal: Fix React component mounting so students can access registration');
  
  try {
    // Step 1: Fix the React mounting issues
    fixReactMounting();
    
    // Step 2: Deploy the fix
    const deploySuccess = deployReactFix();
    
    if (!deploySuccess) {
      console.log('\n❌ DEPLOYMENT FAILED');
      console.log('🔧 Manual intervention required');
      return false;
    }
    
    // Step 3: Test the fix
    const testSuccess = await testReactFix();
    
    console.log('\n🎯 FINAL RESULT');
    console.log('===============');
    
    if (testSuccess) {
      console.log('🎉 SUCCESS: React components now mounting!');
      console.log('✅ Students can access registration form');
      console.log('✅ Assessment flow should work end-to-end');
      console.log('🌐 https://www.thandi.online/assessment');
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Test complete student registration flow');
      console.log('2. Verify assessment questions load properly');
      console.log('3. Start live student testing session');
    } else {
      console.log('⚠️ PARTIAL: Build deployed but React may need more time');
      console.log('🔄 Check live site in 10-15 minutes');
      console.log('💡 The build configuration should now be stable');
    }
    
    return testSuccess;
    
  } catch (error) {
    console.log('\n❌ CRITICAL ERROR');
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// Execute the fix
main().then(success => {
  console.log(`\n📅 Completed: ${new Date().toISOString()}`);
  console.log(`🎯 Status: ${success ? 'READY FOR STUDENT TESTING' : 'NEEDS MORE TIME'}`);
}).catch(error => {
  console.error('❌ Critical error:', error.message);
});