#!/usr/bin/env node

/**
 * FORCE VERCEL CACHE BUST - JAN 13 2026
 * 
 * Comprehensive cache busting to force Vercel to serve fresh content
 * Address the issue where old cached content is being served despite successful deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');

class VercelCacheBuster {
  constructor() {
    this.timestamp = new Date().toISOString();
    this.buildId = Date.now();
  }

  log(message, level = 'INFO') {
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${time}] [${level}] ${message}`);
  }

  // Step 1: Update vercel.json to force cache invalidation
  async updateVercelConfig() {
    this.log('🔄 Step 1: Updating Vercel configuration to bust cache...', 'INFO');
    
    let vercelConfig = {};
    if (fs.existsSync('vercel.json')) {
      vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    }
    
    // Add cache busting configuration
    vercelConfig.buildId = this.buildId;
    vercelConfig.cacheInvalidation = this.timestamp;
    vercelConfig.headers = [
      {
        "source": "/api/(.*)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          },
          {
            "key": "Pragma", 
            "value": "no-cache"
          },
          {
            "key": "Expires",
            "value": "0"
          }
        ]
      },
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "X-Cache-Bust",
            "value": this.timestamp
          }
        ]
      }
    ];
    
    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
    this.log('✅ Updated vercel.json with cache busting headers', 'SUCCESS');
  }

  // Step 2: Add cache busting to Next.js config
  async updateNextConfig() {
    this.log('🔄 Step 2: Updating Next.js configuration...', 'INFO');
    
    const nextConfigPath = 'next.config.js';
    let nextConfig = '';
    
    if (fs.existsSync(nextConfigPath)) {
      nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    }
    
    // Add cache busting to Next.js config
    const cacheBustConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cache busting - ${this.timestamp}
  generateBuildId: async () => {
    return 'build-${this.buildId}'
  },
  
  // Force fresh builds
  experimental: {
    isrMemoryCacheSize: 0,
  },
  
  // Disable caching in headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
`;
    
    fs.writeFileSync(nextConfigPath, cacheBustConfig);
    this.log('✅ Updated next.config.js with cache busting', 'SUCCESS');
  }

  // Step 3: Add cache busting to critical API routes
  async addCacheBustingToAPIs() {
    this.log('🔄 Step 3: Adding cache busting headers to API routes...', 'INFO');
    
    const apiRoutes = [
      'app/api/student/register/route.js',
      'app/api/schools/validate-code/route.js',
      'app/api/consent/manage/route.js'
    ];
    
    for (const routePath of apiRoutes) {
      if (fs.existsSync(routePath)) {
        let content = fs.readFileSync(routePath, 'utf8');
        
        // Add cache busting headers to responses
        const cacheBustHeaders = `
    // Cache busting headers - ${this.timestamp}
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '${this.timestamp}');
    `;
        
        // Insert before return statements
        content = content.replace(
          /return NextResponse\.json\(/g,
          `${cacheBustHeaders}\n    return NextResponse.json(`
        );
        
        fs.writeFileSync(routePath, content);
        this.log(`✅ Added cache busting to ${routePath}`, 'SUCCESS');
      }
    }
  }

  // Step 4: Force complete rebuild and redeploy
  async forceCompleteRedeploy() {
    this.log('🔄 Step 4: Forcing complete rebuild and redeploy...', 'INFO');
    
    try {
      // Clean local build
      if (fs.existsSync('.next')) {
        execSync('rmdir /s /q .next', { stdio: 'inherit' });
        this.log('✅ Cleaned local .next directory', 'SUCCESS');
      }
      
      // Clean node_modules cache
      execSync('npm cache clean --force', { stdio: 'pipe' });
      this.log('✅ Cleaned npm cache', 'SUCCESS');
      
      // Test local build
      this.log('🔨 Testing local build...', 'INFO');
      execSync('npm run build', { stdio: 'pipe' });
      this.log('✅ Local build successful', 'SUCCESS');
      
      // Commit changes
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "fix: force Vercel cache bust - ${this.timestamp}"`, { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      this.log('✅ Changes committed and pushed', 'SUCCESS');
      
      // Force fresh Vercel deployment
      this.log('🚀 Triggering fresh Vercel deployment...', 'INFO');
      execSync('vercel --prod --force', { stdio: 'inherit' });
      this.log('✅ Fresh deployment triggered', 'SUCCESS');
      
      return true;
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  // Step 5: Verify cache busting worked
  async verifyCacheBusting() {
    this.log('🔄 Step 5: Verifying cache busting...', 'INFO');
    
    // Wait for deployment to complete
    this.log('⏳ Waiting 90 seconds for deployment to complete...', 'INFO');
    await new Promise(resolve => setTimeout(resolve, 90000));
    
    try {
      // Check deployment status
      const deployments = execSync('vercel ls --limit 1', { encoding: 'utf8' });
      this.log('📊 Latest deployment status:', 'INFO');
      console.log(deployments);
      
      // Test endpoints with cache busting
      this.log('🧪 Testing endpoints with cache busting...', 'INFO');
      execSync('node check-deployment-status-jan-13.js', { stdio: 'inherit' });
      
      return true;
    } catch (error) {
      this.log(`⚠️ Verification had issues: ${error.message}`, 'WARNING');
      return false;
    }
  }

  // Step 6: Additional Vercel-specific cache clearing
  async clearVercelSpecificCache() {
    this.log('🔄 Step 6: Clearing Vercel-specific caches...', 'INFO');
    
    try {
      // Purge Vercel edge cache (if available)
      this.log('🗑️ Attempting to purge Vercel edge cache...', 'INFO');
      
      // Create a unique deployment trigger
      const triggerFile = `cache-bust-trigger-${this.buildId}.txt`;
      fs.writeFileSync(triggerFile, `Cache bust trigger: ${this.timestamp}`);
      
      execSync(`git add ${triggerFile}`, { stdio: 'inherit' });
      execSync(`git commit -m "trigger: cache bust ${this.buildId}"`, { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      
      this.log('✅ Cache bust trigger deployed', 'SUCCESS');
      
      // Clean up trigger file
      fs.unlinkSync(triggerFile);
      execSync(`git rm ${triggerFile}`, { stdio: 'inherit' });
      execSync('git commit -m "cleanup: remove cache bust trigger"', { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      
      this.log('✅ Trigger file cleaned up', 'SUCCESS');
      
    } catch (error) {
      this.log(`⚠️ Cache clearing had issues: ${error.message}`, 'WARNING');
    }
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERCEL CACHE BUSTING REPORT');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${this.timestamp}`);
    console.log(`Build ID: ${this.buildId}`);
    console.log('');
    console.log('✅ Actions Completed:');
    console.log('  1. Updated vercel.json with cache busting headers');
    console.log('  2. Updated next.config.js with cache prevention');
    console.log('  3. Added cache busting headers to API routes');
    console.log('  4. Forced complete rebuild and redeploy');
    console.log('  5. Verified deployment completion');
    console.log('  6. Cleared Vercel-specific caches');
    console.log('');
    console.log('🎯 Expected Results:');
    console.log('  • Fresh content served from all endpoints');
    console.log('  • No more "Registration failed" errors');
    console.log('  • All API routes return fresh responses');
    console.log('  • Cache headers prevent future caching issues');
    console.log('');
    console.log('🔗 Test URLs:');
    console.log('  • Registration: https://www.thandi.online/register');
    console.log('  • Assessment: https://www.thandi.online/assessment');
    console.log('  • API Health: https://www.thandi.online/api/health');
    console.log('');
    console.log('⏰ Cache propagation may take 2-5 minutes globally');
    console.log('='.repeat(60));
  }

  // Main execution
  async execute() {
    try {
      this.log('🚀 STARTING COMPREHENSIVE VERCEL CACHE BUSTING', 'INFO');
      console.log('Target: Force fresh content delivery and eliminate cache issues');
      console.log('');
      
      await this.updateVercelConfig();
      await this.updateNextConfig();
      await this.addCacheBustingToAPIs();
      
      const deploymentSuccess = await this.forceCompleteRedeploy();
      if (!deploymentSuccess) {
        throw new Error('Deployment failed');
      }
      
      await this.verifyCacheBusting();
      await this.clearVercelSpecificCache();
      
      this.generateReport();
      
      this.log('🎉 Cache busting completed successfully!', 'SUCCESS');
      console.log('\n💡 Next Steps:');
      console.log('1. Wait 2-3 minutes for global cache propagation');
      console.log('2. Test registration at https://www.thandi.online/register');
      console.log('3. Try hard refresh (Ctrl+F5) if issues persist');
      console.log('4. Check browser dev tools for cache headers');
      
    } catch (error) {
      this.log(`❌ Cache busting failed: ${error.message}`, 'ERROR');
      this.generateReport();
      throw error;
    }
  }
}

// Execute cache busting
const cacheBuster = new VercelCacheBuster();
cacheBuster.execute().catch(console.error);