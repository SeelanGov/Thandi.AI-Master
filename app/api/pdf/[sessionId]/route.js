// app/api/pdf/[sessionId]/route.js
// Professional PDF generation endpoint using ProfessionalPDFGenerator

import { NextResponse } from 'next/server';
import { ProfessionalPDFGenerator } from '../../../results/services/ProfessionalPDFGenerator.js';

/**
 * GET /api/pdf/:sessionId
 * Generate professional PDF for assessment results using ProfessionalPDFGenerator
 */
export async function GET(request, { params }) {
  try {
    const { sessionId } = await params;
    
    console.log('📄 Professional PDF requested for session:', sessionId);

    // Get session data from localStorage simulation or database
    // For now, we'll create sample data structure that matches the expected format
    const sampleParsedResults = {
      headerData: {
        gradeLevel: 12,
        hasMarks: true,
        apsScore: 35,
        projectedApsRange: { min: 32, max: 38 },
        universityEligible: true
      },
      programs: [
        {
          program: 'Bachelor of Commerce',
          university: 'University of Cape Town',
          feasibility: 'high',
          apsRequired: 32,
          admissionChance: 85,
          applicationDeadline: '30 Sep 2026'
        },
        {
          program: 'Bachelor of Science',
          university: 'University of the Witwatersrand',
          feasibility: 'medium',
          apsRequired: 36,
          admissionChance: 65,
          applicationDeadline: '30 Sep 2026'
        }
      ],
      bursaries: [
        {
          name: 'National Student Financial Aid Scheme',
          amount: 'Full tuition + allowances',
          eligibilityMatch: 90,
          deadline: '31 Jan 2026',
          urgency: 'CRITICAL'
        },
        {
          name: 'University Merit Bursary',
          amount: 'R50,000 per year',
          eligibilityMatch: 75,
          deadline: '30 Nov 2025',
          urgency: 'HIGH'
        }
      ],
      actionPlan: {
        timeline: 'Grade 12 Critical Year - University Applications Due',
        actionItems: [
          'Complete university applications by September 30, 2026',
          'Apply for NSFAS funding by January 31, 2026',
          'Focus on improving Mathematics and Physical Sciences marks',
          'Research backup career options and TVET programs',
          'Schedule university campus visits and open days'
        ],
        gradeSpecificGuidance: [
          'Grade 12 is your final year - every mark counts toward your final APS score',
          'University applications open in April - prepare all required documents early',
          'NSC examinations in October/November will determine your final university eligibility'
        ]
      }
    };

    const sampleStudentData = {
      name: 'Student',
      surname: 'Assessment',
      grade: sessionId.includes('grade') ? sessionId.match(/grade(\d+)/)?.[1] : '12'
    };

    // Create professional PDF using our existing generator
    const pdfGenerator = new ProfessionalPDFGenerator(sampleParsedResults, sampleStudentData);
    const pdf = pdfGenerator.generateProfessionalReport();
    
    // Get PDF as buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    console.log('✅ Professional PDF generated successfully');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="thandi-career-report-${sessionId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    const { sessionId } = await params;
    console.error('❌ Professional PDF generation error:', error);
    
    // Fallback to basic text response if PDF generation fails
    const fallbackContent = `
THANDI.AI Career Assessment Results
Session ID: ${sessionId}
Generated: ${new Date().toISOString()}

Professional PDF generation encountered an error: ${error.message}

Please contact support or try downloading from the results page directly.
    `.trim();

    return new NextResponse(fallbackContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="career-assessment-${sessionId}.txt"`
      }
    });
  }
}

/**
 * OPTIONS /api/pdf/:sessionId
 * CORS handler
 */
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
