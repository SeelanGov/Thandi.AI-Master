// Assessment Save API - Store student assessment data
// Temporary implementation: Log data and return success (no database table yet)

export async function POST(request) {
  try {
    const data = await request.json();
    const { student_id, responses, subjects, grade, interests } = data;
    
    if (!student_id || !responses) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: student_id and responses' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Log the assessment data (temporary until database table is created)
    console.log('Assessment saved:', {
      student_id,
      responses: Object.keys(responses).length + ' responses',
      subjects: subjects?.length || 0,
      grade,
      interests: interests?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    // Generate a mock assessment ID
    const assessment_id = `assess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        assessment_id,
        message: 'Assessment saved successfully',
        note: 'Data logged temporarily - database table will be created in production'
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Assessment API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}