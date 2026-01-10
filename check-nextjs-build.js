const fs = require('fs');
const path = require('path');

console.log('🔍 CHECKING NEXT.JS BUILD OUTPUT');
console.log('=================================');

// 1. Check if .next directory exists and what's in it
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('✅ .next directory exists');
  
  // Check server build
  const serverDir = path.join(nextDir, 'server', 'app', 'results');
  if (fs.existsSync(serverDir)) {
    console.log('✅ Server build directory exists');
    const files = fs.readdirSync(serverDir);
    console.log('📄 Server build files:', files);
    
    // Check the built page.js file
    const pageJsPath = path.join(serverDir, 'page.js');
    if (fs.existsSync(pageJsPath)) {
      const builtContent = fs.readFileSync(pageJsPath, 'utf8');
      console.log('📄 Built page.js size:', builtContent.length, 'characters');
      
      // Check if our enhanced code is in the built file
      const hasFormatResponse = builtContent.includes('formatResponse');
      const hasStudentFriendly = builtContent.includes('student-friendly');
      const hasEnhancedClasses = builtContent.includes('content-section enhanced');
      
      console.log('\n🔍 Built file content check:');
      console.log('✅ formatResponse in built file:', hasFormatResponse);
      console.log('✅ student-friendly in built file:', hasStudentFriendly);
      console.log('✅ enhanced classes in built file:', hasEnhancedClasses);
      
      if (!hasFormatResponse) {
        console.log('\n❌ CRITICAL: formatResponse function NOT in built file');
        console.log('🔍 This explains why enhanced formatting is not working');
        
        // Look for any function definitions in the built file
        const functionMatches = builtContent.match(/function \w+/g);
        if (functionMatches) {
          console.log('📄 Functions found in built file:', functionMatches.slice(0, 10));
        }
      }
    } else {
      console.log('❌ Built page.js file not found');
    }
  } else {
    console.log('❌ Server build directory not found');
  }
  
  // Check client build
  const staticDir = path.join(nextDir, 'static');
  if (fs.existsSync(staticDir)) {
    console.log('✅ Static build directory exists');
  }
  
} else {
  console.log('❌ .next directory not found');
}

// 2. Check if there are any build errors or warnings
console.log('\n2️⃣ Checking for build issues...');

// 3. Force a manual build to see what happens
console.log('\n3️⃣ Attempting to trigger a fresh build...');
console.log('💡 Recommendation: Stop dev server, delete .next, restart');

console.log('\n🎯 NEXT STEPS:');
console.log('==============');
console.log('1. Stop the development server');
console.log('2. Delete .next directory completely');
console.log('3. Restart development server');
console.log('4. Test if enhanced formatting appears');
console.log('5. If still not working, check for file system issues');