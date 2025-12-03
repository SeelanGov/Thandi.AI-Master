// Integration layer: Gates + RAG + Post-Correction

import { GateOrchestrator } from './index.js';
import { MathGate } from './math-gate.js';
import { ScienceGate } from './science-gate.js';
import { APSGate } from './aps-gate.js';
import { BudgetGate } from './budget-gate.js';
import { DeadlineGate } from './deadline-gate.js';
import { NBTGate, LanguageGate, NSFASGate, CategoryMismatchGate, GeographicGate } from './all-gates.js';

// Initialize all gates
const gates = [
  new MathGate(),
  new ScienceGate(),
  new APSGate(),
  new BudgetGate(),
  new DeadlineGate(),
  new NBTGate(),
  new LanguageGate(),
  new NSFASGate(),
  new CategoryMismatchGate(),
  new GeographicGate()
];

const orchestrator = new GateOrchestrator(gates);

export async function getRecommendationsWithGates(studentProfile, allCareers, ragSearch, generateReport) {
  console.log(`[GATES] Starting with ${allCareers.length} careers`);

  // STEP 1: Run gates to filter careers
  const filterResult = await orchestrator.filterCareers(studentProfile, allCareers);
  
  console.log(`[GATES] Filtered: ${filterResult.stats.total} → ${filterResult.stats.eligible} careers`);
  console.log(`[GATES] Blocked: ${filterResult.stats.blocked} careers`);

  // STEP 2: Run RAG on eligible careers only
  const ragRecommendations = await ragSearch(studentProfile, filterResult.eligible);

  // STEP 3: Generate draft report
  const draftReport = await generateReport(ragRecommendations, filterResult);

  // STEP 4: Return draft (post-correction will be added in Week 2)
  return {
    recommendations: ragRecommendations,
    draftReport,
    gateStats: filterResult.stats,
    blockedCareers: filterResult.blocked,
    warnings: filterResult.eligible.flatMap(career => {
      const result = filterResult.blocked.find(b => b.career.id === career.id);
      return result?.gateResult.warnings || [];
    })
  };
}

// Week 2: Post-correction function (placeholder)
export async function postCorrect(student, draftReport, gateResults) {
  // TODO: Implement Claude post-correction in Week 2
  return draftReport;
}
