// Week 2: Post-Correction Layer with POPIA Compliance

import { popiaSanitiser } from '../compliance/popia-sanitiser.js';
import { ConsentGate } from '../compliance/consent-gate.js';
import { POPIAAuditLogger } from '../compliance/popia-audit.js';
import { llmProvider } from '../llm/llm-adapter.js';

export async function postCorrect(student, draftReport, gateResults, session) {
  const blockedCareers = gateResults.blocked || [];
  const warnings = gateResults.warnings || [];

  // BLOCKER 1: Check consent
  try {
    ConsentGate.enforceConsent(session);
  } catch (error) {
    console.log('[POST-CORRECT] Consent not given, skipping external processing');
    return {
      finalReport: draftReport,
      issuesFound: [],
      correctionsMade: [],
      skipped: 'No consent for external processing'
    };
  }

  // BLOCKER 2: Sanitise student data
  const sanitisedStudent = popiaSanitiser.sanitiseProfile(student);
  const sanitisedReport = popiaSanitiser.sanitiseReportText(draftReport);

  const prompt = buildCorrectionPrompt(sanitisedStudent, sanitisedReport, blockedCareers, warnings);

  try {
    // BLOCKER 3 & 4: Use guarded LLM adapter
    const result = await llmProvider.generateJSON(prompt, {
      maxTokens: 3000,
      timeout: 5000,
      fallback: {
        issues_found: [],
        corrections_made: [],
        final_report: draftReport
      }
    });

    if (!result.success) {
      console.error('[POST-CORRECT] LLM call failed:', result.error);
      return {
        finalReport: draftReport,
        issuesFound: [],
        correctionsMade: [],
        error: result.error,
        fallback: true
      };
    }

    const corrected = result.data;

    // BLOCKER 5: Audit trail
    await POPIAAuditLogger.logExternalAPICall({
      provider: llmProvider.name,
      sanitised: true,
      piiDetected: popiaSanitiser.getAuditTrail().flatMap(a => a.piiDetected),
      piiRemoved: popiaSanitiser.getAuditTrail().flatMap(a => a.piiDetected),
      sessionId: session.id,
      userConsent: true,
      purpose: 'Post-correction of career report'
    });

    // Log for monitoring
    await logCorrection({
      studentId: sanitisedStudent.grade + '_' + Date.now(), // No real student ID
      issuesFound: corrected.issues_found.length,
      correctionsMade: corrected.corrections_made.length,
      timestamp: new Date().toISOString(),
      cost: result.metadata?.cost || 0
    });

    return {
      finalReport: corrected.final_report,
      issuesFound: corrected.issues_found,
      correctionsMade: corrected.corrections_made,
      metadata: result.metadata
    };
  } catch (error) {
    console.error('[POST-CORRECTION] Error:', error);
    // Fallback: return draft if correction fails
    return {
      finalReport: draftReport,
      issuesFound: [],
      correctionsMade: [],
      error: error.message
    };
  }
}

function buildCorrectionPrompt(student, draftReport, blockedCareers, warnings) {
  const currentDate = new Date().toLocaleDateString('en-ZA', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `You are Thandi, a South African career counselor. Review this draft report for accuracy and completeness.

STUDENT PROFILE:
- Grade: ${student.grade}
- Subjects: ${student.subjects?.join(', ') || 'Not specified'}
- Math: ${student.mathMark}% (${student.mathType || 'Not specified'})
- Budget: ${student.budgetLimit || 'Not specified'}
- Location: ${student.location || 'Not specified'}
- Current date: ${currentDate}

CAREERS BLOCKED BY GATES:
${blockedCareers.map(c => `- ${c.career?.name}: ${c.gateResult?.criticalBlocks?.map(b => b.reason).join('; ')}`).join('\n') || 'None'}

WARNINGS DETECTED:
${warnings.map(w => `- ${w.reason}`).join('\n') || 'None'}

DRAFT REPORT:
${draftReport}

YOUR TASK:
1. Check if blocked careers are mentioned (they shouldn't be)
2. Verify warnings are addressed (e.g., if Math is low, did we mention how to improve?)
3. Ensure NSFAS is mentioned if budget is "low"
4. Add "backup plan" section if Grade 12 and < 3 careers recommended
5. Check tone: encouraging but realistic

CRITICAL CONTEXT:
- If student is Grade 12 and it's November, finals are in 1 month - focus on IMMEDIATE actions (applications, bursaries closing soon)
- If Grade 10-11, focus on subject choices and exploration
- Always mention NSFAS if budget is low (household income < R350K qualifies)
- If only 1-2 careers recommended, add backup options

OUTPUT (JSON format):
{
  "issues_found": ["issue1", "issue2"],
  "corrections_made": ["correction1", "correction2"],
  "final_report": "corrected report text"
}`;
}

async function logCorrection(data) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await supabase.from('correction_logs').insert({
      student_id: data.studentId,
      issues_found: data.issuesFound,
      corrections_made: data.correctionsMade,
      created_at: data.timestamp
    });
  } catch (error) {
    console.error('[LOGGING] Error logging correction:', error);
  }
}
