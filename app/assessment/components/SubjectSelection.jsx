'use client';

const SUBJECTS = [
  // Core subjects
  { id: 'mathematics', name: 'Mathematics', category: 'core', emoji: '🔢' },
  { id: 'math_literacy', name: 'Mathematical Literacy', category: 'core', emoji: '📊' },
  
  // Sciences
  { id: 'physical_science', name: 'Physical Sciences', category: 'science', emoji: '⚗️' },
  { id: 'life_sciences', name: 'Life Sciences', category: 'science', emoji: '🧬' },
  
  // Commerce
  { id: 'accounting', name: 'Accounting', category: 'commerce', emoji: '💰' },
  { id: 'business_studies', name: 'Business Studies', category: 'commerce', emoji: '💼' },
  { id: 'economics', name: 'Economics', category: 'commerce', emoji: '📈' },
  
  // Humanities
  { id: 'geography', name: 'Geography', category: 'humanities', emoji: '🌍' },
  { id: 'history', name: 'History', category: 'humanities', emoji: '📜' },
  
  // Languages
  { id: 'english', name: 'English', category: 'language', emoji: '📚' },
  { id: 'afrikaans', name: 'Afrikaans', category: 'language', emoji: '🗣️' },
  { id: 'french', name: 'French', category: 'language', emoji: '🇫🇷' },
  { id: 'isizulu', name: 'isiZulu', category: 'language', emoji: '🗣️' },
  
  // Technical
  { id: 'it', name: 'Information Technology', category: 'technical', emoji: '💻' },
  { id: 'cat', name: 'Computer Applications Technology', category: 'technical', emoji: '🖥️' },
  { id: 'egd', name: 'EGD (Engineering Graphics & Design)', category: 'technical', emoji: '📐' },
  
  // Creative Arts
  { id: 'visual_arts', name: 'Visual Arts', category: 'creative', emoji: '🎨' },
  { id: 'dramatic_arts', name: 'Dramatic Arts', category: 'creative', emoji: '🎭' },
  { id: 'music', name: 'Music', category: 'creative', emoji: '🎵' },
  { id: 'dance', name: 'Dance', category: 'creative', emoji: '💃' },
  
  // Practical subjects
  { id: 'tourism', name: 'Tourism', category: 'practical', emoji: '✈️' },
  { id: 'hospitality', name: 'Hospitality Studies', category: 'practical', emoji: '🍽️' },
  { id: 'consumer_studies', name: 'Consumer Studies', category: 'practical', emoji: '🛍️' },
];

