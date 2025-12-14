#!/usr/bin/env node
// scripts/update-environment-variables.js
// Task 10.2: Environment variable management for Enhanced RAG deployment

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Environment Variable Manager
 * Manages environment variables for different deployment environments
 */
class EnvironmentVariableManager {
  constructor() {
    this.environments = ['development', 'staging', 'production'];
    this.requiredVariables = this.getRequiredVariables();
  }

  /**
   * Get required environment variables for Enhanced RAG
   */
  getRequiredVariables() {
    return {
      // Core Application
      core: [
        'NODE_ENV',
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'OPENAI_API_KEY'
      ],

      // Enhanced RAG Feature Flags
      featureFlags: [
        'RAG_FEATURE_ENHANCED_RAG_FILTERING',
        'RAG_FEATURE_FALLBACK_CAREERS',
        'RAG_FEATURE_PERFORMANCE_MONITORING',
        'RAG_FEATURE_SUBJECT_CATEGORY_PRIORITIZATION',
        'RAG_FEATURE_PROFILE_COMPLEXITY_ANALYSIS',
        'RAG_FEATURE_ENHANCED_ERROR_HANDLING',
        'RAG_FEATURE_ENHANCED_SAFETY_VALIDATION'
      ],

      // Performance Configuration
      performance: [
        'RAG_PERFORMANCE_TIMEOUT',
        'RAG_CACHE_TIMEOUT',
        'RAG_MAX_CONCURRENT_REQUESTS',
        'RAG_MAX_CAREER_COUNT',
        'RAG_MIN_CAREER_COUNT'
      ],

      // Deployment Configuration
      deployment: [
        'RAG_DEPLOYMENT_ENV',
        'DEPLOYMENT_STAGE',
        'DEPLOYMENT_ROLLOUT_PERCENTAGE',
        'DEPLOYMENT_AUTO_ADVANCE',
        'DEPLOYMENT_HEALTH_CHECK_INTERVAL'
      ],

      // Monitoring and Analytics
      monitoring: [
        'RAG_ENABLE_DETAILED_LOGGING',
        'RAG_ANALYTICS_RETENTION_DAYS',
        'RAG_PERFORMANCE_ALERTS',
        'RAG_DEBUG_MODE'
      ],

      // Safety and Compliance
      safety: [
        'RAG_STRICT_SAFETY_MODE',
        'RAG_REQUIRE_VERIFICATION_FOOTER'
      ],

      // Rollback Configuration
      rollback: [
        'ROLLBACK_ENABLED',
        'ROLLBACK_THRESHOLD_ERROR_RATE',
        'ROLLBACK_THRESHOLD_RESPONSE_TIME',
        'ROLLBACK_AUTOMATIC'
      ],

      // Notifications (Optional)
      notifications: [
        'SLACK_WEBHOOK_URL',
        'NOTIFICATION_EMAIL'
      ],

      // Database Configuration
      database: [
        'DATABASE_POOL_SIZE',
        'DATABASE_TIMEOUT',
        'DATABASE_RETRY_ATTEMPTS'
      ],

      // Security Configuration
      security: [
        'CORS_ORIGINS',
        'API_RATE_LIMIT',
        'API_RATE_WINDOW'
      ],

      // Feature Flag Safeguards
      safeguards: [
        'RAG_SAFEGUARD_MAX_RESPONSE_TIME',
        'RAG_SAFEGUARD_MIN_CAREER_COUNT',
        'RAG_SAFEGUARD_MAX_MEMORY_MB',
        'RAG_SAFEGUARD_MIN_CONFIDENCE'
      ]
    };
  }

