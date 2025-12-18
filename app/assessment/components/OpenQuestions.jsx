'use client';

export default function OpenQuestions({ values = {}, onChange }) {
  const updateQuestion = (field, value) => {
    onChange({
      ...values,
      [field]: value
    });
  };

  return (
    <div className="open-questions">
      <h2>Tell us more about you</h2>
      <p className="subtitle">Your answers help us give better recommendations</p>

      <div className="question-group">
        <label htmlFor="motivation">
          What motivates you? What do you enjoy doing?
          <span className="optional">(Optional)</span>
        </label>
        <textarea
          id="motivation"
          value={values.motivation || ''}
          onChange={(e) => updateQuestion('motivation', e.target.value)}
          placeholder="E.g., I love solving problems, helping people, being creative..."
          className="textarea-input"
          rows={4}
        />
        <div className="char-count">
          {(values.motivation || '').length} / 500 characters
        </div>
      </div>

      <div className="question-group">
        <label htmlFor="concerns">
          Do you have any concerns or questions about your future?
          <span className="optional">(Optional)</span>
        </label>
        <textarea
          id="concerns"
          value={values.concerns || ''}
          onChange={(e) => updateQuestion('concerns', e.target.value)}
          placeholder="E.g., I'm worried about finding a job, I don't know if I can afford university..."
          className="textarea-input"
          rows={4}
          maxLength={500}
        />
        <div className="char-count">
          {(values.concerns || '').length} / 500 characters
        </div>
      </div>

      <div className="question-group">
        <label htmlFor="careerInterests">
          What careers are you considering? (Helps us give better advice)
          <span className="optional">(Optional)</span>
        </label>
        <textarea
          id="careerInterests"
          value={values.careerInterests || ''}
          onChange={(e) => updateQuestion('careerInterests', e.target.value)}
          placeholder="E.g., doctor, engineer, teacher, not sure yet..."
          className="textarea-input"
          rows={2}
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
          margin-bottom: 32px;
          font-size: 16px;
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
