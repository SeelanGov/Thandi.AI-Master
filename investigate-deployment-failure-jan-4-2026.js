#!/usr/bin/env node

/**
 * Investigate Deployment Failure - January 4, 2026
 * Analyze why vercel.json fix didn't resolve the issue
 */

import { execSync } from 'child_process';

console.log('🔍 INVESTIGATING DEPLOYMENT FAILURE - JANUARY 4, 2026');
console.log('=' .repeat(60));
console.log('🎯 Analyzing why vercel.json fix didn\'t work\n');

async function investigateDeploymentFailure() {
  try {
    // 1. VERIFY CURRENT VERCEL.JSON
    console.log('📄 1. VERCEL.JSON VERIFICATION');
    console.log('-'.repeat(40));
    
    const vercelConfig = JSON.parse(require('fs').readFileSync('vercel.json', 'utf8'));
    console.log('Current vercel.json:');
    console.log(JSON.stringify(vercelConfig, null, 2));
    
    const expectedConfig = {
      framework: 'nextjs',
      buildCommand: 'next build',
      installCommand: 'npm install',
      outputDirectory: '.next'
    };
    
    const configMatches = JSON.stringify(vercelConfig) === JSON.stringify(expectedConfig);
    console.log(`\n✅ Configuration matches expected: ${configMatches}`);

    // 2. CHECK RECENT DEPLOYMENT PATTERN
    console.log('\n📊 2. DEPLOYMENT PATTERN ANALYSIS');
    console.log('-'.repeat(40));
    
    console.log('Recent deployment pattern:');
    console.log('- 3m ago: Error (16s) - Our latest push');
    console.log('- 1d ago: Error (16s) - Previous attempts');
    console.log('- 2d ago: Ready (44s) - Last successful');
    
    console.log('\n🚨 Issue: Same 16-second fast-fail pattern persists');
    console.log('This suggests the vercel.json change may not be taking effect');

    // 3. POSSIBLE ROOT CAUSES
    console.log('\n🔍 3. POSSIBLE ROOT CAUSES');
    console.log('-'.repeat(40));
    
    const possibleCauses = [
      {
        cause: 'Vercel Dashboard Override',
        description: 'Build settings in Vercel dashboard may override vercel.json',
        likelihood: 'HIGH',
        solution: 'Check and update Vercel dashboard build settings'
      },
      {
        cause: 'Build Cache Issue',
        description: 'Vercel may be using cached build configuration',
        likelihood: 'HIGH',
        solution: 'Clear build cache or force fresh deployment'
      },
      {
        cause: 'Node.js Version Mismatch',
        description: 'Vercel using Node 20.x vs package.json >=18.0.0',
        likelihood: 'MEDIUM',
        solution: 'Update package.json engines to match Vercel'
      },
      {
        cause: 'Package-lock.json Issues',
        description: 'Dependency resolution conflicts',
        likelihood: 'MEDIUM',
        solution: 'Regenerate package-lock.json'
      },
      {
        cause: 'Environment Variable Issues',
        description: 'Missing or incorrect environment variables',
        likelihood: 'LOW',
        solution: 'Verify all 20 environment variables'
      }
    ];

    possibleCauses.forEach((item, index) => {
      console.log(`${index + 1}. [${item.likelihood}] ${item.cause}`);
      console.log(`   Description: ${item.description}`);
      console.log(`   Solution: ${item.solution}\n`);
    });

    // 4. IMMEDIATE ACTION PLAN
    console.log('🚀 4. IMMEDIATE ACTION PLAN');
    console.log('-'.repeat(40));
    
    const actionPlan = [
      {
        priority: 1,
        action: 'Force Vercel Redeploy',
        command: 'vercel --prod --force',
        description: 'Bypass cache and force fresh deployment'
      },
      {
        priority: 2,
        action: 'Update Package.json Node Version',
        command: 'Update engines.node to "20.x"',
        description: 'Match Vercel\'s Node.js version'
      },
      {
        priority: 3,
        action: 'Regenerate Dependencies',
        command: 'rm package-lock.json && npm install',
        description: 'Clean dependency resolution'
      },
      {
        priority: 4,
        action: 'Manual Vercel Dashboard Check',
        command: 'Check dashboard build settings',
        description: 'Verify dashboard doesn\'t override vercel.json'
      }
    ];

    console.log('📋 Priority Actions:');
    actionPlan.forEach(action => {
      console.log(`${action.priority}. ${action.action}`);
      console.log(`   Command: ${action.command}`);
      console.log(`   Why: ${action.description}\n`);
    });

    // 5. DIAGNOSTIC COMMANDS
    console.log('🔧 5. DIAGNOSTIC COMMANDS TO RUN');
    console.log('-'.repeat(40));
    
    const diagnosticCommands = [
      'vercel --version',
      'vercel whoami',
      'vercel ls | head -5',
      'vercel env ls',
      'vercel project ls'
    ];

    console.log('Run these commands to gather more information:');
    diagnosticCommands.forEach((cmd, index) => {
      console.log(`${index + 1}. ${cmd}`);
    });

    // 6. SUCCESS INDICATORS TO WATCH FOR
    console.log('\n✅ 6. SUCCESS INDICATORS');
    console.log('-'.repeat(40));
    
    console.log('Watch for these changes in next deployment:');
    console.log('- Build duration: 40-60 seconds (not 16s)');
    console.log('- Status: Ready (not Error)');
    console.log('- Build logs: "Creating an optimized production build"');
    console.log('- No permission denied errors');
    console.log('- Successful page generation');

    return {
      configCorrect: configMatches,
      recommendedAction: 'Force redeploy with --force flag',
      urgency: 'HIGH'
    };

  } catch (error) {
    console.error('💥 Investigation failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run investigation
investigateDeploymentFailure().then(result => {
  console.log('\n' + '='.repeat(60));
  console.log('🏁 INVESTIGATION COMPLETE');
  
  if (result.configCorrect) {
    console.log('🎯 NEXT ACTION: Force redeploy to bypass cache');
    console.log('💡 COMMAND: vercel --prod --force');
  } else {
    console.log('⚠️  NEXT ACTION: Fix configuration first');
  }
}).catch(error => {
  console.error('💥 Investigation execution failed:', error);
});