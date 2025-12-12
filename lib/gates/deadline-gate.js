// Gate 5: Grade 11+ Subject Change (Deadline Gate)

export class DeadlineGate {
  name = 'Deadline Gate';

  check(student, career) {
    if (student.grade === 10) return { blocked: false }; // Grade 10 can still change

    const requiredSubjects = career.requiredSubjects || [];
    const studentSubjects = student.subjects || [];
    
    const missingSubjects = requiredSubjects.filter(
      subject => !studentSubjects.includes(subject)
    );

    if (missingSubjects.length > 0) {
      return {
        blocked: true,
        reason: `You need ${missingSubjects.join(', ')} but it's too late to add subjects (Grade ${student.grade})`,
        severity: 'CRITICAL',
        missingSubjects,
        alternatives: this.findCareersWithCurrentSubjects(studentSubjects, career.category)
      };
    }

    return { blocked: false };
  }

  findCareersWithCurrentSubjects(subjects, category) {
    // Simplified - in production, query database for careers matching subjects
    const hasMath = subjects.includes('Mathematics') || subjects.includes('Math Literacy');
    const hasScience = subjects.includes('Physical Sciences') || subjects.includes('Life Sciences');

    if (category === 'Engineering') {
      if (hasMath && !hasScience) return ['Software Engineering', 'IT'];
      if (!hasMath) return ['Project Management', 'Business'];
    }

    return ['Business', 'Marketing', 'HR'];
  }
}
