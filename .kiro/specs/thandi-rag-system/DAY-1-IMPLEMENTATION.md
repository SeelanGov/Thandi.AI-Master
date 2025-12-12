# Day 1: Component Architecture
**Date:** Tomorrow (Start of Week 1)  
**Goal:** Working 4-screen assessment form UI (no backend yet)

---

## DELIVERABLE

Working form UI with:
- 4 screens (Academic, Interests, Constraints, Goals)
- Progress bar
- Navigation (Next/Back buttons)
- localStorage save/resume
- Mobile-first design

---

## FILES TO CREATE

### 1. `/components/AssessmentForm.js`
Main form component with screen navigation

### 2. `/components/assessment/Screen1Academic.js`
Academic profile questions (5 questions)

### 3. `/components/assessment/Screen2Interests.js`
Interests and activities (4 questions)

### 4. `/components/assessment/Screen3Constraints.js`
Financial and location constraints (3 questions)

### 5. `/components/assessment/Screen4Goals.js`
Career goals and preferences (3 questions)

### 6. `/components/assessment/ProgressBar.js`
Visual progress indicator

---

## SCREEN 1: ACADEMIC PROFILE (5 Questions)

```javascript
// Screen1Academic.js

1. What grade are you in?
   - Grade 11
   - Grade 12

2. What subjects are you taking? (Select all that apply)
   - Mathematics
   - Mathematical Literacy
   - Physical Sciences
   - Life Sciences
   - Accounting
   - Business Studies
   - Economics
   - English
   - Other languages
   - History
   - Geography
   - IT/CAT
   - Visual Arts
   - Music
   - Drama

3. Which subjects are you strongest in? (Select up to 3)
   - [Same list as above]

4. Which subjects do you struggle with? (Select up to 3)
   - [Same list as above]

5. What are your current marks? (Percentage)
   - Mathematics: [0-100]
   - Physical Sciences: [0-100]
   - Life Sciences: [0-100]
   - English: [0-100]
   - [Show only subjects selected in Q2]
```

---

## SCREEN 2: INTERESTS (4 Questions)

```javascript
// Screen2Interests.js

6. What activities do you enjoy? (Select all that apply)
   - Sports (soccer, rugby, athletics)
   - Arts (drawing, painting, music)
   - Technology (coding, gaming, robotics)
   - Reading and writing
   - Helping others (volunteering, tutoring)
   - Building/fixing things
   - Science experiments
   - Business/entrepreneurship
   - Other: [text input]

7. What type of work do you prefer?
   - Working with people (teaching, healthcare, sales)
   - Working with data (analysis, research, finance)
   - Working with things (building, fixing, creating)
   - Working with ideas (design, writing, strategy)

8. What work environment appeals to you?
   - Office (desk job, computer work)
   - Outdoors (fieldwork, construction, nature)
   - Laboratory (research, experiments)
   - Hospital/clinic (healthcare)
   - Remote (work from anywhere)
   - Mixed (variety of settings)

9. How important is salary vs. passion? (Slider 1-10)
   - 1 = "I'll do what I love, even if it pays less"
   - 10 = "I need high income, passion is secondary"
```

---

## SCREEN 3: CONSTRAINTS (3 Questions)

```javascript
// Screen3Constraints.js

10. What is your household income? (Approximate)
    - Less than R100,000/year (qualify for NSFAS)
    - R100,000 - R350,000/year (may qualify for NSFAS)
    - R350,000 - R600,000/year (partial funding needed)
    - More than R600,000/year (can afford university)
    - Prefer not to say

11. How far are you willing to travel for university?
    - Stay in my city/town
    - Anywhere in my province
    - Anywhere in South Africa
    - Open to studying abroad

12. Are you willing to relocate for work after graduation?
    - Yes, anywhere in SA
    - Yes, but only to major cities (JHB, CPT, DBN)
    - Prefer to stay in my province
    - Must stay in my hometown
```

---

## SCREEN 4: GOALS (3 Questions)

```javascript
// Screen4Goals.js

13. What careers interest you? (Free text)
    - [Text area: "E.g., doctor, software developer, teacher..."]
    - [Placeholder: "List any careers you're considering, or leave blank if unsure"]

14. What university would you like to attend? (Optional)
    - UCT (University of Cape Town)
    - Wits (University of the Witwatersrand)
    - Stellenbosch University
    - University of Pretoria
    - Rhodes University
    - UKZN (University of KwaZulu-Natal)
    - UJ (University of Johannesburg)
    - Other: [text input]
    - Not sure yet

15. What's your biggest worry about choosing a career?
    - Choosing the wrong path
    - Not getting into university
    - Can't afford to study
    - Don't know what careers exist
    - Family pressure to choose specific career
    - Job market uncertainty
    - Other: [text input]
```

---

## COMPONENT STRUCTURE

