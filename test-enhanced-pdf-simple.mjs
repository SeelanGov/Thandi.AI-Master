// Test Enhanced PDF Generator - ES Module version
// Run: node test-enhanced-pdf-simple.mjs

import jsPDF from 'jspdf';
import fs from 'fs';

console.log('🧪 Testing Enhanced PDF with Logo and Complete Report');

try {
  console.log('📄 Creating enhanced PDF with logo...');
  
  // Create PDF with enhanced features
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Colors
  const thandiTeal = [17, 78, 78];
  const thandiGold = [223, 163, 58];
  
  // Page 1: Cover with Logo
  pdf.setFillColor(...thandiTeal);
  pdf.rect(0, 0, 210, 80, 'F');
  
  // Add Thandi Logo (circular with T)
  const logoX = 20;
  const logoY = 25;
  const radius = 8;
  
  // Outer ring (gold)
  pdf.setFillColor(...thandiGold);
  pdf.circle(logoX + radius, logoY, radius + 1, 'F');
  
  // Inner circle (teal)
  pdf.setFillColor(...thandiTeal);
  pdf.circle(logoX + radius, logoY, radius, 'F');
  
  // Letter "T" in white
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('T', logoX + radius - 2.5, logoY + 3);
  
  // Company branding
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(32);
  pdf.text('Thandi.ai', logoX + 25, 35);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('From School to Success', logoX + 25, 45);
  
  // Gold accent line
  pdf.setFillColor(...thandiGold);
  pdf.rect(0, 75, 210, 5, 'F');
  
  // Main title
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.text('Career Assessment Report', 20, 110);
  
  // Student info box
  pdf.setFillColor(248, 250, 252);
  pdf.rect(20, 130, 170, 60, 'F');
  pdf.setDrawColor(...thandiTeal);
  pdf.setLineWidth(1);
  pdf.rect(20, 130, 170, 60);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Student Information', 30, 145);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text('Name: Thabo Mthembu', 30, 160);
  pdf.text('Grade: Grade 12', 30, 172);
  pdf.text('Report Date: ' + new Date().toLocaleDateString('en-ZA'), 30, 184);
  
  // Page 2: Executive Summary
  pdf.addPage();
  
  // Header
  pdf.setFillColor(...thandiTeal);
  pdf.rect(0, 0, 210, 30, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('Executive Summary', 20, 20);
  pdf.setFontSize(10);
  pdf.text('Page 2', 180, 20);
  
  // Content
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(...thandiTeal);
  pdf.text('Assessment Overview', 20, 60);
  
  // Metric boxes
  const addMetricBox = (title, value, x, y, width, height) => {
    pdf.setFillColor(248, 250, 252);
    pdf.rect(x, y, width, height, 'F');
    pdf.setDrawColor(...thandiTeal);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, width, height);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(title, x + 3, y + 10);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...thandiTeal);
    pdf.text(value, x + 3, y + 20);
  };
  
  addMetricBox('Grade Level', 'Grade 12', 20, 80, 50, 30);
  addMetricBox('APS Score', '35', 80, 80, 50, 30);
  addMetricBox('Status', 'University Ready', 140, 80, 50, 30);
  
  // Summary text
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  const summaryText = 'As a Grade 12 student, you are in your final and most critical year. The recommendations focus on immediate actions for university applications and NSC preparation. Your APS score of 35 puts you in a strong position for university admission.';
  const summaryLines = pdf.splitTextToSize(summaryText, 170);
  pdf.text(summaryLines, 20, 130);
  
  // Page 3: Program Recommendations
  pdf.addPage();
  
  // Header
  pdf.setFillColor(...thandiTeal);
  pdf.rect(0, 0, 210, 30, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('Program Recommendations', 20, 20);
  pdf.setFontSize(10);
  pdf.text('Page 3', 180, 20);
  
  // Program cards
  const addProgramCard = (program, university, aps, yPos) => {
    const cardHeight = 45;
    
    // Card background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(20, yPos, 170, cardHeight, 'F');
    
    // Card border
    pdf.setDrawColor(...thandiTeal);
    pdf.setLineWidth(1);
    pdf.rect(20, yPos, 170, cardHeight);
    
    // Left accent bar
    pdf.setFillColor(...thandiGold);
    pdf.rect(20, yPos, 4, cardHeight, 'F');
    
    // Program title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(...thandiTeal);
    pdf.text(program, 30, yPos + 12);
    
    // University
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text(university, 30, yPos + 22);
    
    // Requirements
    pdf.setTextColor(0, 0, 0);
    pdf.text(`APS Required: ${aps}`, 30, yPos + 32);
    pdf.text('Feasibility: High', 100, yPos + 32);
    pdf.text('Deadline: 30 Sep 2026', 150, yPos + 32);
    
    return yPos + cardHeight + 10;
  };
  
  let yPos = 60;
  yPos = addProgramCard('Bachelor of Commerce (Accounting)', 'University of Cape Town', '32', yPos);
  yPos = addProgramCard('Bachelor of Science (Computer Science)', 'University of the Witwatersrand', '36', yPos);
  yPos = addProgramCard('Bachelor of Engineering (Civil)', 'University of Pretoria', '38', yPos);
  
  // Page 4: Parent & School Summary
  pdf.addPage();
  
  // Header
  pdf.setFillColor(...thandiTeal);
  pdf.rect(0, 0, 210, 30, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('Summary for Parents & Schools', 20, 20);
  pdf.setFontSize(10);
  pdf.text('Page 4', 180, 20);
  
  // Executive summary for parents
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(...thandiTeal);
  pdf.text('Executive Summary', 20, 60);
  
  // Key findings box
  pdf.setFillColor(240, 253, 244);
  pdf.rect(20, 80, 170, 70, 'F');
  pdf.setDrawColor(16, 185, 129);
  pdf.setLineWidth(2);
  pdf.rect(20, 80, 170, 70);
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(16, 185, 129);
  pdf.text('Key Findings for Parents', 30, 95);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  const parentSummary = 'Your child is in Grade 12, the critical decision year. This assessment identifies 3 viable programs for university application. Their APS score of 35 indicates good progress toward university admission. Immediate action is required for applications and financial aid.';
  const parentLines = pdf.splitTextToSize(parentSummary, 150);
  pdf.text(parentLines, 30, 110);
  
  // Recommended actions
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(...thandiTeal);
  pdf.text('Recommended Actions for Parents', 20, 170);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  const actions = [
    'Schedule a meeting with school counselor to discuss recommendations',
    'Research suggested universities and programs together',
    'Begin financial planning for tertiary education costs',
    'Support academic performance in final year',
    'Attend university open days as a family'
  ];
  
  let actionY = 185;
  actions.forEach((action, index) => {
    pdf.text(`${index + 1}. ${action}`, 20, actionY);
    actionY += 12;
  });
  
  // Add footer to all pages
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    // Footer line
    pdf.setDrawColor(...thandiTeal);
    pdf.setLineWidth(0.5);
    pdf.line(20, 277, 190, 277);
    
    // Footer text
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text('Generated by THANDI.AI - From School to Success', 20, 285);
    
    const date = new Date().toLocaleDateString('en-ZA');
    pdf.text(date, 160, 285);
  }
  
  // Save PDF
  const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
  const filename = `enhanced-thandi-logo-report-${new Date().toISOString().split('T')[0]}.pdf`;
  
  fs.writeFileSync(filename, pdfBuffer);
  
  console.log('✅ Enhanced PDF with logo generated successfully!');
  console.log(`📁 File saved as: ${filename}`);
  console.log(`📊 File size: ${pdfBuffer.length} bytes`);
  console.log('');
  console.log('🔍 MANUAL VERIFICATION CHECKLIST:');
  console.log('✓ Check Thandi logo appears on cover page (circular T with gold ring)');
  console.log('✓ Verify "Thandi.ai" and "From School to Success" branding');
  console.log('✓ Confirm professional layout with proper spacing');
  console.log('✓ Check all 4 pages are included:');
  console.log('  - Cover Page with Logo');
  console.log('  - Executive Summary with metrics');
  console.log('  - Program Recommendations with cards');
  console.log('  - Parent & School Summary');
  console.log('✓ Verify Thandi teal and gold colors are used correctly');
  console.log('✓ Check that content is comprehensive for parents/schools');
  console.log('');
  console.log('📋 NEXT STEPS:');
  console.log('1. Open the PDF file and verify visual quality');
  console.log('2. If quality looks good, update the main ProfessionalPDFGenerator.js');
  console.log('3. Test via local server: npm run dev');
  console.log('4. Test API endpoint: http://localhost:3000/api/pdf/test-session');
  console.log('5. Deploy if all tests pass');

} catch (error) {
  console.error('❌ Enhanced PDF generation failed:', error);
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('- Ensure jsPDF is installed: npm install jspdf');
  console.log('- Check Node.js version supports ES modules');
  console.log('- Verify file permissions for writing PDF');
}