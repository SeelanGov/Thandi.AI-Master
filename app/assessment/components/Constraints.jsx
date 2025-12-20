'use client';

export default function Constraints({ values, onChange }) {
  const updateConstraint = (field, value) => {
    onChange({
      ...values,
      [field]: value
    });
  };

  return (
    <div className="animate-slide-up">
      <h2 className="assessment-subtitle">What are your constraints?</h2>
      <p className="assessment-description">Help us understand your situation</p>

      <div className="space-y-6">
        <div>
          <label htmlFor="time" className="assessment-label">
            How much time can you commit to studying?
          </label>
          <select
            id="time"
            value={values.time}
            onChange={(e) => updateConstraint('time', e.target.value)}
            className="form-input-assessment form-select-assessment"
          >
            <option value="">Select...</option>
            <option value="full_time">Full-time (3-4 years)</option>
            <option value="part_time">Part-time (while working)</option>
            <option value="short_course">Short course (6-12 months)</option>
            <option value="flexible">Flexible / Not sure</option>
          </select>
        </div>

        <div>
          <label htmlFor="money" className="assessment-label">
            What is your financial situation?
          </label>
          <select
            id="money"
            value={values.money}
            onChange={(e) => updateConstraint('money', e.target.value)}
            className="form-input-assessment form-select-assessment"
          >
            <option value="">Select...</option>
            <option value="low">Need bursary/NSFAS (household income &lt; R350K)</option>
            <option value="medium">Can afford some costs (R350K-R600K)</option>
            <option value="high">Can afford full costs (&gt; R600K)</option>
            <option value="unsure">Not sure / Prefer not to say</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="assessment-label">
            Where do you want to study?
          </label>
          <select
            id="location"
            value={values.location}
            onChange={(e) => updateConstraint('location', e.target.value)}
            className="form-input-assessment form-select-assessment"
          >
            <option value="">Select...</option>
            <option value="gauteng">Gauteng (Johannesburg/Pretoria)</option>
            <option value="western_cape">Western Cape (Cape Town)</option>
            <option value="kwazulu_natal">KwaZulu-Natal (Durban)</option>
            <option value="eastern_cape">Eastern Cape</option>
            <option value="free_state">Free State</option>
            <option value="limpopo">Limpopo</option>
            <option value="mpumalanga">Mpumalanga</option>
            <option value="north_west">North West</option>
            <option value="northern_cape">Northern Cape</option>
            <option value="anywhere">Anywhere in South Africa</option>
            <option value="online">Online / Distance learning</option>
          </select>
        </div>

        <div>
          <label htmlFor="familyBackground" className="assessment-label">
            Is anyone in your family a university graduate?
          </label>
          <select
            id="familyBackground"
            value={values.familyBackground || ''}
            onChange={(e) => updateConstraint('familyBackground', e.target.value)}
            className="form-input-assessment form-select-assessment"
          >
            <option value="">Select...</option>
            <option value="yes_parents">Yes - my parents</option>
            <option value="yes_siblings">Yes - my siblings</option>
            <option value="yes_extended">Yes - extended family</option>
            <option value="no">No - I'd be the first</option>
            <option value="unsure">Not sure / Prefer not to say</option>
          </select>
        </div>
      </div>
    </div>
  );
}
