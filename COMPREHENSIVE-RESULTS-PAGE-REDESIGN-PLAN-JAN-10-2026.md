# COMPREHENSIVE RESULTS PAGE REDESIGN PLAN - JANUARY 10, 2026
**Status**: 📋 COMPREHENSIVE PLAN READY FOR EXECUTION  
**User Request**: Thandi branding + UI/UX consistency + working PDF generation  
**Approach**: Systematic implementation with backup restoration + enhancement + testing

---

## 🎯 EXECUTIVE SUMMARY

**User Requirements Validated**:
1. ✅ **"add thandi branding and ui/ux elements that match our design to ensure consistancy"**
2. ✅ **"now finally ensure the pdf generated in the results page works and has results page information carried through to ensure students can download as well"**
3. ✅ **"make LLM results presentable and student-friendly, aligned with assessment experience"**

**Current State Analysis**:
- ✅ **System Restored**: Clean backup from January 4, 2026 is operational
- ✅ **Enhanced Code Present**: `formatResponse()` function exists but not serving correctly
- ❌ **Thandi Branding Missing**: Results page doesn't match design system
- ❌ **PDF Generation Basic**: Current PDF is text-only, not professional
- ❌ **Serving Issue**: Enhanced formatting code not appearing in browser

**Solution Approach**:
1. **Phase 1**: Clean backup restoration + cache clearing (5 minutes)
2. **Phase 2**: Thandi-branded enhancement implementation (20 minutes)  
3. **Phase 3**: Professional PDF generation system (25 minutes)
4. **Phase 4**: PDF integration & testing (10 minutes)
5. **Phase 5**: Comprehensive testing & verification (10 minutes)

---

## 📋 DETAILED IMPLEMENTATION PLAN

### PHASE 1: CLEAN FOUNDATION (5 minutes)

#### Step 1.1: Force Complete Cache Clear
```bash
# Stop development server
# Clear all caches
rm -rf .next
rm -rf node_modules/.cache
# Clear browser cache (use incognito mode)
# Restart development server
npm run dev
```

#### Step 1.2: Verify Current State
- ✅ Results page loads correctly
- ✅ Enhanced `formatResponse()` code is present in source
- ✅ PDF download works with basic implementation
- ✅ No JavaScript errors in console

**Expected Outcome**: Clean working system ready for enhancement

---

### PHASE 2: THANDI-BRANDED ENHANCEMENT (20 minutes)

#### Step 2.1: Create Thandi Results Formatter (8 minutes)

**File**: `lib/thandi-results-formatter.js`

