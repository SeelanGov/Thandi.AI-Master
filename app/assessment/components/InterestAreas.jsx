'use client';

const INTERESTS = [
  { id: 'helping_people', name: 'Helping People', icon: '🤝' },
  { id: 'problem_solving', name: 'Problem Solving', icon: '🧩' },
  { id: 'creativity', name: 'Being Creative', icon: '🎨' },
  { id: 'working_with_tech', name: 'Working with Technology', icon: '💻' },
  { id: 'working_outdoors', name: 'Working Outdoors', icon: '🌳' },
  { id: 'working_with_numbers', name: 'Working with Numbers', icon: '🔢' },
  { id: 'leadership', name: 'Leading Teams', icon: '👥' },
  { id: 'research', name: 'Research & Analysis', icon: '🔬' },
  { id: 'communication', name: 'Communication', icon: '💬' },
  { id: 'hands_on', name: 'Hands-on Work', icon: '🔧' },
  { id: 'entrepreneurship', name: 'Starting a Business', icon: '💼' },
  { id: 'teaching', name: 'Teaching Others', icon: '📚' }
];

export default function InterestAreas({ selected, onChange }) {
  const toggleInterest = (interestId) => {
    if (selected.includes(interestId)) {
      onChange(selected.filter(id => id !== interestId));
    } else {
      onChange([...selected, interestId]);
    }
  };

  const hasError = selected.length < 1;

  return (
    <div className="animate-slide-up">
      <h2 className="assessment-subtitle">What interests you?</h2>
      <p className="assessment-description">Select at least 1 area (you can select multiple)</p>

      <div className="selection-grid">
        {INTERESTS.map((interest) => (
          <button
            key={interest.id}
            onClick={() => toggleInterest(interest.id)}
            className={`selection-item text-center ${selected.includes(interest.id) ? 'selected' : ''}`}
          >
            <div className="text-3xl mb-2">{interest.icon}</div>
            <div className="selection-item-title">{interest.name}</div>
          </button>
        ))}
      </div>

      {hasError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mt-4">
          Please select at least 1 interest area
        </div>
      )}

      <div className="text-center text-assessment-text-muted text-sm mt-4 font-medium">
        {selected.length} interest{selected.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
}
