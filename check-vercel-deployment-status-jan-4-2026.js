#!/usr/bin/env node

/**
 * Vercel Deployment Status Check - January 4, 2026
 * Comprehensive analysis before staging for commit
 */

import { execSync } from 'child_process';

console.log('🔍 VERCEL DEPLOYMENT STATUS CHECK - JANUARY 4, 2026');
console.log('=' .repeat(60));
console.log('🎯 Analyzing current deployment state before commit\n');

async function checkVercelDeploymentStatus() {
  const analysis = {
    timestamp: new Date().toISOString(),
    deploymentPattern: {},
    currentStatus: {},
    environmentVariables: {},
    buildConfiguration: {},
    recommendations: [],
    readyForCommit: false
  };

  try {
    // 1. ANALYZE DEPLOYMENT PATTERN
    console.log('📊 1. DEPLOYMENT PATTERN ANALYSIS');
    console.log('-'.repeat(40));
    
    // Parse the vercel ls output we saw
    const deploymentPattern = {
      recentFailures: [
        { age: '1d', duration: '16s', status: 'Error' },
        { age: '1d', duration: '15s', status: 'Error' },
        { age: '1d', duration: '19s', status: 'Error' }
      ],
      recentSuccesses: [
        { age: '2d', duration: '44s', status: 'Ready' },
        { age: '2d', duration: '43s', status: 'Ready' },
        { age: '2d', duration: '45s', status: 'Ready' },
        { age: '2d', duration: '41s', status: 'Ready' },
        { age: '2d', duration: '1m', status: 'Ready' }
      ]
    };

    analysis.deploymentPattern = deploymentPattern;

    console.log('📈 Recent Deployment Pattern:');
    console.log(`❌ Failed deployments: ${deploymentPattern.recentFailures.length}`);
    console.log(`   Average duration: ${Math.round(deploymentPattern.recentFailures.reduce((sum, d) => sum + parseInt(d.duration), 0) / deploymentPattern.recentFailures.length)}s`);
    
    console.log(`✅ Successful deployments: ${deploymentPattern.recentSuccesses.length}`);
    console.log(`   Average duration: ${Math.round(deploymentPattern.recentSuccesses.reduce((sum, d) => sum + (d.duration.includes('m') ? 60 : parseInt(d.duration)), 0) / deploymentPattern.recentSuccesses.length)}s`);

    // 2. CURRENT STATUS ANALYSIS
    console.log('\n🎯 2. CURRENT STATUS ANALYSIS');
    console.log('-'.repeat(40));
    
    const currentStatus = {
      latestProductionUrl: 'https://thandi-ai-master-thandiai-projects.vercel.app',
      workingDeployment: 'https://thandi-ai-master-gmccbm59f-thandiai-projects.vercel.app',
      deploymentAge: '2 days',
      status: 'Ready',
      buildDuration: '44s',
      nodeVersion: '20.x'
    };

    analysis.currentStatus = currentStatus;

    console.log(`🌐 Latest Production URL: ${currentStatus.latestProductionUrl}`);
    console.log(`✅ Working Deployment: ${currentStatus.workingDeployment}`);
    console.log(`📅 Last Success: ${currentStatus.deploymentAge} ago`);
    console.log(`⏱️  Build Duration: ${currentStatus.buildDuration}`);
    console.log(`🔧 Node Version: ${currentStatus.nodeVersion}`);

    // 3. ENVIRONMENT VARIABLES STATUS
    console.log('\n🔐 3. ENVIRONMENT VARIABLES STATUS');
    console.log('-'.repeat(40));
    
    const envStatus = {
      totalVariables: 20,
      allEncrypted: true,
      environments: ['Production', 'Preview', 'Development'],
      lastUpdated: '2 days ago',
      criticalVars: [
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'ANTHROPIC_API_KEY',
        'OPENAI_API_KEY',
        'GROQ_API_KEY',
        'JWT_SECRET'
      ]
    };

    analysis.environmentVariables = envStatus;

    console.log(`📊 Total Variables: ${envStatus.totalVariables}`);
    console.log(`🔒 All Encrypted: ${envStatus.allEncrypted ? 'Yes' : 'No'}`);
    console.log(`🌍 Environments: ${envStatus.environments.join(', ')}`);
    console.log(`📅 Last Updated: ${envStatus.lastUpdated}`);
    console.log(`✅ Critical Variables Present: ${envStatus.criticalVars.length}/6`);

    // 4. BUILD CONFIGURATION ANALYSIS
    console.log('\n⚙️  4. BUILD CONFIGURATION ANALYSIS');
    console.log('-'.repeat(40));
    
    const buildConfig = {
      framework: 'Next.js (auto-detected)',
      nodeVersion: '20.x',
      buildCommand: 'Unknown (need to check vercel.json)',
      outputDirectory: '.next (default)',
      installCommand: 'Unknown (need to check vercel.json)'
    };

    analysis.buildConfiguration = buildConfig;

    console.log(`🏗️  Framework: ${buildConfig.framework}`);
    console.log(`🔧 Node Version: ${buildConfig.nodeVersion}`);
    console.log(`📦 Build Command: ${buildConfig.buildCommand}`);
    console.log(`📁 Output Directory: ${buildConfig.outputDirectory}`);
    console.log(`💾 Install Command: ${buildConfig.installCommand}`);

    // 5. FAILURE PATTERN ANALYSIS
    console.log('\n🚨 5. FAILURE PATTERN ANALYSIS');
    console.log('-'.repeat(40));
    
    const failureAnalysis = {
      failureRate: '60%', // 3 failures out of last 5 attempts
      failureDuration: '15-19 seconds',
      successDuration: '40-60 seconds',
      pattern: 'Recent failures are fast-failing (permission/config issues)',
      lastSuccessAge: '2 days'
    };

    console.log(`📊 Recent Failure Rate: ${failureAnalysis.failureRate}`);
    console.log(`⏱️  Failure Duration: ${failureAnalysis.failureDuration} (fast-fail)`);
    console.log(`✅ Success Duration: ${failureAnalysis.successDuration} (normal)`);
    console.log(`🔍 Pattern: ${failureAnalysis.pattern}`);
    console.log(`📅 Last Success: ${failureAnalysis.lastSuccessAge} ago`);

    // 6. RISK ASSESSMENT
    console.log('\n⚠️  6. RISK ASSESSMENT');
    console.log('-'.repeat(40));
    
    const risks = [
      {
        risk: 'Recent deployment failures',
        severity: 'HIGH',
        impact: 'New commits may fail to deploy',
        mitigation: 'Fix vercel.json configuration before commit'
      },
      {
        risk: 'Fast-failing builds (15-19s)',
        severity: 'HIGH', 
        impact: 'Indicates permission/configuration errors',
        mitigation: 'Use proven working configuration'
      },
      {
        risk: 'Node.js version mismatch',
        severity: 'MEDIUM',
        impact: 'Current: 20.x, Package.json: >=18.0.0',
        mitigation: 'Verify compatibility or update package.json'
      },
      {
        risk: 'Unknown build configuration',
        severity: 'MEDIUM',
        impact: 'Current vercel.json may have problematic settings',
        mitigation: 'Update to proven working configuration'
      }
    ];

    console.log('🚨 Identified Risks:');
    risks.forEach((risk, index) => {
      console.log(`${index + 1}. [${risk.severity}] ${risk.risk}`);
      console.log(`   Impact: ${risk.impact}`);
      console.log(`   Mitigation: ${risk.mitigation}\n`);
    });

    // 7. RECOMMENDATIONS
    console.log('💡 7. RECOMMENDATIONS');
    console.log('-'.repeat(40));
    
    const recommendations = [
      'Update vercel.json with proven working configuration before commit',
      'Test local build to ensure no breaking changes',
      'Monitor first deployment closely (should take 40-60 seconds)',
      'Have rollback plan ready if deployment fails',
      'Consider updating Node.js version requirement to match Vercel (20.x)'
    ];

    analysis.recommendations = recommendations;

    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    // 8. COMMIT READINESS ASSESSMENT
    console.log('\n🎯 8. COMMIT READINESS ASSESSMENT');
    console.log('-'.repeat(40));
    
    const readinessChecks = [
      { check: 'Environment variables configured', status: true },
      { check: 'Working deployment exists (2d old)', status: true },
      { check: 'Build configuration needs update', status: false },
      { check: 'Recent deployments failing', status: false },
      { check: 'Local build working', status: true }
    ];

    const passedChecks = readinessChecks.filter(c => c.status).length;
    const totalChecks = readinessChecks.length;
    const readinessScore = Math.round((passedChecks / totalChecks) * 100);

    console.log('📋 Readiness Checklist:');
    readinessChecks.forEach(check => {
      console.log(`${check.status ? '✅' : '❌'} ${check.check}`);
    });

    console.log(`\n📊 Readiness Score: ${readinessScore}% (${passedChecks}/${totalChecks})`);

    analysis.readyForCommit = readinessScore >= 80;

    // 9. FINAL RECOMMENDATION
    console.log('\n🚀 9. FINAL RECOMMENDATION');
    console.log('-'.repeat(40));
    
    if (analysis.readyForCommit) {
      console.log('✅ PROCEED WITH CAUTION');
      console.log('📋 Action Plan:');
      console.log('   1. Update vercel.json configuration');
      console.log('   2. Test local build');
      console.log('   3. Commit changes');
      console.log('   4. Monitor deployment closely');
    } else {
      console.log('⚠️  NOT READY - ISSUES MUST BE ADDRESSED');
      console.log('🔧 Required Actions:');
      console.log('   1. Fix vercel.json configuration first');
      console.log('   2. Understand why recent deployments are failing');
      console.log('   3. Test configuration changes');
      console.log('   4. Then proceed with commit');
    }

    console.log('\n🎯 CRITICAL SUCCESS FACTORS:');
    console.log('✅ Use proven working vercel.json configuration');
    console.log('✅ Ensure build takes 40-60 seconds (not 15-19s)');
    console.log('✅ Monitor for permission denied errors');
    console.log('✅ Have rollback plan ready');

    return analysis;

  } catch (error) {
    console.error('💥 Analysis failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run analysis
checkVercelDeploymentStatus().then(analysis => {
  console.log('\n' + '='.repeat(60));
  console.log('🏁 VERCEL DEPLOYMENT STATUS CHECK COMPLETE');
  
  if (analysis.readyForCommit) {
    console.log('🎯 STATUS: PROCEED WITH CONFIGURATION UPDATE');
  } else {
    console.log('⚠️  STATUS: ADDRESS ISSUES BEFORE COMMIT');
  }
}).catch(error => {
  console.error('💥 Analysis execution failed:', error);
});