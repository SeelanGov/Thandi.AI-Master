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