export default function SubjectSelection({ selected, onChange, curriculumProfile }) {
  // Filter subjects to only show those selected in Step 1
  const availableSubjects = curriculumProfile?.currentSubjects || [];
  
  // Debug: Basic logging
  console.log('🔍 SubjectSelection - Available subjects:', availableSubjects.length);
  
  // Create a robust mapping function to handle name mismatches
  const isSubjectAvailable = (subject) => {
    if (availableSubjects.length === 0) return true; // Show all if none selected
    
    // Direct name match
    if (availableSubjects.includes(subject.name)) return true;
    
    // Create bidirectional mapping between Step 1 names and Step 3 names
    const nameMapping = {
      // Step 3 name -> Step 1 names it should match
      'Mathematics': ['Mathematics'],
      'Mathematical Literacy': ['Mathematical Literacy'],
      'Physical Sciences': ['Physical Sciences'],
      'Life Sciences': ['Life Sciences'],
      'Accounting': ['Accounting'],
      'Business Studies': ['Business Studies'],
      'Economics': ['Economics'],
      'Geography': ['Geography'],
      'History': ['History'],
      'English': ['English Home Language', 'English First Additional Language'],
      'Afrikaans': ['Afrikaans Home Language', 'Afrikaans First Additional Language'],
      'isiZulu': ['IsiZulu Home Language', 'IsiXhosa Home Language', 'Sesotho Home Language', 'Setswana Home Language'],
      'Computer Applications Technology': ['Computer Applications Technology (CAT)'],
      'Information Technology': ['Information Technology'],
      'EGD (Engineering Graphics & Design)': ['Engineering Graphics and Design (EGD)'],
      'Visual Arts': ['Visual Arts'],
      'Dramatic Arts': ['Dramatic Arts'],
      'Music': ['Music'],
      'Tourism': ['Tourism'],
      'Hospitality Studies': ['Hospitality Studies'],
      'Consumer Studies': ['Consumer Studies']
    };
    
    // Check if any of the Step 1 names match this Step 3 subject
    const step1Names = nameMapping[subject.name] || [];
    const hasMatch = step1Names.some(step1Name => availableSubjects.includes(step1Name));
    
    // Also try partial matching for edge cases
    if (!hasMatch) {
      const subjectLower = subject.name.toLowerCase();
      const partialMatch = availableSubjects.some(available => {
        const availableLower = available.toLowerCase();
        return availableLower.includes(subjectLower) || subjectLower.includes(availableLower);
      });
      return partialMatch;
    }
    
    return hasMatch;
  };
  
  const filteredSubjects = SUBJECTS.filter(isSubjectAvailable);
  
  // Debug logging
  console.log('🔍 SubjectSelection - Filtering:', `${filteredSubjects.length}/${SUBJECTS.length} subjects`);
  
  const toggleSubject = (subjectId) => {
    if (selected.includes(subjectId)) {
      onChange(selected.filter(id => id !== subjectId));
    } else {
      // Limit to 5 subjects max
      if (selected.length < 5) {
        onChange([...selected, subjectId]);
      }
    }
  };

  const hasError = selected.length < 2;
  const atMax = selected.length >= 5;

  return (
    <div className="animate-slide-up">
      <h2 className="assessment-subtitle">Which subjects do you actually ENJOY? 💚</h2>
      <p className="assessment-description">
        Pick 2-3 subjects you like (not just take). This helps Thandi give better advice.
      </p>

      {/* Helpful tip */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">💡</span>
        <span className="text-amber-800 text-sm leading-relaxed">
          Only select subjects you genuinely enjoy. If you take Math but don't like it, don't select it!
        </span>
      </div>

      {availableSubjects.length > 0 && (
        <div className="bg-thandi-teal-50 border border-thandi-teal-200 rounded-lg p-3 mb-6">
          <p className="text-thandi-teal-900 text-sm mb-1">
            📚 Showing subjects from your curriculum: {availableSubjects.join(', ')}
          </p>
          <p className="text-green-700 text-xs font-medium">
            🔍 Filtered to {filteredSubjects.length} of {SUBJECTS.length} subjects
          </p>
        </div>
      )}

      <div className="selection-grid">
        {filteredSubjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => toggleSubject(subject.id)}
            className={`selection-item ${selected.includes(subject.id) ? 'selected' : ''} ${atMax && !selected.includes(subject.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={atMax && !selected.includes(subject.id)}
          >
            <div className="text-2xl flex-shrink-0">{subject.emoji}</div>
            <div className="selection-item-title">{subject.name}</div>
          </button>
        ))}
      </div>

      {hasError && selected.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mt-4">
          Please select at least 2 subjects you enjoy
        </div>
      )}

      {atMax && (
        <div className="bg-thandi-teal-50 border border-thandi-teal-200 text-thandi-teal-700 p-3 rounded-lg text-sm mt-4">
          Maximum 5 subjects selected. Deselect one to choose another.
        </div>
      )}

      <div className="text-center text-assessment-text-muted text-sm mt-4 font-medium">
        {selected.length} subject{selected.length !== 1 ? 's' : ''} selected
        {selected.length >= 2 && selected.length <= 3 && ' ✨ Perfect!'}
        {selected.length > 3 && ' (consider narrowing to your top 3)'}
      </div>
    </div>
  );
}
