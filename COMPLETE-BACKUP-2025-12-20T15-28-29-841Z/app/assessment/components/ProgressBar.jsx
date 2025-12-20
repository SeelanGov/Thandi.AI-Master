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
            <div className="progress-step-number">{step}</div>
            <div className="progress-step-label">
              {step === 1 && 'Profile'}
              {step === 2 && 'Marks'}
              {step === 3 && 'Subjects'}
              {step === 4 && 'Interests'}
              {step === 5 && 'Constraints'}
              {step === 6 && 'Questions'}
            </div>
          </div>
        ))}
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>

      <div className="text-center text-sm text-assessment-text-muted font-medium mt-4">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
}
