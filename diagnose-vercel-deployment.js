/**
 * SYSTEMATIC VERCEL DEPLOYMENT DIAGNOSIS
 * 
 * Comprehensive troubleshooting to identify and resolve deployment issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VercelDeploymentDiagnostic {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.projectRoot = process.cwd();
  }

  async runFullDiagnosis() {
    console.log('🔍 SYSTEMATIC VERCEL DEPLOYMENT DIAGNOSIS');
    console.log('=========================================');
    console.log(`📁 Project Root: ${this.projectRoot}\n`);

    // Step 1: Check project structure and configuration
    this.checkProjectStructure();
    
    // Step 2: Validate Next.js configuration
    this.validateNextJSConfig();
    
    // Step 3: Check Vercel configuration
    this.checkVercelConfig();
    
    // Step 4: Validate package.json and dependencies
    this.validatePackageJson();
    
    // Step 5: Check environment files
    this.checkEnvironmentFiles();
    
    // Step 6: Validate API routes
    this.validateAPIRoutes();
    
    // Step 7: Check build requirements
    this.checkBuildRequirements();
    
    // Step 8: Git and deployment status
    this.checkGitStatus();
    
    // Generate comprehensive report
    this.generateDiagnosticReport();
  }

  checkProjectStructure() {
    console.log('📁 CHECKING PROJECT STRUCTURE...');
    
    const requiredFiles = [
      'package.json',
      'next.config.js',
      'app/layout.js',
      'app/page.js',
      'app/assessment/page.jsx'
    ];
    
    const requiredDirs = [
      'app',
      'components',
      'lib',
      'public'
    ];
    
    // Check required files
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} missing`);
        this.issues.push(`Missing required file: ${file}`);
      }
    });
    
    // Check required directories
    requiredDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(`✅ ${dir}/ directory exists`);
      } else {
        console.log(`❌ ${dir}/ directory missing`);
        this.issues.push(`Missing required directory: ${dir}/`);
      }
    });
    
    // Check for conflicting files
    const conflictingFiles = ['pages/index.js', 'pages/_app.js'];
    conflictingFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`⚠️  ${file} exists (may conflict with App Router)`);
        this.issues.push(`Potential conflict: ${file} exists with App Router`);
      }
    });
    
    console.log('');
  }

  validateNextJSConfig() {
    console.log('⚙️  VALIDATING NEXT.JS CONFIGURATION...');
    
    try {
      if (fs.existsSync('next.config.js')) {
        const configContent = fs.readFileSync('next.config.js', 'utf8');
        console.log('✅ next.config.js exists');
        
        // Check for common issues
        if (configContent.includes('experimental')) {
          console.log('⚠️  Experimental features detected');
        }
        
        if (configContent.includes('output:')) {
          console.log('✅ Output configuration found');
        }
        
        // Try to parse the config
        try {
          // Basic syntax check
          if (configContent.includes('module.exports') || configContent.includes('export default')) {
            console.log('✅ Valid export syntax');
          } else {
            this.issues.push('next.config.js: Invalid export syntax');
          }
        } catch (error) {
          this.issues.push(`next.config.js syntax error: ${error.message}`);
        }
        
      } else {
        console.log('⚠️  next.config.js not found (using defaults)');
      }
      
      // Check app directory structure
      if (fs.existsSync('app/layout.js') || fs.existsSync('app/layout.jsx')) {
        console.log('✅ App Router layout found');
      } else {
        console.log('❌ App Router layout missing');
        this.issues.push('Missing app/layout.js or app/layout.jsx');
      }
      
    } catch (error) {
      this.issues.push(`Next.js config validation error: ${error.message}`);
    }
    
    console.log('');
  }

  checkVercelConfig() {
    console.log('🚀 CHECKING VERCEL CONFIGURATION...');
    
    if (fs.existsSync('vercel.json')) {
      try {
        const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
        console.log('✅ vercel.json exists and is valid JSON');
        
        // Check configuration
        if (vercelConfig.framework) {
          console.log(`✅ Framework: ${vercelConfig.framework}`);
        }
        
        if (vercelConfig.regions) {
          console.log(`✅ Regions: ${vercelConfig.regions.join(', ')}`);
        }
        
        if (vercelConfig.builds) {
          console.log('⚠️  Custom builds configuration detected');
        }
        
        if (vercelConfig.routes) {
          console.log('⚠️  Custom routes configuration detected');
        }
        
        // Check for potential issues
        if (vercelConfig.functions) {
          console.log('✅ Functions configuration found');
        }
        
      } catch (error) {
        console.log('❌ vercel.json is invalid JSON');
        this.issues.push(`vercel.json JSON parse error: ${error.message}`);
      }
    } else {
      console.log('⚠️  vercel.json not found (using defaults)');
    }
    
    // Check for .vercelignore
    if (fs.existsSync('.vercelignore')) {
      console.log('✅ .vercelignore exists');
    }
    
    console.log('');
  }

  validatePackageJson() {
    console.log('📦 VALIDATING PACKAGE.JSON...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      console.log('✅ package.json is valid JSON');
      
      // Check required scripts
      const requiredScripts = ['build', 'start', 'dev'];
      requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          console.log(`✅ Script "${script}": ${packageJson.scripts[script]}`);
        } else {
          console.log(`❌ Missing script: ${script}`);
          this.issues.push(`Missing required script: ${script}`);
        }
      });
      
      // Check Next.js version
      if (packageJson.dependencies && packageJson.dependencies.next) {
        const nextVersion = packageJson.dependencies.next;
        console.log(`✅ Next.js version: ${nextVersion}`);
        
        // Check if version is compatible
        if (nextVersion.includes('15.') || nextVersion.includes('14.') || nextVersion.includes('13.')) {
          console.log('✅ Next.js version is recent');
        } else {
          console.log('⚠️  Next.js version may be outdated');
        }
      } else {
        console.log('❌ Next.js not found in dependencies');
        this.issues.push('Next.js missing from dependencies');
      }
      
      // Check React version
      if (packageJson.dependencies && packageJson.dependencies.react) {
        console.log(`✅ React version: ${packageJson.dependencies.react}`);
      } else {
        console.log('❌ React not found in dependencies');
        this.issues.push('React missing from dependencies');
      }
      
      // Check Node.js version requirement
      if (packageJson.engines && packageJson.engines.node) {
        console.log(`✅ Node.js requirement: ${packageJson.engines.node}`);
      } else {
        console.log('⚠️  No Node.js version specified in engines');
      }
      
    } catch (error) {
      console.log('❌ package.json is invalid or missing');
      this.issues.push(`package.json error: ${error.message}`);
    }
    
    console.log('');
  }

  checkEnvironmentFiles() {
    console.log('🔐 CHECKING ENVIRONMENT CONFIGURATION...');
    
    const envFiles = ['.env.local', '.env.production', '.env.example'];
    
    envFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
        
        // Check for required environment variables
        const content = fs.readFileSync(file, 'utf8');
        const requiredVars = [
          'ANTHROPIC_API_KEY',
          'GROQ_API_KEY', 
          'SUPABASE_URL',
          'SUPABASE_ANON_KEY',
          'UPSTASH_REDIS_REST_URL'
        ];
        
        requiredVars.forEach(varName => {
          if (content.includes(varName)) {
            console.log(`  ✅ ${varName} defined`);
          } else {
            console.log(`  ⚠️  ${varName} not found`);
          }
        });
      } else {
        console.log(`⚠️  ${file} not found`);
      }
    });
    
    console.log('');
  }

  validateAPIRoutes() {
    console.log('🔌 VALIDATING API ROUTES...');
    
    const apiRoutes = [
      'app/api/schools/search/route.js',
      'app/api/student/register/route.js',
      'app/api/rag/query/route.js'
    ];
    
    apiRoutes.forEach(route => {
      if (fs.existsSync(route)) {
        console.log(`✅ ${route} exists`);
        
        // Check route file structure
        const content = fs.readFileSync(route, 'utf8');
        if (content.includes('export async function GET') || content.includes('export async function POST')) {
          console.log(`  ✅ Valid App Router API format`);
        } else {
          console.log(`  ⚠️  May not be App Router format`);
          this.issues.push(`${route}: Check App Router API format`);
        }
      } else {
        console.log(`❌ ${route} missing`);
        this.issues.push(`Missing API route: ${route}`);
      }
    });
    
    console.log('');
  }

  checkBuildRequirements() {
    console.log('🔨 CHECKING BUILD REQUIREMENTS...');
    
    try {
      // Check if node_modules exists
      if (fs.existsSync('node_modules')) {
        console.log('✅ node_modules directory exists');
      } else {
        console.log('❌ node_modules missing');
        this.issues.push('node_modules directory missing - run npm install');
      }
      
      // Check package-lock.json
      if (fs.existsSync('package-lock.json')) {
        console.log('✅ package-lock.json exists');
      } else if (fs.existsSync('yarn.lock')) {
        console.log('✅ yarn.lock exists');
      } else {
        console.log('⚠️  No lock file found');
      }
      
      // Try to run build locally (dry run check)
      console.log('🔍 Checking build script...');
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (packageJson.scripts && packageJson.scripts.build) {
        console.log(`✅ Build script: ${packageJson.scripts.build}`);
      }
      
    } catch (error) {
      this.issues.push(`Build requirements check failed: ${error.message}`);
    }
    
    console.log('');
  }

  checkGitStatus() {
    console.log('📝 CHECKING GIT STATUS...');
    
    try {
      // Check git status
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      if (gitStatus.trim() === '') {
        console.log('✅ Working directory clean');
      } else {
        console.log('⚠️  Uncommitted changes detected');
        console.log(gitStatus);
      }
      
      // Check current branch
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      console.log(`✅ Current branch: ${currentBranch}`);
      
      // Check remote
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      console.log(`✅ Remote URL: ${remoteUrl}`);
      
      // Check recent commits
      const recentCommits = execSync('git log --oneline -3', { encoding: 'utf8' });
      console.log('✅ Recent commits:');
      console.log(recentCommits);
      
    } catch (error) {
      this.issues.push(`Git status check failed: ${error.message}`);
    }
    
    console.log('');
  }

  generateDiagnosticReport() {
    console.log('📊 DIAGNOSTIC REPORT');
    console.log('===================');
    
    if (this.issues.length === 0) {
      console.log('🎉 No critical issues detected!');
      console.log('\n🔍 DEPLOYMENT TROUBLESHOOTING STEPS:');
      console.log('1. Check Vercel dashboard for build logs');
      console.log('2. Verify project is connected to correct repository');
      console.log('3. Check environment variables in Vercel dashboard');
      console.log('4. Try manual redeploy from Vercel dashboard');
      console.log('5. Check domain configuration');
    } else {
      console.log(`❌ Found ${this.issues.length} issues:`);
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
      
      console.log('\n🔧 RECOMMENDED FIXES:');
      this.generateFixes();
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      projectRoot: this.projectRoot,
      issues: this.issues,
      fixes: this.fixes,
      nextSteps: this.generateNextSteps()
    };
    
    fs.writeFileSync('vercel-deployment-diagnosis.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Detailed report saved to: vercel-deployment-diagnosis.json');
    
    return report;
  }

  generateFixes() {
    this.issues.forEach(issue => {
      if (issue.includes('Missing required file')) {
        console.log('• Create missing files with proper Next.js App Router structure');
      } else if (issue.includes('next.config.js')) {
        console.log('• Fix Next.js configuration syntax');
      } else if (issue.includes('package.json')) {
        console.log('• Update package.json with required scripts and dependencies');
      } else if (issue.includes('API route')) {
        console.log('• Create missing API routes or fix App Router format');
      } else if (issue.includes('node_modules')) {
        console.log('• Run: npm install');
      } else {
        console.log(`• Address: ${issue}`);
      }
    });
  }

  generateNextSteps() {
    const steps = [];
    
    if (this.issues.length > 0) {
      steps.push('Fix identified issues in project structure');
      steps.push('Test build locally: npm run build');
      steps.push('Commit and push fixes');
    }
    
    steps.push('Check Vercel dashboard for deployment status');
    steps.push('Verify environment variables in Vercel');
    steps.push('Manual redeploy from Vercel dashboard');
    steps.push('Test deployment URL');
    
    return steps;
  }
}

// Run diagnosis
async function runVercelDiagnosis() {
  const diagnostic = new VercelDeploymentDiagnostic();
  await diagnostic.runFullDiagnosis();
}

if (require.main === module) {
  runVercelDiagnosis().catch(console.error);
}

module.exports = { VercelDeploymentDiagnostic };