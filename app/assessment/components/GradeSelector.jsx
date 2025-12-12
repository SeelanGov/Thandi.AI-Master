'use client';

export default function GradeSelector({ onSelect }) {
  const handleSelect = (grade) => {
    console.log('Grade selected:', grade);
    onSelect(grade);
  };

  return (
    <div className="grade-selector-container">
      <div className="grade-selector-card">
        <h2 className="grade-selector-title">
          What grade are you in?
        </h2>
        
        <div className="grade-buttons">
          <button 
            onClick={() => handleSelect(10)}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleSelect(10);
            }}
            className="grade-button"
          >
            Grade 10
          </button>
          
          <button 
            onClick={() => handleSelect(11)}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleSelect(11);
            }}
            className="grade-button"
          >
            Grade 11
          </button>
          
          <button 
            onClick={() => handleSelect(12)}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleSelect(12);
            }}
            className="grade-button"
          >
            Grade 12
          </button>
        </div>
        
        <p className="grade-selector-hint">
          This helps us customize your career guidance
        </p>
      </div>

      <style jsx>{`
        .grade-selector-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }

        .grade-selector-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 32px 24px;
        }

        .grade-selector-title {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          color: #1a1a1a;
          margin-bottom: 32px;
        }

        .grade-buttons {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .grade-button {
          width: 100%;
          padding: 16px 24px;
          background: #2563eb;
          color: white;
          font-size: 18px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .grade-button:hover {
          background: #1d4ed8;
        }

        .grade-button:active {
          transform: scale(0.98);
          background: #1e40af;
        }

        .grade-selector-hint {
          font-size: 14px;
          color: #6b7280;
          text-align: center;
          margin: 0;
        }

        @media (max-width: 768px) {
          .grade-selector-container {
            padding: 15px;
          }

          .grade-selector-card {
            padding: 24px 20px;
          }

          .grade-selector-title {
            font-size: 20px;
            margin-bottom: 24px;
          }

          .grade-button {
            padding: 14px 20px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
