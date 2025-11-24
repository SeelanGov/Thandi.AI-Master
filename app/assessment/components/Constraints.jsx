'use client';

export default function Constraints({ values, onChange }) {
  const updateConstraint = (field, value) => {
    onChange({
      ...values,
      [field]: value
    });
  };

  return (
    <div className="constraints">
      <h2>What are your constraints?</h2>
      <p className="subtitle">Help us understand your situation</p>

      <div className="constraint-group">
        <label htmlFor="time">How much time can you commit to studying?</label>
        <select
          id="time"
          value={values.time}
          onChange={(e) => updateConstraint('time', e.target.value)}
          className="select-input"
        >
          <option value="">Select...</option>
          <option value="full_time">Full-time (3-4 years)</option>
          <option value="part_time">Part-time (while working)</option>
          <option value="short_course">Short course (6-12 months)</option>
          <option value="flexible">Flexible / Not sure</option>
        </select>
      </div>

      <div className="constraint-group">
        <label htmlFor="money">What is your financial situation?</label>
        <select
          id="money"
          value={values.money}
          onChange={(e) => updateConstraint('money', e.target.value)}
          className="select-input"
        >
          <option value="">Select...</option>
          <option value="low">Need bursary/NSFAS (household income &lt; R350K)</option>
          <option value="medium">Can afford some costs (R350K-R600K)</option>
          <option value="high">Can afford full costs (&gt; R600K)</option>
          <option value="unsure">Not sure / Prefer not to say</option>
        </select>
      </div>

      <div className="constraint-group">
        <label htmlFor="location">Where do you want to study?</label>
        <select
          id="location"
          value={values.location}
          onChange={(e) => updateConstraint('location', e.target.value)}
          className="select-input"
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

      <style jsx>{`
        .constraints h2 {
          font-size: 24px;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #6b7280;
          margin-bottom: 32px;
          font-size: 16px;
        }

        .constraint-group {
          margin-bottom: 24px;
        }

        .constraint-group label {
          display: block;
          font-size: 16px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .select-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s;
        }

        .select-input:hover {
          border-color: #2563eb;
        }

        .select-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        @media (max-width: 768px) {
          .constraints h2 {
            font-size: 20px;
          }

          .subtitle {
            font-size: 14px;
          }

          .constraint-group label {
            font-size: 14px;
          }

          .select-input {
            font-size: 14px;
            padding: 10px 12px;
          }
        }
      `}</style>
    </div>
  );
}
