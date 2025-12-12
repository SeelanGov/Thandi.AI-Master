// Simple health check to verify environment variables
export async function GET() {
  const envCheck = {
    hasGroqKey: !!process.env.GROQ_API_KEY,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV || 'not set'
  };

  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      allKeysPresent: Object.values(envCheck).every(v => v === true || typeof v === 'string')
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
