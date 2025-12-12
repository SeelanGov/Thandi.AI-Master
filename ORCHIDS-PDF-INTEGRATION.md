# Orchids PDF Integration Guide

**Date:** November 22, 2025  
**Feature:** PDF Download for Career Guidance  
**Status:** Ready for Integration

---

## Overview

Students can now download their career guidance as a PDF document. The PDF includes:
- ✅ Top warning banner (red, prominent)
- ✅ Full career guidance content
- ✅ Bottom verification footer
- ✅ Thandi.AI branding
- ✅ Page numbers (for multi-page documents)

---

## Integration Options

### Option 1: Client-Side Generation (Recommended for Orchids)

**Pros:**
- No additional API calls
- Faster for users (instant download)
- Works offline
- You control the styling

**Cons:**
- Need to install jsPDF library
- Slightly larger bundle size (~100KB)

### Option 2: Server-Side Generation (API Endpoint)

**Pros:**
- Consistent formatting across all platforms
- No client-side dependencies
- Easier to update PDF layout

**Cons:**
- Requires API call (slower)
- Depends on Thandi API availability

**Our Recommendation:** Option 1 (Client-Side) for better user experience

---

## Option 1: Client-Side Implementation

### Step 1: Install jsPDF

```bash
npm install jspdf
```

### Step 2: Add PDF Generation Function (UPDATED - Better Formatting)

**IMPORTANT:** This is the improved version with proper formatting for headings, lists, and paragraphs.

```javascript
import jsPDF from 'jspdf';

const downloadCareerGuidancePDF = (fullResponse) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = 30;

  // Helper function to check if we need a new page
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

  // 3. Add full response content with PROPER FORMATTING
  checkPageBreak(20);
  
  // Clean and parse content
  const cleanContent = fullResponse
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/⚠️[^:]*:/g, '') // Remove warning headers (we have them separately)
    .replace(/---+/g, ''); // Remove separator lines
  
  // Split into lines and process each one
  const lines = cleanContent.split('\n');
  
  lines.forEach((line) => {
    line = line.trim();
    if (!line) {
      yPosition += 3; // Empty line = small space
      return;
    }

    // Check if it's a heading (starts with ###, ##, or #)
    if (line.startsWith('###')) {
      checkPageBreak(15);
      yPosition += 5;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      const headingText = line.replace(/^###\s*/, '');
      const headingLines = pdf.splitTextToSize(headingText, maxWidth);
      pdf.text(headingLines, margin, yPosition);
      yPosition += headingLines.length * 7 + 5;
      pdf.setFont(undefined, 'normal');
      return;
    }

    // Check if it's a numbered list item (starts with "1.", "2.", etc.)
    const numberedMatch = line.match(/^(\d+)\.\s*(.+)/);
    if (numberedMatch) {
      checkPageBreak(10);
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text(`${numberedMatch[1]}.`, margin, yPosition);
      pdf.setFont(undefined, 'normal');
      
      const itemText = numberedMatch[2].replace(/\*\*/g, ''); // Remove markdown bold
      const itemLines = pdf.splitTextToSize(itemText, maxWidth - 15);
      itemLines.forEach((itemLine, idx) => {
        if (idx > 0) checkPageBreak(7);
        pdf.text(itemLine, margin + 15, yPosition);
        yPosition += 6;
      });
      yPosition += 2;
      return;
    }

    // Check if it's a bullet point (starts with "- " or "* ")
    if (line.startsWith('- ') || line.startsWith('* ')) {
      checkPageBreak(10);
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text('•', margin + 5, yPosition);
      
      const bulletText = line.substring(2).replace(/\*\*/g, ''); // Remove markdown bold
      const bulletLines = pdf.splitTextToSize(bulletText, maxWidth - 15);
      bulletLines.forEach((bulletLine, idx) => {
        if (idx > 0) checkPageBreak(7);
        pdf.text(bulletLine, margin + 15, yPosition);
        yPosition += 6;
      });
      yPosition += 2;
      return;
    }

    // Check if it's bold text (wrapped in **)
    const boldMatch = line.match(/^\*\*(.+)\*\*$/);
    if (boldMatch) {
      checkPageBreak(10);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      const boldLines = pdf.splitTextToSize(boldMatch[1], maxWidth);
      pdf.text(boldLines, margin, yPosition);
      yPosition += boldLines.length * 6 + 3;
      pdf.setFont(undefined, 'normal');
      return;
    }

    // Regular paragraph text
    checkPageBreak(10);
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont(undefined, 'normal');
    const cleanLine = line.replace(/\*\*/g, ''); // Remove any remaining markdown
    const paraLines = pdf.splitTextToSize(cleanLine, maxWidth);
    pdf.text(paraLines, margin, yPosition);
    yPosition += paraLines.length * 6 + 3;
  });

  // 4. Add bottom verification footer
  yPosition += 10;
  checkPageBreak(50);
  
  pdf.setFillColor(255, 243, 205); // Light yellow
  pdf.rect(margin - 5, yPosition - 5, maxWidth + 10, 45, 'F');
  
  pdf.setFontSize(14);
  pdf.setTextColor(231, 76, 60); // Red
  pdf.setFont(undefined, 'bold');
  pdf.text('⚠️ VERIFY THIS INFORMATION BEFORE DECIDING', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont(undefined, 'normal');
  pdf.text('1. Speak with your school counselor', margin, yPosition);
  yPosition += 7;
  pdf.text('2. Call the institution directly', margin, yPosition);
  yPosition += 7;
  pdf.text('3. Check official websites', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  const footerNote = "Thandi's data may be outdated. Always confirm with real people.";
  const footerLines = pdf.splitTextToSize(footerNote, maxWidth);
  pdf.text(footerLines, margin, yPosition);

  // 5. Add page numbers
  const pageCount = pdf.internal.getNumberOfPages();
  pdf.setFont(undefined, 'normal');
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

### What's Improved in This Version

**Better Text Parsing:**
- Detects and formats headings (###)
- Properly formats numbered lists (1., 2., 3.)
- Converts bullet points (- or *) to proper bullets (•)
- Handles bold text (**text**)
- Maintains paragraph spacing

**Result:**
- Clean, professional formatting
- Easy to read structure
- Proper indentation for lists
- No text running together

### Step 3: Add Download Button to Your UI

```jsx
<button 
  onClick={() => downloadCareerGuidancePDF(careerGuidanceResponse)}
  className="download-pdf-button"
