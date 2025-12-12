// Gate 4: Budget Constraints (Soft Warning)

export class BudgetGate {
  name = 'Budget Gate';

  check(student, career) {
    if (student.budgetLimit !== 'low') return { blocked: false };

    const universities = career.universities || [];
    if (universities.length === 0) return { blocked: false };

    const avgCost = universities.reduce((sum, uni) => sum + (uni.annualCost || 0), 0) / universities.length;

    if (avgCost > 40000 && (!career.bursaries || career.bursaries.length === 0)) {
      return {
        blocked: false, // Don't hard-block, just warn
        reason: `Average cost R${Math.round(avgCost)}/year may be unaffordable`,
        severity: 'WARNING',
        nsfasEligible: career.nsfasEligible !== false,
        bursaries: career.bursaries?.length > 0
          ? career.bursaries
          : ['No major bursaries found—consider TVET alternative'],
        alternatives: [
          career.tvetAlternative ? `${career.tvetAlternative} (R5K/year, NSFAS funded)` : null,
          'Distance learning via UNISA (R20K/year)'
        ].filter(Boolean)
      };
    }

    return { blocked: false };
  }
}
