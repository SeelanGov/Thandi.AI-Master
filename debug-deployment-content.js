#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

async function debugDeploymentContent() {
    console.log('🔍 Debugging Deployment Content');
    console.log('=' .repeat(50));
    
    const url = 'https://thandi-ai-master-nodgn847u-thandiai-projects.vercel.app/results';
    
    try {
        const content = await fetchPage(url);
        
        console.log(`📊 URL: ${url}`);
        console.log(`📏 Size: ${content.length.toLocaleString()} bytes`);
        
        // Save content to file for inspection
        fs.writeFileSync('deployed-results-content.html', content);
        console.log('💾 Content saved to: deployed-results-content.html');
        
        // Check for key indicators
        const hasUseClient = content.includes("'use client'");
        const hasReactImports = content.includes('from \'react\'');
        const hasUseEffect = content.includes('useEffect');
        const hasResultsPage = content.includes('ResultsPage');
        const hasLoadingText = content.includes('Loading your results');
        
        console.log(`🔧 'use client': ${hasUseClient ? '✅ FOUND' : '❌ MISSING'}`);
        console.log(`📦 React imports: ${hasReactImports ? '✅ FOUND' : '❌ MISSING'}`);
        console.log(`⚛️  useEffect: ${hasUseEffect ? '✅ FOUND' : '❌ MISSING'}`);
        console.log(`📄 ResultsPage: ${hasResultsPage ? '✅ FOUND' : '❌ MISSING'}`);
        console.log(`⏳ Loading text: ${hasLoadingText ? '✅ FOUND' : '❌ MISSING'}`);
        
        // Show first 500 characters
        console.log('\n📋 First 500 characters:');
        console.log('-'.repeat(50));
        console.log(content.substring(0, 500));
        console.log('-'.repeat(50));
        
        // Check if it's the old broken version
        if (content.includes('Loading your results...') && content.length < 15000) {
            console.log('🚨 DIAGNOSIS: This is the OLD BROKEN VERSION');
            console.log('💡 The deployment is not picking up the new source code');
        }
        
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
    }
}

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

debugDeploymentContent();