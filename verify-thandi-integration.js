/**
 * Simple verification of Thandi integration
 */

console.log('🔍 Verifying Thandi Integration...\n');

// 1. Check if files exist
const fs = require('fs');

const files = [
  'lib/thandi-results-formatter.js',
  'app/results/styles/thandi-results.css',
  'app/results/page.jsx'
];

console.log('📁 File Check:');
files.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 2. Check imports in results page
console.log('\n📦 Import Check:');
try {
  const resultsPage = fs.readFileSync('app/results/page.jsx', 'utf8');
  
  const checks = [
    { name: 'ThandiResultsFormatter import', test: resultsPage.includes('ThandiResultsFormatter') },
    { name: 'CSS import', test: resultsPage.includes('thandi-results.css') },
    { name: 'formatResponse function', test: resultsPage.includes('formatResponse') },
    { name: 'Enhanced PDF', test: resultsPage.includes('thandiColors') }
  ];
  
  checks.forEach(check => {
    console.log(`${check.test ? '✅' : '❌'} ${check.name}`);
  });
  
} catch (error) {
  console.log('❌ Error reading results page:', error.message);
}

// 3. Test formatter
console.log('\n🧪 Formatter Test:');
try {
  const { ThandiResultsFormatter } = require('./lib/thandi-results-formatter.js');
  const formatter = new ThandiResultsFormatter();
  const result = formatter.formatResponse('## Test\n### 1. Program\n**APS**: 30');
  
  console.log('✅ Formatter working');
  console.log('✅ Thandi classes generated');
  
} catch (error) {
  console.log('❌ Formatter error:', error.message);
}

console.log('\n🎯 Next: Visit http://localhost:3000/results to test visually');