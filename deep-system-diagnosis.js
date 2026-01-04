// Deep System Diagnosis - Check actual functionality
console.log('🔬 DEEP SYSTEM DIAGNOSIS');
console.log('='.repeat(60));

const fs = require('fs');

// Check if .env.local exists and what's in it
console.log('\n🔐 ENVIRONMENT VARIABLES DEEP CHECK...');
try {
  if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    console.log(`✅ .env.local exists with ${lines.length} variables`);
    
    // Check for empty or placeholder values
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        if (value.includes('your_') || value.includes('placeholder') || value.length < 10) {
          console.log(`⚠️  ${key}: Appears to be placeholder value`);
        } else {
          console.log(`✅ ${key}: Has value (${value.length} chars)`);
        }
      }
    });
  } else {
    console.log('❌ .env.local file not found');
  }
} catch (error) {
  console.log(`❌ Error reading .env.local: ${error.message}`);
}

// Check Supabase client setup
console.log('\n🗄️ SUPABASE CLIENT CHECK...');
const supabaseClientPaths = [
  'lib/supabase/client.js',
  'lib/supabase.js',
  'utils/supabase.js',
  'lib/supabase/index.js'
];

let supabaseClientFound = false;
supabaseClientPaths.forEach(path => {
  if (fs.existsSync(path)) {
    console.log(`✅ Supabase client found: ${path}`);
    supabaseClientFound = true;
    
    try {
      const content = fs.readFileSync(path, 'utf8');
      if (content.includes('createClient')) {
        console.log(`✅ ${path}: Contains createClient`);
      } else {
        console.log(`⚠️  ${path}: Missing createClient`);
      }
    } catch (error) {
      console.log(`❌ Error reading ${path}: ${error.message}`);
    }
  }
});

if (!supabaseClientFound) {
  console.log('❌ No Supabase client file found in common locations');
}

// Check for database connection issues
console.log('\n🔌 DATABASE CONNECTION CHECK...');
try {
  // Look for any database connection files
  const dbFiles = [
    'lib/database.js',
    'lib/db.js',
    'utils/database.js',
    'config/database.js'
  ];
  
  let dbConfigFound = false;
  dbFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ Database config found: ${file}`);
      dbConfigFound = true;
    }
  });
  
  if (!dbConfigFound) {
    console.log('⚠️  No dedicated database config files found');
  }
} catch (error) {
  console.log(`❌ Database check error: ${error.message}`);
}

// Check RAG system dependencies
console.log('\n🧠 RAG SYSTEM CHECK...');
const ragFiles = [
  'lib/rag/search.js',
  'lib/rag/embeddings.js',
  'lib/rag/retrieval.mjs',
  'lib/openai.js',
  'lib/embeddings.js'
];

ragFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ RAG file exists: ${file}`);
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for key RAG functionality
      if (content.includes('embedding') || content.includes('vector')) {
        console.log(`✅ ${file}: Contains embedding/vector logic`);
      }
      
      if (content.includes('supabase') || content.includes('database')) {
        console.log(`✅ ${file}: Contains database integration`);
      }
      
      if (content.includes('openai') || content.includes('OpenAI')) {
        console.log(`✅ ${file}: Contains OpenAI integration`);
      }
      
    } catch (error) {
      console.log(`❌ Error reading ${file}: ${error.message}`);
    }
  } else {
    console.log(`❌ RAG file missing: ${file}`);
  }
});

// Check assessment form integration
console.log('\n📝 ASSESSMENT FORM INTEGRATION CHECK...');
try {
  const assessmentForm = 'app/assessment/components/AssessmentForm.jsx';
  if (fs.existsSync(assessmentForm)) {
    const content = fs.readFileSync(assessmentForm, 'utf8');
    
    // Check calendar integration
    if (content.includes('emergency-calendar')) {
      console.log('⚠️  Assessment form uses emergency-calendar (old)');
    }
    if (content.includes('pure-commonjs-calendar')) {
      console.log('✅ Assessment form uses pure-commonjs-calendar (new)');
    }
    if (content.includes('comprehensive-calendar')) {
      console.log('⚠️  Assessment form uses comprehensive-calendar');
    }
    
    // Check for API integration
    if (content.includes('/api/')) {
      console.log('✅ Assessment form has API integration');
    } else {
      console.log('⚠️  Assessment form missing API integration');
    }
    
    // Check for state management
    if (content.includes('useState') && content.includes('useEffect')) {
      console.log('✅ Assessment form has proper React hooks');
    } else {
      console.log('⚠️  Assessment form missing React hooks');
    }
    
  } else {
    console.log('❌ Assessment form not found');
  }
} catch (error) {
  console.log(`❌ Assessment form check error: ${error.message}`);
}

// Check API routes
console.log('\n🔌 API ROUTES CHECK...');
const apiRoutes = [
  'app/api/assessment/route.js',
  'app/api/rag/route.js',
  'app/api/embeddings/route.js',
  'pages/api/assessment.js',
  'pages/api/rag.js'
];

let apiRoutesFound = 0;
apiRoutes.forEach(route => {
  if (fs.existsSync(route)) {
    console.log(`✅ API route exists: ${route}`);
    apiRoutesFound++;
  }
});

if (apiRoutesFound === 0) {
  console.log('❌ No API routes found - system cannot function');
} else {
  console.log(`✅ Found ${apiRoutesFound} API routes`);
}

// Check build configuration
console.log('\n🔨 BUILD SYSTEM CHECK...');
try {
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  
  if (nextConfig.includes('experimental')) {
    console.log('✅ Next.js config has experimental features');
  }
  
  if (nextConfig.includes('env')) {
    console.log('✅ Next.js config has environment variables');
  }
  
  if (nextConfig.includes('webpack')) {
    console.log('✅ Next.js config has webpack customization');
  }
  
} catch (error) {
  console.log(`❌ Next.js config check error: ${error.message}`);
}

// Check for common error patterns
console.log('\n🐛 COMMON ERROR PATTERNS CHECK...');

// Check for import/export issues
const jsxFiles = [
  'app/assessment/page.jsx',
  'app/results/page.jsx',
  'app/layout.js',
  'app/page.js'
];

jsxFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for common issues
      if (content.includes("'use client'") || content.includes('"use client"')) {
        console.log(`✅ ${file}: Has 'use client' directive`);
      } else if (file.includes('.jsx')) {
        console.log(`⚠️  ${file}: Missing 'use client' directive (may need it)`);
      }
      
      // Check for proper imports
      const importCount = (content.match(/^import /gm) || []).length;
      const exportCount = (content.match(/^export /gm) || []).length;
      
      if (importCount > 0 && exportCount > 0) {
        console.log(`✅ ${file}: Has imports (${importCount}) and exports (${exportCount})`);
      } else {
        console.log(`⚠️  ${file}: Unusual import/export pattern`);
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${file}: ${error.message}`);
    }
  }
});

console.log('\n🎯 DEEP DIAGNOSIS COMPLETE');
console.log('='.repeat(60));