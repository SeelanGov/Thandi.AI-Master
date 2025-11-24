'use client';

import { useState } from 'react';

export default function TestIntegrationPage() {
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('Checking...');

  const BACKEND_URL = 'https://thandiai.vercel.app';

  // Check backend status on mount
  useState(() => {
    fetch(`${BACKEND_URL}/api/assess`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'ok') {
          setBackendStatus('✅ Online');
        } else {
          setBackendStatus('❌ Error');
        }
      })
      .catch(() => setBackendStatus('❌ Offline'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // CRITICAL: Save fullResponse to localStorage for results page
      localStorage.setItem('thandi_results', JSON.stringify(data));
      console.log('✅ Results saved, redirecting...');
      
      // Navigate to results page
      window.location.href = '/results';
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>
          🎨 Orchids Integration Test
        </h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Test the connection between Orchids frontend and Thandi backend
        </p>

        <div style={{
          background: '#e3f2fd',
          border: '2px solid #90caf9',
          color: '#1976d2',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <strong>Backend URL:</strong> {BACKEND_URL}<br />
          <strong>Status:</strong> {backendStatus}
        </div>

        <form onSubmit={handleSubmit}>
          {[
            'What are your academic strengths?',
            'What do you enjoy doing?',
            'What are your financial constraints?',
            'What are your career goals?'
          ].map((question, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#333'
              }}>
                Question {i + 1}: {question}
              </label>
              <textarea
                value={answers[i]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[i] = e.target.value;
                  setAnswers(newAnswers);
                }}
                placeholder={`e.g., ${i === 0 ? 'I am good at Math and Science' : ''}`}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 40px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Analyzing...' : 'Get Career Recommendations'}
          </button>
        </form>

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#667eea' }}>
            <div style={{
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #667eea',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '20px auto'
            }} />
            <p style={{ fontWeight: '600' }}>Analyzing your responses...</p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee',
            border: '2px solid #fcc',
            color: '#c33',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {results && (
          <div style={{ marginTop: '30px' }}>
            <div style={{
              background: '#efe',
              border: '2px solid #cfc',
              color: '#3c3',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <strong>✅ Success!</strong> Found {results.careers?.length || 0} career recommendation(s)<br />
              <small>Session ID: {results.sessionId}</small>
            </div>

            <div style={{
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <h3 style={{ marginBottom: '20px' }}>Career Recommendations:</h3>
              {results.careers?.map((career, i) => (
                <div key={i} style={{
                  background: 'white',
                  padding: '20px',
                  marginBottom: '15px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #667eea'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '5px'
                  }}>
                    {i + 1}. {career.name}
                  </div>
                  <div style={{
                    color: '#667eea',
                    fontWeight: '600',
                    marginBottom: '10px'
                  }}>
                    {career.match}% Match
                  </div>
                  <div style={{
                    color: '#666',
                    lineHeight: '1.6'
                  }}>
                    {career.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
