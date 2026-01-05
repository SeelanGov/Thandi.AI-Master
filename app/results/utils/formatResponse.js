/**
 * Legacy formatResponse function for fallback compatibility
 * This function formats the AI response text for display when card parsing fails
 */

export function formatResponse(responseText) {
  if (!responseText) return '';

  // Clean and format the response text
  let formatted = responseText
    // Remove any existing HTML tags
    .replace(/<[^>]*>/g, '')
    // Convert markdown-style headers
    .replace(/^### (.+)$/gm, '<h3 class="section-header">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="main-header">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="title-header">$1</h1>')
    // Convert bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="highlight">$1</strong>')
    // Convert numbered lists
    .replace(/^(\d+)\.\s*(.+)$/gm, '<div class="numbered-item"><span class="number">$1.</span><span class="content">$2</span></div>')
    // Convert bullet points
    .replace(/^[-*]\s*(.+)$/gm, '<div class="bullet-item"><span class="bullet">•</span><span class="content">$1</span></div>')
    // Convert line breaks to paragraphs
    .split('\n\n')
    .map(paragraph => {
      if (paragraph.trim()) {
        // Don't wrap if it's already formatted (contains HTML tags)
        if (paragraph.includes('<')) {
          return paragraph;
        }
        return `<p class="paragraph">${paragraph.trim()}</p>`;
      }
      return '';
    })
    .join('\n');

  // Enhance specific content types
  formatted = enhanceContent(formatted);

  return formatted;
}

/**
 * Enhance specific content patterns for better display
 */
function enhanceContent(html) {
  return html
    // Enhance university program mentions
    .replace(/(University of [^<\n]+|UCT|Wits|UJ|TUT|UNISA|UP|UWC)/g, 
      '<span class="university-name">$1</span>')
    
    // Enhance APS scores
    .replace(/APS[:\s]*(\d+)/gi, 
      '<span class="aps-score">APS: <strong>$1</strong></span>')
    
    // Enhance percentages
    .replace(/(\d+)%/g, 
      '<span class="percentage">$1%</span>')
    
    // Enhance deadlines
    .replace(/(deadline|due date)[:\s]*([^<\n.]+)/gi, 
      '<span class="deadline"><strong>$1:</strong> $2</span>')
    
    // Enhance bursary amounts
    .replace(/R\s*(\d+(?:,\d+)*)/g, 
      '<span class="amount">R$1</span>')
    
    // Enhance grade mentions
    .replace(/Grade\s*(\d+)/gi, 
      '<span class="grade-mention">Grade $1</span>')
    
    // Add warning styling to verification text
    .replace(/(⚠️[^<\n]*)/g, 
      '<div class="warning-text">$1</div>')
    
    // Enhance program cards
    .replace(/(\d+\.\s*[A-Z][^<\n]+(?:at|University)[^<\n]+)/g, 
      '<div class="program-highlight">$1</div>');
}

/**
 * Get CSS styles for formatted content
 */
export function getFormattedContentStyles() {
  return `
    .formatted-content {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #374151;
    }

    .title-header {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin: 32px 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 3px solid #10b981;
    }

    .main-header {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin: 28px 0 16px 0;
      padding-bottom: 6px;
      border-bottom: 2px solid #e5e7eb;
    }

    .section-header {
      font-size: 20px;
      font-weight: 600;
      color: #374151;
      margin: 24px 0 12px 0;
    }

    .paragraph {
      margin: 16px 0;
      line-height: 1.7;
      font-size: 16px;
    }

    .numbered-item {
      display: flex;
      align-items: flex-start;
      margin: 12px 0;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }

    .numbered-item .number {
      font-weight: 700;
      color: #10b981;
      margin-right: 12px;
      flex-shrink: 0;
      min-width: 24px;
    }

    .numbered-item .content {
      flex: 1;
      line-height: 1.6;
    }

    .bullet-item {
      display: flex;
      align-items: flex-start;
      margin: 8px 0;
      padding: 8px 0;
    }

    .bullet-item .bullet {
      color: #10b981;
      font-weight: bold;
      margin-right: 12px;
      font-size: 18px;
      line-height: 1.2;
      flex-shrink: 0;
    }

    .bullet-item .content {
      flex: 1;
      line-height: 1.6;
    }

    .highlight {
      background: #fef3c7;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      color: #92400e;
    }

    .university-name {
      background: #dbeafe;
      color: #1e40af;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
    }

    .aps-score {
      background: #dcfce7;
      color: #166534;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 600;
      font-family: 'SF Mono', Monaco, monospace;
    }

    .percentage {
      background: #f0fdf4;
      color: #166534;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      font-family: 'SF Mono', Monaco, monospace;
    }

    .deadline {
      background: #fef3c7;
      color: #92400e;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 500;
    }

    .amount {
      background: #ecfdf5;
      color: #065f46;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 700;
      font-family: 'SF Mono', Monaco, monospace;
    }

    .grade-mention {
      background: #e0f2fe;
      color: #0c4a6e;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 600;
    }

    .warning-text {
      background: #fef2f2;
      border: 2px solid #ef4444;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      color: #991b1b;
      font-weight: 600;
    }

    .program-highlight {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #0ea5e9;
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
      font-weight: 500;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .title-header {
        font-size: 24px;
      }

      .main-header {
        font-size: 20px;
      }

      .section-header {
        font-size: 18px;
      }

      .paragraph {
        font-size: 15px;
      }

      .numbered-item,
      .program-highlight {
        padding: 12px;
      }
    }
  `;
}