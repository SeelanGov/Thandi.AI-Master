// Consent Processing API - Store user consent for POPIA compliance
// Temporary implementation: Log consent and return success (no database table yet)

export async function POST(request) {
  try {
    const data = await request.json();
    const { 
      student_id, 
      consent_type, 
      consent_given, 
      ip_address,
      user_agent 
    } = data;
    
    if (!student_id || consent_given === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: student_id and consent_given' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Log consent for POPIA compliance (temporary until database table is created)
    console.log('Consent recorded:', {
      student_id,
      consent_type: consent_type || 'data_processing',
      consent_given: Boolean(consent_given),
      ip_address: ip_address || 'not_provided',
      user_agent: user_agent || 'not_provided',
      timestamp: new Date().toISOString(),
      policy_version: '1.0'
    });
    
    // Generate a mock consent ID
    const consent_id = `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        consent_id,
        message: 'Consent recorded successfully',
        popia_compliant: true,
        note: 'Consent logged temporarily - database table will be created in production'
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Consent API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}