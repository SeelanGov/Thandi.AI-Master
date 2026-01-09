#!/usr/bin/env node

/**
 * Debug What's Actually Being Served
 * Extract and analyze the HTML content to understand why React isn't working
 */

const https = require('https');
const fs = require('fs');

async function debugServedContent() {
    console.log('🔍 Debugging Served Content');
    console.log('=' .repeat(60));
    
    try {
        // Get the content from the new deployment
        const url = 'https://thandi-ai-master-pd3n4yqoa-thandiai-projects.vercel.app/results';
        console.log(`📥 Fetching: ${url}`);
        
        const content = await fetchPage(url);
        
        // Save to file for inspection
        fs.writeFileSync('served-results-content.html', content);
        console.log('💾 Saved content to: served-results-content.html');
        
        console.log(`📏 Total size: ${content.length.toLocaleString()} bytes`);
        
        // Analyze the content structure
        console.log('\n🔍 Content Analysis:');
        
        // Check for HTML structure
        const hasHtml = content.includes('<html');
        const hasHead = content.includes('<head');
        const hasBody = content.includes('<body');
        const hasScript = content.includes('<script');
        const hasNextScript = content.includes('_next/static');
        
        console.log(`  📄 HTML structure: ${hasHtml ? '✅' : '❌'}`);
        console.log(`  🧠 Head section: ${hasHead ? '✅' : '❌'}`);
        console.log(`  🏗️  Body section: ${hasBody ? '✅' : '❌'}`);
        console.log(`  📜 Script tags: ${hasScript ? '✅' : '❌'}`);
        console.log(`  ⚛️  Next.js scripts: ${hasNextScript ? '✅' : '❌'}`);
        
        // Check for specific content
        const hasLoadingText = content.includes('Loading your results');
        const hasUseClient = content.includes('use client');
        const hasReactImports = content.includes('useEffect') || content.includes('useState');
        
        console.log(`  ⏳ Loading text: ${hasLoadingText ? '✅' : '❌'}`);
        console.log(`  🎯 'use client': ${hasUseClient ? '✅' : '❌'}`);
        console.log(`  ⚛️  React hooks: ${hasReactImports ? '✅' : '❌'}`);
        
        // Look for error indicators
        const hasError = content.includes('error') || content.includes('Error');
        const has404 = content.includes('404') || content.includes('Not Found');
        const hasException = content.includes('exception') || content.includes('Exception');
        
        console.log(`  ❌ Error indicators: ${hasError ? '⚠️  FOUND' : '✅ NONE'}`);
        console.log(`  🔍 404 indicators: ${has404 ? '⚠️  FOUND' : '✅ NONE'}`);
        console.log(`  💥 Exception indicators: ${hasException ? '⚠️  FOUND' : '✅ NONE'}`);
        
        // Extract key sections
        console.log('\n📋 Key Content Sections:');
        
        // Look for the main content
        const titleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (titleMatch) {
            console.log(`  📑 Page title: "${titleMatch[1]}"`);
        }
        
        // Look for the main div content
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            const bodyContent = bodyMatch[1];
            const hasResultsContainer = bodyContent.includes('results-container');
            const hasResultsPage = bodyContent.includes('results-page');
            console.log(`  📦 Results container: ${hasResultsContainer ? '✅' : '❌'}`);
            console.log(`  📄 Results page class: ${hasResultsPage ? '✅' : '❌'}`);
        }
        
        // Check for Next.js hydration
        const hasHydration = content.includes('__NEXT_DATA__');
        console.log(`  💧 Next.js hydration data: ${hasHydration ? '✅' : '❌'}`);
        
        console.log('\n' + '='.repeat(60));
        console.log('📋 DIAGNOSIS');
        console.log('='.repeat(60));
        
        if (!hasNextScript) {
            console.log('🚨 CRITICAL: Missing Next.js scripts - page is not hydrating');
            console.log('   This explains why React features are missing');
        } else if (!hasHydration) {
            console.log('⚠️  WARNING: Next.js scripts present but no hydration data');
            console.log('   Page may not be properly client-side rendered');
        } else if (hasLoadingText && !hasReactImports) {
            console.log('🔍 ISSUE: Static HTML served without client-side React code');
            console.log('   The page is pre-rendered but not hydrating properly');
        } else {
            console.log('✅ Structure looks correct - issue may be elsewhere');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
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

debugServedContent();