```javascript
/**
 * Thandi-Branded Results Formatter
 * Transforms AI responses into student-friendly, visually appealing content
 * Integrates with Thandi design system for consistency
 */

export class ThandiResultsFormatter {
  constructor() {
    // Thandi brand colors from design system
    this.colors = {
      primary: '#114E4E',      // Thandi teal
      gold: '#DFA33A',         // Thandi gold  
      tealMid: '#2C7A7B',      // Secondary gradient
      tealLight: '#3AB795',    // Light accent
      cream: '#F3E6C9',        // Background
      brown: '#5C3B20'         // Text accent
    };
    
    // Thandi typography system
    this.fonts = {
      heading: 'var(--font-poppins)',
      body: 'var(--font-nunito)'
    };
  }

  formatResponse(text) {
    if (!text) return '';
    
    // Clean and prepare text
    const cleaned = this.cleanText(text);
    const sections = this.parseSections(cleaned);
    
    let formatted = '';
    
    sections.forEach(section => {
      formatted += this.formatSection(section);
    });
    
    return `<div class="thandi-results-content">${formatted}</div>`;
  }

  formatSection(section) {
    const lines = section.split('\n').filter(line => line.trim());
    let sectionHtml = '';
    
    lines.forEach((line, index) => {
      line = line.trim();
      if (!line) return;
      
      // Main headers with Thandi branding
      if (line.match(/^##?\s+(.+)/)) {
        const headerText = line.replace(/^##?\s+/, '');
        sectionHtml += `
          <div class="thandi-section-header">
            <div class="thandi-header-card">
              <div class="thandi-header-icon">🎯</div>
              <h2 class="thandi-main-header">${headerText}</h2>
            </div>
          </div>`;
        return;
      }
      
      // Program cards with Thandi styling
      if (line.match(/^###\s+(.+)/)) {
        const headerText = line.replace(/^###\s+/, '');
        
        if (headerText.match(/^\d+\./)) {
          const programNumber = headerText.match(/^(\d+)\./)[1];
          const programName = headerText.replace(/^\d+\.\s*/, '');
          
          sectionHtml += `
            <div class="thandi-program-card">
              <div class="thandi-program-header">
                <div class="thandi-program-number">${programNumber}</div>
                <h3 class="thandi-program-title">${programName}</h3>
              </div>
              <div class="thandi-program-content">
          `;
        } else {
          sectionHtml += `
            <div class="thandi-subsection-card">
              <h3 class="thandi-sub-header">
                <span class="thandi-section-icon">📋</span>
                ${headerText}
              </h3>
          `;
        }
        return;
      }
      
      // Key-value pairs with Thandi visual indicators
      const kvMatch = line.match(/^(.+?):\s*(.+)$/);
      if (kvMatch && !line.includes('http')) {
        const key = kvMatch[1].replace(/\*\*/g, '');
        const value = kvMatch[2].replace(/\*\*/g, '');
        
        const { className, icon } = this.getKeyValueStyle(key);
        
        sectionHtml += `
          <div class="${className}">
            <div class="thandi-key-section">
              <span class="thandi-key-icon">${icon}</span>
              <span class="thandi-key">${key}</span>
            </div>
            <div class="thandi-value-section">
              <span class="thandi-value">${this.formatValue(value)}</span>
            </div>
          </div>`;
        return;
      }
      
      // Enhanced bullet points with Thandi styling
      if (line.match(/^[-*]\s+(.+)/)) {
        const content = line.replace(/^[-*]\s+/, '').replace(/\*\*/g, '');
        const { bulletIcon, bulletClass } = this.getBulletStyle(content);
        
        sectionHtml += `
          <div class="${bulletClass}">
            <span class="thandi-bullet">${bulletIcon}</span>
            <span class="thandi-bullet-content">${content}</span>
          </div>`;
        return;
      }
      
      // Enhanced paragraphs with Thandi highlighting
      if (line.length > 0) {
        const formattedLine = this.enhanceText(line);
        sectionHtml += `<div class="thandi-paragraph">${formattedLine}</div>`;
      }
    });
    
    // Close any open cards
    if (sectionHtml.includes('thandi-program-card') && !sectionHtml.includes('</div></div>')) {
      sectionHtml += '</div></div>';
    } else if (sectionHtml.includes('thandi-subsection-card') && !sectionHtml.includes('</div>')) {
      sectionHtml += '</div>';
    }
    
    return `<div class="thandi-content-section">${sectionHtml}</div>`;
  }

  getKeyValueStyle(key) {
    const keyLower = key.toLowerCase();
    
    if (keyLower.includes('aps') || keyLower.includes('score')) {
      return { className: 'thandi-key-value thandi-score-item', icon: '🎯' };
    } else if (keyLower.includes('deadline')) {
      return { className: 'thandi-key-value thandi-deadline-item', icon: '⏰' };
    } else if (keyLower.includes('chance') || keyLower.includes('eligibility')) {
      return { className: 'thandi-key-value thandi-chance-item', icon: '✅' };
    } else if (keyLower.includes('university') || keyLower.includes('institution')) {
      return { className: 'thandi-key-value thandi-university-item', icon: '🏫' };
    } else if (keyLower.includes('subject') || keyLower.includes('requirement')) {
      return { className: 'thandi-key-value thandi-subject-item', icon: '📚' };
    }
    
    return { className: 'thandi-key-value', icon: '📊' };
  }

  getBulletStyle(content) {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('deadline') || contentLower.includes('apply')) {
      return { bulletIcon: '⏰', bulletClass: 'thandi-bullet-item thandi-deadline-bullet' };
    } else if (contentLower.includes('requirement') || contentLower.includes('need')) {
      return { bulletIcon: '📋', bulletClass: 'thandi-bullet-item thandi-requirement-bullet' };
    } else if (contentLower.includes('bursary') || contentLower.includes('funding')) {
      return { bulletIcon: '💰', bulletClass: 'thandi-bullet-item thandi-funding-bullet' };
    }
    
    return { bulletIcon: '•', bulletClass: 'thandi-bullet-item' };
  }

  formatValue(value) {
    // Enhanced value formatting with Thandi styling
    if (value.includes('✅') || value.includes('⚠️') || value.includes('🚨')) {
      return value
        .replace(/✅/g, '<span class="thandi-status-icon thandi-success">✅</span>')
        .replace(/⚠️/g, '<span class="thandi-status-icon thandi-warning">⚠️</span>')
        .replace(/🚨/g, '<span class="thandi-status-icon thandi-critical">🚨</span>');
    }
    
    // Highlight percentages
    if (value.match(/\d+%/)) {
      return value.replace(/(\d+%)/g, '<span class="thandi-percentage-highlight">$1</span>');
    }
    
    // Highlight APS scores
    if (value.match(/APS \d+/) || (value.match(/^\d+$/) && parseInt(value) >= 15 && parseInt(value) <= 50)) {
      return `<span class="thandi-aps-highlight">${value}</span>`;
    }
    
    // Highlight universities
    if (value.match(/(University|UCT|Wits|UJ|TUT|UNISA|NWU|UP|UFS|UKZN|Rhodes|Stellenbosch)/i)) {
      return `<span class="thandi-university-highlight">${value}</span>`;
    }
    
    // Highlight deadlines
    if (value.match(/\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)/i) || 
        value.match(/\d{1,2}\/\d{1,2}\/\d{4}/) || 
        value.match(/(deadline|close|open)/i)) {
      return `<span class="thandi-deadline-highlight">${value}</span>`;
    }
    
    return value;
  }

  enhanceText(line) {
    return line
      .replace(/\*\*(.*?)\*\*/g, '<strong class="thandi-highlight">$1</strong>')
      .replace(/✅/g, '<span class="thandi-status-icon thandi-success">✅</span>')
      .replace(/⚠️/g, '<span class="thandi-status-icon thandi-warning">⚠️</span>')
      .replace(/🚨/g, '<span class="thandi-status-icon thandi-critical">🚨</span>')
      .replace(/ℹ️/g, '<span class="thandi-status-icon thandi-info">ℹ️</span>')
      .replace(/(Grade \d+)/g, '<span class="thandi-grade-highlight">$1</span>')
      .replace(/(APS \d+)/g, '<span class="thandi-aps-highlight">$1</span>')
      .replace(/(\d+%)/g, '<span class="thandi-percentage-highlight">$1</span>');
  }

  cleanText(text) {
    return text
      .replace(/---+\s*⚠️[^-]*---+/g, '')
      .replace(/⚠️ \*\*Verify before you decide[^⚠️]*⚠️[^⚠️]*$/g, '')
      .replace(/---+/g, '')
      .trim();
  }

  parseSections(text) {
    return text.split(/(?=^##?\s)/gm).filter(section => section.trim());
  }
}
```

