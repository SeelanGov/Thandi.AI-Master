'use client';

export default function OpenQuestions({ values, onChange }) {
  const updateQuestion = (field, value) => {
    onChange({
      ...values,
      [field]: value
    });
  };

  return (
    <div className="open-questions">
      <h2>Tell us more about you 🎯</h2>
      <p className="subtitle">Your answers are critical for personalized career guidance</p>
      
      {/* CRITICAL: Data Importance Explanation */}
      <div className="data-importance-box">
        <div className="importance-icon">🔑</div>
        <div className="importance-content">
          <h3>Why Your Answers Matter</h3>
          <p>
            <strong>100% of your questionnaire data is processed and used</strong> to create personalized recommendations. 
            The more you share, the better we can match you with careers that align with your interests, motivations, and concerns.
          </p>
          <div className="data-usage-grid">
            <div className="usage-item">
              <span className="usage-icon">💭</span>
              <span className="usage-text"><strong>Motivations</strong> help us find careers that fulfill what drives you</span>
            </div>
            <div className="usage-item">
              <span className="usage-icon">❓</span>
              <span className="usage-text"><strong>Concerns</strong> let us address your worries with practical advice</span>
            </div>
            <div className="usage-item">
              <span className="usage-icon">🎯</span>
              <span className="usage-text"><strong>Career interests</strong> are weighted by your grade for age-appropriate guidance</span>
            </div>
          </div>
        </div>
      </div>

      <div className="question-group">
        <label htmlFor="motivation">
          What motivates you? What do you enjoy doing?
          <span className="optional">(Optional)</span>
        </label>
        <textarea
          id="motivation"
          value={values.motivation}
          onChange={(e) => updateQuestion('motivation', e.target.value)}
          placeholder="E.g., I love solving problems, helping people, being creative..."
          className="textarea-input"
          rows={4}
        />
        <div className="char-count">
          {values.motivation.length} / 500 characters
        </div>
      </div>

      <div className="question-group">
        <label htmlFor="concerns">
          Do you have any concerns or questions about your future?
          <span className="optional">(Optional)</span>
        </label>
        <textarea
          id="concerns"
          value={values.concerns}
          onChange={(e) => updateQuestion('concerns', e.target.value)}
          placeholder="E.g., I'm worried about finding a job, I don't know if I can afford university..."
          className="textarea-input"
          rows={4}
          maxLength={500}
        />
        <div className="char-count">
          {values.concerns.length} / 500 characters
        </div>
      </div>

      <div className="question-group">
        <label htmlFor="careerInterests">
          What careers are you considering? 
          <span className="importance-note">(Important for personalized guidance)</span>
        </label>
        <div className="career-interest-explanation">
          <div className="explanation-icon">💡</div>
          <div className="explanation-text">
            Your career interests help us balance recommendations with our <strong>career interest weighting</strong> system based on your grade:
            <br />
            <strong>Grade 10-11:</strong> We'll focus 40% on your interests, 60% on alternatives to explore
            <br />
            <strong>Grade 12:</strong> We'll focus 60% on your interests, 40% on backup options
          </div>
        </div>
        <textarea
          id="careerInterests"
          value={values.careerInterests || ''}
          onChange={(e) => updateQuestion('careerInterests', e.target.value)}
          placeholder="E.g., doctor, engineer, teacher, business owner, not sure yet..."
          className="textarea-input"
          rows={3}
          maxLength={200}
        />
        <div className="char-count">
          {(values.careerInterests || '').length} / 200 characters
        </div>
      </div>

      <div className="info-box">
        <div className="info-icon">ℹ️</div>
        <div className="info-text">
          <strong>Your privacy matters:</strong> Your answers are used only to provide career recommendations. We don't share your information with anyone.
        </div>
      </div>

      <style jsx>{`
        .open-questions h2 {
          font-size: 24px;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #6b7280;
          margin-bottom: 24px;
          font-size: 16px;
        }

        /* Data Importance Box Styles */
        .data-importance-box {
          background: #f0fdf4;
          border: 2px solid #22c55e;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .importance-icon {
          font-size: 28px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .importance-content h3 {
          color: #15803d;
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .importance-content p {
          color: #166534;
          margin: 0 0 16px 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .data-usage-grid {
          display: grid;
          gap: 8px;
        }

        .usage-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #bbf7d0;
        }

        .usage-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .usage-text {
          color: #166534;
          font-size: 13px;
          line-height: 1.4;
        }

        .question-group {
          margin-bottom: 28px;
        }

        .question-group label {
          display: block;
          font-size: 16px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .optional {
          font-size: 14px;
          font-weight: 400;
          color: #9ca3af;
          margin-left: 8px;
        }

        .importance-note {
          font-size: 14px;
          font-weight: 500;
          color: #059669;
          margin-left: 8px;
        }

        .career-interest-explanation {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .explanation-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .explanation-text {
          color: #0c4a6e;
          line-height: 1.5;
        }

        .explanation-text strong {
          color: #0369a1;
        }

        .textarea-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #1a1a1a;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s;
        }

        .textarea-input:hover {
          border-color: #2563eb;
        }

        .textarea-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .textarea-input::placeholder {
          color: #9ca3af;
        }

        .char-count {
          text-align: right;
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .info-box {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          margin-top: 32px;
        }

        .info-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .info-text {
          font-size: 14px;
          color: #1e40af;
          line-height: 1.5;
        }

        .info-text strong {
          display: block;
          margin-bottom: 4px;
        }

        @media (max-width: 768px) {
          .open-questions h2 {
            font-size: 20px;
          }

          .subtitle {
            font-size: 14px;
          }

          .question-group label {
            font-size: 14px;
          }

          .textarea-input {
            font-size: 14px;
            padding: 10px 12px;
          }

          .info-text {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
