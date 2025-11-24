/**
 * Mock API Server for Integration Testing
 * 
 * Simulates RAG responses without needing real API keys
 * Tests data flow: Assessment Form → API → Results
 */

import http from 'http';

const mockServer = http.createServer((req, res) => {
  // Enable CORS for local testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/rag/query' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const requestData = JSON.parse(body);
        console.log('\n📥 Received Assessment Data:');
        console.log(JSON.stringify(requestData, null, 2));

        // Validate data format
        const validation = validateRequestFormat(requestData);
        if (!validation.valid) {
          console.error('❌ Invalid request format:', validation.errors);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid request format',
            details: validation.errors
          }));
          return;
        }

        // Simulate RAG processing delay
        setTimeout(() => {
          const mockResponse = generateMockResponse(requestData);
          
          console.log('\n📤 Sending Mock Response:');
          console.log('- Careers included:', mockResponse.response.match(/\d+\.\s\*\*[^*]+\*\*/g)?.length || 0);
          console.log('- Footer present:', mockResponse.response.includes('⚠️ **Verify before you decide:**'));
          console.log('- Response length:', mockResponse.response.length, 'chars');

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mockResponse));
        }, 1000); // 1 second delay to simulate processing

      } catch (error) {
        console.error('❌ Error processing request:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Server error: ' + error.message
        }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

function validateRequestFormat(data) {
  const errors = [];
  
  if (!data.query && !data.studentProfile) {
    errors.push('Missing query or studentProfile');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function generateMockResponse(requestData) {
  const { studentProfile } = requestData;
  
  // Simulate different responses based on profile
  const hasMathStrength = studentProfile?.academicStrengths?.some(s => /math/i.test(s));
  const hasLowIncome = studentProfile?.financialConstraint === 'low';
  
  let careers = '';
  
  if (hasMathStrength) {
    careers = `1. **Data Scientist (85% match)**
   Why: Your math strength aligns perfectly with data analysis and statistical modeling
   Salary: R25,000-R45,000/month entry-level
   Study: BSc Computer Science or Statistics at UCT, Wits, or UP
   
2. **Actuary (82% match)**
   Why: Strong math skills are essential for risk analysis and financial modeling
   Salary: R30,000-R60,000/month entry-level
   Study: BSc Actuarial Science at UCT, Wits, Stellenbosch, or UP
   
3. **Software Engineer (78% match)**
   Why: Math provides strong problem-solving foundation for programming
   Salary: R20,000-R40,000/month entry-level
   Study: BSc Computer Science or Software Engineering at any major university`;
  } else {
    careers = `1. **Occupational Therapist (75% match)**
   Why: People-focused healthcare career with moderate academic requirements
   Salary: R15,000-R30,000/month entry-level
   Study: BOccTher at UCT, Wits, UP, or Stellenbosch
   
   ⚠️ Note: This requires moderate math (statistics, dosage calculations). Many students who struggle with math succeed with tutoring and extra support. Verify requirements with health sciences schools.
   
2. **Graphic Designer (72% match)**
   Why: Creative career with strong job market and entrepreneurship potential
   Salary: R12,000-R25,000/month entry-level
   Study: Graphic Design at Vega, AAA School of Advertising, or CPUT
   
3. **Social Worker (70% match)**
   Why: Helping profession focused on community support and counseling
   Salary: R15,000-R28,000/month entry-level
   Study: BSW (Bachelor of Social Work) at any major university`;
  }
  
  let bursaries = '';
  if (hasLowIncome) {
    bursaries = `\n\n**Bursaries & Funding:**
- NSFAS (National Student Financial Aid Scheme): Full tuition + R15,000/year allowance. Deadline: 30 November 2025. Apply: www.nsfas.org.za
- Funza Lushaka Bursary (for teaching): Full tuition + R27,000/year stipend. Deadline: 31 January 2026
- Company bursaries: Check with Sasol, Eskom, Discovery, Standard Bank (deadlines vary, usually June-August)`;
  }
  
  const response = `Based on your assessment, here are careers that match your profile:

${careers}${bursaries}

**Next Steps:**
1. Research each career thoroughly (talk to people doing these jobs)
2. Check university entry requirements for 2026
3. Apply for bursaries early (don't wait for matric results)
4. Speak with your school's career counselor for personalized guidance

---

⚠️ **Verify before you decide:**
1. Check with your school counselor
2. Call the institution directly (phone above)
3. Visit official websites for current info

Thandi's data may be outdated. Always confirm with real people.`;

  return {
    success: true,
    response,
    studentProfile: {
      academicStrengths: studentProfile?.academicStrengths || [],
      interests: studentProfile?.interests || [],
      financialConstraint: studentProfile?.financialConstraint || 'unknown'
    },
    metadata: {
      processingTime: 1000,
      modelUsed: 'mock-server',
      verificationFooterAdded: true,
      chunksUsed: 5,
      mockTest: true
    }
  };
}

const PORT = 3001;
mockServer.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Mock API Server Running');
  console.log('='.repeat(50));
  console.log(`Local URL: http://localhost:${PORT}/api/rag/query`);
  console.log(`Network URL: http://<your-ip>:${PORT}/api/rag/query`);
  console.log('');
  console.log('⚠️  Replace <your-ip> with your computer IP address');
  console.log('   Find it with: ipconfig | Select-String "IPv4"');
  console.log('   Example: http://192.168.101.108:3001/api/rag/query');
  console.log('');
  console.log('This server simulates RAG responses for testing.');
  console.log('No API keys needed. Safe for integration testing.');
  console.log('');
  console.log('⚠️  Server is accessible from your local network');
  console.log('   Use network URL when accessing from mobile devices');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('='.repeat(50));
});
