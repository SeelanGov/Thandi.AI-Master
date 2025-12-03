// Gate 1: Math Literacy vs Pure Math

export class MathGate {
  name = 'Math Gate';

  check(student, career) {
    // Gate 1a: Math Lit trying to access Pure Math career
    if (student.mathType === 'Math Literacy' && career.requiresCoreMath) {
      return {
        blocked: true,
        reason: `This career requires Pure Mathematics (you have Math Literacy)`,
        severity: 'CRITICAL',
        fixable: student.grade === 10,
        deadline: student.grade === 10 
          ? 'January 2026 (switch subjects now)' 
          : 'Too late to switch',
        alternatives: this.findMathLitAlternatives(career.category)
      };
    }

    // Gate 1b: Pure Math mark below threshold
    if (student.mathMark !== undefined && career.minMathMark && student.mathMark < career.minMathMark) {
      const gap = career.minMathMark - student.mathMark;
      const isBlocked = gap > 15; // Hard block if gap > 15%
      
      return {
        blocked: isBlocked,
        reason: `You need ${career.minMathMark}% Math, you currently have ${student.mathMark}%`,
        severity: isBlocked ? 'CRITICAL' : 'WARNING',
        gap,
        achievable: gap <= 15,
        action: `Improve Math by ${gap}% by focusing on [specific topics]`
      };
    }

    return { blocked: false };
  }

  findMathLitAlternatives(category) {
    const alternatives = {
      'Engineering': ['Software Engineering', 'IT', 'Data Science'],
      'Science': ['Environmental Science', 'Biotechnology'],
      'Finance': ['Marketing', 'HR', 'Business Management']
    };
    return alternatives[category] || ['IT', 'Marketing', 'HR'];
  }
}
