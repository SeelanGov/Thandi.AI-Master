// lib/rag/intent-extraction.js
// Intent extraction for hybrid search - handles negation, speed, creative+tech blending

function extractQueryIntent(query) {
  const lowerQuery = query.toLowerCase();
  
  return {
    // Negation detection (critical for TEST-2, TEST-3)
    hasUniversityNegation: /(don't want|no|without|not interested in|skip|avoid).*(university|college|degree)|university.*(don't|no|not)|can't afford university/.test(lowerQuery),
    hasMatricNegation: /(don't have|no|without|didn't get|fail|drop out|didn't finish).*(matric|grade 12)|matric.*(don't|no|not|fail)/.test(lowerQuery),
    
    // Speed/urgency detection (TEST-5)
    wantsFastPath: /(fast|quick|immediately|asap|soon|rapid|shortest|fastest|start earning|quick money)/.test(lowerQuery),
    
    // Creative + Tech blend (TEST-1)
    wantsCreative: /(creative|artistic|design|visual|art|media|content|create|make|draw|graphic)/.test(lowerQuery),
    wantsTech: /(tech|technology|digital|computer|code|program|software|online|internet|web|app)/.test(lowerQuery),
    
    // Remote/dollar earning (TEST-4)
    wantsRemote: /(remote|work from home|online|freelance|anywhere|location independent)/.test(lowerQuery),
    wantsDollars: /(dollar|dollars|\$|usd|euro|euros|international|global|foreign currency|earn.*dollar)/.test(lowerQuery),
    wantsHighIncome: /(good money|high salary|earn a lot|well paid|good pay|make money|rich|good salary|need.*salary)/.test(lowerQuery),
    
    // STEM combinations (TEST-6)
    subjects: {
      biology: /(biology|life science|bio\b)/.test(lowerQuery),
      physics: /(physics|physical science)/.test(lowerQuery),
      maths: /(math|mathematics|maths)/.test(lowerQuery),
      science: /(science|stem)/.test(lowerQuery)
    },
    
    // Subject negations (for "hate math" etc)
    subjectNegations: {
      math: /(hate|bad at|weak in|struggle with|don't like|avoid).*(math|mathematics|maths)/.test(lowerQuery),
      science: /(hate|bad at|weak in|struggle with|don't like|avoid).*(science|physics|chemistry)/.test(lowerQuery),
      biology: /(hate|bad at|weak in|struggle with|don't like|avoid).*(biology|life science)/.test(lowerQuery)
    },
    
    // Work style preferences
    wantsHandsOn: /(hands.on|practical|build|fix|work with.*(hands|tools)|manual)/.test(lowerQuery),
    wantsHelping: /(help|helping|care|caring|people|patients|community|social)/.test(lowerQuery),
    
    // Explicit career mentions (for boosting)
    explicitCareers: extractExplicitCareerNames(query)
  };
}

function extractExplicitCareerNames(query) {
  const lowerQuery = query.toLowerCase();
  const careerNameMap = {
    'electrician': ['electrician', 'electrical work', 'wiring', 'solar installation'],
    'chef': ['chef', 'cook', 'cooking', 'culinary', 'kitchen', 'restaurant'],
    'software_engineer': ['software', 'programming', 'coding', 'developer', 'programmer', 'software engineer'],
    'ux_ui_designer': ['\\bux\\b', '\\bui\\b', 'user experience', 'user interface', 'ux designer', 'ui designer', 'ux/ui'],
    'graphic_designer': ['graphic design', 'graphic designer', 'graphics'],
    'content_creator': ['content creator', 'youtuber', 'influencer', 'social media'],
    'data_scientist': ['data science', 'data scientist', 'data analytics', 'data analyst'],
    'ai_ml_engineer': ['\\bai\\b', 'machine learning', 'artificial intelligence', 'ml engineer'],
    'cybersecurity_specialist': ['cybersecurity', 'cyber security', 'security', 'hacking', 'ethical hacker'],
    'blockchain_developer': ['blockchain', 'crypto', 'cryptocurrency', 'web3'],
    'renewable_energy_engineer': ['renewable energy', 'solar', 'wind energy', 'green energy'],
    'medical_doctor': ['doctor', 'medical doctor', 'physician', 'medicine'],
    'biomedical_engineer': ['biomedical', 'biomedical engineer', 'medical engineering'],
    'pharmacist': ['pharmacist', 'pharmacy', 'pharmaceutical'],
    'physiotherapist': ['physiotherapist', 'physio', 'physical therapy'],
    'occupational_therapist': ['occupational therapist', '\\bot\\b', 'occupational therapy'],
    'civil_engineer': ['civil engineer', 'civil engineering'],
    'mechanical_engineer': ['mechanical engineer', 'mechanical engineering'],
    'electrical_engineer': ['electrical engineer', 'electrical engineering'],
    'chemical_engineer': ['chemical engineer', 'chemical engineering']
  };
  
  const found = [];
  Object.entries(careerNameMap).forEach(([career, keywords]) => {
    // Use regex for word boundary matching on short keywords
    const hasMatch = keywords.some(kw => {
      if (kw.startsWith('\\b')) {
        // Use regex for word boundary
        const regex = new RegExp(kw, 'i');
        return regex.test(lowerQuery);
      } else {
        // Simple includes for longer phrases
        return lowerQuery.includes(kw);
      }
    });
    
    if (hasMatch) {
      found.push(career);
    }
  });
  
  return found;
}

/**
 * Detect conflicting intents in query
 */
function detectConflicts(intent, query) {
  const conflicts = [];
  const lowerQuery = query.toLowerCase();
  
  // Conflict: fast earnings + long study time
  const hasLongTermIntent = /(10 years|decade|long.?term|specialist|specialization)/.test(lowerQuery);
  if (intent.wantsFastPath && hasLongTermIntent) {
    conflicts.push({
      type: 'fast-vs-longterm',
      description: 'User wants both fast earnings AND long-term study',
      paths: ['fast-earnings', 'long-term-specialist']
    });
  }
  
  // Conflict: high income + no university (some high-income careers need degrees)
  if (intent.wantsHighIncome && intent.hasUniversityNegation) {
    conflicts.push({
      type: 'income-vs-education',
      description: 'User wants high income without university',
      note: 'Some high-income paths exist without degrees (trades, bootcamps)'
    });
  }
  
  // Conflict: creative + hate art/design
  const hasCreativeNegation = /(hate|don't like|bad at).*(art|design|creative|drawing)/.test(lowerQuery);
  if (intent.wantsCreative && hasCreativeNegation) {
    conflicts.push({
      type: 'creative-vs-aptitude',
      description: 'User wants creative career but dislikes creative activities'
    });
  }
  
  // Conflict: tech + hate math (many tech careers need math)
  if (intent.wantsTech && intent.subjectNegations?.math) {
    conflicts.push({
      type: 'tech-vs-math',
      description: 'User wants tech career but dislikes math',
      note: 'Low-math tech options exist (UX/UI, Content Creation)'
    });
  }
  
  return conflicts;
}

function serializeIntent(intent, query = '') {
  // Priority order matters - check most specific first
  
  // No matric is most restrictive
  if (intent.hasMatricNegation) return 'no-matric';
  
  // No university + high income
  if (intent.hasUniversityNegation && intent.wantsHighIncome) return 'no-university-high-income';
  
  // Creative + Tech blend
  if (intent.wantsCreative && intent.wantsTech) return 'creative-tech';
  
  // Remote + dollars (check dollars OR high income)
  if (intent.wantsRemote && (intent.wantsDollars || intent.wantsHighIncome)) return 'remote-dollars';
  if (intent.wantsDollars) return 'remote-dollars';
  
  // Fast earnings
  if (intent.wantsFastPath) return 'fast-earnings';
  
  // Biology + Tech
  if (intent.subjects.biology && intent.wantsTech) return 'biology-tech';
  
  // Hands-on work
  if (intent.wantsHandsOn) return 'hands-on';
  
  // Helping people
  if (intent.wantsHelping) return 'helping-people';
  
  return 'general';
}

export { 
  extractQueryIntent, 
  serializeIntent,
  extractExplicitCareerNames,
  detectConflicts
};
