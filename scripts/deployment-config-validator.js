#!/usr/bin/env node
// scripts/deployment-config-validator.js
// Task 10.2: Configuration validation for Enhanced RAG deployment

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Deployment Configuration Validator
 * Validates all configuration files and environment variables before deployment
 */
class DeploymentConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validationResults = {};
  }

  /**
   * Run complete validation suite
   */
  async validateAll(environment = 'production') {
    console.log('🔍 Validating Deployment Configuration');
    console.log('=' .repeat(50));
    
    const validations = [
      { name: 'Environment Variables', fn: () => this.validateEnvironmentVariables(environment) },
      { name: 'Feature Flag Configuration', fn: () => this.validateFeatureFlags() },
      { name: 'Database Configuration', fn: () => this.validateDatabaseConfig() },
      { name: 'API Configuration', fn: () => this.validateAPIConfig() },
      { name: 'Security Configuration', fn: () => this.validateSecurityConfig() },
      { name: 'Performance Configuration', fn: () => this.validatePerformanceConfig() },
      { name: 'Monitoring Configuration', fn: () => this.validateMonitoringConfig() },
      { name: 'Rollback Configuration', fn: () => this.validateRollbackConfig() }
    ];

    for (const validation of validations) {
      try {
        console.log(`\n📋 Validating ${validation.name}...`);
        const result = await validation.fn();
        this.validationResults[validation.name] = { status: 'passed', ...result };
        console.log(`   ✅ ${validation.name} validation passed`);
      } catch (error) {
        this.errors.push(`${validation.name}: ${error.message}`);
        this.validationResults[validation.name] = { status: 'failed', error: error.message };
        console.error(`   ❌ ${validation.name} validation failed: ${error.message}`);
      }
    }

    return this.generateValidationReport();
  }

  /**
   * Validate environment variables
   */
  validateEnvironmentVariables(environment) {
    const envFile = `.env.${environment}`;
    const exampleFile = `.env.${environment}.example`;
    
    // Check if example file exists
    if (!existsSync(exampleFile)) {
      throw new Error(`Example environment file ${exampleFile} not found`);
    }

    // Load example file to get required variables
    const exampleContent = readFileSync(exampleFile, 'utf8');
    const requiredVars = this.extractRequiredVariables(exampleContent);
    
    // Check if actual env file exists
    if (!existsSync(envFile)) {
      this.warnings.push(`Environment file ${envFile} not found, using process.env`);
    }

    // Validate each required variable
    const missingVars = [];
    const invalidVars = [];

    for (const varName of requiredVars) {
      const value = process.env[varName];
      
      if (!value) {
        missingVars.push(varName);
        continue;
      }

      // Validate specific variable formats
      try {
        this.validateEnvironmentVariable(varName, value);
      } catch (error) {
        invalidVars.push(`${varName}: ${error.message}`);
      }
    }

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    if (invalidVars.length > 0) {
      throw new Error(`Invalid environment variables: ${invalidVars.join('; ')}`);
    }

    return {
      requiredVariables: requiredVars.length,
      validatedVariables: requiredVars.length - missingVars.length - invalidVars.length
    };
  }

  /**
   * Extract required variables from example file
   */
  extractRequiredVariables(content) {
    const lines = content.split('\n');
    const variables = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const varName = trimmed.split('=')[0].trim();
        if (varName) {
          variables.push(varName);
        }
      }
    }
    
    return variables;
  }

  /**
   * Validate individual environment variable
   */
  validateEnvironmentVariable(name, value) {
    switch (name) {
      case 'NEXT_PUBLIC_SUPABASE_URL':
      case 'SUPABASE_URL':
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
        
      case 'SLACK_WEBHOOK_URL':
        if (value && !value.startsWith('https://hooks.slack.com/')) {
          throw new Error('Must be a valid Slack webhook URL');
        }
        break;
        
      case 'NOTIFICATION_EMAIL':
        if (value && !value.includes('@')) {
          throw new Error('Must be a valid email address');
        }
        break;
    }
  }

  /**
   * Validate feature flag configuration
   */
  validateFeatureFlags() {
    const requiredFlags = [
      'RAG_FEATURE_ENHANCED_RAG_FILTERING',
      'RAG_FEATURE_FALLBACK_CAREERS',
      'RAG_FEATURE_PERFORMANCE_MONITORING',
      'RAG_FEATURE_ENHANCED_SAFETY_VALIDATION'
    ];

    const missingFlags = [];
    const invalidFlags = [];

    for (const flag of requiredFlags) {
      const value = process.env[flag];
      
      if (value === undefined) {
        missingFlags.push(flag);
        continue;
      }

      // Validate flag value (should be 0-100 or true/false)
      const numValue = parseInt(value);
      if (value !== 'true' && value !== 'false' && (isNaN(numValue) || numValue < 0 || numValue > 100)) {
        invalidFlags.push(`${flag}: must be true/false or 0-100`);
      }
    }

    if (missingFlags.length > 0) {
      throw new Error(`Missing feature flags: ${missingFlags.join(', ')}`);
    }

    if (invalidFlags.length > 0) {
      throw new Error(`Invalid feature flags: ${invalidFlags.join('; ')}`);
    }

    return {
      totalFlags: requiredFlags.length,
      validFlags: requiredFlags.length - invalidFlags.length
    };
  }

  /**
   * Validate database configuration
   */
  validateDatabaseConfig() {
    const requiredConfig = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingConfig = requiredConfig.filter(key => !process.env[key]);
    
    if (missingConfig.length > 0) {
      throw new Error(`Missing database configuration: ${missingConfig.join(', ')}`);
    }

    // Validate connection pool settings
    const poolSize = process.env.DATABASE_POOL_SIZE;
    if (poolSize && (isNaN(parseInt(poolSize)) || parseInt(poolSize) < 1)) {
      throw new Error('DATABASE_POOL_SIZE must be a positive integer');
    }

    const timeout = process.env.DATABASE_TIMEOUT;
    if (timeout && (isNaN(parseInt(timeout)) || parseInt(timeout) < 1000)) {
      throw new Error('DATABASE_TIMEOUT must be at least 1000ms');
    }

    return {
      connectionConfigured: true,
      poolSize: poolSize || 'default',
      timeout: timeout || 'default'
    };
  }

  /**
   * Validate API configuration
   */
  validateAPIConfig() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }

    // Validate rate limiting
    const rateLimit = process.env.API_RATE_LIMIT;
    if (rateLimit && (isNaN(parseInt(rateLimit)) || parseInt(rateLimit) < 1)) {
      throw new Error('API_RATE_LIMIT must be a positive integer');
    }

    const rateWindow = process.env.API_RATE_WINDOW;
    if (rateWindow && (isNaN(parseInt(rateWindow)) || parseInt(rateWindow) < 1000)) {
      throw new Error('API_RATE_WINDOW must be at least 1000ms');
    }

    return {
      apiKeyConfigured: true,
      rateLimitConfigured: !!rateLimit,
      rateWindowConfigured: !!rateWindow
    };
  }

  /**
   * Validate security configuration
   */
  validateSecurityConfig() {
    const corsOrigins = process.env.CORS_ORIGINS;
    if (corsOrigins && corsOrigins !== '*') {
      const origins = corsOrigins.split(',');
      for (const origin of origins) {
        if (!origin.trim().startsWith('https://') && origin.trim() !== 'http://localhost:3000') {
          this.warnings.push(`CORS origin ${origin.trim()} should use HTTPS in production`);
        }
      }
    }

    // Validate strict safety mode
    const strictMode = process.env.RAG_STRICT_SAFETY_MODE;
    if (strictMode !== 'true') {
      this.warnings.push('RAG_STRICT_SAFETY_MODE should be true in production');
    }

    return {
      corsConfigured: !!corsOrigins,
      strictSafetyMode: strictMode === 'true'
    };
  }

  /**
   * Validate performance configuration
   */
  validatePerformanceConfig() {
    const timeout = process.env.RAG_PERFORMANCE_TIMEOUT;
    if (!timeout) {
      throw new Error('RAG_PERFORMANCE_TIMEOUT is required');
    }

    const timeoutMs = parseInt(timeout);
    if (isNaN(timeoutMs) || timeoutMs < 1000 || timeoutMs > 10000) {
      throw new Error('RAG_PERFORMANCE_TIMEOUT must be between 1000 and 10000ms');
    }

    const cacheTimeout = process.env.RAG_CACHE_TIMEOUT;
    if (cacheTimeout) {
      const cacheMs = parseInt(cacheTimeout);
      if (isNaN(cacheMs) || cacheMs < 60000) {
        throw new Error('RAG_CACHE_TIMEOUT must be at least 60000ms (1 minute)');
      }
    }

    const maxConcurrent = process.env.RAG_MAX_CONCURRENT_REQUESTS;
    if (maxConcurrent) {
      const concurrent = parseInt(maxConcurrent);
      if (isNaN(concurrent) || concurrent < 1 || concurrent > 100) {
        throw new Error('RAG_MAX_CONCURRENT_REQUESTS must be between 1 and 100');
      }
    }

    return {
      timeoutConfigured: true,
      cacheConfigured: !!cacheTimeout,
      concurrencyConfigured: !!maxConcurrent
    };
  }

  /**
   * Validate monitoring configuration
   */
  validateMonitoringConfig() {
    const enabledLogging = process.env.RAG_ENABLE_DETAILED_LOGGING;
    const performanceAlerts = process.env.RAG_PERFORMANCE_ALERTS;
    
    // Check notification configuration
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    const notificationEmail = process.env.NOTIFICATION_EMAIL;
    
    if (!slackWebhook && !notificationEmail) {
      this.warnings.push('No notification channels configured (SLACK_WEBHOOK_URL or NOTIFICATION_EMAIL)');
    }

    return {
      detailedLogging: enabledLogging === 'true',
      performanceAlerts: performanceAlerts === 'true',
      notificationChannels: [slackWebhook && 'slack', notificationEmail && 'email'].filter(Boolean)
    };
  }

  /**
   * Validate rollback configuration
   */
  validateRollbackConfig() {
    const rollbackEnabled = process.env.ROLLBACK_ENABLED;
    if (rollbackEnabled !== 'true') {
      this.warnings.push('ROLLBACK_ENABLED should be true for production safety');
    }

    const errorThreshold = process.env.ROLLBACK_THRESHOLD_ERROR_RATE;
    if (errorThreshold) {
      const threshold = parseFloat(errorThreshold);
      if (isNaN(threshold) || threshold < 0 || threshold > 1) {
        throw new Error('ROLLBACK_THRESHOLD_ERROR_RATE must be between 0 and 1');
      }
    }

    const responseThreshold = process.env.ROLLBACK_THRESHOLD_RESPONSE_TIME;
    if (responseThreshold) {
      const threshold = parseInt(responseThreshold);
      if (isNaN(threshold) || threshold < 1000) {
        throw new Error('ROLLBACK_THRESHOLD_RESPONSE_TIME must be at least 1000ms');
      }
    }

    return {
      rollbackEnabled: rollbackEnabled === 'true',
      errorThresholdConfigured: !!errorThreshold,
      responseThresholdConfigured: !!responseThreshold
    };
  }

  /**
   * Generate validation report
   */
  generateValidationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      status: this.errors.length === 0 ? 'PASSED' : 'FAILED',
      summary: {
        totalValidations: Object.keys(this.validationResults).length,
        passed: Object.values(this.validationResults).filter(r => r.status === 'passed').length,
        failed: this.errors.length,
        warnings: this.warnings.length
      },
      errors: this.errors,
      warnings: this.warnings,
      validationResults: this.validationResults
    };

    console.log('\n📊 Validation Report');
    console.log('=' .repeat(50));
    console.log(`Status: ${report.status}`);
    console.log(`Validations: ${report.summary.passed}/${report.summary.totalValidations} passed`);
    
    if (report.warnings.length > 0) {
      console.log(`\n⚠️ Warnings (${report.warnings.length}):`);
      report.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    if (report.errors.length > 0) {
      console.log(`\n❌ Errors (${report.errors.length}):`);
      report.errors.forEach(error => console.log(`   - ${error}`));
    }

    if (report.status === 'PASSED') {
      console.log('\n✅ Configuration validation passed - ready for deployment!');
    } else {
      console.log('\n❌ Configuration validation failed - fix errors before deployment');
    }

    return report;
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'production';
  const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1];
  
  const validator = new DeploymentConfigValidator();
  
  try {
    const report = await validator.validateAll(environment);
    
    if (outputFile) {
      const fs = await import('fs');
      fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
      console.log(`\n📄 Report saved to ${outputFile}`);
    }
    
    process.exit(report.status === 'PASSED' ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DeploymentConfigValidator };