  /**
   * Update environment variables for specific environment
   */
  async updateEnvironmentVariables(environment, updates = {}, options = {}) {
    console.log(`🔧 Updating environment variables for ${environment}`);
    console.log('=' .repeat(50));

    const {
      dryRun = false,
      backup = true,
      validate = true
    } = options;

    try {
      // Step 1: Load current environment file
      const envFile = `.env.${environment}`;
      const exampleFile = `.env.${environment}.example`;
      
      let currentEnv = {};
      if (existsSync(envFile)) {
        currentEnv = this.parseEnvFile(envFile);
        
        if (backup && !dryRun) {
          await this.backupEnvironmentFile(envFile);
        }
      }

      // Step 2: Load example file for reference
      let exampleEnv = {};
      if (existsSync(exampleFile)) {
        exampleEnv = this.parseEnvFile(exampleFile);
      }

      // Step 3: Merge updates with current environment
      const updatedEnv = { ...currentEnv, ...updates };

      // Step 4: Apply environment-specific defaults
      const finalEnv = this.applyEnvironmentDefaults(environment, updatedEnv, exampleEnv);

      // Step 5: Validate configuration
      if (validate) {
        await this.validateEnvironmentConfiguration(environment, finalEnv);
      }

      // Step 6: Write updated environment file
      if (!dryRun) {
        await this.writeEnvironmentFile(envFile, finalEnv);
        console.log(`✅ Environment file updated: ${envFile}`);
      } else {
        console.log(`🔍 DRY RUN: Would update ${envFile}`);
        this.previewChanges(currentEnv, finalEnv);
      }

      return finalEnv;

    } catch (error) {
      console.error(`❌ Failed to update environment variables: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parse environment file
   */
  parseEnvFile(filePath) {
    const content = readFileSync(filePath, 'utf8');
    const env = {};
    
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        env[key.trim()] = value;
      }
    }
    
    return env;
  }

  /**
   * Apply environment-specific defaults
   */
  applyEnvironmentDefaults(environment, currentEnv, exampleEnv) {
    const defaults = this.getEnvironmentDefaults(environment);
    const finalEnv = { ...exampleEnv, ...currentEnv };

    // Apply defaults for missing values
    for (const [key, defaultValue] of Object.entries(defaults)) {
      if (!finalEnv[key]) {
        finalEnv[key] = defaultValue;
      }
    }

    return finalEnv;
  }

  /**
   * Get environment-specific defaults
   */
  getEnvironmentDefaults(environment) {
    const commonDefaults = {
      RAG_FEATURE_PERFORMANCE_MONITORING: '100',
      RAG_FEATURE_ENHANCED_SAFETY_VALIDATION: '100',
      RAG_STRICT_SAFETY_MODE: 'true',
      RAG_REQUIRE_VERIFICATION_FOOTER: 'true',
      RAG_MAX_CAREER_COUNT: '5',
      RAG_MIN_CAREER_COUNT: '3',
      ROLLBACK_ENABLED: 'true',
      ROLLBACK_THRESHOLD_ERROR_RATE: '0.05',
      ROLLBACK_THRESHOLD_RESPONSE_TIME: '8000',
      ROLLBACK_AUTOMATIC: 'true',
      DATABASE_POOL_SIZE: '10',
      DATABASE_TIMEOUT: '30000',
      DATABASE_RETRY_ATTEMPTS: '3',
      API_RATE_LIMIT: '100',
      API_RATE_WINDOW: '900000',
      RAG_SAFEGUARD_MAX_RESPONSE_TIME: '5000',
      RAG_SAFEGUARD_MIN_CAREER_COUNT: '3',
      RAG_SAFEGUARD_MAX_MEMORY_MB: '100',
      RAG_SAFEGUARD_MIN_CONFIDENCE: '0.4'
    };

    const environmentDefaults = {
      development: {
        ...commonDefaults,
        NODE_ENV: 'development',
        RAG_DEPLOYMENT_ENV: 'development',
        RAG_FEATURE_ENHANCED_RAG_FILTERING: '100',
        RAG_FEATURE_FALLBACK_CAREERS: '100',
        RAG_FEATURE_SUBJECT_CATEGORY_PRIORITIZATION: '100',
        RAG_FEATURE_PROFILE_COMPLEXITY_ANALYSIS: '100',
        RAG_FEATURE_ENHANCED_ERROR_HANDLING: '100',
        RAG_PERFORMANCE_TIMEOUT: '8000',
        RAG_CACHE_TIMEOUT: '180000',
        RAG_MAX_CONCURRENT_REQUESTS: '5',
        RAG_ENABLE_DETAILED_LOGGING: 'true',
        RAG_DEBUG_MODE: 'true',
        DEPLOYMENT_STAGE: 'development',
        DEPLOYMENT_ROLLOUT_PERCENTAGE: '100',
        DEPLOYMENT_AUTO_ADVANCE: 'true',
        CORS_ORIGINS: '*'
      },

      staging: {
        ...commonDefaults,
        NODE_ENV: 'staging',
        RAG_DEPLOYMENT_ENV: 'staging',
        RAG_FEATURE_ENHANCED_RAG_FILTERING: '100',
        RAG_FEATURE_FALLBACK_CAREERS: '100',
        RAG_FEATURE_SUBJECT_CATEGORY_PRIORITIZATION: '50',
        RAG_FEATURE_PROFILE_COMPLEXITY_ANALYSIS: '50',
        RAG_FEATURE_ENHANCED_ERROR_HANDLING: '100',
        RAG_PERFORMANCE_TIMEOUT: '8000',
        RAG_CACHE_TIMEOUT: '180000',
        RAG_MAX_CONCURRENT_REQUESTS: '5',
        RAG_ENABLE_DETAILED_LOGGING: 'true',
        RAG_DEBUG_MODE: 'true',
        DEPLOYMENT_STAGE: 'staging',
        DEPLOYMENT_ROLLOUT_PERCENTAGE: '100',
        DEPLOYMENT_AUTO_ADVANCE: 'true'
      },

      production: {
        ...commonDefaults,
        NODE_ENV: 'production',
        RAG_DEPLOYMENT_ENV: 'production_canary',
        RAG_FEATURE_ENHANCED_RAG_FILTERING: '10',
        RAG_FEATURE_FALLBACK_CAREERS: '10',
        RAG_FEATURE_SUBJECT_CATEGORY_PRIORITIZATION: '0',
        RAG_FEATURE_PROFILE_COMPLEXITY_ANALYSIS: '0',
        RAG_FEATURE_ENHANCED_ERROR_HANDLING: '100',
        RAG_PERFORMANCE_TIMEOUT: '5000',
        RAG_CACHE_TIMEOUT: '300000',
        RAG_MAX_CONCURRENT_REQUESTS: '10',
        RAG_ENABLE_DETAILED_LOGGING: 'true',
        RAG_ANALYTICS_RETENTION_DAYS: '30',
        RAG_PERFORMANCE_ALERTS: 'true',
        DEPLOYMENT_STAGE: 'canary',
        DEPLOYMENT_ROLLOUT_PERCENTAGE: '10',
        DEPLOYMENT_AUTO_ADVANCE: 'false',
        DEPLOYMENT_HEALTH_CHECK_INTERVAL: '300000'
      }
    };

    return environmentDefaults[environment] || commonDefaults;
  }

  /**
   * Validate environment configuration
   */
  async validateEnvironmentConfiguration(environment, env) {
    console.log(`🔍 Validating ${environment} environment configuration...`);

    const errors = [];
    const warnings = [];

    // Check required variables
    const allRequired = Object.values(this.requiredVariables).flat();
    const missing = allRequired.filter(key => !env[key]);
    
    if (missing.length > 0) {
      errors.push(`Missing required variables: ${missing.join(', ')}`);
    }

    // Validate specific variable formats
    for (const [key, value] of Object.entries(env)) {
      try {
        this.validateEnvironmentVariable(key, value, environment);
      } catch (error) {
        errors.push(`${key}: ${error.message}`);
      }
    }

    // Environment-specific validations
    if (environment === 'production') {
      if (env.RAG_DEBUG_MODE === 'true') {
        warnings.push('RAG_DEBUG_MODE should be false in production');
      }
      
      if (env.CORS_ORIGINS === '*') {
        warnings.push('CORS_ORIGINS should not be * in production');
      }
    }

    if (warnings.length > 0) {
      console.log('⚠️ Warnings:');
      warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join('; ')}`);
    }

    console.log('✅ Environment configuration validated');
  }

