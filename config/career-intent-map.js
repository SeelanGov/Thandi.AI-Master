// config/career-intent-map.js
// Maps student intents to specific careers for hybrid search

export default {
  // No matric - most restrictive path
  'no-matric': [
    'electrician',  // Grade 9 + apprenticeship
    'chef',  // Some schools accept Grade 11
    'content_creator'  // No formal education needed
  ],
  
  // No university but wants high income
  'no-university-high-income': [
    'electrician',  // R15k-R45k/month
    'chef',  // R12k-R50k/month
    'software_engineer',  // Bootcamp path
    'cybersecurity_specialist',  // Cert path
    'renewable_energy_engineer',  // Technician route
    'content_creator',  // Self-taught
    'ux_ui_designer'  // Portfolio-based
  ],
  
  // Creative + Tech blend (TEST-1 critical)
  'creative-tech': [
    'ux_ui_designer',  // PERFECT blend
    'graphic_designer',  // Visual + digital
    'content_creator',  // Creative + tech platforms
    'ai_ml_engineer',  // Creative problem-solving
    'software_engineer'  // Creative coding
  ],
  
  // Remote work + dollar earnings
  'remote-dollars': [
    'software_engineer',
    'ux_ui_designer',
    'data_scientist',
    'ai_ml_engineer',
    'cybersecurity_specialist',
    'blockchain_developer',
    'content_creator',
    'graphic_designer'
  ],
  
  // Fast path to earnings
  'fast-earnings': [
    'electrician',  // Apprenticeship = immediate earnings
    'chef',  // 1-2 year diploma, work while studying
    'renewable_energy_engineer',  // Solar cert is 1 week
    'content_creator'  // Can monetize in months
  ],
  
  // Biology + Tech combination
  'biology-tech': [
    'medical_doctor',  // Traditional path (we have content)
    'pharmacist',  // Science + healthcare (we have content)
    'data_scientist',  // Bioinformatics (we have content)
    'biomedical_engineer'  // Perfect blend (limited content)
  ],
  
  // Hands-on practical work
  'hands-on': [
    'electrician',
    'chef',
    'renewable_energy_engineer',
    'mechanical_engineer',
    'civil_engineer',
    'physiotherapist'
  ],
  
  // Helping people
  'helping-people': [
    'medical_doctor',
    'pharmacist',
    'physiotherapist',
    'occupational_therapist',
    'chef'  // Feeding people
  ],
  
  // Long-term specialist path (for conflict resolution)
  'long-term-specialist': [
    'medical_doctor',  // 6+ years + specialization
    'pharmacist',  // 4 years + specialization options
    'civil_engineer',  // 4 years + masters common
    'mechanical_engineer'
  ],
  
  // General - let semantic search handle
  'general': []
};
