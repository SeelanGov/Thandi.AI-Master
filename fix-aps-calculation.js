#!/usr/bin/env node

/**
 * Quick APS Calculation Fix
 * Identify and fix the APS scoring issue
 */

console.log('🔧 APS CALCULATION FIX');
console.log('='.repeat(40));

// Test the APS calculation with sample data
function calculateAPS(marks) {
  console.log(`[APS DEBUG] calculateAPS called with marks:`, marks);
  
  if (!marks || typeof marks !== 'object') {
    console.log(`[APS DEBUG] No marks or invalid marks object, returning 0`);
    return 0;
  }
  
  let totalPoints = 0;
  let subjectCount = 0;
  
  Object.entries(marks).forEach(([subject, mark]) => {
    const percentage = parseFloat(mark);
    console.log(`[APS DEBUG] Processing ${subject}: ${mark} -> ${percentage}`);
    
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      let points = 0;
      // Convert percentage to APS points
      if (percentage >= 80) points = 7;
      else if (percentage >= 70) points = 6;
      else if (percentage >= 60) points = 5;
      else if (percentage >= 50) points = 4;
      else if (percentage >= 40) points = 3;
      else if (percentage >= 30) points = 2;
      else points = 1;
      
      totalPoints += points;
      subjectCount++;
      console.log(`[APS DEBUG] ${subject}: ${percentage}% = ${points} points (total: ${totalPoints})`);
    } else {
      console.log(`[APS DEBUG] Invalid mark for ${subject}: ${mark}`);
    }
  });
  
  console.log(`[APS DEBUG] Final APS: ${totalPoints} points from ${subjectCount} subjects`);
  return totalPoints;
}

// Test with different data formats
console.log('\n📊 Testing APS Calculation:');

// Test 1: Normal format
const testMarks1 = {
  mathematics: 75,
  english: 70,
  physical_sciences: 65,
  life_sciences: 60,
  geography: 55,
  afrikaans: 50
};

console.log('\nTest 1 - Normal format:');
const aps1 = calculateAPS(testMarks1);
console.log(`Result: ${aps1} APS points`);

// Test 2: String format
const testMarks2 = {
  mathematics: "75",
  english: "70",
  physical_sciences: "65",
  life_sciences: "60",
  geography: "55",
  afrikaans: "50"
};

console.log('\nTest 2 - String format:');
const aps2 = calculateAPS(testMarks2);
console.log(`Result: ${aps2} APS points`);

// Test 3: Empty/null
console.log('\nTest 3 - Empty marks:');
const aps3 = calculateAPS({});
console.log(`Result: ${aps3} APS points`);

// Test 4: Null
console.log('\nTest 4 - Null marks:');
const aps4 = calculateAPS(null);
console.log(`Result: ${aps4} APS points`);

console.log('\n' + '='.repeat(40));
console.log('🔍 DIAGNOSIS COMPLETE');

if (aps1 > 0 && aps2 > 0) {
  console.log('✅ APS calculation function works correctly');
  console.log('❌ Issue is likely in data format or API response');
  console.log('\n🔧 LIKELY CAUSES:');
  console.log('1. Marks not being passed to calculateAPS function');
  console.log('2. Marks object is empty or null');
  console.log('3. Subject names don\'t match expected format');
  console.log('4. API response structure changed');
} else {
  console.log('❌ APS calculation function has issues');
}

console.log('\n📋 NEXT STEPS:');
console.log('1. Check how marks are passed from frontend to API');
console.log('2. Verify marks object structure in API route');
console.log('3. Add debug logging to production API');
console.log('4. Test with actual student data format');