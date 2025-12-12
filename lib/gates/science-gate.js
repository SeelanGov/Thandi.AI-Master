// Gate 2: Physical Science Requirement

export class ScienceGate {
  name = 'Science Gate';

  check(student, career) {
    if (career.requiresPhysicalScience && !student.subjects?.includes('Physical Sciences')) {
      return {
        blocked: true,
        reason: `This career requires Physical Sciences (you're not taking it)`,
        severity: 'CRITICAL',
        fixable: student.grade === 10,
        deadline: student.grade === 10 
          ? 'Add Physical Sciences in 2026' 
          : 'Too late to add subjects',
        alternatives: this.findAlternatives(career, student)
      };
    }

    return { blocked: false };
  }

  findAlternatives(career, student) {
    // If they have Life Sciences, suggest bio-focused careers
    if (student.subjects?.includes('Life Sciences')) {
      return career.category === 'Engineering'
        ? ['Biotechnology', 'Environmental Engineering', 'Food Science']
        : ['Biotechnology', 'Microbiology', 'Genetics'];
    }

    // Otherwise suggest non-science alternatives
    return career.category === 'Engineering'
      ? ['Software Engineering', 'Data Science', 'IT']
      : ['Business', 'Marketing', 'HR'];
  }
}
