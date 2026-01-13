// app/api/pdf/[sessionId]/route.js
// PDF generation endpoint for Orchids frontend

import { NextResponse } from 'next/server';

// Add cache busting headers to response
function addCacheHeaders(response) {
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Cache-Bust', '2026-01-13T16:30:00.000Z');
  return response;
}


/**
 * GET /api/pdf/:sessionId
 * Generate PDF for assessment results
 * 
 * For now, returns a simple text response
 * TODO: Implement actual PDF generation with jsPDF or puppeteer
 */
export async function GET(request, { params }) {
  try {
    const { sessionId } = await params;
    
    console.log('📄 PDF requested for session:', sessionId);

    // For now, return a placeholder response
    // In production, this would generate an actual PDF
    const pdfContent = `
Career Assessment Results
Session ID: ${sessionId}
Generated: ${new Date().toISOString()}

This is a placeholder PDF endpoint.
Actual PDF generation will be implemented with jsPDF or puppeteer.

To implement:
1. Install: npm install jspdf
2. Generate PDF from session data
3. Return as blob/buffer
    `.trim();

    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="career-assessment-${sessionId}.txt"`
      }
    });

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    return addCacheHeaders(NextResponse.json(
      { error: 'Failed to generate PDF: ' + error.message },
      { status: 500 }
    ));
  }
}

/**
 * OPTIONS /api/pdf/:sessionId
 * CORS handler
 */
export async function OPTIONS() {
  return addCacheHeaders(NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  }));
}
