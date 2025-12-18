import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Thandi.ai
        </h1>
        <p style={{
          color: '#6b7280',
          marginBottom: '32px',
          lineHeight: '1.5'
        }}>
          AI-powered career guidance for South African students
        </p>
        
        <div style={{ marginBottom: '24px' }}>
          <Link 
            href="/assessment" 
            style={{
              display: 'block',
              width: '100%',
              background: '#2563eb',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            Start Career Assessment
          </Link>
          
          <div style={{
            fontSize: '14px',
            color: '#9ca3af',
            marginTop: '16px'
          }}>
            Discover your ideal career path based on your interests, subjects, and goals
          </div>
        </div>
        
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            Status: <span style={{ color: '#10b981' }}>Online</span> • 
            Cache: <span style={{ color: '#10b981' }}>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}