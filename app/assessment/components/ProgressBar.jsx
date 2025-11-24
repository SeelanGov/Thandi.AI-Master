'use client';

export default function ProgressBar({ currentStep, totalSteps }) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="progress-container">
      <div className="progress-steps">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`progress-step ${step <= currentStep ? 'active' : ''} ${
              step < currentStep ? 'completed' : ''
            }`}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">
              {step === 1 && 'Subjects'}
              {step === 2 && 'Interests'}
              {step === 3 && 'Constraints'}
              {step === 4 && 'Questions'}
            </div>
          </div>
        ))}
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>

      <div className="progress-text">
        Step {currentStep} of {totalSteps}
      </div>

      <style jsx>{`
        .progress-container {
          margin: 20px 0 40px;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 8px;
          transition: all 0.3s;
        }

        .progress-step.active .step-number {
          background: #2563eb;
          color: white;
        }

        .progress-step.completed .step-number {
          background: #10b981;
          color: white;
        }

        .step-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .progress-step.active .step-label {
          color: #2563eb;
          font-weight: 600;
        }

        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin: 15px 0;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: center;
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .step-number {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }

          .step-label {
            font-size: 10px;
          }

          .progress-bar {
            height: 6px;
          }
        }
      `}</style>
    </div>
  );
}
