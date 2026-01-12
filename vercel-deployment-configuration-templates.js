#!/usr/bin/env node

/**
 * VERCEL DEPLOYMENT CONFIGURATION TEMPLATES
 * Production-ready configuration templates based on research findings
 * 
 * Based on comprehensive analysis of Vercel deployment mechanics
 * Generated: January 11, 2026
 */

/**
 * Vercel.json configuration template optimized for Phase 0
 */
const VERCEL_CONFIG_TEMPLATE = {
  // Build configuration optimized for Next.js
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  
  // Environment-specific settings
  "env": {
    "NODE_ENV": "production"
  },
  
  // Build-time environment variables (NEXT_PUBLIC_*)
  "build": {
    "env": {
      "NEXT_PUBLIC_VERCEL_ENV": "@vercel-env",
      "NEXT_PUBLIC_VERCEL_URL": "@vercel-url",
      "NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA": "@vercel-git-commit-sha"
    }
  },
  
  // Function configuration for API routes
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 30
    },
    "app/api/student/register/route.js": {
      "runtime": "nodejs18.x", 
      "memory": 512,
      "maxDuration": 15
    },
    "app/api/schools/search/route.js": {
      "runtime": "nodejs18.x",
      "memory": 256,
      "maxDuration": 10
    }
  },
  
  // Routing configuration
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  
  // Headers for security and performance
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://thandi.ai"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  
  // Redirects for Phase 0
  "redirects": [
    {
      "source": "/register",
      "destination": "/student/register",
      "permanent": true
    },
    {
      "source": "/schools",
      "destination": "/school/search",
      "permanent": true
    }
  ],
  
  // Git integration settings
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true,
      "staging": true
    }
  },
  
  // Ignore patterns for build optimization
  "ignoreCommand": "if [ \"$VERCEL_ENV\" = \"production\" ]; then exit 1; else exit 0; fi"
};

/**
 * Next.js configuration optimized for Vercel deployment
 */
