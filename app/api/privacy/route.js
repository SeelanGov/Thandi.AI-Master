// Privacy Policy API - Return current privacy policy
export async function GET() {
  const privacyPolicy = {
    version: "1.0",
    lastUpdated: "2024-12-11",
    title: "Thandi AI Privacy Policy",
    content: {
      dataCollection: "We collect assessment responses, subject choices, and career interests to provide personalized career guidance.",
      dataUsage: "Your data is used solely to generate career recommendations and improve our AI guidance system.",
      dataProtection: "All personal information is processed in compliance with POPIA (Protection of Personal Information Act).",
      dataRetention: "Assessment data is retained for 12 months to track your career journey progress.",
      userRights: "You have the right to access, correct, or delete your personal information at any time.",
      contact: "For privacy concerns, contact us at privacy@thandiai.co.za"
    },
    compliance: {
      popia: true,
      gdpr: true,
      lastAudit: "2024-12-11"
    }
  };

  return new Response(
    JSON.stringify({
      success: true,
      policy: privacyPolicy
    }),
    {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    }
  );
}