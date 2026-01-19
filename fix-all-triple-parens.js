const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/api/schools/login/route.js',
  'app/api/schools/claim/route.js',
  'app/api/schools/request-addition/route.js',
  'app/api/school/students/route.js',
  'app/api/student/retroactive-association/route.js'
];

console.log('🔧 Fixing triple parentheses in API files...\n');

filesToFix.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace all instances of }))) with }))
    content = content.replace(/\}\)\)\);/g, '}));');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      const count = (originalContent.match(/\}\)\)\);/g) || []).length;
      console.log(`✅ ${filePath}: Fixed ${count} instances`);
    } else {
      console.log(`⏭️  ${filePath}: No changes needed`);
    }
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
  }
});

console.log('\n✅ All files processed!');
