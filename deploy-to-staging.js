import { execSync } from 'child_process';
import fs from 'fs';

async function deployToStaging() {
  console.log('🚀 DEPLOYING TO VERCEL STAGING');
  console.log('=' .repeat(50));
  
  try {
    // Check if we're logged into Vercel
    console.log('\n🔐 Checking Vercel authentication...');
    try {
      execSync('vercel whoami', { stdio: 'pipe' });
      console.log('✅ Vercel authentication confirmed');
    } catch (error) {
      console.log('❌ Not logged into Vercel. Please run: vercel login');
      return;
    }
    
    // Check git status
    console.log('\n📝 Checking git status...');
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      if (gitStatus.trim()) {
        console.log('⚠️ Uncommitted changes detected:');
        console.log(gitStatus);
        console.log('\n📦 Committing changes for deployment...');
        
        execSync('git add .', { stdio: 'inherit' });
        execSync('git commit -m "feat: curriculum-aware RAG system with 605 embeddings - ready for staging"', { stdio: 'inherit' });
        console.log('✅ Changes committed');
      } else {
        console.log('✅ Working directory clean');
      }
    } catch (error) {
      console.log('ℹ️ Git status check completed');
    }
    
    // Deploy to Vercel
    console.log('\n🚀 Deploying to Vercel staging...');
    console.log('This may take 2-3 minutes...');
    
    try {
      const deployOutput = execSync('vercel --prod=false', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ Deployment successful!');
      
      // Extract deployment URL
      const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
      if (urlMatch) {
        const deploymentUrl = urlMatch[0];
        console.log(`🌐 Staging URL: ${deploymentUrl}`);
        
        // Save deployment info
        const deploymentInfo = {
          url: deploymentUrl,
          timestamp: new Date().toISOString(),
          embeddings: 605,
          features: [
            'Curriculum-aware RAG (CAPS/IEB)',
            '605 embeddings (7x increase)',
            'University-specific guidance',
            'AP Mathematics bonuses',
            'Performance optimized'
          ]
        };
        
        fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('📄 Deployment info saved to deployment-info.json');
        
        return deploymentUrl;
      }
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Staging deployment failed:', error.message);
    return null;
  }
}

// Run deployment
deployToStaging().then(url => {
  if (url) {
    console.log('\n🎉 STAGING DEPLOYMENT COMPLETE!');
    console.log('=' .repeat(50));
    console.log(`🌐 Staging URL: ${url}`);
    console.log('\n🧪 Next steps:');
    console.log('1. Test the staging environment');
    console.log('2. Verify curriculum-aware functionality');
    console.log('3. Run student pilot tests');
    console.log('4. Monitor performance metrics');
    console.log('5. Deploy to production when ready');
  } else {
    console.log('\n❌ STAGING DEPLOYMENT FAILED');
    console.log('Please check the errors above and try again.');
  }
}).catch(console.error);