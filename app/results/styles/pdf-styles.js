// PDF Styles - Consistent styling system for professional PDFs
export const PDFStyles = {
  colors: {
    primary: [17, 78, 78],      // Thandi teal #114E4E
    secondary: [107, 114, 128], // Gray
    accent: [223, 163, 58],     // Thandi gold #DFA33A
    warning: [239, 68, 68],     // Red
    success: [16, 185, 129],    // Green
    background: [249, 250, 251],
    white: [255, 255, 255],
    black: [0, 0, 0]
  },
  
  fonts: {
    heading: 'helvetica',
    body: 'helvetica',
    mono: 'courier'
  },
  
  spacing: {
    margin: 20,
    padding: 10,
    lineHeight: 1.4,
    sectionGap: 15,
    cardGap: 8
  },
  
  sizes: {
    h1: 24,
    h2: 18,
    h3: 14,
    h4: 12,
    body: 11,
    small: 9,
    tiny: 8
  },
  
  layout: {
    pageWidth: 210,
    pageHeight: 297,
    margin: 20,
    headerHeight: 35,
    footerHeight: 15
  }
};

// Professional color schemes for different elements
export const ColorSchemes = {
  feasibility: {
    high: [16, 185, 129],    // Green
    medium: [223, 163, 58],  // Gold
    low: [239, 68, 68]       // Red
  },
  
  urgency: {
    critical: [239, 68, 68], // Red
    high: [223, 163, 58],    // Gold
    info: [17, 78, 78]       // Teal
  },
  
  grades: {
    10: [16, 185, 129],      // Green - exploration
    11: [223, 163, 58],      // Gold - planning
    12: [92, 59, 32]         // Brown - urgency
  }
};