#### Step 2.2: Create Thandi CSS Styling System (8 minutes)

**File**: `app/results/styles/thandi-results.css`

```css
/* Thandi Results Page Styling System */
/* Integrates with existing Thandi design system */

.thandi-results-content {
  font-family: var(--font-nunito), system-ui, sans-serif;
  color: var(--assessment-text-primary);
  line-height: 1.6;
}

/* Section Headers with Thandi Branding */
.thandi-section-header {
  margin: 2rem 0 1.5rem 0;
}

.thandi-header-card {
  background: linear-gradient(135deg, var(--thandi-teal) 0%, var(--thandi-teal-mid) 100%);
  color: white;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-thandi-lg);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.thandi-header-icon {
  font-size: 2rem;
  color: var(--thandi-gold);
}

.thandi-main-header {
  font-family: var(--font-poppins), system-ui, sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

/* Content Sections */
.thandi-content-section {
  margin-bottom: 2rem;
}

/* Program Cards with Thandi Styling */
.thandi-program-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-thandi);
  border: 1px solid var(--assessment-border);
  margin: 1.5rem 0;
  overflow: hidden;
  transition: all var(--transition-normal);
}

.thandi-program-card:hover {
  box-shadow: var(--shadow-thandi-lg);
  transform: translateY(-2px);
}

.thandi-program-header {
  background: linear-gradient(135deg, var(--thandi-gold) 0%, #c8922e 100%);
  color: var(--thandi-teal);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.thandi-program-number {
  background: rgba(17, 78, 78, 0.2);
  color: var(--thandi-teal);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
}

.thandi-program-title {
  font-family: var(--font-poppins), system-ui, sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.thandi-program-content {
  padding: 1.5rem;
}

/* Subsection Cards */
.thandi-subsection-card {
  background: var(--thandi-cream);
  border: 1px solid rgba(17, 78, 78, 0.1);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  margin: 1rem 0;
}

.thandi-sub-header {
  font-family: var(--font-poppins), system-ui, sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--thandi-teal);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.thandi-section-icon {
  font-size: 1.125rem;
  color: var(--thandi-gold);
}

/* Key-Value Pairs with Thandi Visual Indicators */
.thandi-key-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  margin: 0.5rem 0;
  background: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--assessment-border);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.thandi-key-value:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.thandi-key-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.thandi-key-icon {
  font-size: 1.125rem;
  color: var(--thandi-teal);
}

.thandi-key {
  font-weight: 500;
  color: var(--assessment-text-secondary);
}

.thandi-value-section {
  text-align: right;
}

.thandi-value {
  font-weight: 600;
  color: var(--assessment-text-primary);
  font-size: 1rem;
}

/* Specialized Key-Value Styling */
.thandi-score-item {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: var(--thandi-teal-light);
}

.thandi-score-item .thandi-key-icon {
  color: var(--thandi-teal-light);
}

.thandi-score-item .thandi-value {
  color: var(--thandi-teal-light);
  font-weight: 700;
  font-size: 1.125rem;
}

.thandi-deadline-item {
  background: linear-gradient(135deg, var(--thandi-cream) 0%, #f4e6c7 100%);
  border-color: var(--thandi-gold);
}

.thandi-deadline-item .thandi-key-icon {
  color: var(--thandi-gold);
}

.thandi-deadline-item .thandi-value {
  color: var(--thandi-brown);
  font-weight: 700;
}

.thandi-chance-item {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: var(--thandi-teal-light);
}

.thandi-university-item {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
}

.thandi-subject-item {
  background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%);
  border-color: #a855f7;
}

/* Enhanced Bullet Points */
.thandi-bullet-item {
  display: flex;
  align-items: flex-start;
  margin: 0.75rem 0;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--thandi-teal-light);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.thandi-bullet-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(2px);
}

.thandi-bullet {
  color: var(--thandi-teal-light);
  font-weight: bold;
  margin-right: 0.75rem;
  font-size: 1.125rem;
  line-height: 1.2;
  min-width: 1.25rem;
}

.thandi-bullet-content {
  flex: 1;
  line-height: 1.6;
  font-size: 0.9375rem;
}

/* Specialized Bullet Styling */
.thandi-deadline-bullet {
  border-left-color: var(--thandi-gold);
}

.thandi-deadline-bullet .thandi-bullet {
  color: var(--thandi-gold);
}

.thandi-requirement-bullet {
  border-left-color: #3b82f6;
}

.thandi-requirement-bullet .thandi-bullet {
  color: #3b82f6;
}

.thandi-funding-bullet {
  border-left-color: var(--thandi-teal-light);
}

/* Enhanced Paragraphs */
.thandi-paragraph {
  margin: 0.75rem 0;
  line-height: 1.7;
  font-size: 1rem;
  padding: 0.75rem 0;
}

/* Text Highlighting with Thandi Colors */
.thandi-highlight {
  background: linear-gradient(135deg, var(--thandi-cream) 0%, #f4e6c7 100%);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  color: var(--thandi-brown);
}

.thandi-grade-highlight {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  color: #1e40af;
}

.thandi-aps-highlight {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  color: var(--thandi-teal);
}

.thandi-percentage-highlight {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  color: var(--thandi-teal);
}

.thandi-university-highlight {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  color: #1e40af;
}

.thandi-deadline-highlight {
  background: linear-gradient(135deg, var(--thandi-cream) 0%, #f4e6c7 100%);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  color: var(--thandi-brown);
}

/* Status Icons */
.thandi-status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  font-size: 0.875rem;
  margin: 0 0.25rem;
}

.thandi-status-icon.thandi-success {
  background: #dcfce7;
  color: var(--thandi-teal);
}

.thandi-status-icon.thandi-warning {
  background: var(--thandi-cream);
  color: var(--thandi-gold);
}

.thandi-status-icon.thandi-critical {
  background: #fecaca;
  color: #991b1b;
}

.thandi-status-icon.thandi-info {
  background: #dbeafe;
  color: #1e40af;
}

/* Mobile Responsive Design */
@media (max-width: 768px) {
  .thandi-header-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .thandi-main-header {
    font-size: 1.25rem;
  }
  
  .thandi-program-header {
    padding: 0.75rem 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .thandi-program-content {
    padding: 1rem;
  }
  
  .thandi-key-value {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .thandi-value-section {
    text-align: left;
    width: 100%;
  }
  
  .thandi-bullet-item {
    padding: 0.5rem 0.75rem;
  }
}

/* Print Styles for PDF Generation */
@media print {
  .thandi-results-content {
    color: black;
    font-size: 12pt;
    line-height: 1.5;
  }
  
  .thandi-header-card,
  .thandi-program-header {
    background: #f5f5f5 !important;
    color: black !important;
    -webkit-print-color-adjust: exact;
  }
  
  .thandi-key-value,
  .thandi-bullet-item {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
```

