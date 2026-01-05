/**
 * Setup Test Data for Results Page Redesign
 * Creates localStorage entries to test the results page with different grade levels
 */

// Test data for different grades
const testData = {
  grade10: {
    grade: '10',
    fullResponse: `
# Your Grade 10 Career Exploration Results

## Academic Foundation Status
You're in your foundation year - this is the perfect time to explore and build strong academic habits. No APS score yet, but you're building toward a projected range of 35-42 based on your current performance.

## Career Exploration Options

### 1. Engineering Programs
**University of Cape Town - Mechanical Engineering**
- APS Required: 42
- Projected admission chance: 65%
- Application deadline: July 2027
- Duration: 4 years
- Requirements: Mathematics 70%, Physical Science 70%, English 60%

This field offers excellent problem-solving opportunities and aligns with your interest in how things work.

### 2. Medical Sciences
**University of the Witwatersrand - Medicine**
- APS Required: 45
- Projected admission chance: 45%
- Application deadline: July 2027
- Duration: 6 years
- Requirements: Mathematics 80%, Physical Science 80%, Life Sciences 80%

Consider this if you're passionate about helping people and have strong science marks.

## Financial Aid Opportunities

### NSFAS Financial Aid
- Amount: Full tuition + allowances
- Eligibility match: 85%
- Deadline: August 2027
- Urgency: INFO
- Qualifications: South African citizen, Family income under R350,000, Academic performance

Start learning about NSFAS requirements now so you're prepared when applications open.

## Your Grade 10 Action Plan

**Timeline: 3 years to matric - Foundation building phase**

**Priority Actions:**
1. Confirm your subject choices align with career interests
2. Explore different career fields through online research
3. Build strong study habits and time management skills
4. Consider subject adjustments if needed (limited window available)

**Grade 10 Specific Guidance:**
- You have time to explore broadly - don't feel pressured to decide on a specific career yet
- Focus on building strong foundations in Mathematics and English

⚠️ **VERIFY THIS INFORMATION BEFORE DECIDING**
Always confirm program details, requirements, and deadlines with institutions directly.
    `,
    metadata: {
      grade: '10',
      mockTest: true
    }
  },

  grade11: {
    grade: '11',
    fullResponse: `
# Your Grade 11 Strategic Planning Results

## Academic Performance Overview
Based on your Grade 10 marks, your current APS is 38 with a projected range of 36-44 for matric. You're eligible for university admission and should focus on strategic improvement.

## Recommended University Programs

### 1. Computer Science
**University of Cape Town - Computer Science**
- APS Required: 40
- Admission chance: 78%
- Application deadline: July 2025
- Duration: 3 years
- Requirements: Mathematics 70%, English 65%

Strong match based on your Mathematics performance and technology interests.

### 2. Accounting
**University of the Witwatersrand - Accounting**
- APS Required: 42
- Admission chance: 65%
- Application deadline: July 2025
- Duration: 4 years
- Requirements: Mathematics 65%, English 70%, Accounting 75%

## Financial Aid Opportunities

### NSFAS Financial Aid
- Amount: Full tuition + allowances
- Eligibility match: 90%
- Deadline: August 2025
- Urgency: HIGH
- Qualifications: South African citizen, Family income qualification, Academic performance

Start preparing your application documents now - applications open next year.

## Your Grade 11 Strategic Plan

**Timeline: 2 years to matric - Strategic planning phase**

**Priority Actions:**
1. Research university programs thoroughly and visit campuses
2. Focus on improving Mathematics and English marks
3. Start preparing bursary application documents
4. Plan your Grade 12 strategy and subject focus

**Grade 11 Specific Guidance:**
- Use Grade 10 marks as baseline - focus on consistent improvement
- Research university requirements and align your efforts accordingly

⚠️ **VERIFY THIS INFORMATION BEFORE DECIDING**
Confirm all program details, requirements, and deadlines with institutions.
    `,
    metadata: {
      grade: '11',
      mockTest: true
    }
  },

  grade12: {
    grade: '12',
    fullResponse: `
# Your Grade 12 Final Year Results

## Critical Academic Status
Based on your Grade 11 marks, your current APS is 41. You're university eligible and must focus on final NSC preparation and immediate applications.

## University Applications - APPLY NOW

### 1. Business Science
**University of Cape Town - Commerce**
- APS Required: 40
- Admission chance: 82%
- Application deadline: July 2024
- Duration: 3 years
- Requirements: Mathematics 65%, English 70%

STRONG MATCH - Apply immediately. Deadline approaching.

### 2. Law
**University of the Witwatersrand - Law**
- APS Required: 43
- Admission chance: 68%
- Application deadline: July 2024
- Duration: 4 years
- Requirements: English 75%, any other subject 70%

## CRITICAL Financial Aid Deadlines

### NSFAS Financial Aid
- Amount: Full tuition + allowances
- Eligibility match: 95%
- Deadline: August 2024
- Urgency: CRITICAL
- Qualifications: South African citizen, Family income under R350,000

APPLY IMMEDIATELY - Deadline in 3 months!

### FirstRand Bursary
- Amount: R150,000 per year
- Eligibility match: 80%
- Deadline: June 2024
- Urgency: CRITICAL
- Qualifications: Commerce studies, Academic excellence, Leadership

## Your Grade 12 Critical Action Plan

**Timeline: 1 year to matric - Critical execution phase**

**IMMEDIATE ACTIONS (Next 30 days):**
1. Submit university applications before July deadline
2. Complete NSFAS application immediately
3. Focus intensively on NSC preparation
4. Finalize backup plans for different scenarios

**Grade 12 Specific Guidance:**
- Time is critical - every week matters for applications
- Focus on your strongest subjects for final push
- Have backup plans ready for different APS outcomes

⚠️ **VERIFY THIS INFORMATION BEFORE DECIDING**
This is your final year - confirm ALL deadlines and requirements immediately.
    `,
    metadata: {
      grade: '12',
      mockTest: true
    }
  }
};

console.log('🔧 Results Page Redesign - Test Data Setup');
console.log('=====================================\n');

console.log('This script helps you test the new card-based results page.');
console.log('Copy and paste the commands below into your browser console:\n');

Object.entries(testData).forEach(([grade, data]) => {
  console.log(`📋 Test ${grade.toUpperCase()}:`);
  console.log(`localStorage.setItem('thandi_results', '${JSON.stringify(data).replace(/'/g, "\\'")}');`);
  console.log(`window.location.href = '/results';`);
  console.log('');
});

console.log('🚀 Quick Test Instructions:');
console.log('1. Run: npm run dev');
console.log('2. Open: http://localhost:3000');
console.log('3. Open browser console (F12)');
console.log('4. Paste one of the commands above');
console.log('5. Press Enter to load test data and navigate to results');
console.log('6. Observe the new card-based layout!');

console.log('\n🧪 Alternative: Use Test Page');
console.log('Navigate to: http://localhost:3000/results/test');
console.log('This provides a UI to test different grade levels.');

console.log('\n✅ Expected Results:');
console.log('- Grade 10: Green theme, exploration focus, no current APS');
console.log('- Grade 11: Blue theme, strategic planning, Grade 10 marks context');
console.log('- Grade 12: Red theme, high urgency, application deadlines');

console.log('\n🔍 What to Check:');
console.log('- Card layout displays correctly');
console.log('- Grade-specific theming works');
console.log('- Progress bars and indicators show');
console.log('- Responsive design on mobile');
console.log('- Fallback works if parsing fails');
console.log('- PDF download still functions');