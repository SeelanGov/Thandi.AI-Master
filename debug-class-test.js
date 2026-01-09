// Debug class import issue

class TestClass {
  static testMethod() {
    return 'test works';
  }
}

console.log('Direct test:', TestClass.testMethod());

export { TestClass };
export default TestClass;