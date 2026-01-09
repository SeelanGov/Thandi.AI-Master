#!/usr/bin/env node

/**
 * Diagnose Results Page Issue - Systematic Analysis
 * Check if this is a deployment issue or client-side hydration problem
 */

const https = require('https');

async function diagnoseResultsPageIssue() {
    console.log('🔍 Diagnosing Results Page Issue - Systematic Analysis');
    console.log('=' + '='.repeat(60));
    
    const urls = [
        'https://www.thandi.online/results',
        'https://thandi-ai-master.vercel.app/results'
    ];
    
    for (const url of urls) {
        try {
            console.log(`\n📊 Testing: ${url}`);
            
            const content = await fetchPage(url);
            console.log(`📏 Size: ${content.length.toLocaleString()} bytes`);
            
            // Check for key indicators
            const hasReactCode = content.includes('useEffect') || content.includes('useState');
            const hasClientDirective = content.includes('use client');
            const hasLoadingDiv = content.includes('Loading your results');
            const hasResultsPage = content.includes('results-page');
            const hasJSChunks = content.includes('_next/static/chunks');
            const hasResultsPageJS = content.includes('app/results/page');
            const hasReactComponents = content.includes('ResultsCardLayout') || content.includes('ThandiChat');
            
            console.log(`  ⚛️  React Hooks: ${hasReactCode ? '✅ FOUND' : '❌ MISSING'}`);
            console.log(`  📱 Client Directive: ${hasClientDirective ? '✅ FOUND' : '❌ MISSING'}`);
            console.log(`  ⏳ Loading Div: ${hasLoadingDiv ? '✅ FOUND' : '❌ MISSING'}`);
            console.log(`  📄 Results Page Class: ${hasResultsPage ? '✅ FOUND' : '❌ MISSING'}`);
            console.log(`  📦 JS Chunks: ${hasJSChunks ? '✅ FOUND' : '❌ MISSING'}`);
            console.log(`  🎯 Results Page JS: ${hasResultsPageJS ? '✅ FOUND' : '❌ MISSING'}`);
            console.log(`  🧩 React Components: ${hasReactComponents ? '✅ FOUND' : '❌ MISSING'}`);
            
            // Check for specific JavaScript chunks
            const jsChunkMatches = content.match(/app\/results\/page-[a-f0-9]+\.js/g);
            if (jsChunkMatches) {
                console.log(`  📦 Results JS Chunk: ✅ ${jsChunkMatches[0]}`);
            } else {
                console.log(`  📦 Results JS Chunk: ❌ NOT FOUND`);
            }
            
            // Determine status
            if (content.length > 25000 && hasReactCode && hasReactComponents) {
                console.log(`  🎉 STATUS: FULLY DEPLOYED AND COMPLETE`);
            } else if (hasJSChunks && hasLoadingDiv && jsChunkMatches) {
                console.log(`  ⚠️  STATUS: DEPLOYED BUT REACT NOT HYDRATING`);
                console.log(`      This suggests a client-side JavaScript execution issue`);
            } else if (hasJSChunks && hasLoadingDiv) {
                console.log(`  ⚠️  STATUS: PARTIAL DEPLOYMENT - Missing results page JS`);
            } else {
                console.log(`  ❌ STATUS: OLD VERSION STILL CACHED`);
            }
            
        } catch (error) {
            console.log(`  ❌ ERROR: ${error.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 SYSTEMATIC DIAGNOSIS');
    console.log('='.repeat(60));
    console.log('Based on the analysis above:');
    console.log('');
    console.log('1. If "FULLY DEPLOYED": Issue is resolved');
    console.log('2. If "REACT NOT HYDRATING": Client-side JS issue, not deployment');
    console.log('3. If "PARTIAL DEPLOYMENT": Missing JS chunks, deployment incomplete');
    console.log('4. If "OLD VERSION CACHED": CDN/DNS propagation still in progress');
    console.log('');
    console.log('RECOMMENDATION:');
    console.log('- If React not hydrating: Check browser console for JS errors');
    console.log('- If partial deployment: Force new Vercel deployment');
    console.log('- If old version cached: Wait 15-30 more minutes for DNS');
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

diagnoseResultsPageIssue();