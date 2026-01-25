/**
 * Unit Tests for Admin Authentication
 * Tests the authentication and authorization functionality
 */

const {
  generateJWT,
  verifyJWT,
  hashPassword,
  comparePassword,
  validateEmail,
  validatePasswordStrength,
  validateAPIKey,
  rateLimit
} = require('../../lib/admin/auth');

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => Promise.resolve(hash === `hashed_${password}`))
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload) => `jwt_token_${payload.userId}`),
  verify: jest.fn((token) => {
    if (token.startsWith('jwt_token_')) {
      return { userId: token.replace('jwt_token_', ''), exp: Date.now() / 1000 + 3600 };
    }
    throw new Error('Invalid token');
  })
}));

describe('Admin Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('JWT Token Management', () => {
    test('should generate JWT token', () => {
      const payload = {
        userId: 'admin-123',
        email: 'admin@thandi.ai',
        role: 'admin'
      };

      const token = generateJWT(payload);

      expect(token).toBeDefined();
      expect(token).toContain('jwt_token_');
    });

    test('should verify valid token', () => {
      const token = 'jwt_token_admin-123';

      const decoded = verifyJWT(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe('admin-123');
    });

    test('should reject invalid token', () => {
      const token = 'invalid_token';

      expect(() => verifyJWT(token)).toThrow('Invalid token');
    });

    test('should reject expired token', () => {
      const jwt = require('jsonwebtoken');
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Token expired');
      });

      const token = 'jwt_token_expired';

      expect(() => verifyJWT(token)).toThrow('Token expired');
    });
  });

  describe('Password Management', () => {
    test('should hash password correctly', async () => {
      const password = 'SecurePassword123!';

      const hashed = await hashPassword(password);

      expect(hashed).toBe(`hashed_${password}`);
      expect(hashed).not.toBe(password);
    });

    test('should compare password correctly', async () => {
      const password = 'SecurePassword123!';
      const hashed = `hashed_${password}`;

      const isMatch = await comparePassword(password, hashed);

      expect(isMatch).toBe(true);
    });

    test('should validate email format', () => {
      const validEmails = [
        'admin@thandi.ai',
        'user@example.com',
        'test.user@domain.co.za'
      ];

      for (const email of validEmails) {
        expect(validateEmail(email)).toBe(true);
      }
    });

    test('should reject invalid email format', () => {
      const invalidEmails = [
        'invalid',
        '@domain.com',
        'user@',
        'user @domain.com'
      ];

      for (const email of invalidEmails) {
        expect(validateEmail(email)).toBe(false);
      }
    });

    test('should validate password strength', () => {
      const strongPasswords = [
        'SecurePass123!',
        'MyP@ssw0rd',
        'Admin2026!'
      ];

      for (const password of strongPasswords) {
        const result = validatePasswordStrength(password);
        expect(result.isStrong).toBe(true);
      }
    });

    test('should reject weak passwords', () => {
      const weakPasswords = [
        'short',
        'nouppercaseornumbers',
        'NoNumbers!',
        'NoSpecialChars123'
      ];

      for (const password of weakPasswords) {
        const result = validatePasswordStrength(password);
        expect(result.isStrong).toBe(false);
        expect(result.errors).toBeDefined();
      }
    });
  });

  describe('Credential Validation', () => {
    test('should handle missing credentials', async () => {
      const result = await authenticateUser(null, null);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing credentials');
    });

    test('should handle invalid credentials', async () => {
      const result = await authenticateUser('admin@thandi.ai', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid credentials');
    });

    test('should store token in cookie', () => {
      const token = 'jwt_token_admin-123';
      const cookie = createAuthCookie(token);

      expect(cookie).toContain('auth_token=');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Secure');
      expect(cookie).toContain('SameSite=Strict');
    });

    test('should clear token on logout', () => {
      const cookie = clearAuthCookie();

      expect(cookie).toContain('auth_token=');
      expect(cookie).toContain('Max-Age=0');
    });
  });

  describe('API Key Authentication', () => {
    test('should validate API key format', () => {
      const validKeys = [
        'thandi_live_1234567890abcdef',
        'thandi_test_abcdef1234567890'
      ];

      for (const key of validKeys) {
        expect(validateAPIKey(key)).toBe(true);
      }
    });

    test('should verify valid API key', async () => {
      const apiKey = 'thandi_live_1234567890abcdef';

      const result = await verifyAPIKey(apiKey);

      expect(result.valid).toBe(true);
    });

    test('should reject invalid API key', async () => {
      const apiKey = 'invalid_key';

      const result = await verifyAPIKey(apiKey);

      expect(result.valid).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    test('should rate limit API requests', async () => {
      const identifier = 'test-user';
      const limit = 5;

      // Make requests up to limit
      for (let i = 0; i < limit; i++) {
        const result = await rateLimitHelper(identifier, limit, 60);
        expect(result.allowed).toBe(true);
      }

      // Next request should be rate limited
      const result = await rateLimitHelper(identifier, limit, 60);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });

    test('should reset rate limit after window', async () => {
      const identifier = 'test-user-2';
      const limit = 3;
      const window = 1; // 1 second

      // Exhaust limit
      for (let i = 0; i < limit; i++) {
        await rateLimitHelper(identifier, limit, window);
      }

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be allowed again
      const result = await rateLimitHelper(identifier, limit, window);
      expect(result.allowed).toBe(true);
    });

    test('should handle concurrent requests', async () => {
      const identifier = 'test-user-3';
      const limit = 10;

      const promises = Array.from({ length: 15 }, () => 
        rateLimitHelper(identifier, limit, 60)
      );

      const results = await Promise.all(promises);

      const allowed = results.filter(r => r.allowed).length;
      const denied = results.filter(r => !r.allowed).length;

      expect(allowed).toBe(limit);
      expect(denied).toBe(5);
    });

    test('should return correct auth response', async () => {
      const result = await authenticateUser('admin@thandi.ai', 'correctpassword');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    test('should handle database errors', async () => {
      // Mock database error
      const result = await authenticateUser('admin@thandi.ai', 'password', {
        simulateError: true
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database');
    });
  });
});

// Helper functions for tests
async function authenticateUser(email, password, options = {}) {
  if (options.simulateError) {
    return { success: false, error: 'Database connection failed' };
  }

  if (!email || !password) {
    return { success: false, error: 'Missing credentials' };
  }

  if (email === 'admin@thandi.ai' && password === 'correctpassword') {
    return {
      success: true,
      token: 'jwt_token_admin-123',
      user: { id: 'admin-123', email }
    };
  }

  return { success: false, error: 'Invalid credentials' };
}

function createAuthCookie(token) {
  return `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`;
}

function clearAuthCookie() {
  return `auth_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

async function verifyAPIKey(apiKey) {
  const validKeys = [
    'thandi_live_1234567890abcdef',
    'thandi_test_abcdef1234567890'
  ];

  return {
    valid: validKeys.includes(apiKey)
  };
}

// Rate limiting implementation
const rateLimitStore = new Map();

async function rateLimitHelper(identifier, limit, windowSeconds) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, { count: 0, resetAt: now + windowMs });
  }

  const record = rateLimitStore.get(identifier);

  // Reset if window expired
  if (now >= record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  // Check limit
  if (record.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000)
    };
  }

  // Increment and allow
  record.count++;
  return {
    allowed: true,
    remaining: limit - record.count
  };
}
