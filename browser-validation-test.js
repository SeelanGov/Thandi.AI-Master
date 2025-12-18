// Browser console test script for validation UI
// Copy and paste this into browser console at http://localhost:3000/assessment

console.log('🧪 Starting Browser Validation Test');

// Clear any existing data
localStorage.removeItem('thandi_assessment_data');
localStorage.removeItem('thandi_results');

// Function to simulate clicking subjects
function selectSubject(subjectName) {
  const buttons = Array.from(document.querySelectorAll('.subject-card'));
  const button = buttons.find(btn => btn.textContent.includes(subjectName));
  if (button) {
    button.click();
    console.log(`✅ Selected: ${subjectName}`);
    return true;
  } else {
    console.log(`❌ Not found: ${subjectName}`);
    return false;
  }
}

// Function to click Next button
function clickNext() {
  const nextBtn = document.querySelector('.btn-primary');
  if (nextBtn) {
    nextBtn.click();
    console.log('🔄 Clicked Next button');
    return true;
  }
  return false;
}

// Function to check current warning message
function checkWarningMessage() {
  const warning = document.querySelector('.requirement-notice');
  if (warning) {
    const type = warning.classList.contains('critical') ? 'CRITICAL' : 
                 warning.classList.contains('warning') ? 'WARNING' : 
                 warning.classList.contains('success') ? 'SUCCESS' : 'UNKNOWN';
    const text = warning.querySelector('.requirement-text').textContent;
    console.log(`📋 Warning (${type}): ${text}`);
    return { type, text };
  }
  return null;
}

// Test sequence
async function runTest() {
  console.log('\n🎯 Test 1: No subjects selected');
  checkWarningMessage();
  
  console.log('\n🎯 Test 2: Select 3 subjects (too few)');
  selectSubject('Mathematics');
  selectSubject('English Home Language');
  selectSubject('Physical Sciences');
  setTimeout(() => {
    checkWarningMessage();
    
    console.log('\n🎯 Test 3: Try to proceed with 3 subjects');
    clickNext();
    
    setTimeout(() => {
      console.log('\n🎯 Test 4: Add more subjects for complete selection');
      selectSubject('Life Sciences');
      selectSubject('Geography');
      selectSubject('Accounting');
      selectSubject('Life Orientation');
      
      setTimeout(() => {
        checkWarningMessage();
        console.log('\n🎯 Test 5: Try to proceed with complete selection');
        clickNext();
        
        setTimeout(() => {
          console.log('\n✅ Test completed! Check if we reached Step 2');
          const stepIndicator = document.querySelector('.assessment-content h2');
          if (stepIndicator) {
            console.log(`Current step: ${stepIndicator.textContent}`);
          }
        }, 1000);
      }, 500);
    }, 1000);
  }, 500);
}

// Instructions
console.log(`
📋 Instructions:
1. Make sure you're on the assessment page (Step 1)
2. Select Grade 11 if not already selected
3. Run: runTest()
4. Watch the console for test results
`);

// Make function available globally
window.runTest = runTest;
window.selectSubject = selectSubject;
window.checkWarningMessage = checkWarningMessage;