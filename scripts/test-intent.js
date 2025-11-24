// scripts/test-intent.js
// Quick test for intent extraction

import { extractQueryIntent, serializeIntent } from '../lib/rag/intent-extraction.js';

const testQueries = [
  "I don't want university but need good salary",
  "creative but tech",
  "I don't have matric",
  "work from home earn dollars",
  "fast money quick earnings",
  "biology and technology"
];

console.log('🧪 INTENT EXTRACTION TEST\n');

testQueries.forEach(query => {
  const intent = extractQueryIntent(query);
  const intentKey = serializeIntent(intent);
  
  console.log(`Query: "${query}"`);
  console.log(`Intent Key: ${intentKey}`);
  console.log(`Details:`, {
    hasUniversityNegation: intent.hasUniversityNegation,
    hasMatricNegation: intent.hasMatricNegation,
    wantsCreative: intent.wantsCreative,
    wantsTech: intent.wantsTech,
    wantsRemote: intent.wantsRemote,
    wantsFastPath: intent.wantsFastPath,
    explicitCareers: intent.explicitCareers
  });
  console.log('---\n');
});

// Test the specific query from the command line
if (process.argv[2]) {
  console.log('\n🎯 CUSTOM QUERY TEST\n');
  const customQuery = process.argv[2];
  const intent = extractQueryIntent(customQuery);
  const intentKey = serializeIntent(intent);
  
  console.log(`Query: "${customQuery}"`);
  console.log(`Intent Key: ${intentKey}`);
  console.log(`Full Intent:`, JSON.stringify(intent, null, 2));
}