const NEXT_CONFIG_TEMPLATE = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Vercel
  output: 'standalone',
  
  // Performance optimizations
  experimental: {
    // Enable build cache for 40-70% faster builds
    turbotrace: {
      logLevel: 'error'
    },
    // Optimize bundle size
    optimizeCss: true,
    // Enable SWC minification
    swcMinify: true
  },
  
  // Image optimization
  images: {
    domains: ['thandi.ai', 'supabase.co'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000 // 1 year
  },
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Webpack configuration for optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\\\/]node_modules[\\\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    // Add bundle analyzer in development
    if (dev) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects for Phase 0
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/student/register',
        permanent: true,
      },
      {
        source: '/schools',
        destination: '/school/search',
        permanent: true,
      },
    ];
  },
  
  // Rewrites for API optimization
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
`;

/**
 * Package.json scripts optimized for Vercel deployment
 */
const PACKAGE_JSON_SCRIPTS = {
  "scripts": {
    // Development
    "dev": "next dev",
    "dev:turbo": "next dev --turbo",
    
    // Building
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "build:debug": "DEBUG=1 next build",
    
    // Production
    "start": "next start",
    "start:prod": "NODE_ENV=production next start",
    
    // Testing
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    
    // Quality assurance
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    
    // Deployment preparation
    "pre-deploy": "npm run lint && npm run type-check && npm run test && npm run build",
    "deploy:dev": "vercel --target development",
    "deploy:preview": "vercel --target preview", 
    "deploy:prod": "vercel --prod",
    
    // Database
    "db:migrate": "supabase db push",
    "db:reset": "supabase db reset",
    "db:seed": "node scripts/seed-database.js",
    
    // Utilities
    "clean": "rm -rf .next node_modules/.cache",
    "clean:all": "rm -rf .next node_modules package-lock.json && npm install",
    "analyze": "npm run build:analyze",
    
    // Phase 0 specific
    "test:phase0": "jest --testPathPattern=phase0",
    "validate:phase0": "node scripts/validate-phase0.js",
    "deploy:phase0": "node vercel-deployment-best-practices-implementation.js production"
  }
};

/**
 * Environment variable templates for different environments
 */
const ENVIRONMENT_TEMPLATES = {
  development: {
    // Next.js
    "NODE_ENV": "development",
    "NEXT_PUBLIC_VERCEL_ENV": "development",
    
    // Database
    "DATABASE_URL": "postgresql://user:password@localhost:5432/thandi_dev",
    
    // Supabase
    "SUPABASE_URL": "https://your-project.supabase.co",
    "SUPABASE_ANON_KEY": "your-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key",
    "NEXT_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
    
    // API Configuration
    "NEXT_PUBLIC_API_URL": "http://localhost:3000/api",
    "API_BASE_URL": "http://localhost:3000/api",
    
    // Feature flags
    "NEXT_PUBLIC_ENABLE_ANALYTICS": "false",
    "NEXT_PUBLIC_ENABLE_DEBUG": "true",
    
    // External services
    "SMTP_HOST": "localhost",
    "SMTP_PORT": "1025",
    "SMTP_USER": "",
    "SMTP_PASS": ""
  },
  
  staging: {
    // Next.js
    "NODE_ENV": "production",
    "NEXT_PUBLIC_VERCEL_ENV": "preview",
    
    // Database
    "DATABASE_URL": "postgresql://user:password@staging-db:5432/thandi_staging",
    
    // Supabase
    "SUPABASE_URL": "https://staging-project.supabase.co",
    "SUPABASE_ANON_KEY": "staging-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "staging-service-role-key",
    "NEXT_PUBLIC_SUPABASE_URL": "https://staging-project.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "staging-anon-key",
    
    // API Configuration
    "NEXT_PUBLIC_API_URL": "https://staging.thandi.ai/api",
    "API_BASE_URL": "https://staging.thandi.ai/api",
    
    // Feature flags
    "NEXT_PUBLIC_ENABLE_ANALYTICS": "true",
    "NEXT_PUBLIC_ENABLE_DEBUG": "false",
    
    // External services
    "SMTP_HOST": "smtp.staging.com",
    "SMTP_PORT": "587",
    "SMTP_USER": "staging@thandi.ai",
    "SMTP_PASS": "staging-password"
  },
  
  production: {
    // Next.js
    "NODE_ENV": "production",
    "NEXT_PUBLIC_VERCEL_ENV": "production",
    
    // Database
    "DATABASE_URL": "postgresql://user:password@prod-db:5432/thandi_production",
    
    // Supabase
    "SUPABASE_URL": "https://prod-project.supabase.co",
    "SUPABASE_ANON_KEY": "prod-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "prod-service-role-key",
    "NEXT_PUBLIC_SUPABASE_URL": "https://prod-project.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "prod-anon-key",
    
    // API Configuration
    "NEXT_PUBLIC_API_URL": "https://thandi.ai/api",
    "API_BASE_URL": "https://thandi.ai/api",
    
    // Feature flags
    "NEXT_PUBLIC_ENABLE_ANALYTICS": "true",
    "NEXT_PUBLIC_ENABLE_DEBUG": "false",
    
    // External services
    "SMTP_HOST": "smtp.production.com",
    "SMTP_PORT": "587",
    "SMTP_USER": "noreply@thandi.ai",
    "SMTP_PASS": "production-password",
    
    // Security
    "JWT_SECRET": "super-secure-jwt-secret",
    "ENCRYPTION_KEY": "32-character-encryption-key",
    
    // Monitoring
    "SENTRY_DSN": "https://your-sentry-dsn",
    "ANALYTICS_ID": "your-analytics-id"
  }
};

/**
 * .vercelignore template for build optimization
 */
const VERCELIGNORE_TEMPLATE = `
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/
__tests__/
*.test.js
*.test.ts
*.spec.js
*.spec.ts

# Development files
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Documentation
docs/
README.md
CHANGELOG.md

# Git
.git/
.gitignore

# Build artifacts (except .next for Next.js)
dist/
build/
out/

# Temporary files
tmp/
temp/

# Database
*.db
*.sqlite

# Backup files
*.backup
*.bak

# Phase 0 specific ignores
test-data/
mock-data/
scripts/seed-*.js
scripts/test-*.js

# Development tools
.eslintcache
.prettierignore
jest.config.js
playwright.config.js

# Deployment scripts (keep only production ones)
deploy-dev.sh
deploy-staging.sh
local-*.js
debug-*.js
`;

/**
 * GitHub Actions workflow for Vercel deployment
 */
const GITHUB_ACTIONS_WORKFLOW = `
name: Vercel Deployment with Phase 0 Validation

on:
  push:
    branches: [main, develop, staging]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: \${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  # Pre-deployment validation
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: \${{ secrets.TEST_DATABASE_URL }}
          SUPABASE_URL: \${{ secrets.TEST_SUPABASE_URL }}
          SUPABASE_ANON_KEY: \${{ secrets.TEST_SUPABASE_ANON_KEY }}
      
      - name: Run Phase 0 validation
        run: npm run validate:phase0
        env:
          DATABASE_URL: \${{ secrets.TEST_DATABASE_URL }}
          SUPABASE_URL: \${{ secrets.TEST_SUPABASE_URL }}
          SUPABASE_ANON_KEY: \${{ secrets.TEST_SUPABASE_ANON_KEY }}
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: \${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: \${{ secrets.TEST_SUPABASE_ANON_KEY }}

  # Deploy to Vercel
  deploy:
    needs: validate
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/staging'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=\${{ github.ref == 'refs/heads/main' && 'production' || 'preview' }} --token=\${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build \${{ github.ref == 'refs/heads/main' && '--prod' || '' }} --token=\${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Project Artifacts to Vercel
        id: deploy
        run: |
          url=\$(vercel deploy --prebuilt \${{ github.ref == 'refs/heads/main' && '--prod' || '' }} --token=\${{ secrets.VERCEL_TOKEN }})
          echo "deployment-url=\$url" >> \$GITHUB_OUTPUT
      
      - name: Run post-deployment tests
        run: |
          npm run test:e2e
        env:
          BASE_URL: \${{ steps.deploy.outputs.deployment-url }}
          
      - name: Comment deployment URL
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Deployed to: \${{ steps.deploy.outputs.deployment-url }}'
            })