#### Step 2.3: Update Results Page Component (4 minutes)

**File**: `app/results/page.jsx` (Update the formatResponse function)

```javascript
// Import the new Thandi formatter
import { ThandiResultsFormatter } from '@/lib/thandi-results-formatter';

// Replace the existing formatResponse function
function formatResponse(text) {
  const formatter = new ThandiResultsFormatter();
  return formatter.formatResponse(text);
}

// Add CSS import at the top of the file
import './styles/thandi-results.css';
```

**Expected Outcome**: Results page displays with Thandi branding, visual cards, and consistent design system integration

---

### PHASE 3: PROFESSIONAL PDF GENERATION (25 minutes)

#### Step 3.1: Create Professional PDF Generator (15 minutes)

**File**: `lib/thandi-pdf-generator.js`

```javascript
/**
 * Professional Thandi PDF Generator
 * Creates branded, professional career guidance reports
 */

import jsPDF from 'jspdf';

export class ThandiPDFGenerator {
  constructor(results, studentData = {}) {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.results = results;
    this.studentData = studentData;
    
    // Thandi brand colors (RGB values for PDF)
    this.colors = {
      primary: [17, 78, 78],        // Thandi teal
      gold: [223, 163, 58],         // Thandi gold
      tealMid: [44, 122, 123],      // Secondary
      tealLight: [58, 183, 149],    // Light accent
      cream: [243, 230, 201],       // Background
      brown: [92, 59, 32],          // Text accent
      white: [255, 255, 255],
      black: [0, 0, 0],
      gray: [107, 114, 128]
    };
    
    this.fonts = {
      heading: 'helvetica',
      body: 'helvetica',
      mono: 'courier'
    };
    
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.margin = 20;
    this.maxWidth = this.pageWidth - (this.margin * 2);
  }

  generateProfessionalReport() {
    this.addCoverPage();
    this.addExecutiveSummary();
    this.addResultsContent();
    this.addVerificationFooter();
    this.addPageNumbers();
    
    return this.pdf;
  }

  addCoverPage() {
    // Professional header band
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.rect(0, 0, this.pageWidth, 80, 'F');
    
    // Thandi branding
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(32);
    this.pdf.text('THANDI.AI', this.margin, 35);
    
    this.pdf.setFontSize(14);
    this.pdf.text('Career Guidance Report', this.margin, 50);
    
    // Gold accent line
    this.pdf.setFillColor(...this.colors.gold);
    this.pdf.rect(this.margin, 55, 60, 2, 'F');
    
    // Student information section
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(24);
    this.pdf.text('Your Career Guidance Report', this.margin, 110);
    
    // Student details
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...this.colors.gray);
    
    const studentName = this.studentData.name || 'Student';
    const grade = this.getGradeFromResults();
    const date = new Date().toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
    
    this.pdf.text(`Prepared for: ${studentName}`, this.margin, 130);
    this.pdf.text(`Grade: ${grade}`, this.margin, 140);
    this.pdf.text(`Date: ${date}`, this.margin, 150);
    
    // Professional disclaimer box
    this.addDisclaimerBox(170);
  }

  addExecutiveSummary() {
    this.pdf.addPage();
    this.addPageHeader('Executive Summary');
    
    let yPos = 60;
    
    // Key metrics cards
    const grade = this.getGradeFromResults();
    const apsScore = this.extractAPSScore();
    const eligibility = this.extractEligibility();
    
    // Grade card
    yPos = this.addMetricCard('Grade Level', grade, this.margin, yPos);
    
    // APS card (if applicable)
    if (apsScore && grade !== '10') {
      yPos = this.addMetricCard('APS Score', apsScore, this.margin + 60, yPos - 40);
    } else {
      yPos = this.addMetricCard('Status', 'Foundation Year', this.margin + 60, yPos - 40);
    }
    
    // Eligibility card
    yPos = this.addMetricCard('University Eligible', eligibility ? 'Yes' : 'Building', this.margin + 120, yPos);
    
    yPos += 20;
    
    // Summary text
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(...this.colors.black);
    
    const summaryText = this.generateSummaryText(grade);
    const lines = this.pdf.splitTextToSize(summaryText, this.maxWidth);
    this.pdf.text(lines, this.margin, yPos);
  }

  addResultsContent() {
    this.pdf.addPage();
    this.addPageHeader('Career Recommendations');
    
    let yPos = 60;
    
    // Parse and format the results content
    const content = this.results.fullResponse || this.results.response || '';
    const sections = this.parseContentSections(content);
    
    sections.forEach(section => {
      if (yPos > this.pageHeight - 60) {
        this.pdf.addPage();
        this.addPageHeader('Career Recommendations (continued)');
        yPos = 60;
      }
      
      yPos = this.addContentSection(section, yPos);
    });
  }

  addContentSection(section, yPos) {
    const lines = section.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      line = line.trim();
      if (!line) return;
      
      // Check for page break
      if (yPos > this.pageHeight - 40) {
        this.pdf.addPage();
        this.addPageHeader('Career Recommendations (continued)');
        yPos = 60;
      }
      
      // Headers
      if (line.match(/^##?\s+(.+)/)) {
        const headerText = line.replace(/^##?\s+/, '');
        yPos = this.addSectionHeader(headerText, yPos);
        return;
      }
      
      // Sub headers (programs)
      if (line.match(/^###\s+(.+)/)) {
        const headerText = line.replace(/^###\s+/, '');
        yPos = this.addProgramHeader(headerText, yPos);
        return;
      }
      
      // Key-value pairs
      const kvMatch = line.match(/^(.+?):\s*(.+)$/);
      if (kvMatch && !line.includes('http')) {
        const key = kvMatch[1].replace(/\*\*/g, '');
        const value = kvMatch[2].replace(/\*\*/g, '');
        yPos = this.addKeyValuePair(key, value, yPos);
        return;
      }
      
      // Bullet points
      if (line.match(/^[-*]\s+(.+)/)) {
        const content = line.replace(/^[-*]\s+/, '').replace(/\*\*/g, '');
        yPos = this.addBulletPoint(content, yPos);
        return;
      }
      
      // Regular paragraphs
      if (line.length > 0) {
        yPos = this.addParagraph(line, yPos);
      }
    });
    
    return yPos + 10;
  }

  addSectionHeader(text, yPos) {
    // Section header with Thandi styling
    this.pdf.setFillColor(...this.colors.primary, 0.1);
    this.pdf.rect(this.margin, yPos - 5, this.maxWidth, 15, 'F');
    
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text(text, this.margin + 5, yPos + 5);
    
    return yPos + 20;
  }

  addProgramHeader(text, yPos) {
    // Program header with gold accent
    this.pdf.setFillColor(...this.colors.gold, 0.2);
    this.pdf.rect(this.margin, yPos - 3, this.maxWidth, 12, 'F');
    
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...this.colors.brown);
    this.pdf.text(text, this.margin + 3, yPos + 5);
    
    return yPos + 15;
  }

  addKeyValuePair(key, value, yPos) {
    // Key in regular font
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.colors.gray);
    this.pdf.text(`${key}:`, this.margin + 5, yPos);
    
    // Value in bold
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.text(value, this.margin + 80, yPos);
    
    return yPos + 8;
  }

  addBulletPoint(content, yPos) {
    // Bullet
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text('•', this.margin + 5, yPos);
    
    // Content
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setTextColor(...this.colors.black);
    const lines = this.pdf.splitTextToSize(content, this.maxWidth - 20);
    this.pdf.text(lines, this.margin + 15, yPos);
    
    return yPos + (lines.length * 6) + 3;
  }

  addParagraph(text, yPos) {
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.colors.black);
    
    const cleanText = text.replace(/\*\*/g, '').replace(/<[^>]*>/g, '');
    const lines = this.pdf.splitTextToSize(cleanText, this.maxWidth);
    this.pdf.text(lines, this.margin, yPos);
    
    return yPos + (lines.length * 6) + 5;
  }

  addMetricCard(title, value, x, y, width = 50, height = 35) {
    // Card background
    this.pdf.setFillColor(...this.colors.cream);
    this.pdf.rect(x, y, width, height, 'F');
    
    // Border
    this.pdf.setDrawColor(...this.colors.primary);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(x, y, width, height);
    
    // Title
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(...this.colors.gray);
    this.pdf.text(title, x + 3, y + 10);
    
    // Value
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text(value.toString(), x + 3, y + 25);
    
    return y + height + 10;
  }

  addPageHeader(title) {
    // Header background
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.rect(0, 0, this.pageWidth, 30, 'F');
    
    // Title
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(16);
    this.pdf.text(title, this.margin, 20);
    
    // Thandi logo text
    this.pdf.setFontSize(10);
    this.pdf.text('THANDI.AI', this.pageWidth - 40, 20);
  }

  addDisclaimerBox(yPos) {
    // Warning box
    this.pdf.setFillColor(255, 243, 205);
    this.pdf.rect(this.margin, yPos, this.maxWidth, 50, 'F');
    this.pdf.setDrawColor(239, 68, 68);
    this.pdf.setLineWidth(2);
    this.pdf.rect(this.margin, yPos, this.maxWidth, 50);
    
    // Warning title
    this.pdf.setTextColor(239, 68, 68);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(12);
    this.pdf.text('⚠️ IMPORTANT DISCLAIMER', this.margin + 5, yPos + 15);
    
    // Warning text
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(9);
    const warningText = 'This report contains AI-generated career guidance. All recommendations must be verified with qualified counselors, institutions, and official sources before making educational or career decisions.';
    const lines = this.pdf.splitTextToSize(warningText, this.maxWidth - 10);
    this.pdf.text(lines, this.margin + 5, yPos + 25);
  }

  addVerificationFooter() {
    this.pdf.addPage();
    this.addPageHeader('Verification Requirements');
    
    let yPos = 60;
    
    // Verification steps
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text('Before Making Any Decisions, Please:', this.margin, yPos);
    
    yPos += 20;
    
    const verificationSteps = [
      'Speak with your school counselor or career guidance teacher',
      'Contact universities directly to confirm admission requirements',
      'Verify bursary information on official websites',
      'Check application deadlines with institutions',
      'Consult with parents/guardians about your career choices'
    ];
    
    verificationSteps.forEach((step, index) => {
      // Number circle
      this.pdf.setFillColor(...this.colors.gold);
      this.pdf.circle(this.margin + 5, yPos + 3, 4, 'F');
      this.pdf.setTextColor(...this.colors.white);
      this.pdf.setFont(this.fonts.body, 'bold');
      this.pdf.setFontSize(10);
      this.pdf.text((index + 1).toString(), this.margin + 3, yPos + 5);
      
      // Step text
      this.pdf.setTextColor(...this.colors.black);
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(11);
      const lines = this.pdf.splitTextToSize(step, this.maxWidth - 20);
      this.pdf.text(lines, this.margin + 15, yPos + 5);
      
      yPos += lines.length * 6 + 8;
    });
    
    // Contact information
    yPos += 20;
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text('Need Help?', this.margin, yPos);
    
    yPos += 15;
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.text('Visit: www.thandi.online', this.margin, yPos);
    this.pdf.text('For additional career guidance resources', this.margin, yPos + 10);
  }

  addPageNumbers() {
    const pageCount = this.pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(...this.colors.gray);
      this.pdf.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }

  // Helper methods
  getGradeFromResults() {
    // Extract grade from results metadata or content
    if (this.results.metadata?.grade) {
      return this.results.metadata.grade;
    }
    
    const content = this.results.fullResponse || this.results.response || '';
    const gradeMatch = content.match(/Grade (\d+)/i);
    return gradeMatch ? gradeMatch[1] : '12';
  }

  extractAPSScore() {
    const content = this.results.fullResponse || this.results.response || '';
    const apsMatch = content.match(/APS[:\s]*(\d+)/i);
    return apsMatch ? parseInt(apsMatch[1]) : null;
  }

  extractEligibility() {
    const content = this.results.fullResponse || this.results.response || '';
    return content.toLowerCase().includes('university eligible') || 
           content.toLowerCase().includes('eligible for university');
  }

  generateSummaryText(grade) {
    const gradeTexts = {
      '10': 'As a Grade 10 student, this report focuses on career exploration and foundation building. You have time to explore different paths and ensure your subjects align with your interests.',
      '11': 'As a Grade 11 student, this report provides strategic guidance for university research and academic improvement. You have two years to prepare for applications.',
      '12': 'As a Grade 12 student, this report focuses on immediate actions: university applications, NSC preparation, and final decisions. Time is critical for achieving your goals.'
    };
    
    return gradeTexts[grade] || gradeTexts['12'];
  }

  parseContentSections(content) {
    // Clean content and split into manageable sections
    const cleaned = content
      .replace(/---+\s*⚠️[^-]*---+/g, '')
      .replace(/⚠️ \*\*Verify before you decide[^⚠️]*⚠️[^⚠️]*$/g, '')
      .replace(/---+/g, '')
      .trim();
    
    return cleaned.split(/(?=^##?\s)/gm).filter(section => section.trim());
  }
}
```

