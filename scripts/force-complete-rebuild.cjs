#!/usr/bin/env node

// Force complete Vercel rebuild by changing build configuration

const fs = require('fs');

console.log('🔄 FORCING COMPLETE VERCEL REBUILD');

// 1. Update package.json version to force rebuild
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.version = `0.1.${Date.now()}`;
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

// 2. Create build marker to force cache invalidation
const buildMarker = {
  timestamp: Date.now(),
  buildId: Math.random().toString(36),
  forceRebuild: true
};
fs.writeFileSync('.vercel-rebuild-marker.json', JSON.stringify(buildMarker, null, 2));

// 3. Update vercel.json to force new deployment
const vercelConfig = {
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "regions": ["cpt1"],
  "build": {
    "env": {
      "FORCE_REBUILD": buildMarker.buildId
    }
  }
};
fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));

console.log('✅ Rebuild markers created');
console.log(`   New version: ${packageJson.version}`);
console.log(`   Build ID: ${buildMarker.buildId}`);
console.log('');
console.log('🚀 Ready to commit and deploy fresh build');