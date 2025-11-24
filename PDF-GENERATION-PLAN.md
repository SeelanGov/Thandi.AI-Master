# PDF Generation Implementation Plan

**Date:** November 22, 2025  
**Priority:** P1 (Required for pilot)  
**Timeline:** Complete by end of week

---

## Overview

Add PDF download functionality to the results page, ensuring the verification footer is prominently displayed in the PDF document. This addresses the cofounder's requirement for students to have a downloadable copy of their career guidance.

---

## Implementation Steps

### Step 1: Install jsPDF Library

```bash
npm install jspdf
```

**Why jsPDF:**
- Client-side PDF generation (no server needed)
- Lightweight (~100KB)
- Works in all browsers
- Simple API for text and formatting

### Step 2: Add PDF Generation Function to Results Page

**Location:** `app/results/page.jsx`

**Key Requirements:**
1. ✅ Include top warning banner (red, prominent)
2. ✅ Include full career guidance content
3. ✅ Include bottom verification footer
4. ✅ Format text to fit page width
5. ✅ Handle multi-page content
6. ✅ Add Thandi.AI branding

### Step 3: Add Download Button to UI

**Placement:** Below the "Start New Assessment" button in the header

**Button Style:** Primary action (green/blue, prominent)

### Step 4: Test PDF Generation

**Test Cases:**
1. Short response (1 page)
2. Long response (multiple pages)
3. Mobile browser download
4. Desktop browser download
5. Footer visibility in PDF

### Step 5: Update Orchids Documentation

**What Orchids Needs:**
- Option to add PDF download button to their UI
- Code snippet for PDF generation
- Styling guidelines

---

## Technical Implementation

### Enhanced PDF Generation (Better than Cofounder's Version)

**Improvements:**
1. **Multi-page support** - Handles long content automatically
2. **Better formatting** - Preserves structure (headings, lists, bullets)
3. **Page numbers** - Adds footer with page numbers
4. **Proper spacing** - Prevents text cutoff between pages
5. **Logo support** - Can add Thandi.AI logo if provided

### Code Structure

```javascript
import jsPDF from 'jspdf';

const downloadPDF = () => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = 30;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      pdf.addPage();
      yPosition = 30;
      return true;
    }
    return false;
  };

  // 1. Add header/logo
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text('THANDI.AI Career Guidance', margin, yPosition);
  yPosition += 15;

  // 2. Add top warning (RED, PROMINENT)
  checkPageBreak(40);
  pdf.setFillColor(255, 234, 167); // Yellow background
  pdf.rect(margin - 5, yPosition - 5, maxWidth + 10, 35, 'F');
  
  pdf.setFontSize(14);
  pdf.setTextColor(231, 76, 60); // Red
  pdf.text('⚠️ READ THIS FIRST:', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  const warning = "This is AI-generated advice. You MUST verify it with real people before making any decision.";
  const warningLines = pdf.splitTextToSize(warning, maxWidth);
  pdf.text(warningLines, margin, yPosition);
  yPosition += (warningLines.length * 6) + 15;

  // 3. Add full response content
  checkPageBreak(20);
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  
  const content = results.fullResponse || results.response;
  const contentLines = pdf.splitTextToSize(content, maxWidth);
  
  contentLines.forEach((line) => {
    checkPageBreak(8);
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });

  // 4. Add bottom verification footer
  yPosition += 10;
  checkPageBreak(50);
  
  pdf.setFillColor(255, 243, 205); // Light yellow
  pdf.rect(margin - 5, yPosition - 5, maxWidth + 10, 45, 'F');
  
  pdf.setFontSize(14);
  pdf.setTextColor(231, 76, 60); // Red
  pdf.text('⚠️ VERIFY THIS INFORMATION BEFORE DECIDING', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  pdf.text('1. Speak with your school counselor', margin, yPosition);
  yPosition += 7;
  pdf.text('2. Call the institution directly', margin, yPosition);
  yPosition += 7;
  pdf.text('3. Check official websites', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Thandi's data may be outdated. Always confirm with real people.", margin, yPosition);

  // 5. Add page numbers
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // 6. Save PDF
  const timestamp = new Date().toISOString().split('T')[0];
  pdf.save(`thandi-career-guidance-${timestamp}.pdf`);
};
```

---

## UI Changes

### Button Placement

**Option 1: Header (Recommended)**
```jsx
<div className="results-header">
  <h1>Your Career Matches</h1>
  <div className="header-actions">
    <button onClick={downloadPDF} className="btn-primary">
      📄 Download PDF
    </button>
    <button onClick={startNewAssessment} className="btn-secondary">
      Start New Assessment
    </button>
  </div>
</div>
```

**Option 2: Floating Action Button**
```jsx
<button onClick={downloadPDF} className="fab-download">
  📄 Download
</button>
```

**Option 3: Bottom of Page**
```jsx
<div className="download-section">
  <p>Save your career guidance for future reference:</p>
  <button onClick={downloadPDF} className="btn-download">
    📄 Download as PDF
  </button>
</div>
```

