#!/usr/bin/env node

/**
 * Check JavaScript Chunk Content
 * Fetch and analyze the actual JS chunk to identify issues
 */

const https = require('https');

async function checkJSChunkContent() {
    console.log('🔍 Checking JavaScript Chunk Content');
    console.log('=' + '='.repeat(50));
    
    const baseUrl = 'https://www.thandi.online';
    const chunkPath = '/_next/static/chunks/app/results/page-f07d48c5929b8309.js';
    const fullUrl = baseUrl + chunkPath;
    
    try {
        console.log(`📦 Fetching: ${fullUrl}`);
        
        const content = await fetchPage(fullUrl);
        console.log(`📏 Chunk Size: ${content.length.toLocaleString()} bytes`);
        
        // Check for key React patterns
        const hasUseEffect = content.includes('useEffect');
        const hasUseState = content.includes('useState');
        const hasUseClient = content.includes('use client');
        const hasLocalStorage = content.includes('localStorage');
        const hasResultsPage = content.includes('ResultsPage');
        const hasLoadingText = content.includes('Loading your results');
        const hasJSXElements = content.includes('jsx') || content.includes('createElement');
        
        console.log('\n🔍 Content Analysis:');
        console.log(`  ⚛️  useEffect: ${hasUseEffect ? '✅ FOUND' : '❌ MISSING'}`);
        console.log(`  ⚛️  useState: ${hasUseState ? '✅ FOUND' : '❌ MISSING'}`);
        console.log(`  📱 'use client': ${hasUseClient ? '✅ FOUND' : '❌ MISSING'}`);
        console.log(`  💾 localStorage: ${hasLocalStorage ? '✅ FOUND' : '❌ MISSING'}`);
        console.log(`  📄 ResultsPage: ${hasResultsPage ? '✅ FOUND' : '❌ MISSING'}`);
        console.log(`  ⏳ Loading text: ${hasLoadingText ? '✅ FOUND' : '❌ MISSING'}`);
        console.log(`  🧩 JSX elements: ${hasJSXElements ? '✅ FOUND' : '❌ MISSING'}`);
        
        // Look for error patterns
        const hasSyntaxError = content.includes('SyntaxError') || content.includes('Unexpected token');
        const hasImportError = content.includes('Cannot resolve module') || content.includes('Module not found');
        const hasRuntimeError = content.includes('ReferenceError') || content.includes('TypeError');
        
        console.log('\n🚨 Error Analysis:');
        console.log(`  ❌ Syntax Errors: ${hasSyntaxError ? '🚨 FOUND' : '✅ NONE'}`);
        console.log(`  ❌ Import Errors: ${hasImportError ? '🚨 FOUND' : '✅ NONE'}`);
        console.log(`  ❌ Runtime Errors: ${hasRuntimeError ? '🚨 FOUND' : '✅ NONE'}`);
        
        // Check if it's minified properly
        const isMinified = !content.includes('\n') && content.length > 1000;
        console.log(`\n📦 Build Analysis:`);
        console.log(`  🗜️  Minified: ${isMinified ? '✅ YES' : '❌ NO'}`);
        
        // Sample a small portion to see structure
        const sample = content.substring(0, 500);
        console.log(`\n📝 Content Sample (first 500 chars):`);
        console.log(sample);
        
        if (hasUseEffect && hasUseState && hasLocalStorage) {
            console.log(`\n🎉 ASSESSMENT: JavaScript chunk contains all expected React code`);
            console.log(`   This suggests the issue is in client-side execution, not the build`);
        } else {
            console.log(`\n❌ ASSESSMENT: JavaScript chunk is missing expected React code`);
            console.log(`   This suggests a build or compilation issue`);
        }
        
    } catch (error) {
        console.log(`❌ ERROR fetching JS chunk: ${error.message}`);
        console.log(`This could indicate the chunk URL has changed or is not accessible`);
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

checkJSChunkContent();