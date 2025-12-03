// Test all 20 scenarios from cofounder's plan

import { GateOrchestrator } from '../lib/gates/index.js';
import { MathGate } from '../lib/gates/math-gate.js';
import { ScienceGate } from '../lib/gates/science-gate.js';
import { APSGate } from '../lib/gates/aps-gate.js';
import { BudgetGate } from '../lib/gates/budget-gate.js';
import { DeadlineGate } from '../lib/gates/deadline-gate.js';

const gates = [
  new MathGate(),
  new ScienceGate(),
  new APSGate(),
  new BudgetGate(),
  new DeadlineGate()
];

const orchestrator = new GateOrchestrator(gates);

// Test Scenario 1: Math Lit Student Wants Engineering
async function testScenario1() {
  console.log('\n=== SCENARIO 1: Math Lit → Engineering ===');
  
  const student = {
    grade: 11,
    mathType: 'Math Literacy',
    subjects: ['Math Literacy', 'Life Sciences', 'English', 'History']
  };

  const career = {
    name: 'Mechanical Engineering',
    requiresCoreMath: true,
    category: 'Engineering'
  };

  const result = await orchestrator.checkCareer(student, career);
  
  console.log('Expected: BLOCKED');
  console.log('Actual:', result.blocked ? 'BLOCKED ✓' : 'ALLOWED ✗');
  console.log('Reason:', result.criticalBlocks[0]?.reason);
  console.log('Alternatives:', result.criticalBlocks[0]?.alternatives);
  
  return result.blocked === true;
}

// Test Scenario 2: Grade 12 Low Math, Wants Medicine
async function testScenario2() {
  console.log('\n=== SCENARIO 2: Low Math → Medicine ===');
  
  const student = {
    grade: 12,
    mathType: 'Pure Mathematics',
    mathMark: 52,
    subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences', 'English']
  };

  const career = {
    name: 'Medicine',
    requiresCoreMath: true,
    requiresPhysicalScience: true,
    minMathMark: 70,
    category: 'Healthcare'
  };

  const result = await orchestrator.checkCareer(student, career);
  
  console.log('Expected: BLOCKED (gap 18%)');
  console.log('Actual:', result.blocked ? 'BLOCKED ✓' : 'ALLOWED ✗');
  console.log('Gap:', result.criticalBlocks[0]?.gap);
  
  return result.blocked === true;
}

// Test Scenario 3: Low Budget, Expensive Uni
async function testScenario3() {
  console.log('\n=== SCENARIO 3: Low Budget → UCT Engineering ===');
  
  const student = {
    grade: 11,
    budgetLimit: 'low',
    mathType: 'Pure Mathematics',
    mathMark: 80, // Above the 60% requirement
    subjects: ['Mathematics', 'Physical Sciences', 'English'],
    marks: {
      'Mathematics': 80,
      'Physical Sciences': 72,
      'English': 78,
      'History': 75,
      'Life Orientation': 82,
      'Afrikaans': 70
    } // APS = 6+6+6+6+7+6 = 37... need one more point. Let's bump Math to 80
    // Actually: Math 80=7, PhysSci 72=6, Eng 78=6, Hist 75=6, LO 82=7, Afr 70=6 = 38 APS ✓
  };

  const career = {
    name: 'Engineering',
    requiresCoreMath: true,
    requiresPhysicalScience: true,
    minMathMark: 60,
    universities: [
      { name: 'UCT', annualCost: 60000, minAPS: 38 }
    ],
    bursaries: [],
    nsfasEligible: true
  };

  const result = await orchestrator.checkCareer(student, career);
  
  console.log('Expected: WARNING (not blocked)');
  console.log('Actual:', result.blocked ? 'BLOCKED ✗' : 'WARNING ✓');
  console.log('Warnings:', result.warnings.length);
  console.log('NSFAS mentioned:', result.warnings[0]?.nsfasEligible);
  if (result.blocked) {
    console.log('Blocking reasons:', result.criticalBlocks.map(b => b.reason));
  }
  
  return !result.blocked && result.warnings.length > 0;
}

// Test Scenario 4: Grade 10 Wrong Subjects
async function testScenario4() {
  console.log('\n=== SCENARIO 4: Grade 10 Wrong Subjects → Pharmacy ===');
  
  const student = {
    grade: 10,
    subjects: ['Mathematics', 'Life Sciences', 'History', 'English']
  };

  const career = {
    name: 'Pharmacy',
    requiresPhysicalScience: true,
    category: 'Healthcare'
  };

  const result = await orchestrator.checkCareer(student, career);
  
  console.log('Expected: BLOCKED but FIXABLE');
  console.log('Actual:', result.blocked ? 'BLOCKED ✓' : 'ALLOWED ✗');
  console.log('Fixable:', result.criticalBlocks[0]?.fixable);
  console.log('Deadline:', result.criticalBlocks[0]?.deadline);
  
  return result.blocked === true && result.criticalBlocks[0]?.fixable === true;
}

// Test Scenario 5: Grade 11 Impossible Subject Add
async function testScenario5() {
  console.log('\n=== SCENARIO 5: Grade 11 Missing Physical Science ===');
  
  const student = {
    grade: 11,
    subjects: ['Mathematics', 'Life Sciences', 'English', 'History']
  };

  const career = {
    name: 'Chemical Engineering',
    requiresPhysicalScience: true,
    requiredSubjects: ['Physical Sciences'],
    category: 'Engineering'
  };

  const result = await orchestrator.checkCareer(student, career);
  
  console.log('Expected: BLOCKED, not fixable');
  console.log('Actual:', result.blocked ? 'BLOCKED ✓' : 'ALLOWED ✗');
  console.log('Fixable:', result.criticalBlocks[0]?.fixable);
  console.log('Alternatives:', result.criticalBlocks[0]?.alternatives);
  
  return result.blocked === true && result.criticalBlocks[0]?.fixable === false;
}

// Run all tests
async function runAllTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   GATE SYSTEM TEST SUITE (5/20)       ║');
  console.log('╚════════════════════════════════════════╝');

  const results = [];
  
  results.push(await testScenario1());
  results.push(await testScenario2());
  results.push(await testScenario3());
  results.push(await testScenario4());
  results.push(await testScenario5());

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n╔════════════════════════════════════════╗');
  console.log(`║   RESULTS: ${passed}/${total} PASSED                 ║`);
  console.log('╚════════════════════════════════════════╝');

  if (passed === total) {
    console.log('\n✓ All critical scenarios passing!');
    console.log('✓ Ready for Week 1 integration');
  } else {
    console.log('\n✗ Some scenarios failing - review gates');
  }
}

runAllTests().catch(console.error);
