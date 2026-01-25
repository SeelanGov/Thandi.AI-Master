/**
 * Jest Setup File
 * Runs before all tests
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key';
process.env.ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'test-api-key';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Global test timeout
jest.setTimeout(30000);
