const fs = require('fs');
const glob = require('glob');

// Find all API route files
const files = glob.sync('app/api/**/*.js');

console.log(`🔧 Final comprehensive fix for ${files.length} API files...\n`);

let totalFixed = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    let changes = [];
    
    // Fix 1: Remove triple closing parens }))) -> }))
    const before1 = content;
    content = content.replace(/\}\)\)\);/g, '}));');
    if (content !== before1) changes.push('triple-parens');
    
    // Fix 2: Success responses missing closing paren
    // Pattern: return addCacheHeaders(NextResponse.json({...}); -> }));
    const successPattern = /return addCacheHeaders\(NextResponse\.json\(\{[\s\S]*?\}\)\);/g;
    content = content.replace(successPattern, (match) => {
      // Count opening and closing parens
      const openParens = (match.match(/\(/g) || []).length;
      const closeParens = (match.match(/\)/g) || []).length;
      
      if (openParens > closeParens) {
        changes.push('success-response');
        return match.replace(/\);$/, '));');
      }
      return match;
    });
    
    // Fix 3: Error responses with status codes missing closing paren
    // Pattern: }, { status: XXX }); -> }));
    const errorPattern = /return addCacheHeaders\(NextResponse\.json\([\s\S]*?\},\s*\{\s*status:\s*\d+\s*\}\)\);/g;
    content = content.replace(errorPattern, (match) => {
      const openParens = (match.match(/\(/g) || []).length;
      const closeParens = (match.match(/\)/g) || []).length;
      
      if (openParens > closeParens) {
        changes.push('error-response');
        return match.replace(/\)\);$/, '));');
      }
      return match;
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath}`);
      console.log(`   Fixed: ${changes.join(', ')}\n`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
  }
});

console.log(`\n✅ Fixed ${totalFixed} files!`);
console.log('\n🔨 Running build to verify...');
