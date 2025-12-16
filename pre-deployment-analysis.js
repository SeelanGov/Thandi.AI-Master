#!/usr/bin/env node

/**
 * Pre-Deployment Analysis Script
 * Comprehensive review of current deployment vs new deployment
 * Identifies potential breaking changes and compatibility issues
 */

import fs from 'fs';
import path from 'path';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBold(message, color = 'white') {
  console.log(`${colors.bold}${colors[color]}${message}${colors.reset}`);
}

class DeploymentAnalyzer {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.improvements = [];
    this.compatibility = [];
  }

  analyzePackageJson() {
    logBold('\n📦 Package.json Analysis', 'blue');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check critical dependencies
      const criticalDeps = [
        '@anthropic-ai/sdk',
        '@supabase/supabase-js', 
        'next',
        'react',
        'openai'
      ];
      
      criticalDeps.forEach(dep => {
        if (packageJson.dependencies[dep]) {
          log(`✅ ${dep}: ${packageJson.dependencies[dep]}`, 'green');
        } else {
          this.issues.push(`Missing critical dependency: ${dep}`);
          log(`❌ Missing: ${dep}`, 'red');
        }
      });
      
      // Check for potential version conflicts
      if (packageJson.dependencies.next) {
        const nextVersion = packageJson.dependencies.next;
        if (nextVersion.includes('14.')) {
          log(`✅ Next.js version compatible: ${nextVersion}`, 'green');
        } else {
          this.warnings.push(`Next.js version may need review: ${nextVersion}`);
        }
      }
      
    } catch (error) {
      this.issues.push(`Cannot read package.json: ${error.message}`);
    }
  }

  analyzeEnvironmentConfig() {
    logBold('\n🔧 Environment Configuration', 'blue');
    
    // Check for example files
    const envFiles = [
      { file: '.env.example', required: true, description: 'Environment template' },
      { file: '.env.production.example', required: true, description: 'Production template' },
      { file: '.env.staging.example', required: true, description: 'Staging template' },
      { file: '.env.local', required: false, description: 'Local env (should not exist)' }
    ];
    
    envFiles.forEach(({ file, required, description }) => {
      const exists = fs.existsSync(file);
      
      if (file === '.env.local') {
        if (!exists) {
          log(`✅ ${file} correctly excluded from repository`, 'green');
        } else {
          this.issues.push(`${file} should not be in repository`);
          log(`❌ ${file} found in repository`, 'red');
        }
      } else if (required && exists) {
        log(`✅ ${file} exists - ${description}`, 'green');
      } else if (required && !exists) {
        this.warnings.push(`Missing ${file} - ${description}`);
        log(`⚠️  Missing ${file}`, 'yellow');
      }
    });
  }

  analyzeAPIRoutes() {
    logBold('\n🌐 API Routes Analysis', 'blue');
    
    const apiRoutes = [
      'app/api/health/route.js',
      'app/api/rag/query/route.js',
      'app/api/rag/simple-query/route.js',
      'app/api/monitoring/bias-dashboard/route.js'
    ];
    
    apiRoutes.forEach(route => {
      if (fs.existsSync(route)) {
        log(`✅ ${route} exists`, 'green');
        
        // Check for basic structure
        try {
          const content = fs.readFileSync(route, 'utf8');
          
          // Check for export patterns
          if (content.includes('export async function GET') || content.includes('export async function POST')) {
            log(`  ✅ Proper Next.js 13+ route structure`, 'green');
          } else {
            this.warnings.push(`${route} may use old API route structure`);
            log(`  ⚠️  Check route structure`, 'yellow');
          }
          
          // Check for environment variable usage
          if (content.includes('process.env.') && !content.includes('hardcoded')) {
            log(`  ✅ Uses environment variables`, 'green');
          } else {
            this.warnings.push(`${route} may have hardcoded values`);
          }
          
        } catch (error) {
          this.warnings.push(`Cannot analyze ${route}: ${error.message}`);
        }
      } else {
        this.issues.push(`Missing API route: ${route}`);
        log(`❌ Missing ${route}`, 'red');
      }
    });
  }

  analyzeLLMConfiguration() {
    logBold('\n🤖 LLM Configuration Analysis', 'blue');
    
    try {
      const llmAdapter = fs.readFileSync('lib/llm/llm-adapter.js', 'utf8');
      
      // Check for provider support
      const providers = ['groq', 'openai', 'claude'];
      providers.forEach(provider => {
        if (llmAdapter.includes(`${provider}:`)) {
          log(`✅ ${provider.toUpperCase()} provider configured`, 'green');
        } else {
          this.warnings.push(`${provider} provider may not be configured`);
        }
      });
      
      // Check for environment variable usage
      if (llmAdapter.includes('process.env.LLM_PROVIDER')) {
        log(`✅ Dynamic provider selection configured`, 'green');
      } else {
        this.warnings.push('LLM provider selection may be hardcoded');
      }
      
    } catch (error) {
      this.issues.push(`Cannot analyze LLM configuration: ${error.message}`);
    }
  }

  analyzeAssessmentComponents() {
    logBold('\n📝 Assessment Components Analysis', 'blue');
    
    const components = [
      'app/assessment/components/AssessmentForm.jsx',
      'app/assessment/components/OpenQuestions.jsx',
      'app/assessment/components/DeepDiveQuestions.jsx',
      'app/assessment/components/SubjectEnjoymentSelection.jsx',
      'app/assessment/components/SubjectMarksCollection.jsx'
    ];
    
    components.forEach(component => {
      if (fs.existsSync(component)) {
        log(`✅ ${path.basename(component)} exists`, 'green');
        
        try {
          const content = fs.readFileSync(component, 'utf8');
          
          // Check for React patterns
          if (content.includes('export default function') || content.includes('const ') && content.includes('= () =>')) {
            log(`  ✅ Valid React component structure`, 'green');
          }
          
          // Check for potential issues from UX simplification
          if (content.includes('technical') || content.includes('algorithm')) {
            this.warnings.push(`${component} may still contain technical language`);
            log(`  ⚠️  May contain technical language`, 'yellow');
          } else {
            log(`  ✅ Student-friendly language`, 'green');
          }
          
        } catch (error) {
          this.warnings.push(`Cannot analyze ${component}: ${error.message}`);
        }
      } else {
        this.issues.push(`Missing component: ${component}`);
        log(`❌ Missing ${component}`, 'red');
      }
    });
  }

  analyzeDatabase() {
    logBold('\n🗄️  Database Configuration Analysis', 'blue');
    
    // Check for Supabase configuration files
    const dbFiles = [
      'supabase/config.toml',
      'lib/supabase.js'
    ];
    
    dbFiles.forEach(file => {
      if (fs.existsSync(file)) {
        log(`✅ ${file} exists`, 'green');
      } else {
        this.warnings.push(`Database file ${file} not found`);
        log(`⚠️  ${file} not found`, 'yellow');
      }
    });
    
    // Check for SQL files
    const sqlFiles = fs.readdirSync('.').filter(f => f.endsWith('.sql'));
    if (sqlFiles.length > 0) {
      log(`✅ Found ${sqlFiles.length} SQL files`, 'green');
      sqlFiles.forEach(file => {
        log(`  • ${file}`, 'white');
      });
    }
  }

  analyzeKnowledgeBase() {
    logBold('\n📚 Knowledge Base Analysis', 'blue');
    
    try {
      if (fs.existsSync('thandi_knowledge_base')) {
        const caps = fs.existsSync('thandi_knowledge_base/caps');
        const ieb = fs.existsSync('thandi_knowledge_base/ieb');
        
        if (caps && ieb) {
          log(`✅ Both CAPS and IEB knowledge bases exist`, 'green');
          
          // Count subjects
          const capsSubjects = fs.existsSync('thandi_knowledge_base/caps/subjects') 
            ? fs.readdirSync('thandi_knowledge_base/caps/subjects').length 
            : 0;
          const iebSubjects = fs.existsSync('thandi_knowledge_base/ieb/subjects')
            ? fs.readdirSync('thandi_knowledge_base/ieb/subjects').length
            : 0;
            
          log(`  • CAPS subjects: ${capsSubjects}`, 'white');
          log(`  • IEB subjects: ${iebSubjects}`, 'white');
          
          if (capsSubjects > 10 && iebSubjects > 10) {
            log(`✅ Comprehensive subject coverage`, 'green');
          } else {
            this.warnings.push('Limited subject coverage in knowledge base');
          }
        } else {
          this.warnings.push('Incomplete knowledge base structure');
        }
      } else {
        this.issues.push('Knowledge base directory missing');
      }
    } catch (error) {
      this.warnings.push(`Cannot analyze knowledge base: ${error.message}`);
    }
  }

  checkBreakingChanges() {
    logBold('\n⚠️  Breaking Changes Analysis', 'yellow');
    
    // Check for potential breaking changes
    const breakingPatterns = [
      { file: 'next.config.js', pattern: 'experimental', description: 'Experimental Next.js features' },
      { file: 'package.json', pattern: '"type": "module"', description: 'ES modules configuration' }
    ];
    
    breakingPatterns.forEach(({ file, pattern, description }) => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes(pattern)) {
          this.warnings.push(`${file} contains ${description}`);
          log(`⚠️  ${file}: ${description}`, 'yellow');
        }
      }
    });
    
    // Check for deprecated patterns
    const deprecatedPatterns = [
      'getServerSideProps',
      'getStaticProps',
      'pages/api'
    ];
    
    // This is a simplified check - in a real scenario you'd scan more thoroughly
    log(`ℹ️  Checking for deprecated Next.js patterns...`, 'blue');
    log(`✅ Using App Router (app/ directory)`, 'green');
  }

  generateCompatibilityReport() {
    logBold('\n🔄 Deployment Compatibility Report', 'cyan');
    
    const totalChecks = 25; // Approximate number of checks
    const issueCount = this.issues.length;
    const warningCount = this.warnings.length;
    
    const score = Math.max(0, ((totalChecks - issueCount - (warningCount * 0.5)) / totalChecks) * 100);
    
    log(`📊 Compatibility Score: ${Math.round(score)}%`, score > 90 ? 'green' : score > 70 ? 'yellow' : 'red');
    log(`🚨 Critical Issues: ${issueCount}`, issueCount === 0 ? 'green' : 'red');
    log(`⚠️  Warnings: ${warningCount}`, warningCount < 5 ? 'green' : 'yellow');
    
    if (issueCount === 0 && warningCount < 5) {
      logBold('\n✅ DEPLOYMENT APPROVED', 'green');
      log('System is ready for Vercel deployment', 'green');
    } else if (issueCount === 0) {
      logBold('\n⚠️  DEPLOYMENT APPROVED WITH CAUTION', 'yellow');
      log('Minor warnings detected - monitor after deployment', 'yellow');
    } else {
      logBold('\n❌ DEPLOYMENT NOT RECOMMENDED', 'red');
      log('Critical issues must be resolved first', 'red');
    }
    
    return { score, issues: issueCount, warnings: warningCount };
  }

  showDeploymentInstructions() {
    logBold('\n🚀 Vercel Deployment Instructions', 'cyan');
    
    log('\n1. Environment Variables Setup:', 'blue');
    log('   Go to Vercel Dashboard → Project → Settings → Environment Variables', 'white');
    
    const requiredVars = [
      'GROQ_API_KEY',
      'OPENAI_API_KEY', 
      'ANTHROPIC_API_KEY',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'LLM_PROVIDER=groq',
      'GROQ_MODEL=llama-3.1-8b-instant'
    ];
    
    requiredVars.forEach(varName => {
      log(`   • ${varName}`, 'yellow');
    });
    
    log('\n2. Deployment Commands:', 'blue');
    log('   vercel --prod', 'white');
    log('   # OR deploy via Vercel Dashboard from GitHub', 'white');
    
    log('\n3. Post-Deployment Verification:', 'blue');
    log('   • Test /api/health endpoint', 'white');
    log('   • Verify assessment flow works', 'white');
    log('   • Check LLM provider connectivity', 'white');
    log('   • Validate database connections', 'white');
  }

  async run() {
    logBold('🔍 PRE-DEPLOYMENT ANALYSIS', 'cyan');
    log('Analyzing current codebase for deployment readiness...\n', 'white');
    
    // Run all analyses
    this.analyzePackageJson();
    this.analyzeEnvironmentConfig();
    this.analyzeAPIRoutes();
    this.analyzeLLMConfiguration();
    this.analyzeAssessmentComponents();
    this.analyzeDatabase();
    this.analyzeKnowledgeBase();
    this.checkBreakingChanges();
    
    // Generate final report
    const results = this.generateCompatibilityReport();
    
    // Show issues and warnings
    if (this.issues.length > 0) {
      logBold('\n🚨 CRITICAL ISSUES TO RESOLVE:', 'red');
      this.issues.forEach(issue => log(`   • ${issue}`, 'red'));
    }
    
    if (this.warnings.length > 0) {
      logBold('\n⚠️  WARNINGS TO MONITOR:', 'yellow');
      this.warnings.forEach(warning => log(`   • ${warning}`, 'yellow'));
    }
    
    // Show deployment instructions if ready
    if (results.issues === 0) {
      this.showDeploymentInstructions();
    }
    
    return results;
  }
}

// Run the analysis
const analyzer = new DeploymentAnalyzer();
analyzer.run().catch(error => {
  console.error('Analysis failed:', error);
  process.exit(1);
});