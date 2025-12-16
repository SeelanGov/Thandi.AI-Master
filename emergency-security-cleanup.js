#!/usr/bin/env node

/**
 * EMERGENCY Security Cleanup Script
 * Removes all exposed secrets and sensitive data from the codebase
 */

import fs from 'fs';
import path from 'path';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBold(message, color = 'white') {
  console.log(`${colors.bold}${colors[color]}${message}${colors.reset}`);
}

class SecurityCleaner {
  constructor() {
    this.cleanedFiles = [];
    this.removedFiles = [];
  }

  // Remove .env.local file (should never be committed)
  removeEnvLocal() {
    const envLocalPath = '.env.local';
    if (fs.existsSync(envLocalPath)) {
      fs.unlinkSync(envLocalPath);
      this.removedFiles.push(envLocalPath);
      log(`✅ Removed: ${envLocalPath}`, 'green');
    }
  }

  // Clean hardcoded secrets from files
  cleanFile(filePath, replacements) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      replacements.forEach(({ pattern, replacement, description }) => {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          modified = true;
          log(`   🔧 ${description}`, 'yellow');
        }
      });

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.cleanedFiles.push(filePath);
        log(`✅ Cleaned: ${filePath}`, 'green');
      }
    } catch (error) {
      log(`❌ Error cleaning ${filePath}: ${error.message}`, 'red');
    }
  }

  run() {
    logBold('🚨 EMERGENCY SECURITY CLEANUP', 'red');
    log('Removing all exposed secrets and sensitive data...\n', 'yellow');

    // 1. Remove .env.local
    log('1. Removing environment files...', 'blue');
    this.removeEnvLocal();

    // 2. Clean test files - replace hardcoded keys with mock values
    log('\n2. Cleaning test files...', 'blue');
    const testReplacements = [
      {
        pattern: /process\.env\.SUPABASE_SERVICE_ROLE_KEY = '[^']+'/g,
        replacement: "process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-supabase-key'",
        description: 'Replaced hardcoded Supabase key with mock'
      },
      {
        pattern: /process\.env\.OPENAI_API_KEY = '[^']+'/g,
        replacement: "process.env.OPENAI_API_KEY = 'mock-openai-key'",
        description: 'Replaced hardcoded OpenAI key with mock'
      },
      {
        pattern: /process\.env\.NEXT_PUBLIC_SUPABASE_URL = 'https:\/\/[^']+'/g,
        replacement: "process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co'",
        description: 'Replaced hardcoded Supabase URL with mock'
      }
    ];

    const testFiles = [
      'lib/rag/__tests__/career-matcher.property.test.js',
      'lib/rag/__tests__/comprehensive-test-suite.test.js',
      'lib/rag/__tests__/diverse-profile-testing.test.js',
      'lib/rag/__tests__/end-to-end-validation.test.js',
      'lib/rag/__tests__/performance-validation.test.js'
    ];

    testFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.cleanFile(file, testReplacements);
      }
    });

    // 3. Clean setup scripts - remove hardcoded keys
    log('\n3. Cleaning setup scripts...', 'blue');
    
    // Remove setup-vercel-llm-env.js entirely (contains hardcoded keys)
    if (fs.existsSync('setup-vercel-llm-env.js')) {
      fs.unlinkSync('setup-vercel-llm-env.js');
      this.removedFiles.push('setup-vercel-llm-env.js');
      log('✅ Removed: setup-vercel-llm-env.js (contained hardcoded keys)', 'green');
    }

    // Clean check-vercel-env-vars.js
    if (fs.existsSync('check-vercel-env-vars.js')) {
      const checkVercelReplacements = [
        {
          pattern: /gsk_[a-zA-Z0-9]{52}/g,
          replacement: 'gsk_YOUR_GROQ_API_KEY_HERE',
          description: 'Replaced GROQ API key with placeholder'
        },
        {
          pattern: /sk-ant-api[0-9]{2}-[a-zA-Z0-9_-]{95}/g,
          replacement: 'sk-ant-api03-YOUR_ANTHROPIC_API_KEY_HERE',
          description: 'Replaced Anthropic API key with placeholder'
        }
      ];
      this.cleanFile('check-vercel-env-vars.js', checkVercelReplacements);
    }

    // 4. Clean result files that may contain URLs
    log('\n4. Cleaning result files...', 'blue');
    const resultFiles = [
      'api-connection-test-results.json',
      'deployment-verification-results.json'
    ];

    const urlReplacements = [
      {
        pattern: /"https:\/\/pvvnxupuukuefajypovz\.supabase\.co"/g,
        replacement: '"https://YOUR_PROJECT.supabase.co"',
        description: 'Replaced Supabase URL with placeholder'
      }
    ];

    resultFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.cleanFile(file, urlReplacements);
      }
    });

    // 5. Clean backup files
    log('\n5. Cleaning backup files...', 'blue');
    if (fs.existsSync('backups')) {
      const backupFiles = fs.readdirSync('backups');
      backupFiles.forEach(file => {
        const filePath = path.join('backups', file);
        if (file.endsWith('.js')) {
          this.cleanFile(filePath, urlReplacements);
        }
      });
    }

    // 6. Clean script files
    log('\n6. Cleaning script files...', 'blue');
    const scriptFiles = [
      'scripts/debug-vercel-prod.js',
      'scripts/test-full-stack-proof.js',
      'scripts/test-requirements-engine.js',
      'scripts/verify-vercel-env.js'
    ];

    scriptFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.cleanFile(file, urlReplacements);
      }
    });

    // 7. Update .gitignore
    log('\n7. Updating .gitignore...', 'blue');
    this.updateGitignore();

    // Summary
    logBold('\n🎉 SECURITY CLEANUP COMPLETE', 'green');
    log(`✅ Files cleaned: ${this.cleanedFiles.length}`, 'green');
    log(`✅ Files removed: ${this.removedFiles.length}`, 'green');
    
    if (this.cleanedFiles.length > 0) {
      log('\nCleaned files:', 'blue');
      this.cleanedFiles.forEach(file => log(`   • ${file}`, 'white'));
    }
    
    if (this.removedFiles.length > 0) {
      log('\nRemoved files:', 'blue');
      this.removedFiles.forEach(file => log(`   • ${file}`, 'white'));
    }

    logBold('\n🔒 NEXT STEPS:', 'cyan');
    log('1. Run security audit again to verify cleanup', 'white');
    log('2. Set up Vercel environment variables manually', 'white');
    log('3. Use .env.example for documentation', 'white');
    log('4. Never commit .env.local or real API keys', 'white');
  }

  updateGitignore() {
    const gitignorePath = '.gitignore';
    let gitignoreContent = '';
    
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    const requiredEntries = [
      '.env.staging',
      '.vercel/',
      'security-audit-pre-commit.js',
      'emergency-security-cleanup.js'
    ];

    let modified = false;
    requiredEntries.forEach(entry => {
      if (!gitignoreContent.includes(entry)) {
        gitignoreContent += `\n${entry}`;
        modified = true;
        log(`   Added to .gitignore: ${entry}`, 'yellow');
      }
    });

    if (modified) {
      fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
      log('✅ Updated .gitignore', 'green');
    }
  }
}

// Run the cleanup
const cleaner = new SecurityCleaner();
cleaner.run();