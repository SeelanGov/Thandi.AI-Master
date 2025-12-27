'use client';

export default function OpenQuestions({ values = {}, onChange }) {
  const updateQuestion = (field, value) => {
    onChange({
      ...values,
      [field]: value
    });
  };

  return (
    <div className="animate-slide-up">
      <h2 className="assessment-subtitle">Tell us more about you</h2>
      <p className="assessment-description">Your answers help us give better recommendations</p>

      <div className="space-y-6">
        <div>
          <label htmlFor="motivation" className="assessment-label">
            What motivates you? What do you enjoy doing?
            <span className="text-sm font-normal text-assessment-text-muted ml-2">(Optional)</span>
          </label>
          <textarea
            id="motivation"
            value={values.motivation || ''}
            onChange={(e) => updateQuestion('motivation', e.target.value)}
            placeholder="E.g., I love solving problems, helping people, being creative..."
            className="form-input-assessment form-textarea-assessment"
            rows={4}
            maxLength={500}
          />
          <div className="text-right text-xs text-assessment-text-muted mt-1">
            {(values.motivation || '').length} / 500 characters
          </div>
        </div>

        <div>
          <label htmlFor="concerns" className="assessment-label">
            Do you have any concerns or questions about your future?
            <span className="text-sm font-normal text-assessment-text-muted ml-2">(Optional)</span>
          </label>
          <textarea
            id="concerns"
            value={values.concerns || ''}
            onChange={(e) => updateQuestion('concerns', e.target.value)}
            placeholder="E.g., I'm worried about finding a job, I don't know if I can afford university..."
            className="form-input-assessment form-textarea-assessment"
            rows={4}
            maxLength={500}
          />
          <div className="text-right text-xs text-assessment-text-muted mt-1">
            {(values.concerns || '').length} / 500 characters
          </div>
        </div>

        <div>
          <label htmlFor="careerInterests" className="assessment-label">
            What careers are you considering? (Helps us give better advice)
            <span className="text-sm font-normal text-assessment-text-muted ml-2">(Optional)</span>
          </label>
          <textarea
            id="careerInterests"
            value={values.careerInterests || ''}
            onChange={(e) => updateQuestion('careerInterests', e.target.value)}
            placeholder="E.g., doctor, engineer, teacher, not sure yet..."
            className="form-input-assessment form-textarea-assessment"
            rows={2}
            maxLength={200}
          />
          <div className="text-right text-xs text-assessment-text-muted mt-1">
            {(values.careerInterests || '').length} / 200 characters
          </div>
        </div>
      </div>

      <div className="bg-thandi-cream border border-thandi-teal/20 rounded-lg p-4 mt-8 flex items-start gap-3">
        <div className="text-xl flex-shrink-0">ℹ️</div>
        <div className="text-thandi-brown text-sm">
          <strong className="block mb-1">Your privacy matters:</strong>
          Your answers are used only to provide career recommendations. We don't share your information with anyone.
        </div>
      </div>
    </div>
  );
}
