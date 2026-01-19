const fs = require('fs');

const filesToFix = [
  'app/api/schools/login/route.js',
  'app/api/schools/claim/route.js',
  'app/api/schools/request-addition/route.js',
  'app/api/school/students/route.js',
  'app/api/student/retroactive-association/route.js'
];

console.log('🔧 Fixing ALL API syntax errors...\n');

filesToFix.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix triple parentheses: }))) -> }))
    content = content.replace(/\}\)\)\);/g, '}));');
    
    // Fix success responses missing closing paren: }); at end of return statement
    // Pattern: return addCacheHeaders(NextResponse.json({...}); should be return addCacheHeaders(NextResponse.json({...}));
    content = content.replace(/return addCacheHeaders\(NextResponse\.json\(([^)]+)\)\);/g, 
                              'return addCacheHeaders(NextResponse.json($1)));');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath}: Fixed`);
    } else {
      console.log(`⏭️  ${filePath}: No changes needed`);
    }
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
  }
});

console.log('\n✅ All files processed!');
