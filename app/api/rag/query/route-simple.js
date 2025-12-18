// Simplified RAG endpoint for production deployment
import { NextResponse } from 'next/server';

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { query, grade, curriculum } = body;
    
    // Quick validation
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // Simplified response for now to avoid timeout
    const response = {
      success: true,
      query,
      grade: grade || 'grade10',
      curriculum: curriculum || 'caps',
      results: [
        {
          title: "Career Assessment Available",
          content: "Your personalized career assessment is being processed. This is a simplified response to ensure the deployment works.",
          relevance: 0.9
        }
      ],
      performance: {
        totalTime: Date.now() - startTime,
        source: 'simplified'
      },
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('RAG Query Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'RAG Query endpoint is running',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}