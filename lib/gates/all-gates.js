// Gates 6-10: Additional Safety Checks

export class NBTGate {
  name = 'NBT Gate';

  check(student, career) {
    // Only for Grade 12 applying to universities that require NBT
    if (student.grade !== 12) return { blocked: false };
    if (!career.requiresNBT) return { blocked: false };

    const currentMonth = new Date().getMonth() + 1; // 1-12
    const nbtDeadline = 7; // July

    if (!student.hasWrittenNBT && currentMonth >= nbtDeadline) {
      return {
        blocked: false, // Warning, not hard block
        reason: 'Most universities require NBT by July - register immediately',
        severity: 'WARNING',
        action: 'Register at www.nbt.ac.za'
      };
    }

    return { blocked: false };
  }
}

export class LanguageGate {
  name = 'Language Gate';

  check(student, career) {
    const englishMark = student.marks?.English || student.marks?.['English Home Language'];
    
    if (career.minEnglishMark && englishMark && englishMark < career.minEnglishMark) {
      const gap = career.minEnglishMark - englishMark;
      return {
        blocked: gap > 20,
        reason: `Career needs ${career.minEnglishMark}% English, you have ${englishMark}%`,
        severity: gap > 20 ? 'CRITICAL' : 'WARNING',
        gap,
        action: gap <= 15 ? 'Focus on improving English comprehension and writing' : null
      };
    }

    return { blocked: false };
  }
}

export class NSFASGate {
  name = 'NSFAS Gate';

  check(student, career) {
    // If student indicated low budget but doesn't know about NSFAS
    if (student.budgetLimit === 'low' && !student.knowsAboutNSFAS) {
      const householdIncome = student.householdIncome || 0;
      
      if (householdIncome < 350000) {
        return {
          blocked: false,
          reason: 'You qualify for NSFAS funding',
          severity: 'INFO',
          action: 'Apply at www.nsfas.org.za before November 30',
          coverage: 'Covers tuition, accommodation, meals, and transport'
        };
      }
    }

    return { blocked: false };
  }
}

export class CategoryMismatchGate {
  name = 'Category Mismatch Gate';

  check(student, career) {
    // Check for obvious mismatches based on student preferences
    const dislikes = student.dislikes || [];
    
    if (career.category === 'Healthcare' && dislikes.includes('blood')) {
      return {
        blocked: true,
        reason: 'You indicated discomfort with blood - healthcare may not be suitable',
        severity: 'CRITICAL',
        alternatives: ['Pharmacy', 'Medical Research', 'Health Administration']
      };
    }

    if (career.requiresPublicSpeaking && dislikes.includes('public speaking')) {
      return {
        blocked: false,
        reason: 'This career involves significant public speaking',
        severity: 'WARNING',
        alternatives: []
      };
    }

    return { blocked: false };
  }
}

export class GeographicGate {
  name = 'Geographic Gate';

  check(student, career) {
    if (!student.locationPreference || student.locationPreference === 'anywhere') {
      return { blocked: false };
    }

    const universities = career.universities || [];
    const availableInRegion = universities.filter(
      uni => uni.province === student.locationPreference
    );

    if (universities.length > 0 && availableInRegion.length === 0) {
      return {
        blocked: false,
        reason: `This career is not offered in ${student.locationPreference}`,
        severity: 'WARNING',
        nearestOptions: universities.slice(0, 3).map(u => `${u.name} (${u.province})`)
      };
    }

    return { blocked: false };
  }
}
