#!/usr/bin/env node
/**
 * PHASE 0 DEPLOYMENT VERIFICATION SCRIPT
 * Comprehensive pre-deployment verification for Phase 0 components
 * Based on Vercel deployment research findings
 */

import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL'
];

const CRITICAL_ENDPOINTS = [
  '/api/student/register',
  '/api/schools/login',
  '/api/schools/validate-code',
  '/api/schools/request-addition',
  '/results',
  '/school/claim'
];

class Phase0DeploymentVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCheck(name, checkFunction) {
    try {
      this.log(`Running ${name}...`);
      await checkFunction();
      this.log(`${name} passed`, 'success');
      this.passed++;
    } catch (error) {
      this.log(`${name} failed: ${error.message}`, 'error');
      this.errors.push({ check: name, error: error.message });
      this.failed++;
    }
  }

  // 1. Environment Variable Validation
  async validateEnvironmentVariables() {
    const missing = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate Supabase URL format
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
      throw new Error('Invalid Supabase URL format');
    }

    // Validate DATABASE_URL for connection pooling
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl.includes(':6543') || !dbUrl.includes('pgbouncer=true')) {
      this.warnings.push('DATABASE_URL should use port 6543 with pgbouncer=true for Vercel deployment');
    }
  }

  // 2. Database Connectivity Test
  async testDatabaseConnection() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test basic connectivity
    const { data, error } = await supabase
      .from('students')
      .select('count')
      .limit(1);

    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    // Test RLS policies
    const anonSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { error: rlsError } = await anonSupabase
      .from('students')
      .select('*')
      .limit(1);

    // RLS should block this query (expected behavior)
    if (!rlsError) {
      this.warnings.push('RLS policies may not be properly configured');
    }
  }

  // 3. Build System Verification
  async verifyBuildSystem() {
    // Check for build artifacts in git
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      if (gitStatus.includes('.next/') || gitStatus.includes('node_modules/')) {
        throw new Error('Build artifacts found in git. Add .next/ and node_modules/ to .gitignore');
      }
    } catch (error) {
      if (!error.message.includes('not a git repository')) {
        throw error;
      }
    }

    // Verify .gitignore exists and contains required entries
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      const requiredEntries = ['.next/', 'node_modules/'];
      const missing = requiredEntries.filter(entry => !gitignore.includes(entry));
      
      if (missing.length > 0) {
        throw new Error(`Missing .gitignore entries: ${missing.join(', ')}`);
      }
    } else {
      throw new Error('.gitignore file not found');
    }

    // Test clean build
    this.log('Testing clean build (this may take a moment)...');
    try {
      execSync('rm -rf .next', { stdio: 'pipe' });
      execSync('npm run build', { stdio: 'pipe' });
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  // 4. API Routes Testing
  async testAPIRoutes() {
    // Start local server for testing
    this.log('Starting local server for API testing...');
    
    const server = execSync('npm run dev &', { stdio: 'pipe' });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      for (const endpoint of CRITICAL_ENDPOINTS) {
        try {
          const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.status === 404) {
            throw new Error(`Endpoint ${endpoint} not found (404)`);
          }

          if (response.status >= 500) {
            throw new Error(`Endpoint ${endpoint} server error (${response.status})`);
          }

          this.log(`Endpoint ${endpoint}: ${response.status} ${response.statusText}`);
        } catch (fetchError) {
          if (fetchError.code === 'ECONNREFUSED') {
            throw new Error('Local server not responding. Check if port 3000 is available.');
          }
          throw fetchError;
        }
      }
    } finally {
      // Kill the dev server
      try {
        execSync('pkill -f "next dev"', { stdio: 'pipe' });
      } catch (error) {
        // Ignore errors when killing the process
      }
    }
  }

  // 5. TypeScript and Linting
  async validateCodeQuality() {
    // TypeScript check
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
    } catch (error) {
      throw new Error(`TypeScript errors found: ${error.message}`);
    }

    // Linting check
    try {
      execSync('npm run lint', { stdio: 'pipe' });
    } catch (error) {
      this.warnings.push(`Linting issues found: ${error.message}`);
    }
  }

  // 6. Phase 0 Specific Schema Validation
  async validatePhase0Schema() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const requiredTables = ['students', 'schools', 'assessments', 'results'];
    
    for (const table of requiredTables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && error.code === '42P01') {
        throw new Error(`Required table '${table}' not found in database`);
      }
    }

    // Check for required columns in students table
    const { data: studentColumns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'students' });

    if (columnError) {
      this.warnings.push('Could not verify student table schema');
    } else {
      const requiredColumns = ['id', 'email', 'school_id', 'created_at'];
      const existingColumns = studentColumns?.map(col => col.column_name) || [];
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing columns in students table: ${missingColumns.join(', ')}`);
      }
    }
  }

  // 7. Deployment Configuration Check
  async validateDeploymentConfig() {
    // Check package.json scripts
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (!packageJson.scripts?.build) {
      throw new Error('Missing build script in package.json');
    }

    // Check for Prisma generate in build script if Prisma is used
    if (packageJson.dependencies?.prisma || packageJson.devDependencies?.prisma) {
      if (!packageJson.scripts.build.includes('prisma generate')) {
        this.warnings.push('Build script should include "prisma generate" for Vercel deployment');
      }
    }

    // Check Next.js configuration
    if (fs.existsSync('next.config.js')) {
      const nextConfig = fs.readFileSync('next.config.js', 'utf8');
      
      // Check for common Vercel-incompatible configurations
      if (nextConfig.includes('output: "standalone"')) {
        this.warnings.push('Standalone output may not be necessary for Vercel deployment');
      }
    }
  }

  // Main execution function
  async run() {
    console.log('🎯 PHASE 0 DEPLOYMENT VERIFICATION');
    console.log('==================================');
    console.log('Based on comprehensive Vercel deployment research\n');

    const checks = [
      ['Environment Variables', () => this.validateEnvironmentVariables()],
      ['Database Connection', () => this.testDatabaseConnection()],
      ['Build System', () => this.verifyBuildSystem()],
      ['API Routes', () => this.testAPIRoutes()],
      ['Code Quality', () => this.validateCodeQuality()],
      ['Phase 0 Schema', () => this.validatePhase0Schema()],
      ['Deployment Config', () => this.validateDeploymentConfig()]
    ];

    for (const [name, checkFn] of checks) {
      await this.runCheck(name, checkFn);
    }

    // Summary
    console.log('\n📊 VERIFICATION SUMMARY');
    console.log('======================');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(({ check, error }) => {
        console.log(`   • ${check}: ${error}`);
      });
      
      console.log('\n🚨 DEPLOYMENT NOT RECOMMENDED');
      console.log('Fix the above errors before deploying to Vercel.');
      process.exit(1);
    }

    console.log('\n🚀 DEPLOYMENT VERIFICATION COMPLETE');
    console.log('Phase 0 is ready for Vercel deployment!');
    
    if (this.warnings.length > 0) {
      console.log('\nConsider addressing warnings for optimal deployment.');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new Phase0DeploymentVerifier();
  verifier.run().catch(error => {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  });
}

export default Phase0DeploymentVerifier;