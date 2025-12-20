'use client';

export default function PreliminaryReport({ careers, onDeepDive, onSkip }) {
  return (
    <div className="preliminary-report-container">
      <div className="preliminary-report-card">
        <h2 className="report-title">
          📊 Your Quick Career Matches
        </h2>
        
        <p className="report-subtitle">
          Based on your interests, here are 3 careers to explore:
        </p>
        
        <div className="careers-list">
          {careers.slice(0, 3).map((career, i) => (
            <div key={i} className="career-card">
              <h3 className="career-title">
                {i + 1}. {career.title} ({career.match}% match)
              </h3>
              <p className="career-reason">{career.reason}</p>
              {career.bursaries && career.bursaries.length > 0 && (
                <div className="career-bursaries">
                  <p>💰 Bursaries: {career.bursaries.join(', ')}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="cta-section">
          <h3 className="cta-title">
            🎯 Get Your Personalized 2-Year Success Plan
          </h3>
          
          <p className="cta-value">
            Turn these matches into a <strong>step-by-step roadmap</strong> from Grade 10 → 12
          </p>
          
          <ul className="cta-benefits">
            <li>
              <span className="check">✓</span>
              <strong>Year-by-year mark targets</strong> for each subject
            </li>
            <li>
              <span className="check">✓</span>
              <strong>Month-by-month study schedule</strong> to improve struggling subjects
            </li>
            <li>
              <span className="check">✓</span>
              <strong>Bursary deadlines & amounts</strong> (worth R50,000+)
            </li>
            <li>
              <span className="check">✓</span>
              <strong>University application timeline</strong> and requirements
            </li>
            <li>
              <span className="check">✓</span>
              <strong>Backup career options</strong> if marks don't improve
            </li>
          </ul>
          
          <p className="cta-time">
            ⏱️ Takes 5 more minutes • No duplicate questions
          </p>
        
          <div className="cta-buttons">
          <button 
            onClick={(e) => {
              e.preventDefault();
              console.log('Deep dive clicked');
              onDeepDive();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              console.log('Deep dive touched');
              onDeepDive();
            }}
            className="btn-deep-dive"
          >
            Get My 2-Year Success Plan →
          </button>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              console.log('Skip clicked');
              onSkip();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              console.log('Skip touched');
              onSkip();
            }}
            className="btn-skip"
          >
            Skip for Now
          </button>
          </div>
        </div>

        <style jsx>{`
          .cta-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .btn-deep-dive, .btn-skip {
            width: 100%;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          .btn-deep-dive {
            padding: 14px 24px;
            background: #10b981;
            color: white;
            font-size: 18px;
          }

          .btn-deep-dive:hover {
            background: #059669;
          }

          .btn-deep-dive:active {
            transform: scale(0.98);
            background: #047857;
          }

          .btn-skip {
            padding: 10px 24px;
            background: #e5e7eb;
            color: #374151;
            font-size: 16px;
          }

          .btn-skip:hover {
            background: #d1d5db;
          }

          .btn-skip:active {
            transform: scale(0.98);
          }

          .preliminary-report-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }

          .preliminary-report-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 32px 24px;
          }

          .report-title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            color: #1a1a1a;
            margin-bottom: 16px;
          }

          .report-subtitle {
            font-size: 16px;
            color: #6b7280;
            text-align: center;
            margin-bottom: 24px;
          }

          .careers-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 32px;
          }

          .career-card {
            padding: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #f9fafb;
          }

          .career-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
          }

          .career-reason {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
          }

          .career-bursaries {
            margin-top: 8px;
          }

          .career-bursaries p {
            font-size: 13px;
            color: #059669;
            font-weight: 500;
          }

          .cta-section {
            background: linear-gradient(to right, #dbeafe, #d1fae5);
            padding: 24px;
            border-radius: 8px;
            border: 1px solid #93c5fd;
          }

          .cta-title {
            font-size: 20px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 12px;
          }

          .cta-value {
            font-size: 16px;
            color: #374151;
            margin-bottom: 16px;
          }

          .cta-value strong {
            color: #059669;
          }

          .cta-benefits {
            list-style: none;
            padding: 0;
            margin: 0 0 16px 0;
          }

          .cta-benefits li {
            display: flex;
            align-items: center;
            color: #374151;
            margin-bottom: 8px;
          }

          .check {
            color: #10b981;
            margin-right: 8px;
            font-weight: bold;
          }

          .cta-time {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 20px;
          }

          @media (max-width: 768px) {
            .preliminary-report-container {
              padding: 15px;
            }

            .preliminary-report-card {
              padding: 24px 20px;
            }

            .report-title {
              font-size: 20px;
            }

            .career-title {
              font-size: 16px;
            }

            .cta-title {
              font-size: 18px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
