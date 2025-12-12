/**
 * Misconception Detection for Thandi RAG System
 * 
 * Detects dangerous career-subject mismatches that need immediate flagging
 * before the LLM generates a response.
 */

export function detectMisconceptions(query, studentProfile) {
  const flags = [];
  const queryLower = query.toLowerCase();
  
  // Extract career interests from query
  const careerInterests = extractCareerInterests(queryLower);
  
  // Extract subjects from profile
  const subjects = studentProfile.enjoyedSubjects || [];
  const strugglingSubjects = studentProfile.strugglingSubjects || [];
  const hasMathLit = subjects.some(s => s.toLowerCase().includes('mathematical literacy'));
  const hasPureMath = subjects.some(s => s.toLowerCase().includes('mathematics') && !s.toLowerCase().includes('literacy'));
  
  // Rule 1: Medical careers require Pure Mathematics
  if (careerInterests.medical && hasMathLit && !hasPureMath) {
    flags.push({
      type: 'subject_mismatch',
      severity: 'critical',
      career: 'Medical Doctor',
      message: '⚠️ IMPORTANT: Medical school (MBChB) requires Pure Mathematics, not Mathematical Literacy. You currently have Math Lit.',
      suggestion: 'Consider healthcare alternatives that accept Math Lit: Nursing, Radiography, Emergency Medical Care, or Pharmacy Assistant.',
      verifiable: 'Parents can verify: Google "Can I study medicine with Math Lit in South Africa?"'
    });
  }
  
  // Rule 2: Engineering requires Pure Mathematics + Physical Sciences
  if (careerInterests.engineering) {
    if (hasMathLit && !hasPureMath) {
      flags.push({
        type: 'subject_mismatch',
        severity: 'critical',
        career: 'Engineering',
        message: '⚠️ IMPORTANT: Engineering degrees require Pure Mathematics, not Mathematical Literacy.',
        suggestion: 'Consider technical alternatives: IT Support, Technician roles, or TVET engineering diplomas.',
        verifiable: 'Teachers can verify: Check university engineering admission requirements.'
      });
    }
    
    const hasPhysicalScience = subjects.some(s => s.toLowerCase().includes('physical science'));
    if (!hasPhysicalScience) {
      flags.push({
        type: 'subject_missing',
        severity: 'high',
        career: 'Engineering',
        message: '⚠️ Engineering requires Physical Sciences. You don\'t have this subject listed.',
        suggestion: 'If you do take Physical Sciences, make sure to include it. If not, consider IT or software development instead.',
        verifiable: 'LO can verify: Engineering admission requirements need Physical Sciences.'
      });
    }
  }
  
  // Rule 3: Struggling with key subjects for desired career
  if (strugglingSubjects.length > 0) {
    if (careerInterests.engineering && strugglingSubjects.some(s => s.toLowerCase().includes('math'))) {
      flags.push({
        type: 'academic_concern',
        severity: 'medium',
        career: 'Engineering',
        message: '⚠️ You mentioned struggling with Mathematics, which is critical for engineering.',
        suggestion: 'Focus on improving math marks first. Consider tutoring or study groups. Target 70%+ by Grade 12.',
        verifiable: 'Teachers can verify: Your current math performance and improvement plan.'
      });
    }
    
    if (careerInterests.medical && strugglingSubjects.some(s => s.toLowerCase().includes('science'))) {
      flags.push({
        type: 'academic_concern',
        severity: 'medium',
        career: 'Medical',
        message: '⚠️ You mentioned struggling with sciences, which are critical for medical school.',
        suggestion: 'Medical school needs 70%+ in Life Sciences and Physical Sciences. Focus on improvement strategies.',
        verifiable: 'Teachers can verify: Your current science performance and support available.'
      });
    }
  }
  
  // Rule 4: First-generation student needs extra support
  if (studentProfile.familyBackground === 'no') {
    flags.push({
      type: 'support_needed',
      severity: 'info',
      message: 'As a first-generation university student, you\'ll need extra guidance.',
      suggestion: 'Talk to your LO teacher about: NSFAS applications, university visits, and mentorship programs.',
      verifiable: 'Principal can verify: First-gen student support programs available at your school.'
    });
  }
  
  return flags;
}

/**
 * Extract career interests from query text
 */
function extractCareerInterests(queryLower) {
  return {
    medical: /\b(doctor|medical|medicine|mbchb|physician)\b/.test(queryLower),
    engineering: /\b(engineer|engineering)\b/.test(queryLower),
    healthcare: /\b(nurse|nursing|healthcare|health|radiograph|pharmacy)\b/.test(queryLower),
    stem: /\b(science|technology|math|data|software|computer)\b/.test(queryLower),
    business: /\b(business|accounting|finance|economics)\b/.test(queryLower),
    creative: /\b(design|art|creative|media|content)\b/.test(queryLower)
  };
}

/**
 * Format misconception flags for LLM context
 */
export function formatMisconceptionsForLLM(flags) {
  if (flags.length === 0) return '';
  
  let context = '\n\n⚠️ CRITICAL MISCONCEPTIONS DETECTED:\n';
  
  flags.forEach((flag, idx) => {
    context += `\n${idx + 1}. ${flag.message}\n`;
    if (flag.suggestion) {
      context += `   → ${flag.suggestion}\n`;
    }
    if (flag.verifiable) {
      context += `   → ${flag.verifiable}\n`;
    }
  });
  
  context += '\nYou MUST address these misconceptions in your response. Be direct and clear about subject requirements.\n';
  
  return context;
}

/**
 * Format misconception flags for frontend display
 */
export function formatMisconceptionsForDisplay(flags) {
  if (flags.length === 0) return null;
  
  const critical = flags.filter(f => f.severity === 'critical');
  const high = flags.filter(f => f.severity === 'high');
  const medium = flags.filter(f => f.severity === 'medium');
  const info = flags.filter(f => f.severity === 'info');
  
  return {
    hasCritical: critical.length > 0,
    hasWarnings: high.length > 0 || medium.length > 0,
    critical,
    high,
    medium,
    info,
    summary: `${critical.length} critical issues, ${high.length + medium.length} warnings detected`
  };
}
