const fs = require('fs');
const path = require('path');

console.log('🚨 CRITICAL RESULTS PAGE DEBUG');
console.log('===============================');

// 1. Verify our source file has the enhanced code
console.log('\n1️⃣ Source File Verification:');
const sourceFile = path.join(process.cwd(), 'app/results/page.jsx');
const sourceContent = fs.readFileSync(sourceFile, 'utf8');

// Check for key functions and classes
const checks = {
  'formatResponse function': sourceContent.includes('function formatResponse'),
  'formatValue function': sourceContent.includes('function formatValue'),
  'student-friendly class': sourceContent.includes('student-friendly'),
  'content-section enhanced': sourceContent.includes('content-section enhanced'),
  'program-card enhanced': sourceContent.includes('program-card enhanced'),
  'key-value enhanced': sourceContent.includes('key-value enhanced'),
  'dangerouslySetInnerHTML formatResponse': sourceContent.includes('formatResponse(results.fullResponse')
};

Object.entries(checks).forEach(([check, result]) => {
  console.log(`${result ? '✅' : '❌'} ${check}: ${result}`);
});

// 2. Check if there are any syntax errors in our file
console.log('\n2️⃣ Syntax Check:');
try {
  // Try to parse the JSX file (basic check)
  const lines = sourceContent.split('\n');
  const functionStart = lines.findIndex(line => line.includes('function formatResponse'));
  const functionEnd = lines.findIndex((line, index) => index > functionStart && line.trim() === '}');
  
  if (functionStart > -1 && functionEnd > -1) {
    console.log('✅ formatResponse function structure looks valid');
    console.log(`📍 Function spans lines ${functionStart + 1} to ${functionEnd + 1}`);
  } else {
    console.log('❌ formatResponse function structure issue');
  }
  
  // Check for common syntax issues
  const openBraces = (sourceContent.match(/{/g) || []).length;
  const closeBraces = (sourceContent.match(/}/g) || []).length;
  console.log(`📊 Brace balance: ${openBraces} open, ${closeBraces} close (${openBraces === closeBraces ? 'BALANCED' : 'UNBALANCED'})`);
  
} catch (error) {
  console.log('❌ Syntax check failed:', error.message);
}

// 3. Check the exact line where formatResponse is called
console.log('\n3️⃣ formatResponse Usage Check:');
const formatResponseUsage = sourceContent.match(/dangerouslySetInnerHTML=\{[^}]*formatResponse[^}]*\}/);
if (formatResponseUsage) {
  console.log('✅ formatResponse is called in dangerouslySetInnerHTML');
  console.log('📄 Usage:', formatResponseUsage[0]);
} else {
  console.log('❌ formatResponse NOT found in dangerouslySetInnerHTML');
  
  // Look for any formatResponse calls
  const anyFormatResponse = sourceContent.match(/formatResponse\([^)]*\)/g);
  if (anyFormatResponse) {
    console.log('⚠️ Found formatResponse calls:', anyFormatResponse);
  }
}

// 4. Check if the file was modified recently
console.log('\n4️⃣ File Modification Check:');
const stats = fs.statSync(sourceFile);
const modifiedTime = stats.mtime;
const now = new Date();
const timeDiff = now - modifiedTime;
const minutesAgo = Math.floor(timeDiff / (1000 * 60));

console.log(`📅 Last modified: ${modifiedTime.toISOString()}`);
console.log(`⏰ Modified ${minutesAgo} minutes ago`);

// 5. Check if there are any import issues
console.log('\n5️⃣ Import/Export Check:');
const hasClientDirective = sourceContent.includes("'use client'");
const hasReactImports = sourceContent.includes('import { useEffect, useState }');
const hasJsPDFImport = sourceContent.includes("import jsPDF from 'jspdf'");

console.log('✅ use client directive:', hasClientDirective);
console.log('✅ React hooks import:', hasReactImports);
console.log('✅ jsPDF import:', hasJsPDFImport);

// 6. Extract the exact formatResponse function
console.log('\n6️⃣ formatResponse Function Extract:');
const formatResponseMatch = sourceContent.match(/function formatResponse\(text\) \{[\s\S]*?\n\}/);
if (formatResponseMatch) {
  const functionCode = formatResponseMatch[0];
  console.log('✅ formatResponse function extracted');
  console.log(`📏 Function length: ${functionCode.length} characters`);
  console.log('📄 Function preview (first 200 chars):');
  console.log(functionCode.substring(0, 200) + '...');
  
  // Check if function returns enhanced HTML
  const returnsEnhanced = functionCode.includes('student-friendly');
  console.log('✅ Returns enhanced HTML:', returnsEnhanced);
} else {
  console.log('❌ Could not extract formatResponse function');
}

console.log('\n🎯 DIAGNOSIS SUMMARY:');
console.log('=====================');
const allChecksPass = Object.values(checks).every(check => check);
console.log('All source checks pass:', allChecksPass);

if (allChecksPass) {
  console.log('✅ SOURCE FILE IS CORRECT');
  console.log('🔍 ISSUE: Next.js is not serving the updated code');
  console.log('💡 SOLUTION: Need to investigate Next.js build/cache issue');
} else {
  console.log('❌ SOURCE FILE HAS ISSUES');
  console.log('🔍 ISSUE: Enhanced code is missing or malformed');
  console.log('💡 SOLUTION: Need to fix the source file');
}