/**
 * Simple Rule #2 Test - No dependencies
 */

// Copy the DANGER_TRIGGERS and checkDangerousTriggers function
const DANGER_TRIGGERS = {
  droppingOut: {
    patterns: [
      /(should i|can i|want to|thinking of|considering).*(drop out|leave school|quit school|stop school)/i,
      /do i need.*(matric|grade 12|to finish school)/i,
      /(drop|leave|quit).*(school|matric)/i,
      /dropping out/i
    ],
    response: "I don't have verified information on leaving school before completing matric."
  },
  
  noMatric: {
    patterns: [
      /(what can i do|careers|jobs|options).*(without|with no|if i don't have).*(matric|grade 12)/i,
      /(failed|didn't pass|no).* matric/i,
      /only grade (9|10|11)/i,
      /without matric/i,
      /no matric/i
    ],
    response: "I don't have verified information on pathways without matric completion."
  },
  
  largeFinancialDecision: {
    patterns: [
      /should i.*(take|get|apply for).*(loan|student loan|debt)/i,
      /(this course|this program).*worth.*R\d+/i,
      /should i pay.*R\d+/i,
      /R[1-9]\d{4,}/i,
      /student loan/i
    ],
    response: "I don't have verified information on financial decisions of this scale."
  }
};

function checkDangerousTriggers(query) {
  for (const [category, config] of Object.entries(DANGER_TRIGGERS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(query)) {
        return { category, response: config.response, triggered: true };
      }
    }
  }
  return null;
}

// Test queries
const tests = [
  { query: "I'm thinking of dropping out to do coding bootcamp", shouldTrigger: true, expectedCategory: 'droppingOut' },
  { query: "What jobs can I get without matric?", shouldTrigger: true, expectedCategory: 'noMatric' },
  { query: "What careers are good for someone good at math?", shouldTrigger: false, expectedCategory: null },
  { query: "Should I take a R50,000 student loan?", shouldTrigger: true, expectedCategory: 'largeFinancialDecision' }
];

console.log('🧪 Testing Rule #2 Trigger Detection\n');

let passed = 0;
let failed = 0;

tests.forEach((test, i) => {
  console.log(`Test ${i + 1}: "${test.query}"`);
  const result = checkDangerousTriggers(test.query);
  
  if (test.shouldTrigger) {
    if (result && result.triggered) {
      if (result.category === test.expectedCategory) {
        console.log(`✅ PASS - Triggered ${result.category}`);
        passed++;
      } else {
        console.log(`❌ FAIL - Wrong category: ${result.category} (expected ${test.expectedCategory})`);
        failed++;
      }
    } else {
      console.log(`❌ FAIL - Should have triggered but didn't`);
      failed++;
    }
  } else {
    if (!result) {
      console.log(`✅ PASS - Correctly did not trigger`);
      passed++;
    } else {
      console.log(`❌ FAIL - Should NOT have triggered but did (${result.category})`);
      failed++;
    }
  }
  console.log('');
});

console.log('='.repeat(50));
console.log(`Results: ${passed}/${tests.length} passed`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('✅ All tests passed!');
} else {
  console.log(`❌ ${failed} tests failed`);
  process.exit(1);
}
