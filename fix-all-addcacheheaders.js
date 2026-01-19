const fs = require('fs');

const files = [
  'app/api/schools/login/route.js',
  'app/api/schools/claim/route.js',
  'app/api/schools/request-addition/route.js',
  'app/api/school/students/route.js',
  'app/api/student/retroactive-association/route.js'
];

console.log('🔧 Fixing ALL addCacheHeaders syntax...\n');

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;
    
    // Fix pattern 1: }))) -> }))
    const before1 = content;
    content = content.replace(/\}\)\)\);/g, '}));');
    if (content !== before1) {
      changes++;
      console.log(`  - Fixed triple parens`);
    }
    
    // Fix pattern 2: Missing closing paren on success responses
    // return addCacheHeaders(NextResponse.json({...}); -> return addCacheHeaders(NextResponse.json({...}));
    const before2 = content;
    content = content.replace(/return addCacheHeaders\(NextResponse\.json\(\{[\s\S]*?\}\)\);/g, (match) => {
      // Count opening and closing parens
      const openParens = (match.match(/\(/g) || []).length;
      const closeParens = (match.match(/\)/g) || []).length;
      
      if (openParens > closeParens) {
        return match.replace(/\);$/, '));');
      }
      return match;
    });
    if (content !== before2) {
      changes++;
      console.log(`  - Fixed success responses`);
    }
    
    if (changes > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath}: ${changes} fixes applied\n`);
    } else {
      console.log(`⏭️  ${filePath}: No changes needed\n`);
    }
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}\n`);
  }
});

console.log('✅ All files processed!');