#### Step 3.2: Update PDF Download Function (10 minutes)

**File**: `app/results/page.jsx` (Update downloadPDF function)

```javascript
// Import the new PDF generator
import { ThandiPDFGenerator } from '@/lib/thandi-pdf-generator';

// Replace the existing downloadPDF function
const downloadPDF = async () => {
  if (!results) return;

  try {
    // Show loading state (add state if needed)
    console.log('🔄 Generating professional PDF...');
    
    // Create professional PDF with Thandi branding
    const generator = new ThandiPDFGenerator(results, {
      name: 'Student', // Can be enhanced with actual student data
      grade: results.metadata?.grade || '12'
    });
    
    const pdf = generator.generateProfessionalReport();
    
    // Professional filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Thandi-Career-Report-${timestamp}.pdf`;
    
    pdf.save(filename);
    
    // Track enhanced PDF download
    trackPDFDownload(results.metadata?.grade || '12', true, 'professional');
    
    console.log('✅ Professional PDF generated successfully');
    
  } catch (error) {
    console.error('❌ Professional PDF generation failed:', error);
    
    // Fallback to basic PDF generation
    console.log('🔄 Falling back to basic PDF...');
    generateBasicPDF();
  }
};

// Keep existing basic PDF as fallback
const generateBasicPDF = () => {
  // Existing PDF generation code as fallback
  const pdf = new jsPDF();
  // ... existing implementation
  pdf.save(`thandi-career-guidance-${new Date().toISOString().split('T')[0]}.pdf`);
};
```

**Expected Outcome**: Professional, branded PDF reports with structured layout, visual elements, and comprehensive content

---

### PHASE 4: PDF INTEGRATION & TESTING (10 minutes)

#### Step 4.1: Test PDF Generation (5 minutes)

**Test Cases**:
1. **Basic PDF Generation**: Click download button, verify PDF creates
2. **Content Verification**: Check PDF contains all results information
3. **Professional Layout**: Verify branding, headers, formatting
4. **Fallback Testing**: Simulate error, verify basic PDF fallback works
5. **File Naming**: Verify professional filename format

#### Step 4.2: Integration Testing (5 minutes)

**Test Scenarios**:
1. **Complete User Flow**: Assessment → Results → PDF Download
2. **Different Grades**: Test with Grade 10, 11, 12 content
3. **Various Content Types**: Test with different result formats
4. **Mobile Testing**: Verify PDF download works on mobile
5. **Error Handling**: Test with malformed results data

**Expected Outcome**: Robust PDF generation system with professional output and reliable fallback

---

### PHASE 5: COMPREHENSIVE TESTING & VERIFICATION (10 minutes)

#### Step 5.1: Visual Verification (5 minutes)

**Checklist**:
- [ ] Results page displays with Thandi branding colors
- [ ] Visual cards replace plain text formatting
- [ ] Icons and visual indicators appear correctly
- [ ] Mobile responsive design works
- [ ] Typography matches Thandi design system
- [ ] Color coding is consistent throughout

#### Step 5.2: Functional Testing (5 minutes)

**Checklist**:
- [ ] Enhanced formatting appears in browser (not cached)
- [ ] PDF download button works
- [ ] Professional PDF generates with branding
- [ ] PDF contains all results information
- [ ] Fallback PDF works if professional generation fails
- [ ] No JavaScript errors in console
- [ ] All existing functionality preserved (registration CTA, warnings, etc.)

**Expected Outcome**: Fully functional, professionally branded results page with enhanced PDF generation

---

## 🎯 SUCCESS CRITERIA

### User Requirements Met:
1. ✅ **Thandi Branding**: Results page uses Thandi colors, fonts, and design system
2. ✅ **UI/UX Consistency**: Matches assessment page design and user experience
3. ✅ **Professional PDF**: Enhanced PDF with branding, structure, and complete information
4. ✅ **Student-Friendly**: LLM results are presentable and aligned with assessment experience

### Technical Requirements Met:
1. ✅ **Enhanced Formatting**: Visual cards, icons, and hierarchy
2. ✅ **Professional PDF**: Branded, structured, comprehensive reports
3. ✅ **Backward Compatibility**: Existing functionality preserved
4. ✅ **Error Handling**: Graceful fallbacks and error recovery
5. ✅ **Performance**: No degradation in page load or PDF generation times

### Quality Assurance:
1. ✅ **Visual Consistency**: Matches Thandi design system exactly
2. ✅ **Content Accuracy**: All results information preserved and enhanced
3. ✅ **Professional Standards**: PDF meets professional document standards
4. ✅ **User Experience**: Improved readability and visual appeal
5. ✅ **Mobile Compatibility**: Works seamlessly on all devices

---

## 📊 IMPLEMENTATION TIMELINE

| Phase | Duration | Tasks | Outcome |
|-------|----------|-------|---------|
| **Phase 1** | 5 min | Cache clearing, foundation setup | Clean working system |
| **Phase 2** | 20 min | Thandi branding implementation | Branded results page |
| **Phase 3** | 25 min | Professional PDF system | Enhanced PDF generation |
| **Phase 4** | 10 min | Integration and testing | Verified functionality |
| **Phase 5** | 10 min | Comprehensive verification | Production-ready system |
| **Total** | **70 min** | **Complete implementation** | **Professional solution** |

---

## 🔧 RISK MITIGATION

### Technical Risks:
- **Cache Issues**: Force complete cache clear in Phase 1
- **PDF Generation Failure**: Robust fallback to basic PDF
- **Styling Conflicts**: Use Thandi CSS variables for consistency
- **Mobile Compatibility**: Responsive design testing included

### User Experience Risks:
- **Information Loss**: Preserve all existing content and functionality
- **Visual Regression**: Maintain familiar information hierarchy
- **Performance Impact**: Optimize CSS and PDF generation
- **Accessibility**: Maintain semantic HTML and ARIA labels

### Business Risks:
- **Brand Inconsistency**: Use exact Thandi design system colors and fonts
- **Professional Standards**: Professional PDF meets document standards
- **User Satisfaction**: Enhanced visual appeal and usability
- **Competitive Advantage**: Professional presentation improves perception

---

## 📈 EXPECTED OUTCOMES

### Immediate Benefits:
1. **Visual Appeal**: Professional, branded results presentation
2. **User Experience**: Improved readability and information hierarchy
3. **Brand Consistency**: Seamless integration with Thandi design system
4. **Professional PDFs**: High-quality, shareable career guidance reports

### Long-term Benefits:
1. **User Engagement**: Increased time spent reviewing results
2. **Conversion Rates**: Higher registration rates from improved UX
3. **Professional Perception**: Enhanced credibility and trust
4. **Competitive Advantage**: Superior presentation vs. competitors

### Measurable Improvements:
1. **PDF Download Rate**: Expected increase of 25-40%
2. **User Satisfaction**: Improved visual appeal ratings
3. **Time on Results Page**: Increased engagement metrics
4. **Professional Perception**: Higher quality ratings in user feedback

---

## 🚀 DEPLOYMENT READINESS

**Pre-Deployment Checklist**:
- [ ] All phases completed successfully
- [ ] Visual verification passed
- [ ] Functional testing completed
- [ ] PDF generation tested across scenarios
- [ ] Mobile compatibility verified
- [ ] Error handling tested
- [ ] Performance benchmarks met

**Post-Deployment Monitoring**:
- [ ] PDF generation success rates
- [ ] User engagement metrics
- [ ] Error logging and monitoring
- [ ] User feedback collection
- [ ] Performance monitoring

---

**Plan Created By**: Kiro AI Assistant  
**Plan Duration**: 70 minutes total implementation time  
**Status**: ✅ READY FOR EXECUTION  
**Next Phase**: User approval and implementation execution

This comprehensive plan addresses all user requirements while maintaining system stability and providing professional-grade enhancements to both the results page presentation and PDF generation capabilities.