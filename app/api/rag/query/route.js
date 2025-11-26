// Simplified RAG endpoint for testing
export async function POST(request) {
  try {
    const body = await request.json();
    const { query } = body;

    // Mock response
    const mockResponse = {
      success: true,
      query,
      response: `### Your Career Matches

Based on your profile, here are careers that match your interests:

**1. Software Engineer**
- Strong match with your interest in Mathematics and Technology
- Entry requirements: Matric with Math 60%+, Physical Sciences 60%+
- Study path: BSc Computer Science (4 years)
- Institutions: University of Cape Town, Stellenbosch University, University of Pretoria
- Bursaries: Sasol Bursary (R120,000/year), NSFAS (means-tested)
- Starting salary: R250,000 - R350,000/year

**2. Data Scientist**
- Excellent fit for problem-solving and analytical thinking
- Entry requirements: Matric with Math 70%+, Physical Sciences 60%+
- Study path: BSc Data Science or Statistics (3-4 years)
- Institutions: University of Witwatersrand, University of Pretoria
- Bursaries: Eskom Bursary (R100,000/year), NSFAS
- Starting salary: R300,000 - R400,000/year

**3. Biomedical Engineer**
- Combines Life Sciences with Technology
- Entry requirements: Matric with Math 70%+, Physical Sciences 70%+, Life Sciences 60%+
- Study path: BEng Biomedical Engineering (4 years)
- Institutions: University of Cape Town, University of Witwatersrand
- Bursaries: NSFAS, Private sector bursaries
- Starting salary: R280,000 - R380,000/year

### Next Steps

1. **Improve your marks**: Focus on getting Math and Physical Sciences to 70%+ by Grade 12
2. **Apply for bursaries**: Start researching and applying in Grade 11
3. **Visit university open days**: Attend UCT, Wits, and UP open days
4. **Talk to professionals**: Shadow someone in these careers if possible

⚠️ **Verify before you decide:**
1. Speak with your school counselor
2. Call the institution directly
3. Check official websites

*Thandi's data may be outdated. Always confirm with real people.*`,
      studentProfile: {
        academicStrengths: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
        interests: ['Problem-solving', 'Technology', 'Helping people'],
        financialConstraint: 'Limited budget'
      },
      metadata: {
        processingTime: 150,
        chunksRetrieved: 10,
        chunksUsed: 5,
        modelUsed: 'mock',
        validationPassed: true
      }
    };

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      endpoint: '/api/rag/query',
      version: '1.0.0-mock'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
