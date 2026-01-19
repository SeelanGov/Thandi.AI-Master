const fs = require('fs');
const glob = require('glob');

// Find all API route files
const files = glob.sync('app/api/**/*.js');

console.log(`🔧 Fixing syntax in ${files.length} API files...\n`);

let totalFixed = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Pattern 1: Fix }))) -> }))
    content = content.replace(/\}\)\)\);/g, '}));');
    
    // Pattern 2: Fix }); at end of addCacheHeaders -> }));
    // This handles: return addCacheHeaders(NextResponse.json({...});
    content = content.replace(/return addCacheHeaders\(NextResponse\.json\(([^)]*\{[^}]*\})\);/g, 
                              'return addCacheHeaders(NextResponse.json($1));');
    
    // Pattern 3: Fix multi-line addCacheHeaders with single closing paren
    // Match: return addCacheHeaders(NextResponse.json(\n...stuff...\n});
    // Replace with: return addCacheHeaders(NextResponse.json(\n...stuff...\n}));
    content = content.replace(/return addCacheHeaders\(NextResponse\.json\(([^]*?)\}\);/g, (match, inner) => {
      // Count parens in the inner content
      const openParens = (inner.match(/\(/g) || []).length;
      const closeParens = (inner.match(/\)/g) || []).length;
      
      // If balanced, we need one more closing paren
      if (openParens === closeParens) {
        return `return addCacheHeaders(NextResponse.json(${inner}));`;
      }
      return match;
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath}`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
  }
});

console.log(`\n✅ Fixed ${totalFixed} files!`);
