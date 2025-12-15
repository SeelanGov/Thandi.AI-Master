// Jest setup file for global test configuration

// Increase timeout for property-based tests
jest.setTimeout(30000);

// Mock console.error to reduce noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('[StudentProfileBuilder]') ||
       args[0].includes('[QueryContextStructurer]'))
    ) {
      // Suppress expected error logs from our classes
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});