  /**
   * Validate individual environment variable
   */
  validateEnvironmentVariable(key, value, environment) {
    if (!value) return; // Skip empty values

    switch (key) {
      case 'NEXT_PUBLIC_SUPABASE_URL':
        if (!value.startsWith('https://') || !value.includes('supabase.co')) {
          throw new Error('Must be a valid Supabase HTTPS URL');
        }
        break;

      case 'OPENAI_API_KEY':
        if (!value.startsWith('sk-') || value.length < 20) {
          throw new Error('Must be a valid OpenAI API key');
        }
        break;

      case 'RAG_PERFORMANCE_TIMEOUT':
      case 'RAG_CACHE_TIMEOUT':
      case 'DATABASE_TIMEOUT':
        const timeout = parseInt(value);
        if (isNaN(timeout) || timeout < 1000) {
          throw new Error('Must be a valid timeout in milliseconds (≥1000)');
        }
        break;

      case 'RAG_MAX_CAREER_COUNT':
      case 'RAG_MIN_CAREER_COUNT':
        const count = parseInt(value);
        if (isNaN(count) || count < 1 || count > 10) {
          throw new Error('Must be a number between 1 and 10');
        }
        break;

      case 'DEPLOYMENT_ROLLOUT_PERCENTAGE':
        const percentage = parseInt(value);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
          throw new Error('Must be a percentage between 0 and 100');
        }
        break;

      case 'ROLLBACK_THRESHOLD_ERROR_RATE':
        const errorRate = parseFloat(value);
        if (isNaN(errorRate) || errorRate < 0 || errorRate > 1) {
          throw new Error('Must be a decimal between 0 and 1');
        }
        break;
    }
  }

  /**
   * Backup environment file
   */
  async backupEnvironmentFile(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;
    
    try {
      const content = readFileSync(filePath, 'utf8');
      writeFileSync(backupPath, content);
      console.log(`📄 Backup created: ${backupPath}`);
    } catch (error) {
      console.warn(`⚠️ Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Write environment file
   */
  async writeEnvironmentFile(filePath, env) {
    const lines = [];
    
    // Add header
    lines.push(`# Enhanced RAG Filtering - ${filePath.split('.')[1].toUpperCase()} Environment`);
    lines.push(`# Generated on ${new Date().toISOString()}`);
    lines.push('');

    // Group variables by category
    const categories = {
      'Core Application': this.requiredVariables.core,
      'Enhanced RAG Feature Flags': this.requiredVariables.featureFlags,
      'Performance Configuration': this.requiredVariables.performance,
      'Deployment Configuration': this.requiredVariables.deployment,
      'Monitoring and Analytics': this.requiredVariables.monitoring,
      'Safety and Compliance': this.requiredVariables.safety,
      'Rollback Configuration': this.requiredVariables.rollback,
      'Database Configuration': this.requiredVariables.database,
      'Security Configuration': this.requiredVariables.security,
      'Feature Flag Safeguards': this.requiredVariables.safeguards,
      'Notifications': this.requiredVariables.notifications
    };

    for (const [category, variables] of Object.entries(categories)) {
      lines.push(`# ${category}`);
      
      for (const variable of variables) {
        if (env[variable] !== undefined) {
          lines.push(`${variable}=${env[variable]}`);
        }
      }
      
      lines.push('');
    }

    // Add any additional variables not in categories
    const categorizedVars = Object.values(categories).flat();
    const additionalVars = Object.keys(env).filter(key => !categorizedVars.includes(key));
    
    if (additionalVars.length > 0) {
      lines.push('# Additional Configuration');
      for (const variable of additionalVars) {
        lines.push(`${variable}=${env[variable]}`);
      }
    }

    writeFileSync(filePath, lines.join('\n'));
  }

  /**
   * Preview changes
   */
  previewChanges(currentEnv, newEnv) {
    console.log('\n📋 Preview of Changes:');
    console.log('-'.repeat(40));

    const allKeys = new Set([...Object.keys(currentEnv), ...Object.keys(newEnv)]);
    
    for (const key of allKeys) {
      const currentValue = currentEnv[key];
      const newValue = newEnv[key];
      
      if (currentValue !== newValue) {
        if (!currentValue) {
          console.log(`   + ${key}=${newValue} (new)`);
        } else if (!newValue) {
          console.log(`   - ${key}=${currentValue} (removed)`);
        } else {
          console.log(`   ~ ${key}=${currentValue} → ${newValue} (changed)`);
        }
      }
    }
  }

  /**
   * Generate environment template
   */
  async generateEnvironmentTemplate(environment) {
    console.log(`📝 Generating environment template for ${environment}`);
    
    const defaults = this.getEnvironmentDefaults(environment);
    const templatePath = `.env.${environment}.template`;
    
    await this.writeEnvironmentFile(templatePath, defaults);
    console.log(`✅ Template generated: ${templatePath}`);
    
    return templatePath;
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const envManager = new EnvironmentVariableManager();

  try {
    switch (command) {
      case 'update':
        {
          const environment = args[1] || 'production';
          const dryRun = args.includes('--dry-run');
          const noBackup = args.includes('--no-backup');
          const noValidate = args.includes('--no-validate');
          
          await envManager.updateEnvironmentVariables(environment, {}, {
            dryRun,
            backup: !noBackup,
            validate: !noValidate
          });
        }
        break;

      case 'template':
        {
          const environment = args[1] || 'production';
          await envManager.generateEnvironmentTemplate(environment);
        }
        break;

      case 'validate':
        {
          const environment = args[1] || 'production';
          const envFile = `.env.${environment}`;
          
          if (!existsSync(envFile)) {
            throw new Error(`Environment file ${envFile} not found`);
          }
          
          const env = envManager.parseEnvFile(envFile);
          await envManager.validateEnvironmentConfiguration(environment, env);
        }
        break;

      default:
        console.log('Environment Variable Manager for Enhanced RAG');
        console.log('');
        console.log('Usage:');
        console.log('  npm run env:update [environment] [options]    - Update environment variables');
        console.log('  npm run env:template [environment]            - Generate environment template');
        console.log('  npm run env:validate [environment]            - Validate environment configuration');
        console.log('');
        console.log('Options:');
        console.log('  --dry-run      Show what would change without updating');
        console.log('  --no-backup    Skip creating backup of existing file');
        console.log('  --no-validate  Skip validation of updated configuration');
        console.log('');
        console.log('Examples:');
        console.log('  npm run env:update production --dry-run');
        console.log('  npm run env:template staging');
        console.log('  npm run env:validate production');
        break;
    }
  } catch (error) {
    console.error('❌ Environment variable command failed:', error.message);
    process.exit(1);
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { EnvironmentVariableManager };