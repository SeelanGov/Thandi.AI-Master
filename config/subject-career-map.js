// config/subject-career-map.js
// Maps academic subjects to careers (for boosting/filtering)

export default {
  // Positive mappings - boost these careers when subject is liked
  biology: [
    'medical_doctor',
    'pharmacist',
    'physiotherapist',
    'occupational_therapist',
    'data_scientist',  // bioinformatics
    'biomedical_engineer'
  ],
  
  mathematics: [
    'software_engineer',
    'data_scientist',
    'ai_ml_engineer',
    'mechanical_engineer',
    'electrical_engineer',
    'civil_engineer',
    'chemical_engineer',
    'blockchain_developer',
    'cybersecurity_specialist'
  ],
  
  physical_sciences: [
    'mechanical_engineer',
    'electrical_engineer',
    'civil_engineer',
    'chemical_engineer',
    'renewable_energy_engineer',
    'biomedical_engineer'
  ],
  
  // Negative mappings - deprioritize these when subject is hated
  avoid_math: [
    'data_scientist',
    'ai_ml_engineer',
    'electrical_engineer',
    'chemical_engineer',
    'mechanical_engineer',
    'civil_engineer',
    'blockchain_developer',
    'software_engineer'  // Can be learned without strong math, but math helps
  ],
  
  avoid_science: [
    'medical_doctor',
    'pharmacist',
    'biomedical_engineer',
    'chemical_engineer',
    'renewable_energy_engineer'
  ],
  
  // Low-math tech careers (for "hate math but want tech")
  low_math_tech: [
    'ux_ui_designer',
    'graphic_designer',
    'content_creator',
    'cybersecurity_specialist'  // More practical than theoretical
  ]
};
