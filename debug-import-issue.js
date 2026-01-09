// Debug the import issue step by step

console.log('=== DEBUGGING IMPORT ISSUE ===');

// Test 1: Simple class definition
console.log('\n1. Testing simple class definition:');
class TestClass {
  static testMethod() {
    return 'works';
  }
}
console.log('Direct call:', TestClass.testMethod());

// Test 2: Export and import in same file
console.log('\n2. Testing export:');
export { TestClass };
export default TestClass;

console.log('TestClass type:', typeof TestClass);
console.log('TestClass.testMethod type:', typeof TestClass.testMethod);

// Test 3: Check what happens with import
console.log('\n3. Testing import behavior:');
import('./debug-import-issue.js').then(m => {
  console.log('Import result keys:', Object.keys(m));
  console.log('m.default type:', typeof m.default);
  console.log('m.TestClass type:', typeof m.TestClass);
  
  const TC = m.default || m.TestClass;
  console.log('TC type:', typeof TC);
  console.log('TC.testMethod type:', typeof TC?.testMethod);
  
  if (TC && TC.testMethod) {
    console.log('TC.testMethod() result:', TC.testMethod());
  } else {
    console.log('TC.testMethod is not available');
    console.log('TC properties:', Object.getOwnPropertyNames(TC));
    console.log('TC prototype:', Object.getOwnPropertyNames(TC.prototype || {}));
  }
}).catch(e => {
  console.error('Import error:', e.message);
});