`;

/**
 * Configuration generator utility
 */
class VercelConfigurationGenerator {
  constructor() {
    this.templates = {
      vercel: VERCEL_CONFIG_TEMPLATE,
      nextConfig: NEXT_CONFIG_TEMPLATE,
      packageScripts: PACKAGE_JSON_SCRIPTS,
      environments: ENVIRONMENT_TEMPLATES,
      vercelignore: VERCELIGNORE_TEMPLATE,
      githubActions: GITHUB_ACTIONS_WORKFLOW
    };
  }

  generateVercelConfig(customizations = {}) {
    return {
      ...VERCEL_CONFIG_TEMPLATE,
      ...customizations
    };
  }

  generateEnvironmentConfig(environment, customizations = {}) {
    if (!ENVIRONMENT_TEMPLATES[environment]) {
      throw new Error(`Unknown environment: ${environment}`);
    }
    
    return {
      ...ENVIRONMENT_TEMPLATES[environment],
      ...customizations
    };
  }

  generateAllConfigurations(projectName, environments = ['development', 'staging', 'production']) {
    const configs = {
      'vercel.json': this.generateVercelConfig(),
      'next.config.js': NEXT_CONFIG_TEMPLATE,
      '.vercelignore': VERCELIGNORE_TEMPLATE,
      '.github/workflows/vercel-deployment.yml': GITHUB_ACTIONS_WORKFLOW
    };

    // Generate environment-specific configurations
    for (const env of environments) {
      configs[\`.env.\${env}.example\`] = Object.entries(this.generateEnvironmentConfig(env))
        .map(([key, value]) => \`\${key}=\${value}\`)
        .join('\\n');
    }

    return configs;
  }

  writeConfigurationFiles(outputDir = '.', customizations = {}) {
    const fs = require('fs');
    const path = require('path');
    
    const configs = this.generateAllConfigurations('thandi-ai', ['development', 'staging', 'production']);
    
    for (const [filename, content] of Object.entries(configs)) {
      const filePath = path.join(outputDir, filename);
      const dir = path.dirname(filePath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file
      const finalContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
      fs.writeFileSync(filePath, finalContent);
      
      console.log(\`✅ Generated: \${filename}\`);
    }
    
    console.log('🎉 All configuration files generated successfully!');
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const generator = new VercelConfigurationGenerator();
  
  switch (command) {
    case 'generate':
      const outputDir = process.argv[3] || '.';
      generator.writeConfigurationFiles(outputDir);
      break;
      
    case 'vercel-config':
      console.log(JSON.stringify(VERCEL_CONFIG_TEMPLATE, null, 2));
      break;
      
    case 'env-config':
      const environment = process.argv[3] || 'development';
      if (ENVIRONMENT_TEMPLATES[environment]) {
        console.log(Object.entries(ENVIRONMENT_TEMPLATES[environment])
          .map(([key, value]) => \`\${key}=\${value}\`)
          .join('\\n'));
      } else {
        console.error(\`Unknown environment: \${environment}\`);
        process.exit(1);
      }
      break;
      
    default:
      console.log(\`
🔧 Vercel Deployment Configuration Templates

Usage:
  node vercel-deployment-configuration-templates.js <command> [options]

Commands:
  generate [dir]     Generate all configuration files in specified directory
  vercel-config      Output vercel.json configuration
  env-config [env]   Output environment configuration for specified environment

Examples:
  node vercel-deployment-configuration-templates.js generate ./config
  node vercel-deployment-configuration-templates.js vercel-config
  node vercel-deployment-configuration-templates.js env-config production
      \`);
  }
}

module.exports = {
  VERCEL_CONFIG_TEMPLATE,
  NEXT_CONFIG_TEMPLATE,
  PACKAGE_JSON_SCRIPTS,
  ENVIRONMENT_TEMPLATES,
  VERCELIGNORE_TEMPLATE,
  GITHUB_ACTIONS_WORKFLOW,
  VercelConfigurationGenerator
};