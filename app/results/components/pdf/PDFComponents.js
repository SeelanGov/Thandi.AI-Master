// PDF Components - Reusable PDF design elements
export class PDFComponents {
  constructor(pdf, colors, fonts) {
    this.pdf = pdf;
    this.colors = colors;
    this.fonts = fonts;
  }

  // Professional table component
  addTable(headers, rows, x, y, columnWidths) {
    let currentY = y;
    
    // Header row
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.rect(x, currentY, columnWidths.reduce((a, b) => a + b), 10, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(10);
    
    let currentX = x;
    headers.forEach((header, index) => {
      this.pdf.text(header, currentX + 2, currentY + 6);
      currentX += columnWidths[index];
    });
    
    currentY += 10;
    
    // Data rows
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(9);
    
    rows.forEach((row, rowIndex) => {
      // Alternating row colors
      if (rowIndex % 2 === 0) {
        this.pdf.setFillColor(248, 250, 252);
        this.pdf.rect(x, currentY, columnWidths.reduce((a, b) => a + b), 8, 'F');
      }
      
      currentX = x;
      row.forEach((cell, cellIndex) => {
        this.pdf.text(cell.toString(), currentX + 2, currentY + 5);
        currentX += columnWidths[cellIndex];
      });
      
      currentY += 8;
    });
    
    return currentY;
  }

  // Professional chart placeholder
  addChart(type, data, x, y, width, height) {
    // Chart background
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(x, y, width, height, 'F');
    
    // Chart border
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.rect(x, y, width, height);
    
    // Chart title
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(data.title, x + 5, y + 12);
    
    return y + height + 10;
  }
}