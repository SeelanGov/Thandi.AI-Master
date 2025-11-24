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
    <div className="interest-areas">
      <h2>What interests you?</h2>
      <p className="subtitle">Select at least 1 area (you can select multiple)</p>

      <div className="interests-grid">
        {INTERESTS.map((interest) => (
          <button
            key={interest.id}
            onClick={() => toggleInterest(interest.id)}
            className={`interest-card ${selected.includes(interest.id) ? 'selected' : ''}`}
          >
            <div className="interest-icon">{interest.icon}</div>
            <div className="interest-name">{interest.name}</div>
            {selected.includes(interest.id) && (
              <div className="checkmark">✓</div>
            )}
          </button>
        ))}
      </div>

      {hasError && (
        <div className="error-message">
          Please select at least 1 interest area
        </div>
      )}

      <div className="selection-count">
        {selected.length} interest{selected.length !== 1 ? 's' : ''} selected
      </div>

      <style jsx>{`
        .interest-areas h2 {
          font-size: 24px;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #6b7280;
          margin-bottom: 24px;
          font-size: 16px;
        }

        .interests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .interest-card {
          padding: 20px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          text-align: center;
          min-height: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .interest-card:hover {
          border-color: #2563eb;
          background: #eff6ff;
          transform: translateY(-2px);
        }

        .interest-card.selected {
          border-color: #2563eb;
          background: #dbeafe;
        }

        .interest-icon {
          font-size: 32px;
          margin-bottom: 4px;
        }

        .interest-name {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .checkmark {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 18px;
          color: #2563eb;
          font-weight: bold;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          margin-top: 16px;
        }

        .selection-count {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          margin-top: 16px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .interests-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .interest-areas h2 {
            font-size: 20px;
          }

          .subtitle {
            font-size: 14px;
          }

          .interest-icon {
            font-size: 28px;
          }

          .interest-name {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
