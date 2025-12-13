// IEB (Independent Examinations Board) Subject List
// Based on official IEB curriculum offerings for Grade 10-12
// Last updated: December 2024

export const IEB_SUBJECTS = [
  { name: 'Mathematics', code: 'MATH', emoji: '🔢', aps_weight: 1.0, category: 'core' },
  { name: 'Advanced Programme Mathematics', code: 'APMATH', emoji: '🔢', aps_weight: 1.1, category: 'core' },
  { name: 'Mathematical Literacy', code: 'MATHLIT', emoji: '📊', aps_weight: 0.8, category: 'core' },
  { name: 'Physical Sciences', code: 'PHYSCI', emoji: '⚛️', aps_weight: 1.0, category: 'science' },
  { name: 'Life Sciences', code: 'LIFESCI', emoji: '🧬', aps_weight: 1.0, category: 'science' },
  { name: 'English Home Language', code: 'ENGHL', emoji: '📖', aps_weight: 1.0, category: 'language' },
  { name: 'English First Additional Language', code: 'ENGFAL', emoji: '📚', aps_weight: 1.0, category: 'language' },
  { name: 'Afrikaans Home Language', code: 'AFRHL', emoji: '🗣️', aps_weight: 1.0, category: 'language' },
  { name: 'Afrikaans First Additional Language', code: 'AFRFAL', emoji: '💬', aps_weight: 1.0, category: 'language' },
  { name: 'French', code: 'FRENCH', emoji: '🇫🇷', aps_weight: 1.0, category: 'language' },
  { name: 'German', code: 'GERMAN', emoji: '🇩🇪', aps_weight: 1.0, category: 'language' },
  { name: 'Accounting', code: 'ACCOUNT', emoji: '💰', aps_weight: 1.0, category: 'commerce' },
  { name: 'Business Studies', code: 'BUSINESS', emoji: '🏢', aps_weight: 1.0, category: 'commerce' },
  { name: 'Economics', code: 'ECON', emoji: '📈', aps_weight: 1.0, category: 'commerce' },
  { name: 'Geography', code: 'GEO', emoji: '🌍', aps_weight: 1.0, category: 'humanities' },
  { name: 'History', code: 'HIST', emoji: '🏛️', aps_weight: 1.0, category: 'humanities' },
  { name: 'Information Technology', code: 'IT', emoji: '💻', aps_weight: 1.0, category: 'technical' },
  { name: 'Computer Applications Technology', code: 'CAT', emoji: '🖥️', aps_weight: 1.0, category: 'technical' },
  { name: 'Engineering Graphics and Design', code: 'EGD', emoji: '📐', aps_weight: 1.0, category: 'technical' },
  { name: 'Visual Arts', code: 'ART', emoji: '🎨', aps_weight: 1.0, category: 'creative' },
  { name: 'Dramatic Arts', code: 'DRAMA', emoji: '🎭', aps_weight: 1.0, category: 'creative' },
  { name: 'Music', code: 'MUSIC', emoji: '🎵', aps_weight: 1.0, category: 'creative' },
  { name: 'Design', code: 'DESIGN', emoji: '🎨', aps_weight: 1.0, category: 'creative' },
  { name: 'Life Orientation', code: 'LO', emoji: '🏃', aps_weight: 0.8, category: 'compulsory' }
];

// IEB-specific subject warnings and requirements
export const IEB_SUBJECT_WARNINGS = {
  'Mathematical Literacy': {
    type: 'critical',
    message: 'Blocks most engineering, medicine, and science degrees at all SA universities'
  },
  'Advanced Programme Mathematics': {
    type: 'positive', 
    message: 'IEB-specific advanced option - accepted as equivalent to CAPS Mathematics + Additional Mathematics'
  },
  'Physical Sciences': {
    type: 'positive',
    message: 'Required for engineering, medicine, and most science degrees'
  },
  'Mathematics': {
    type: 'positive',
    message: 'Opens doors to engineering, medicine, commerce, and science'
  },
  'Life Sciences': {
    type: 'positive',
    message: 'Required for medicine, nursing, and health sciences'
  },
  'French': {
    type: 'info',
    message: 'Available at most IEB schools - not offered in CAPS curriculum'
  },
  'German': {
    type: 'info', 
    message: 'Available at most IEB schools - not offered in CAPS curriculum'
  },
  'Design': {
    type: 'info',
    message: 'IEB-specific creative subject combining art and technology'
  }
};

// Export count for verification
export const IEB_SUBJECT_COUNT = IEB_SUBJECTS.length; // Should be 24