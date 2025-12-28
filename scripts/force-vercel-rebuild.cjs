#!/usr/bin/env node

/**
 * Force Vercel Rebuild
 * Create a deployment trigger to force fresh build
 */

const fs = require('fs');
const path = require('path');

async function forceVercelRebuild() {
  console.log('🔄 FORCING VERCEL REBUILD');
  console.log('=' .repeat(50));
  
  // Create a deployment marker file with timestamp
  const deploymentMarker = {
    timestamp: new Date().toISOString(),
    trigger: 'force-rebuild-assessment-page-fix',
    commit: 'Assessment page Next.js structure restoration',
    changes: [
      'Comprehensive RAG route restored',
      'Name input UX cursor jumping fixed',
      'Assessment page structure verified',
      'All components functional'
    ]
  };
  
  const markerPath = path.join(process.cwd(), 'deployment-marker.json');
  
  try {
    fs.writeFileSync(markerPath, JSON.stringify(deploymentMarker, null, 2));
    console.log('✅ Created deployment marker file');
    console.log(`   File: ${markerPath}`);
    console.log(`   Timestamp: ${deploymentMarker.timestamp}`);
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Commit this marker file to trigger deployment');
    console.log('2. Push to main branch');
    console.log('3. Monitor Vercel dashboard for build progress');
    console.log('4. Test production URL after deployment completes');
    
    console.log('\n🔧 COMMANDS TO RUN:');
    console.log('   git add deployment-marker.json');
    console.log('   git commit -m "Force Vercel rebuild - restore Next.js structure"');
    console.log('   git push origin main');
    
    console.log('\n⏱️  EXPECTED TIMELINE:');
    console.log('   - Deployment trigger: Immediate');
    console.log('   - Build time: 2-3 minutes');
    console.log('   - Propagation: 1-2 minutes');
    console.log('   - Total: ~5 minutes');
    
  } catch (error) {
    console.error('❌ Failed to create deployment marker:', error.message);
    process.exit(1);
  }
}

forceVercelRebuild();