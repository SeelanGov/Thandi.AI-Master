#!/usr/bin/env node

/**
 * FIX API CACHE HEADERS - JAN 13 2026
 * 
 * Fix the broken cache busting headers in API routes
 */

const fs = require('fs');
const path = require('path');

const apiRoutes = [
  'app/api/student/register/route.js',
  'app/api/schools/validate-code/route.js',
  'app/api/consent/manage/route.js'
];

function fixCacheHeaders(filePath) {
  console.log(`🔧 Fixing ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove all the broken cache busting header insertions
  content = content.replace(/\s*\/\/ Cache busting headers - [\d\-T:\.Z]+\s*response\.headers\.set\('Cache-Control', 'no-cache, no-store, must-revalidate'\);\s*response\.headers\.set\('Pragma', 'no-cache'\);\s*response\.headers\.set\('Expires', '0'\);\s*response\.headers\.set\('X-Cache-Bust', '[\d\-T:\.Z]+'\);\s*/g, '');
  
  // Add proper cache headers function
  const cacheHeadersFunction = `
// Add cache busting headers to response
function addCacheHeaders(response) {
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Cache-Bust', '2026-01-13T16:30:00.000Z');
  return response;
}

`;
  
  // Insert the function after imports
  const importEndIndex = content.lastIndexOf('import');
  const nextLineIndex = content.indexOf('\n', importEndIndex);
  content = content.slice(0, nextLineIndex + 1) + cacheHeadersFunction + content.slice(nextLineIndex + 1);
  
  // Replace NextResponse.json calls with addCacheHeaders wrapper
  content = content.replace(/return NextResponse\.json\(/g, 'return addCacheHeaders(NextResponse.json(');
  
  // Fix any unmatched parentheses by ensuring each addCacheHeaders call is properly closed
  const lines = content.split('\n');
  const fixedLines = lines.map(line => {
    if (line.includes('return addCacheHeaders(NextResponse.json(') && !line.includes('));')) {
      // This is a multi-line NextResponse.json call, we need to find the closing
      return line;
    }
    if (line.trim().startsWith(');') && line.includes('status:')) {
      // This is likely the end of a NextResponse.json call, add the closing for addCacheHeaders
      return line + ');';
    }
    return line;
  });
  
  content = fixedLines.join('\n');
  
  // Clean up any double closing parentheses
  content = content.replace(/\)\)\);/g, '));');
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed ${filePath}`);
}

console.log('🚀 FIXING API CACHE HEADERS');
console.log('============================');

for (const route of apiRoutes) {
  fixCacheHeaders(route);
}

console.log('');
console.log('✅ All API routes fixed!');
console.log('💡 Next: Test the APIs and deploy');