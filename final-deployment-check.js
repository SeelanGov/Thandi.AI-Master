#!/usr/bin/env node

/**
 * Final Deployment Check
 * Accurate assessment of deployment readiness for Vercel
 */

import fs from 'fs';
import { execSync } from 'child_process';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBold(message, color = 'white') {
  console.log(`${colors.bold}${colors[color]}${message}${colors.reset}`);
}

class FinalDeploymentChecker {
  constructor() {
    this.criticalIssues = [];
    this.warnings = [];
    this.passed = [];
  }

  checkCriticalDependencies() {
    logBold('\n📦 Critical Dependencies Check', 'blue');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const required = [
        '@anthropic-ai/sdk',
        '@supabase/supabase-js',
        'next',
        'react',
        'openai'
      ];
      
      required.forEach(dep => {
        if (packageJson.dependencies[dep]) {
          this.passed.push(`${dep} installed`);
          log(`✅ ${dep}: ${packageJson.dependencies[dep]}`, 'green');
        } else {
          this.criticalIssues.push(`Missing dependency: ${dep}`);
          log(`❌ Missing: ${dep}`, 'red');
        }
      });
      
    } catch (error) {
      this.criticalIssues.push(`Cannot read package.json: ${error.message}`);
    }
  }

  checkCoreAPIRoutes() {
    logBold('\n🌐 Core API Routes Check', 'blue');
    
    const coreRoutes = [
      'app/api/health/route.js',
      'app/api/rag/query/route.js'
    ];
    
    coreRoutes.forEach(route => {
      if (fs.existsSync(route)) {
        this.passed.push(`${route} exists`);
        log(`✅ ${route}`, 'green');
      } else {
        this.criticalIssues.push(`Missing core route: ${route}`);
        log(`❌ ${route}`, 'red');
      }
    });
  }

  checkAssessmentComponents() {
    logBold('\n📝 Assessment Components Check', 'blue');
    
    const coreComponents = [
      'app/assessment/components/AssessmentForm.jsx',
      'app/assessment/components/OpenQuestions.jsx',
      'app/assessment/components/DeepDiveQuestions.jsx',
      'app/assessment/components/SubjectSelection.jsx',
      'app/assessment/components/CurriculumProfile.jsx'
    ];
    
    coreComponents.forEach(component => {
      if (fs.existsSync(component)) {
        this.passed.push(`${component} exists`);
        log(`✅ ${component.split('/').pop()}`, 'green');
      } else {
        this.criticalIssues.push(`Missing component: ${component}`);
        log(`❌ ${component.split('/').pop()}`, 'red');
      }
    });
  }

  checkEnvironmentSetup() {
    logBold('\n🔧 Environment Setup Check', 'blue');
    
    // Check .env.local is NOT in repo
    if (!fs.existsSync('.env.local')) {
      this.passed.push('.env.local correctly excluded');
      log('✅ .env.local not in repository', 'green');
    } else {
      this.criticalIssues.push('.env.local found in repository');
      log('❌ .env.local should not be committed', 'red');
    }
    
    // Check example files exist
    const envExamples = ['.env.example', '.env.production.example'];
    envExamples.forEach(file => {
      if (fs.existsSync(file)) {
        this.passed.push(`${file} exists`);
        log(`✅ ${file}`, 'green');
      } else {
        this.warnings.push(`Missing ${file}`);
        log(`⚠️  ${file} missing`, 'yellow');
      }
    });
  }

  checkBuildProcess() {
    logBold('\n🔨 Build Process Check', 'blue');
    
    try {
      log('Testing Next.js build...', 'blue');
      execSync('npm run build', { stdio: 'pipe' });
      this.passed.push('Build process successful');
      log('✅ Build successful', 'green');
    } catch (error) {
      this.criticalIssues.push('Build process failed');
      log('❌ Build failed', 'red');
      log(`   Error: ${error.message.split('\n')[0]}`, 'red');
    }
  }

  checkLLMConfiguration() {
    logBold('\n🤖 LLM Configuration Check', 'blue');
    
    try {
      const llmAdapter = fs.readFileSync('lib/llm/llm-adapter.js', 'utf8');
      
      if (llmAdapter.includes('GroqProvider') && llmAdapter.includes('OpenAIProvider') && llmAdapter.includes('ClaudeProvider')) {
        this.passed.push('All LLM providers configured');
        log('✅ GROQ, OpenAI, and Anthropic providers configured', 'green');
      } else {
        this.warnings.push('Some LLM providers may be missing');
        log('⚠️  Check LLM provider configuration', 'yellow');
      }
      
    } catch (error) {
      this.criticalIssues.push('Cannot verify LLM configuration');
    }
  }

  checkKnowledgeBase() {
    logBold('\n📚 Knowledge Base Check', 'blue');
    
    if (fs.existsSync('thandi_knowledge_base')) {
      const caps = fs.existsSync('thandi_knowledge_base/caps');
      const ieb = fs.existsSync('thandi_knowledge_base/ieb');
      
      if (caps && ieb) {
        this.passed.push('Knowledge base structure exists');
        log('✅ CAPS and IEB knowledge bases exist', 'green');
      } else {
        this.warnings.push('Incomplete knowledge base structure');
        log('⚠️  Knowledge base structure incomplete', 'yellow');
      }
    } else {
      this.warnings.push('Knowledge base directory missing');
      log('⚠️  Knowledge base directory not found', 'yellow');
    }
  }

  generateFinalReport() {
    logBold('\n📊 FINAL DEPLOYMENT REPORT', 'cyan');
    log('=====================================', 'cyan');
    
    const totalChecks = this.passed.length + this.criticalIssues.length + this.warnings.length;
    const score = totalChecks > 0 ? Math.round((this.passed.length / totalChecks) * 100) : 0;
    
    log(`✅ Passed: ${this.passed.length}`, 'green');
    log(`❌ Critical Issues: ${this.criticalIssues.length}`, this.criticalIssues.length === 0 ? 'green' : 'red');
    log(`⚠️  Warnings: ${this.warnings.length}`, this.warnings.length < 3 ? 'green' : 'yellow');
    log(`📊 Overall Score: ${score}%`, score > 85 ? 'green' : score > 70 ? 'yellow' : 'red');
    
    if (this.criticalIssues.length > 0) {
      logBold('\n🚨 CRITICAL ISSUES:', 'red');
      this.criticalIssues.forEach(issue => log(`   • ${issue}`, 'red'));
    }
    
    if (this.warnings.length > 0) {
      logBold('\n⚠️  WARNINGS:', 'yellow');
      this.warnings.forEach(warning => log(`   • ${warning}`, 'yellow'));
    }
    
    // Final decision
    if (this.criticalIssues.length === 0) {
      logBold('\n🚀 DEPLOYMENT APPROVED', 'green');
      log('System is ready for Vercel deployment!', 'green');
      this.showDeploymentInstructions();
      return true;
    } else {
      logBold('\n❌ DEPLOYMENT BLOCKED', 'red');
      log('Critical issues must be resolved before deployment', 'red');
      return false;
    }
  }

  showDeploymentInstructions() {
    logBold('\n📋 VERCEL DEPLOYMENT INSTRUCTIONS', 'cyan');
    
    log('\n1. Set Environment Variables in Vercel:', 'blue');
    const envVars = [
      'GROQ_API_KEY',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY', 
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'LLM_PROVIDER=groq',
      'GROQ_MODEL=llama-3.1-8b-instant'
    ];
    
    envVars.forEach(varName => {
      log(`   • ${varName}`, 'yellow');
    });
    
    log('\n2. Deploy Commands:', 'blue');
    log('   vercel --prod', 'white');
    log('   # OR use Vercel Dashboard → Deploy from GitHub', 'white');
    
    log('\n3. Post-Deployment Tests:', 'blue');
    log('   • Visit https://your-app.vercel.app/api/health', 'white');
    log('   • Test assessment flow', 'white');
    log('   • Verify LLM responses work', 'white');
  }

  async run() {
    logBold('🎯 FINAL DEPLOYMENT READINESS CHECK', 'cyan');
    log('Comprehensive verification for Vercel deployment\n', 'white');
    
    this.checkCriticalDependencies();
    this.checkCoreAPIRoutes();
    this.checkAssessmentComponents();
    this.checkEnvironmentSetup();
    this.checkLLMConfiguration();
    this.checkKnowledgeBase();
    this.checkBuildProcess();
    
    return this.generateFinalReport();
  }
}

// Run the final check
const checker = new FinalDeploymentChecker();
checker.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Deployment check failed:', error);
  process.exit(1);
});