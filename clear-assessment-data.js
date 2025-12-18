// Clear localStorage assessment data for fresh testing
console.log('Clearing assessment data...');

// This would run in browser console
const script = `
localStorage.removeItem('thandi_assessment_data');
localStorage.removeItem('thandi_results');
console.log('✅ Assessment data cleared');
location.reload();
`;

console.log('Run this in browser console:');
console.log(script);