>
  📄 Download PDF
</button>
```

### Step 4: Style the Button (Optional)

```css
.download-pdf-button {
  padding: 10px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.download-pdf-button:hover {
  background: #059669;
}
```

---

## Option 2: Server-Side Implementation (API Endpoint)

### API Endpoint

```
POST https://thandi.ai.vercel.app/api/pdf/generate
Content-Type: application/json

{
  "fullResponse": "The complete career guidance text...",
  "sessionId": "student-session-id-123"
}
```

### Response

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="thandi-career-guidance-{sessionId}.pdf"

[PDF binary data]
```

### Implementation

```javascript
const downloadCareerGuidancePDF = async (fullResponse, sessionId) => {
  try {
    const response = await fetch('https://thandi.ai.vercel.app/api/pdf/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullResponse: fullResponse,
        sessionId: sessionId
      })
    });

    if (!response.ok) {
      throw new Error('PDF generation failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thandi-career-guidance-${sessionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF download failed:', error);
    alert('Failed to download PDF. Please try again.');
  }
};
```

**Note:** API endpoint will be available by end of week (November 26, 2025)

---

## Testing Checklist

### Desktop Browsers
- [ ] Chrome (Windows/Mac)
- [ ] Firefox (Windows/Mac)
- [ ] Safari (Mac)
- [ ] Edge (Windows)

### Mobile Browsers
- [ ] Chrome (Android)
- [ ] Safari (iOS)
- [ ] Samsung Internet (Android)

### PDF Viewers
- [ ] Adobe Acrobat Reader
- [ ] Browser built-in PDF viewer
- [ ] Mobile PDF apps (iOS Files, Android PDF viewers)

### Content Verification
- [ ] Top warning banner is visible and red
- [ ] Full career guidance content is included
- [ ] Bottom verification footer is visible and red
- [ ] Text is not cut off at page edges
- [ ] Multi-page content flows correctly
- [ ] Page numbers are present (if multiple pages)

---

## Example Usage in Your Platform

### React Component Example

```jsx
import { useState } from 'react';
import jsPDF from 'jspdf';

function CareerGuidanceResults({ careerData }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      downloadCareerGuidancePDF(careerData.fullResponse);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="career-results">
      <div className="results-header">
        <h1>Your Career Guidance</h1>
        <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="btn-download"
        >
          {isDownloading ? '⏳ Generating...' : '📄 Download PDF'}
        </button>
      </div>
      
      <div className="results-content">
        {/* Display career guidance */}
        {careerData.fullResponse}
      </div>
    </div>
  );
}
```

### Vue Component Example

```vue
<template>
  <div class="career-results">
    <div class="results-header">
      <h1>Your Career Guidance</h1>
      <button 
        @click="handleDownloadPDF"
        :disabled="isDownloading"
        class="btn-download"
      >
        {{ isDownloading ? '⏳ Generating...' : '📄 Download PDF' }}
      </button>
    </div>
    
    <div class="results-content">
      {{ careerData.fullResponse }}
    </div>
  </div>
</template>

<script>
import jsPDF from 'jspdf';

export default {
  props: ['careerData'],
  data() {
    return {
      isDownloading: false
    };
  },
  methods: {
    handleDownloadPDF() {
      this.isDownloading = true;
      try {
        downloadCareerGuidancePDF(this.careerData.fullResponse);
      } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF. Please try again.');
      } finally {
        this.isDownloading = false;
      }
    }
  }
};
</script>
```

---

## Troubleshooting

### Issue: PDF is blank or incomplete

**Solution:** Ensure `fullResponse` contains the complete text. Check for:
- Empty or null values
- HTML tags that need cleaning
- Very long content (may need pagination)

### Issue: PDF download doesn't work on mobile

**Solution:** 
- Check browser compatibility (some older browsers don't support blob downloads)
- Use server-side generation (Option 2) as fallback
- Test with different mobile browsers

### Issue: Text is cut off at page edges

**Solution:**
- Increase margin value (default is 20)
- Reduce font size for very long content
- Check `maxWidth` calculation

### Issue: Warning banners not visible

**Solution:**
- Verify color codes: Red = `rgb(231, 76, 60)`
- Check background colors are applied
- Ensure `setFillColor` is called before `rect`

---

## Support

**Questions?** Contact Thandi team:
- Email: [your-email]
- Slack: [your-slack-channel]
- Documentation: https://thandi.ai.vercel.app/docs

**Issues?** Report bugs:
- GitHub: [your-repo-url]
- Support ticket: [your-support-url]

---

## Next Steps

1. **Choose integration option** (Client-side recommended)
2. **Install jsPDF** (if using Option 1)
3. **Add PDF generation function** to your codebase
4. **Add download button** to results page
5. **Test on all browsers** (desktop + mobile)
6. **Deploy to production**

**Estimated Time:** 2-4 hours for full integration and testing

---

**Last Updated:** November 22, 2025  
**Version:** 1.0  
**Status:** Production Ready
