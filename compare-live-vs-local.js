#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');

class LiveVsLocalComparator {
  constructor() {
    this.liveUrl = 'https://www.thandi.online';
    this.localUrl = 'http://localhost:3005';
    this.differences = [];
  }

  async compareDeployments() {
    console.log('🔍 LIVE vs LOCAL COMPARISON ANALYSIS');
    console.log('====================================\n');

    // Step 1: Compare assessment page content
    console.log('📋 Step 1: Comparing Assessment Page Content...');
    await this.compareAssessmentPages();

    // Step 2: Compare component files
    console.log('\n📁 Step 2: Analyzing Component File Changes...');
    await this.analyzeComponentChanges();

    // Step 3: Compare CSS/styling
    console.log('\n🎨 Step 3: Comparing CSS and Styling...');
    await this.compareStyling();

    // Step 4: Generate deployment diff report
    console.log('\n📊 Step 4: Generating Deployment Diff Report...');
    this.generateDiffReport();
  }

  async makeRequest(url, isLocal = false) {
    return new Promise((resolve, reject) => {
      const client = isLocal ? http : https;
      
      const req = client.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async compareAssessmentPages() {
    try {
      console.log('   🌐 Fetching live assessment page...');
      const liveResult = await this.makeRequest(`${this.liveUrl}/assessment`);
      
      console.log('   💻 Fetching local assessment page...');
      const localResult = await this.makeRequest(`${this.localUrl}/assessment`, true);
      
      if (liveResult.status === 200 && localResult.status === 200) {
        console.log(`   ✅ Both pages loaded successfully`);
        console.log(`   📏 Live content: ${liveResult.data.length} bytes`);
        console.log(`   📏 Local content: ${localResult.data.length} bytes`);
        
        // Compare key elements
        this.comparePageElements(liveResult.data, localResult.data);
        
      } else {
        console.log(`   ❌ Page loading issue - Live: ${liveResult.status}, Local: ${localResult.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error comparing pages: ${error.message}`);
    }
  }

  comparePageElements(liveHtml, localHtml) {
    const elements = [
      { name: 'Thandi branding', pattern: /Thandi/g },
      { name: 'Assessment container class', pattern: /assessment-container/g },
      { name: 'Assessment card class', pattern: /assessment-card/g },
      { name: 'Primary button class', pattern: /btn-assessment-primary/g },
      { name: 'Secondary button class', pattern: /btn-assessment-secondary/g },
      { name: 'Form input class', pattern: /form-input-assessment/g },
      { name: 'Form select class', pattern: /form-select-assessment/g },
      { name: 'Assessment label class', pattern: /assessment-label/g },
      { name: 'Grade dropdown', pattern: /Select your grade/g },
      { name: 'Registration form', pattern: /Continue with Registration/g },
      { name: 'Anonymous option', pattern: /Continue Anonymously/g }
    ];

    console.log('\n   🔍 Element-by-element comparison:');
    
    elements.forEach(element => {
      const liveMatches = (liveHtml.match(element.pattern) || []).length;
      const localMatches = (localHtml.match(element.pattern) || []).length;
      
      const status = liveMatches === localMatches ? '=' : 
                    localMatches > liveMatches ? '+' : '-';
      
      console.log(`   ${status === '=' ? '✅' : status === '+' ? '🆕' : '⚠️'} ${element.name}: Live(${liveMatches}) vs Local(${localMatches})`);
      
      if (status !== '=') {
        this.differences.push({
          type: 'content',
          element: element.name,
          live: liveMatches,
          local: localMatches,
          change: status === '+' ? 'added' : 'removed'
        });
      }
    });
  }

  async analyzeComponentChanges() {
    try {
      // Read the current BulletproofStudentRegistration component
      const componentContent = fs.readFileSync('components/BulletproofStudentRegistration.jsx', 'utf8');
      
      console.log('   📄 Analyzing BulletproofStudentRegistration.jsx changes...');
      
      // Check for our specific changes
      const changes = [
        { name: 'Assessment container usage', pattern: /assessment-container/g },
        { name: 'Assessment card usage', pattern: /assessment-card/g },
        { name: 'Branded button classes', pattern: /btn-assessment-(primary|secondary)/g },
        { name: 'Form input classes', pattern: /form-input-assessment/g },
        { name: 'Form select classes', pattern: /form-select-assessment/g },
        { name: 'Assessment label classes', pattern: /assessment-label/g },
        { name: 'Animation classes', pattern: /animate-(fade-in|slide-up)/g },
        { name: 'Assessment title class', pattern: /assessment-title/g },
        { name: 'Assessment description class', pattern: /assessment-description/g }
      ];
      
      console.log('\n   🔧 Component changes detected:');
      
      changes.forEach(change => {
        const matches = (componentContent.match(change.pattern) || []).length;
        console.log(`   ${matches > 0 ? '✅' : '❌'} ${change.name}: ${matches} instances`);
        
        if (matches > 0) {
          this.differences.push({
            type: 'component',
            change: change.name,
            instances: matches,
            status: 'added'
          });
        }
      });
      
    } catch (error) {
      console.log(`   ❌ Error analyzing component: ${error.message}`);
    }
  }

  async compareStyling() {
    try {
      // Check globals.css for Thandi branding
      const globalsCss = fs.readFileSync('app/globals.css', 'utf8');
      
      console.log('   🎨 Analyzing CSS branding system...');
      
      const cssFeatures = [
        { name: 'Thandi color variables', pattern: /--thandi-(teal|gold|cream|brown)/g },
        { name: 'Assessment component classes', pattern: /\.assessment-(container|card|title|description)/g },
        { name: 'Button system classes', pattern: /\.btn-assessment-(primary|secondary|gold)/g },
        { name: 'Form component classes', pattern: /\.form-(input|select|textarea)-assessment/g },
        { name: 'Animation classes', pattern: /\.animate-(fade-in|slide-up)/g },
        { name: 'Responsive design', pattern: /@media.*max-width/g },
        { name: 'Touch optimizations', pattern: /touch-manipulation|min-h-\[48px\]/g }
      ];
      
      console.log('\n   🎨 CSS system analysis:');
      
      cssFeatures.forEach(feature => {
        const matches = (globalsCss.match(feature.pattern) || []).length;
        console.log(`   ${matches > 0 ? '✅' : '❌'} ${feature.name}: ${matches} instances`);
        
        if (matches > 0) {
          this.differences.push({
            type: 'css',
            feature: feature.name,
            instances: matches,
            status: 'present'
          });
        }
      });
      
    } catch (error) {
      console.log(`   ❌ Error analyzing CSS: ${error.message}`);
    }
  }

  generateDiffReport() {
    console.log('\n📊 DEPLOYMENT DIFF REPORT');
    console.log('=========================\n');
    
    // Categorize differences
    const contentDiffs = this.differences.filter(d => d.type === 'content');
    const componentDiffs = this.differences.filter(d => d.type === 'component');
    const cssDiffs = this.differences.filter(d => d.type === 'css');
    
    console.log('🔄 CONTENT CHANGES (Live vs Local):');
    if (contentDiffs.length === 0) {
      console.log('   ✅ No content differences detected');
    } else {
      contentDiffs.forEach(diff => {
        console.log(`   ${diff.change === 'added' ? '🆕' : '⚠️'} ${diff.element}: ${diff.change} (${diff.local - diff.live} difference)`);
      });
    }
    
    console.log('\n🧩 COMPONENT CHANGES:');
    if (componentDiffs.length === 0) {
      console.log('   ❌ No component changes detected - this might be an issue!');
    } else {
      componentDiffs.forEach(diff => {
        console.log(`   ✅ ${diff.change}: ${diff.instances} instances added`);
      });
    }
    
    console.log('\n🎨 CSS SYSTEM:');
    if (cssDiffs.length === 0) {
      console.log('   ❌ No CSS system detected - this might be an issue!');
    } else {
      cssDiffs.forEach(diff => {
        console.log(`   ✅ ${diff.feature}: ${diff.instances} instances present`);
      });
    }
    
    // Generate deployment recommendation
    console.log('\n🎯 DEPLOYMENT RECOMMENDATION:');
    
    const hasComponentChanges = componentDiffs.length > 0;
    const hasCssSystem = cssDiffs.length > 0;
    const hasBreakingChanges = contentDiffs.some(d => d.change === 'removed');
    
    if (hasComponentChanges && hasCssSystem && !hasBreakingChanges) {
      console.log('   ✅ SAFE TO DEPLOY');
      console.log('   📋 Changes detected:');
      console.log('      • Thandi branding system is in place');
      console.log('      • Component classes have been updated');
      console.log('      • No breaking changes detected');
      console.log('      • Assessment flow improvements ready');
      
      console.log('\n🚀 DEPLOYMENT STEPS:');
      console.log('   1. git add .');
      console.log('   2. git commit -m "Apply Thandi branding system to assessment flow"');
      console.log('   3. git push origin main');
      console.log('   4. Verify deployment on www.thandi.online');
      
    } else {
      console.log('   ⚠️ REVIEW NEEDED BEFORE DEPLOYMENT');
      console.log('   📋 Issues detected:');
      if (!hasComponentChanges) console.log('      • Component changes not detected');
      if (!hasCssSystem) console.log('      • CSS system not found');
      if (hasBreakingChanges) console.log('      • Potential breaking changes found');
      
      console.log('\n🔧 RECOMMENDED ACTIONS:');
      console.log('   1. Review the issues above');
      console.log('   2. Fix any missing components or CSS');
      console.log('   3. Re-run this comparison');
      console.log('   4. Only deploy when all checks pass');
    }
    
    console.log('\n📋 SUMMARY:');
    console.log(`   • Content differences: ${contentDiffs.length}`);
    console.log(`   • Component changes: ${componentDiffs.length}`);
    console.log(`   • CSS features: ${cssDiffs.length}`);
    console.log(`   • Ready for deployment: ${hasComponentChanges && hasCssSystem && !hasBreakingChanges ? 'YES' : 'NO'}`);
  }
}

// Run the comparison
const comparator = new LiveVsLocalComparator();
comparator.compareDeployments().catch(console.error);