// Gate 3: APS (Admission Point Score) Reality Check

export class APSGate {
  name = 'APS Gate';

  check(student, career) {
    // Only for Grade 11-12 (Grade 10 don't have final marks yet)
    if (student.grade < 11) return { blocked: false };

    const projectedAPS = this.calculateAPS(student.marks);
    const universityOptions = career.universities || [];

    if (universityOptions.length === 0) return { blocked: false };

    const eligibleUnis = universityOptions.filter(uni => projectedAPS >= uni.minAPS);
    const blockedUnis = universityOptions.filter(uni => projectedAPS < uni.minAPS);

    if (eligibleUnis.length === 0) {
      // No universities accept this student
      const lowestRequirement = Math.min(...universityOptions.map(u => u.minAPS));
      return {
        blocked: true,
        reason: `Your projected APS (${projectedAPS}) is below all universities offering ${career.name}`,
        severity: 'CRITICAL',
        lowestRequirement,
        gap: lowestRequirement - projectedAPS,
        alternatives: [
          career.tvetAlternative ? `TVET pathway: ${career.tvetAlternative}` : null,
          'Private colleges (lower APS requirements)',
          'Gap year + improve marks'
        ].filter(Boolean)
      };
    }

    if (blockedUnis.length > 0) {
      // Some universities blocked, others open
      return {
        blocked: false,
        reason: `You qualify for ${eligibleUnis.length} universities, but not ${blockedUnis.length} others`,
        severity: 'INFO',
        eligible: eligibleUnis.map(u => u.name),
        blocked: blockedUnis.map(u => `${u.name} (needs APS ${u.minAPS})`)
      };
    }

    return { blocked: false };
  }

  calculateAPS(marks) {
    if (!marks || typeof marks !== 'object') return 0;
    
    // CAPS APS system: 7 points for 80%+, 6 for 70-79%, etc.
    const subjects = Object.values(marks).slice(0, 6); // Best 6 subjects
    return subjects.reduce((total, mark) => {
      if (mark >= 80) return total + 7;
      if (mark >= 70) return total + 6;
      if (mark >= 60) return total + 5;
      if (mark >= 50) return total + 4;
      if (mark >= 40) return total + 3;
      if (mark >= 30) return total + 2;
      return total + 1;
    }, 0);
  }
}
