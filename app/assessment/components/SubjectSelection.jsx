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
  // Filter subjects to only show those from curriculum profile (Step 1)
  const availableSubjects = curriculumProfile?.currentSubjects?.length > 0 
    ? SUBJECTS.filter(subject => 
        curriculumProfile.currentSubjects.some(currentSubj => 
          currentSubj.toLowerCase().includes(subject.name.toLowerCase()) ||
          subject.name.toLowerCase().includes(currentSubj.toLowerCase())
        )
      )
    : SUBJECTS; // Fallback to all subjects if no curriculum profile

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
    <div className="subject-selection">
      {/* FIXED: Aligned with curriculum profile from Step 1 */}
      <h2>Which of your CURRENT subjects do you most enjoy? 💚</h2>
      <p className="subtitle">
        From the subjects you selected in Step 1, pick 2-3 that you genuinely enjoy studying.
      </p>

      {/* Show curriculum context */}
      {curriculumProfile?.currentSubjects?.length > 0 && (
        <div className="context-box">
          <span className="context-icon">📚</span>
          <span className="context-text">
            Showing subjects from your {curriculumProfile.framework} curriculum profile
          </span>
        </div>
      )}

      {/* Updated tip for alignment */}
      <div className="tip-box">
        <span className="tip-icon">💡</span>
        <span className="tip-text">
          This helps Thandi focus on career paths that match subjects you both take AND enjoy!
        </span>
      </div>

      <div className="subjects-grid">
        {availableSubjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => toggleSubject(subject.id)}
            className={`subject-card ${selected.includes(subject.id) ? 'selected' : ''} ${atMax && !selected.includes(subject.id) ? 'disabled' : ''}`}
            disabled={atMax && !selected.includes(subject.id)}
          >
            <div className="subject-emoji">{subject.emoji}</div>
            <div className="subject-name">{subject.name}</div>
            {selected.includes(subject.id) && (
              <div className="checkmark">✓</div>
            )}
          </button>
        ))}
      </div>

      {hasError && selected.length > 0 && (
        <div className="error-message">
          Please select at least 2 subjects you enjoy
        </div>
      )}

      {atMax && (
        <div className="info-message">
          Maximum 5 subjects selected. Deselect one to choose another.
        </div>
      )}

      <div className="selection-count">
        {selected.length} subject{selected.length !== 1 ? 's' : ''} selected
        {selected.length >= 2 && selected.length <= 3 && ' ✨ Perfect!'}
        {selected.length > 3 && ' (consider narrowing to your top 3)'}
      </div>

      <style jsx>{`
        .subject-selection h2 {
          font-size: 24px;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #6b7280;
          margin-bottom: 16px;
          font-size: 16px;
          line-height: 1.5;
        }

        .context-box {
          background: #eff6ff;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .context-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .context-text {
          color: #1e40af;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 500;
        }

        .tip-box {
          background: #fef3c7;
          border: 2px solid #fbbf24;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .tip-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .tip-text {
          color: #78350f;
          font-size: 14px;
          line-height: 1.5;
        }

        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .subject-card {
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          text-align: left;
          min-height: 70px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .subject-card:hover:not(.disabled) {
          border-color: #10b981;
          background: #d1fae5;
          transform: translateY(-2px);
        }

        .subject-card.selected {
          border-color: #10b981;
          background: #d1fae5;
        }

        .subject-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .subject-emoji {
          font-size: 24px;
          flex-shrink: 0;
        }

        .subject-name {
          font-size: 15px;
          font-weight: 500;
          color: #374151;
          flex: 1;
        }

        .checkmark {
          font-size: 20px;
          color: #10b981;
          font-weight: bold;
          flex-shrink: 0;
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

        .info-message {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
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
          .subjects-grid {
            grid-template-columns: 1fr;
          }

          .subject-selection h2 {
            font-size: 20px;
          }

          .subtitle {
            font-size: 14px;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .subjects-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
