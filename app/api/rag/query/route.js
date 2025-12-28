// RAG endpoint - Simplified for Vercel deployment
import { NextResponse } from 'next/server';

// Generate enhanced career guidance
function generateCareerGuidance(query, grade, curriculum, studentProfile = null) {
  const gradeLevel = grade || 'grade10';
  const curriculumType = curriculum || 'caps';
  
  // Simple academic context without external dependencies
  const gradeNumber = parseInt(gradeLevel.replace('grade', '')) || 10;
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  
  let academicPhase = 'preparation';
  let timelineMessage = '';
  
  if (gradeNumber === 12) {
    if (year === 2025 && month >= 11) {
      academicPhase = 'post-finals';
      timelineMessage = 'Grade 12 finals complete (November 2025). Focus on results and 2026 applications.';
    } else if (year === 2025 && month >= 9) {
      academicPhase = 'finals-approach';
      timelineMessage = 'Grade 12 finals approaching (October-November 2025). Focus on preparation.';
    } else {
      timelineMessage = `Grade 12 student - finals in ${year === 2025 ? 'October 2025' : 'October-November ' + year}`;
    }
  } else if (gradeNumber === 11) {
    timelineMessage = `Grade 11 student - 1 year until Grade 12 finals`;
  } else {
    timelineMessage = `Grade 10 student - 2 years until Grade 12 finals`;
  }
  
  // Generate response based on query and grade
  let careerResponse = `# Your Career Guidance Results

## Based on Your Assessment
**Grade Level**: ${String(gradeLevel).toUpperCase()}
**Curriculum**: ${String(curriculumType).toUpperCase()}
**Academic Timeline**: ${timelineMessage}
**Query**: ${query}

## Recommended Career Paths

### 1. Technology & Engineering
- **Software Development**: High demand field with excellent growth prospects
- **Data Science**: Emerging field combining mathematics and technology
- **Engineering**: Various specializations available (Civil, Mechanical, Electrical)

### 2. Healthcare & Sciences
- **Medical Sciences**: Rewarding career helping others
- **Biomedical Engineering**: Combines technology with healthcare
- **Research Sciences**: Opportunities in various scientific fields

### 3. Business & Finance
- **Business Management**: Leadership opportunities across industries
- **Financial Services**: Banking, investment, and financial planning
- **Entrepreneurship**: Start your own business ventures

## Next Steps for ${String(gradeLevel).toUpperCase()} Students

1. **Subject Selection**: Choose subjects that align with your career interests
2. **University Research**: Investigate admission requirements for your chosen field
3. **Work Experience**: Seek internships or job shadowing opportunities
4. **Skills Development**: Build relevant skills through courses and projects

## Important Considerations

- **Academic Requirements**: Each career path has specific subject requirements
- **Market Demand**: Research job availability in your chosen field
- **Personal Interests**: Ensure your career choice aligns with your passions
- **Financial Planning**: Consider the cost of education and potential earnings

---

⚠️ **Verify before you decide**: This is AI-generated advice. Always confirm with school counselors, career advisors, and professionals in your field of interest before making important decisions about your future.`;

  return {
    response: careerResponse,
    fullResponse: careerResponse,
    results: [
      {
        title: "Personalized Career Guidance",
        content: "Based on your assessment, here are career recommendations tailored to your grade level and interests.",
        relevance: 0.95
      },
      {
        title: "Next Steps",
        content: "Specific action items to help you progress toward your career goals.",
        relevance: 0.90
      },
      {
        title: "Verification Required",
        content: "Remember to verify this AI-generated advice with real career counselors and professionals.",
        relevance: 0.85
      }
    ]
  };
}

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { query, grade, curriculum, profile, curriculumProfile } = body;
    
    // Extract grade parameter
    const gradeParam = grade || profile?.grade || curriculumProfile?.grade;
    
    // Quick validation
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // Parse grade from parameter or query
    let parsedGrade = 'grade10'; // Default fallback
    
    if (grade) {
      if (grade === '10' || grade === 10 || grade === 'grade10') parsedGrade = 'grade10';
      else if (grade === '11' || grade === 11 || grade === 'grade11') parsedGrade = 'grade11';
      else if (grade === '12' || grade === 12 || grade === 'grade12') parsedGrade = 'grade12';
      else if (typeof grade === 'string' && grade.startsWith('grade')) parsedGrade = grade;
    }
    
    // Generate career guidance response
    const careerGuidance = generateCareerGuidance(query, parsedGrade, curriculum, profile);
    
    const response = {
      success: true,
      query,
      grade: parsedGrade,
      curriculum: curriculum || 'caps',
      response: careerGuidance.response,
      fullResponse: careerGuidance.fullResponse,
      results: careerGuidance.results,
      metadata: {
        grade: parsedGrade,
        curriculum: curriculum || 'caps',
        provider: 'generated',
        hasVerificationFooter: true
      },
      performance: {
        totalTime: Date.now() - startTime,
        source: 'generated'
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
    message: 'RAG Query endpoint with cache is running',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}