// Minimal RAG endpoint for debugging Vercel deployment
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, grade, curriculum } = body;
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    const response = {
      success: true,
      query,
      grade: grade || 'grade10',
      curriculum: curriculum || 'caps',
      response: `# Career Guidance Results

## Based on Your Assessment
**Grade Level**: ${(grade || 'grade10').toUpperCase()}
**Curriculum**: ${(curriculum || 'caps').toUpperCase()}
**Query**: ${query}

## Recommended Career Paths

### 1. Technology & Engineering
- Software Development
- Data Science  
- Engineering

### 2. Healthcare & Sciences
- Medical Sciences
- Biomedical Engineering
- Research Sciences

### 3. Business & Finance
- Business Management
- Financial Services
- Entrepreneurship

---

⚠️ **Verify before you decide**: This is AI-generated advice. Always confirm with school counselors and career advisors.`,
      results: [
        {
          title: "Career Guidance",
          content: "Personalized recommendations based on your assessment.",
          relevance: 0.95
        }
      ],
      metadata: {
        grade: grade || 'grade10',
        curriculum: curriculum || 'caps',
        provider: 'minimal'
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