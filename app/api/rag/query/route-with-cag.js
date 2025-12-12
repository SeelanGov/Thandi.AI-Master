// Production RAG endpoint with CAG Quality Layer
import { getRelevantGate } from '@/lib/curriculum/query-gates-simple';
import { ConsentGate } from '@/lib/compliance/consent-gate';
import { POPIASanitiser } from '@/lib/compliance/popia-sanitiser';
import { LLMAdapter } from '@/lib/llm/llm-adapter';
import { guardedClient } from '@/lib/llm/guarded-client';
import { generatePersonalizedReport } from '@/lib/rag/report-generator';

// Task 7.1: Import CAG Layer
const { CAGLayer } = require('@/lib/cag/index.cjs');

// Task 7.3: Initialize CAG with monitoring
const cag = new CAGLayer();
let cagStats = {
  totalVerifications: 0,
  decisions: { approved: 0, revised: 0, rejected: 0, fallback: 0 },
  avgProcessingTime: 0
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, curriculumProfile, session } = body;

    // BLOCKER 2: Check consent first
    const consentCheck = ConsentGate.checkConsent(session || {});
    
    if (!consentCheck.allowed) {
      console.log('[COMPLIANCE] No consent given, returning RAG-powered draft report');
      const reportData = await generatePersonalizedReport(curriculumProfile || {});
      const draftReport = formatReportAsText(reportData, null);
      return new Response(JSON.stringify({
        success: true,
        response: draftReport,
        fullResponse: draftReport,
        source: 'rag_draft',
        matchingMethod: reportData.matchingMethod,
        compliance: {
          consent: false,
          reason: consentCheck.reason
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // BLOCKER 1: Sanitise PII before any processing
    const sanitiser = new POPIASanitiser();
    const sanitisedProfile = sanitiser.sanitiseProfile(curriculumProfile || {});
    const sanitisedQuery = sanitiser.sanitiseReportText(query || '');

    console.log('[COMPLIANCE] Profile sanitised, PII removed');

    // Get curriculum gate if profile provided
    let gate = null;
    if (sanitisedProfile && sanitisedProfile.subjects) {
      gate = await getRelevantGate(
        sanitisedProfile.grade || 10,
        sanitisedProfile.subjects || [],
        sanitisedQuery
      );
    }

    // Generate RAG-powered personalized report
    console.log('[RAG] Generating personalized career report...');
    const reportData = await generatePersonalizedReport(sanitisedProfile);
    const draftReport = formatReportAsText(reportData, gate);
    console.log(`[RAG] Report generated: ${reportData.matchingMethod}, ${reportData.careers?.length || 0} careers`);

    // Task 7.1: Convert RAG chunks for CAG
    const ragChunks = convertReportDataToChunks(reportData);

    // BLOCKER 4: Get LLM provider via adapter
    const provider = LLMAdapter.getDefaultProvider();

    // BLOCKER 3: Use guarded client for external API call
    const enhancementPrompt = buildEnhancementPrompt(sanitisedProfile, draftReport, gate);
    
    const result = await guardedClient.execute(
      async () => provider.generateText(enhancementPrompt),
      { 
        maxTokens: 3000,
        fallback: draftReport
      }
    );

    if (!result.success) {
      console.log('[GUARDED] Enhancement failed, returning draft:', result.error);
      return new Response(JSON.stringify({
        success: true,
        response: draftReport,
        fullResponse: draftReport,
        source: 'draft',
        compliance: {
          consent: true,
          sanitised: true,
          enhanced: false,
          reason: result.error
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[SUCCESS] Report enhanced via LLM');

    // Task 7.1: CAG VERIFICATION - Verify LLM-enhanced answer
    console.log('[CAG] Starting quality verification...');
    const cagStartTime = Date.now();
    
    const cagResult = await cag.verify({
      draftAnswer: result.data,
      ragChunks: ragChunks,
      studentProfile: sanitisedProfile,
      query: sanitisedQuery,
      ragDraft: draftReport,
      options: {
        skipLLMVerification: false, // Enable full verification
        strictMode: false
      }
    });

    const cagProcessingTime = Date.now() - cagStartTime;
    console.log(`[CAG] Verification complete: ${cagResult.decision} (${cagProcessingTime}ms)`);

    // Task 7.3: Update CAG statistics
    updateCAGStats(cagResult.decision, cagProcessingTime);

    // Task 7.3: Log CAG decision details
    if (cagResult.metadata.issuesDetected.length > 0) {
      console.log(`[CAG] Issues detected: ${cagResult.metadata.issuesDetected.length}`);
      cagResult.metadata.issuesDetected.forEach(issue => {
        console.log(`  - ${issue.severity}: ${issue.type} - ${issue.problem}`);
      });
    }

    if (cagResult.metadata.revisionsApplied.length > 0) {
      console.log(`[CAG] Revisions applied: ${cagResult.metadata.revisionsApplied.length}`);
    }

    // Determine final source based on CAG decision
    let finalSource = 'enhanced';
    if (cagResult.decision === 'fallback') {
      finalSource = 'draft_fallback';
    } else if (cagResult.decision === 'revised') {
      finalSource = 'enhanced_revised';
    } else if (cagResult.decision === 'rejected') {
      finalSource = 'draft_rejected';
    }

    // Return CAG-verified response
    return new Response(JSON.stringify({
      success: true,
      query: sanitisedQuery,
      gate: gate,
      response: cagResult.finalAnswer,
      fullResponse: cagResult.finalAnswer,
      source: finalSource,
      compliance: {
        consent: true,
        sanitised: true,
        enhanced: true,
        cagVerified: true
      },
      cag: {
        decision: cagResult.decision,
        confidence: cagResult.metadata.confidence,
        processingTime: cagResult.metadata.processingTime,
        issuesDetected: cagResult.metadata.issuesDetected.length,
        revisionsApplied: cagResult.metadata.revisionsApplied.length,
        requiresHuman: cagResult.metadata.requiresHuman,
        stagesCompleted: cagResult.metadata.stagesCompleted
      },
      metadata: result.metadata
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[ERROR] RAG pipeline failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  // Task 7.3: Include CAG stats in health check
  const stats = cag.getStats();
  
  return new Response(
    JSON.stringify({
      status: 'ok',
      endpoint: '/api/rag/query',
      version: '3.0.0-cag',
      blockers: ['consent', 'sanitiser', 'guarded-client', 'adapter', 'cag-layer'],
      cag: {
        enabled: true,
        stats: {
          totalVerifications: stats.totalVerifications,
          avgProcessingTime: Math.round(stats.avgProcessingTime) + 'ms',
          decisionDistribution: stats.decisionPercentages
        }
      }
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

// Task 7.1: Convert report data to RAG chunks format
function convertReportDataToChunks(reportData) {
  const chunks = [];
  
  // Convert each career to a chunk
  reportData.careers?.forEach((career, index) => {
    chunks.push({
      id: `career_${index}`,
      chunk_text: `${career.title}: ${career.description}. Requirements: ${career.requirements}. Pathways: ${career.pathways.join(', ')}. Salary: ${career.salaryRange}.`,
      chunk_metadata: {
        source: `career_${career.title.toLowerCase().replace(/\s+/g, '_')}`,
        category: 'career',
        career: career.title
      },
      similarity: career.match === 'excellent' ? 0.95 : career.match === 'good' ? 0.85 : 0.75
    });
  });
  
  // Add guidance as a chunk
  if (reportData.personalizedGuidance) {
    chunks.push({
      id: 'guidance',
      chunk_text: reportData.personalizedGuidance,
      chunk_metadata: {
        source: 'personalized_guidance',
        category: 'guidance'
      },
      similarity: 1.0
    });
  }
  
  return chunks;
}

// Task 7.3: Update CAG statistics
function updateCAGStats(decision, processingTime) {
  cagStats.totalVerifications++;
  cagStats.decisions[decision]++;
  
  // Update rolling average
  const n = cagStats.totalVerifications;
  cagStats.avgProcessingTime = ((cagStats.avgProcessingTime * (n - 1)) + processingTime) / n;
}

// Helper: Format RAG report data as text
function formatReportAsText(reportData, gate) {
  let text = `### Your Personalized Career Matches\n\n`;
  text += `${reportData.personalizedGuidance}\n\n`;
  
  // Format each career
  reportData.careers?.forEach((career, index) => {
    text += `**${index + 1}. ${career.title}** (${career.match} match)\n`;
    text += `- ${career.description}\n`;
    text += `- Requirements: ${career.requirements}\n`;
    text += `- Pathways: ${career.pathways.join(', ')}\n`;
    text += `- Salary: ${career.salaryRange}\n`;
    if (career.demand) text += `- Demand: ${career.demand}\n`;
    text += `\n`;
  });
  
  // Add curriculum gate if available
  if (gate && gate.guidance) {
    text += `### Curriculum Guidance\n${gate.guidance}\n\n`;
  }
  
  // Add next steps
  if (reportData.nextSteps && reportData.nextSteps.length > 0) {
    text += `### Next Steps\n\n`;
    reportData.nextSteps.forEach((step, index) => {
      text += `${index + 1}. ${step}\n`;
    });
    text += `\n`;
  }
  
  // Add resources
  if (reportData.additionalResources && reportData.additionalResources.length > 0) {
    text += `### Additional Resources\n\n`;
    reportData.additionalResources.forEach((resource) => {
      text += `- ${resource}\n`;
    });
    text += `\n`;
  }
  
  // Add verification warning
  text += `\n⚠️ **Verify before you decide:**\n`;
  text += `1. Speak with your school counselor\n`;
  text += `2. Call the institution directly\n`;
  text += `3. Check official websites\n\n`;
  text += `*Thandi's data may be outdated. Always confirm with real people.*`;
  
  return text;
}

// Helper: Build enhancement prompt for LLM
function buildEnhancementPrompt(profile, draftReport, gate) {
  return `You are Thandi, a South African career counselor. Enhance this draft career report with personalized guidance.

STUDENT PROFILE (sanitised):
- Grade: ${profile?.grade || 'unknown'}
- Subjects: ${profile?.subjects?.join(', ') || 'not specified'}
- Math: ${profile?.mathMark || 'unknown'}% (${profile?.mathType || 'unknown'})
- Province: ${profile?.province || 'unknown'}
- Budget: ${profile?.budgetLimit || 'unknown'}

DRAFT REPORT:
${draftReport}

YOUR TASK:
1. Personalize the career recommendations based on the student's profile
2. Add specific guidance for their grade level
3. Mention NSFAS if budget is limited
4. Keep the tone encouraging but realistic
5. CRITICAL: You MUST include this exact warning at the end:

⚠️ **Verify before you decide:**
1. Speak with your school counselor
2. Call the institution directly
3. Check official websites

*Thandi's data may be outdated. Always confirm with real people.*

Return the enhanced report as plain text (no JSON).`;
}