**Recommendation:** Option 1 (Header) - Most visible, standard placement

---

## Testing Checklist

### Functional Tests

- [ ] PDF downloads successfully on desktop Chrome
- [ ] PDF downloads successfully on desktop Firefox
- [ ] PDF downloads successfully on desktop Safari
- [ ] PDF downloads successfully on mobile Chrome
- [ ] PDF downloads successfully on mobile Safari
- [ ] PDF opens correctly in Adobe Reader
- [ ] PDF opens correctly in browser PDF viewer
- [ ] PDF opens correctly on mobile PDF apps

### Content Tests

- [ ] Top warning banner is visible and red
- [ ] Full career guidance content is included
- [ ] Bottom verification footer is visible and red
- [ ] Text is not cut off at page edges
- [ ] Multi-page content flows correctly
- [ ] Page numbers are present (if multiple pages)
- [ ] Thandi.AI branding is visible

### Edge Cases

- [ ] Very short response (< 1 page)
- [ ] Very long response (> 5 pages)
- [ ] Response with special characters
- [ ] Response with emojis
- [ ] Response with bullet points
- [ ] Response with numbered lists

---

## Orchids Integration

### What Orchids Needs to Do

**Option 1: Use Your PDF Endpoint (Recommended)**

Create a new API endpoint that generates PDFs server-side:

```
POST /api/pdf/generate
Body: { fullResponse: "...", sessionId: "..." }
Response: PDF file download
```

**Benefits:**
- Consistent PDF formatting
- You control the layout
- Easier for Orchids (just call API)

**Option 2: Orchids Implements Client-Side**

Provide them with the PDF generation code to add to their UI.

**Benefits:**
- No additional API calls
- Faster for users (no server round-trip)
- Works offline

**Recommendation:** Option 1 (API endpoint) for consistency

### API Endpoint Implementation

**Location:** `app/api/pdf/generate/route.js`

```javascript
import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';

export async function POST(request) {
  try {
    const { fullResponse, sessionId } = await request.json();

    if (!fullResponse) {
      return NextResponse.json(
        { error: 'Missing fullResponse' },
        { status: 400 }
      );
    }

    // Generate PDF (same logic as client-side)
    const pdf = new jsPDF();
    // ... (PDF generation code) ...

    // Return PDF as blob
    const pdfBlob = pdf.output('blob');
    
    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="thandi-career-guidance-${sessionId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
```

---

## Documentation for Orchids

### Quick Start

**1. Add Download Button to Your UI**

```jsx
<button onClick={downloadCareerGuidancePDF}>
  Download PDF
</button>
```

**2. Call Thandi API to Generate PDF**

```javascript
const downloadCareerGuidancePDF = async () => {
  try {
    const response = await fetch('https://thandi.ai.vercel.app/api/pdf/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullResponse: careerGuidanceText,
        sessionId: studentSessionId
      })
    });

    if (!response.ok) throw new Error('PDF generation failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-guidance-${studentSessionId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    alert('Failed to download PDF. Please try again.');
  }
};
```

**3. That's It!**

The PDF will include:
- Top warning banner (red, prominent)
- Full career guidance content
- Bottom verification footer
- Thandi.AI branding
- Page numbers (if multiple pages)

---

## Timeline

### Day 1 (Today)
- [ ] Install jsPDF: `npm install jspdf`
- [ ] Add PDF generation function to results page
- [ ] Add download button to UI
- [ ] Test on desktop browsers

### Day 2 (Tomorrow)
- [ ] Test on mobile browsers
- [ ] Fix any formatting issues
- [ ] Create API endpoint for server-side generation
- [ ] Test API endpoint

### Day 3 (Day After)
- [ ] Update Orchids documentation
- [ ] Send integration guide to Orchids team
- [ ] Deploy to Vercel
- [ ] Final testing

### Day 4 (Buffer)
- [ ] Address any issues from Orchids
- [ ] Polish PDF formatting
- [ ] Add logo if provided

**Target Completion:** End of week (November 26, 2025)

---

## Success Criteria

✅ **Functional:**
- PDF downloads work on all major browsers (desktop + mobile)
- PDF opens correctly in all PDF viewers
- Content is complete and readable

✅ **Safety:**
- Top warning banner is visible and prominent
- Bottom verification footer is visible and prominent
- Footer text matches web version exactly

✅ **Quality:**
- Text is properly formatted (no cutoffs)
- Multi-page content flows correctly
- Branding is professional

✅ **Integration:**
- Orchids can easily add download button
- API endpoint is documented
- Testing guide is provided

---

## Next Steps

1. **Approve this plan** - Confirm approach (client-side vs API endpoint)
2. **Install jsPDF** - Run `npm install jspdf`
3. **Implement PDF generation** - Add code to results page
4. **Test thoroughly** - All browsers, all devices
5. **Document for Orchids** - Integration guide
6. **Deploy to production** - Vercel deployment

**Ready to proceed?** Let me know and I'll start implementation immediately.