```javascript
// AssessmentForm.js

import { useState } from 'react';
import Screen1Academic from './assessment/Screen1Academic';
import Screen2Interests from './assessment/Screen2Interests';
import Screen3Constraints from './assessment/Screen3Constraints';
import Screen4Goals from './assessment/Screen4Goals';
import ProgressBar from './assessment/ProgressBar';

export default function AssessmentForm() {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [formData, setFormData] = useState({
    // Screen 1
    grade: '',
    subjects: [],
    subjectStrengths: [],
    subjectWeaknesses: [],
    marks: {},
    
    // Screen 2
    activities: [],
    workPreference: '',
    workEnvironment: '',
    salaryVsPassion: 5,
    
    // Screen 3
    householdIncome: '',
    travelDistance: '',
    willingToRelocate: '',
    
    // Screen 4
    careerInterests: '',
    targetUniversity: '',
    biggestWorry: ''
  });

  const handleNext = () => {
    // Save to localStorage
    localStorage.setItem('thandiAssessment', JSON.stringify(formData));
    
    // Validate current screen
    if (validateScreen(currentScreen)) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const handleBack = () => {
    setCurrentScreen(currentScreen - 1);
  };

  const validateScreen = (screen) => {
    // Validation logic per screen
    switch(screen) {
      case 1:
        return formData.grade && formData.subjects.length > 0;
      case 2:
        return formData.activities.length > 0 && formData.workPreference;
      case 3:
        return formData.householdIncome && formData.travelDistance;
      case 4:
        return formData.biggestWorry;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <ProgressBar current={currentScreen} total={4} />
      
      {currentScreen === 1 && (
        <Screen1Academic 
          data={formData} 
          onChange={setFormData} 
        />
      )}
      
      {currentScreen === 2 && (
        <Screen2Interests 
          data={formData} 
          onChange={setFormData} 
        />
      )}
      
      {currentScreen === 3 && (
        <Screen3Constraints 
          data={formData} 
          onChange={setFormData} 
        />
      )}
      
      {currentScreen === 4 && (
        <Screen4Goals 
          data={formData} 
          onChange={setFormData} 
        />
      )}
      
      <div className="flex justify-between mt-6">
        {currentScreen > 1 && (
          <button 
            onClick={handleBack}
            className="px-6 py-3 bg-gray-200 rounded-lg"
          >
            Back
          </button>
        )}
        
        {currentScreen < 4 ? (
          <button 
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg ml-auto"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg ml-auto"
          >
            Get My Recommendations
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## STYLING REQUIREMENTS

### Mobile-First (Tailwind CSS)

```css
/* Key classes to use */

.container {
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
}

.button {
  min-height: 44px; /* Touch-friendly */
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.input {
  min-height: 44px;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.checkbox {
  min-width: 24px;
  min-height: 24px;
}

.label {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  display: block;
}
```

---

## PROGRESS BAR COMPONENT

```javascript
// ProgressBar.js

export default function ProgressBar({ current, total }) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Step {current} of {total}</span>
        <span>{Math.round(percentage)}% complete</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

---

## LOCALSTORAGE IMPLEMENTATION

```javascript
// Save on every screen change
const saveProgress = (data) => {
  localStorage.setItem('thandiAssessment', JSON.stringify(data));
  localStorage.setItem('thandiAssessmentTimestamp', Date.now());
};

// Load on component mount
const loadProgress = () => {
  const saved = localStorage.getItem('thandiAssessment');
  if (saved) {
    return JSON.parse(saved);
  }
  return null;
};

// Clear on successful submission
const clearProgress = () => {
  localStorage.removeItem('thandiAssessment');
  localStorage.removeItem('thandiAssessmentTimestamp');
};
```

---

## TESTING CHECKLIST

### Functionality:
- [ ] Can navigate to Screen 2
- [ ] Can navigate back to Screen 1
- [ ] Progress bar updates correctly
- [ ] Form data persists on refresh
- [ ] Validation prevents advancing with empty fields

### Mobile:
- [ ] Works on 4-inch screen (iPhone SE)
- [ ] Buttons are tappable (44px min)
- [ ] Text is readable (16px min)
- [ ] No horizontal scrolling
- [ ] Keyboard doesn't cover inputs

### Performance:
- [ ] Each screen loads in <1 second
- [ ] Smooth transitions between screens
- [ ] No janky animations

---

## END OF DAY 1 DELIVERABLE

**What should work:**
- ✅ 4-screen form with navigation
- ✅ Progress bar showing 1/4, 2/4, 3/4, 4/4
- ✅ localStorage saves form data
- ✅ Form data persists on page refresh
- ✅ Mobile-responsive design
- ✅ Touch-friendly buttons

**What doesn't need to work yet:**
- ❌ Submit button (no backend connection)
- ❌ Validation error messages (basic validation only)
- ❌ Results page (not built yet)

---

## COMMIT MESSAGE

```
feat: Day 1 - Assessment form component architecture

- Add 4-screen assessment form (Academic, Interests, Constraints, Goals)
- Add progress bar component
- Implement localStorage save/resume
- Mobile-first responsive design
- Touch-friendly UI (44px buttons)

Deliverable: Working form UI, no backend connection yet
Next: Day 2 - Form state & validation
```

---

**Ready to start building tomorrow.**

**End of day review:** Test on mobile device, verify all 4 screens work.
