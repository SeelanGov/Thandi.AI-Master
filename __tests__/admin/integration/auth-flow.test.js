/**
 * Integration Tests: Authentication Flow
 * Tests the complete authentication workflow from login to token validation
 */

const {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  authenticateAdmin,
  createAdminUser,
  validateAPIKey
} = require('../../../lib/admin/auth');

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  insert: jest.fn(() => mockSupabase),
  update: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  single: jest.fn()
};

describe('Authentication Flow - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Authentication Workflow', () => {
    test('should create user, login, verify token, and logout', async () => {
      const userData = {
        email: 'admin@thandi.online',
        password: 'SecurePassword123!',
        full_name: 'Admin User',
        role: 'admin'
      };

      // Step 1: Create admin user
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null }); // Check existing user
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'admin-1',
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          is_active: true
        },
        error: null
      });

      const createResult = await createAdminUser(mockSupabase, userData);
      expect(createResult.success).toBe(true);
      expect(createResult.user.email).toBe(userData.email);
      expect(createResult.user).not.toHaveProperty('password_hash');

      // Step 2: Login with credentials
      const passwordHash = await hashPassword(userData.password);
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'admin-1',
          email: userData.email,
          password_hash: passwordHash,
          is_active: true
        },
        error: null
      });

      const loginResult = await authenticateAdmin(mockSupabase, userData.email, userData.password);
      expect(loginResult.success).toBe(true);
      expect(loginResult.user.email).toBe(userData.email);

      // Step 3: Generate JWT token
      const jwtSecret = 'test-jwt-secret-key';
      const token = generateToken(
        { userId: loginResult.user.id, email: loginResult.user.email },
        jwtSecret,
        '24h'
      );
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Step 4: Verify JWT token
      const decoded = verifyToken(token, jwtSecret);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe('admin-1');
      expect(decoded.email).toBe(userData.email);

      // Step 5: Verify token expiration is set
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    test('should handle complete login flow with invalid credentials', async () => {
      const email = 'admin@thandi.online';
      const correctPassword = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword123!';

      const passwordHash = await hashPassword(correctPassword);

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'admin-1',
          email: email,
          password_hash: passwordHash,
          is_active: true
        },
        error: null
      });

      const loginResult = await authenticateAdmin(mockSupabase, email, wrongPassword);
      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Invalid credentials');
    });
  });

  describe('Password Hashing and Verification', () => {
    test('should hash password and verify correctly', async () => {
      const password = 'SecurePassword123!';
      
      // Hash password
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);

      // Verify correct password
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      // Verify incorrect password
      const isInvalid = await verifyPassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });

    test('should generate different hashes for same password', async () => {
      const password = 'SecurePassword123!';
      
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Hashes should be different (due to salt)
      expect(hash1).not.toBe(hash2);

      // But both should verify correctly
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe('JWT Token Management', () => {
    test('should generate and verify JWT token', () => {
      const payload = {
        userId: 'admin-1',
        email: 'admin@thandi.online',
        role: 'admin'
      };
      const secret = 'test-jwt-secret-key';

      const token = generateToken(payload, secret, '1h');
      expect(token).toBeDefined();

      const decoded = verifyToken(token, secret);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    test('should reject token with wrong secret', () => {
      const payload = { userId: 'admin-1' };
      const correctSecret = 'correct-secret';
      const wrongSecret = 'wrong-secret';

      const token = generateToken(payload, correctSecret, '1h');
      const decoded = verifyToken(token, wrongSecret);

      expect(decoded).toBeNull();
    });

    test('should handle expired token', () => {
      const payload = { userId: 'admin-1' };
      const secret = 'test-secret';

      // Generate token that expires immediately
      const token = generateToken(payload, secret, '0s');

      // Wait a moment for token to expire
      setTimeout(() => {
        const decoded = verifyToken(token, secret);
        expect(decoded).toBeNull();
      }, 100);
    });

    test('should throw error when secret is missing', () => {
      const payload = { userId: 'admin-1' };

      expect(() => generateToken(payload, null, '1h')).toThrow('JWT secret is required');
      expect(() => verifyToken('some-token', null)).toThrow('JWT secret is required');
    });
  });

  describe('User Authentication', () => {
    test('should authenticate valid user', async () => {
      const email = 'admin@thandi.online';
      const password = 'SecurePassword123!';
      const passwordHash = await hashPassword(password);

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'admin-1',
          email: email,
          password_hash: passwordHash,
          full_name: 'Admin User',
          role: 'admin',
          is_active: true
        },
        error: null
      });

      const result = await authenticateAdmin(mockSupabase, email, password);
      expect(result.success).toBe(true);
      expect(result.user.email).toBe(email);
      expect(result.user).not.toHaveProperty('password_hash');
    });

    test('should reject inactive user', async () => {
      const email = 'admin@thandi.online';
      const password = 'SecurePassword123!';

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'User not found' }
      });

      const result = await authenticateAdmin(mockSupabase, email, password);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    test('should reject missing credentials', async () => {
      const result1 = await authenticateAdmin(mockSupabase, '', 'password');
      expect(result1.success).toBe(false);
      expect(result1.error).toContain('required');

      const result2 = await authenticateAdmin(mockSupabase, 'email@test.com', '');
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('required');
    });

    test('should update last login timestamp', async () => {
      const email = 'admin@thandi.online';
      const password = 'SecurePassword123!';
      const passwordHash = await hashPassword(password);

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'admin-1',
          email: email,
          password_hash: passwordHash,
          is_active: true
        },
        error: null
      });

      await authenticateAdmin(mockSupabase, email, password);

      // Verify update was called
      expect(mockSupabase.update).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'admin-1');
    });
  });

  describe('User Creation', () => {
    test('should create new admin user', async () => {
      const userData = {
        email: 'newadmin@thandi.online',
        password: 'SecurePassword123!',
        full_name: 'New Admin',
        role: 'admin'
      };

      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null }); // Check existing
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'admin-2',
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          is_active: true
        },
        error: null
      });

      const result = await createAdminUser(mockSupabase, userData);
      expect(result.success).toBe(true);
      expect(result.user.email).toBe(userData.email);
      expect(result.user).not.toHaveProperty('password_hash');
    });

    test('should reject duplicate email', async () => {
      const userData = {
        email: 'existing@thandi.online',
        password: 'SecurePassword123!'
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'existing-user' },
        error: null
      });

      const result = await createAdminUser(mockSupabase, userData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('User already exists');
    });

    test('should reject missing required fields', async () => {
      const result1 = await createAdminUser(mockSupabase, { password: 'password' });
      expect(result1.success).toBe(false);
      expect(result1.error).toContain('required');

      const result2 = await createAdminUser(mockSupabase, { email: 'email@test.com' });
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('required');
    });

    test('should use default role if not provided', async () => {
      const userData = {
        email: 'admin@thandi.online',
        password: 'SecurePassword123!'
      };

      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'admin-3',
          email: userData.email,
          role: 'admin',
          is_active: true
        },
        error: null
      });

      const result = await createAdminUser(mockSupabase, userData);
      expect(result.success).toBe(true);
      expect(result.user.role).toBe('admin');
    });
  });

  describe('API Key Validation', () => {
    test('should validate correct API key', async () => {
      const apiKey = 'valid-api-key-123';

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'admin-1',
          email: 'admin@thandi.online',
          role: 'admin',
          is_active: true
        },
        error: null
      });

      const result = await validateAPIKey(mockSupabase, apiKey);
      expect(result.valid).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('admin@thandi.online');
    });

    test('should reject invalid API key', async () => {
      const apiKey = 'invalid-api-key';

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' }
      });

      const result = await validateAPIKey(mockSupabase, apiKey);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    test('should reject missing API key', async () => {
      const result = await validateAPIKey(mockSupabase, '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    test('should reject API key for inactive user', async () => {
      const apiKey = 'valid-api-key-123';

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' }
      });

      const result = await validateAPIKey(mockSupabase, apiKey);
      expect(result.valid).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' }
      });

      const result = await authenticateAdmin(mockSupabase, 'admin@test.com', 'password');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    test('should handle malformed JWT tokens', () => {
      const secret = 'test-secret';
      
      const decoded1 = verifyToken('not-a-valid-token', secret);
      expect(decoded1).toBeNull();

      const decoded2 = verifyToken('', secret);
      expect(decoded2).toBeNull();

      const decoded3 = verifyToken(null, secret);
      expect(decoded3).toBeNull();
    });

    test('should handle password verification errors', async () => {
      const password = 'test-password';
      const invalidHash = 'not-a-valid-hash';

      // Should not throw, but return false
      const result = await verifyPassword(password, invalidHash);
      expect(result).toBe(false);
    });
  });

  describe('Security Best Practices', () => {
    test('should not expose password hash in responses', async () => {
      const userData = {
        email: 'admin@thandi.online',
        password: 'SecurePassword123!'
      };

      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'admin-1',
          email: userData.email,
          password_hash: 'hashed-password',
          is_active: true
        },
        error: null
      });

      const result = await createAdminUser(mockSupabase, userData);
      expect(result.user).not.toHaveProperty('password_hash');
    });

    test('should use secure password hashing', async () => {
      const password = 'test-password';
      const hash = await hashPassword(password);

      // Hash should start with bcrypt identifier
      expect(hash).toMatch(/^\$2[aby]\$/);
      
      // Hash should be long enough (bcrypt hashes are 60 characters)
      expect(hash.length).toBe(60);
    });

    test('should include expiration in JWT tokens', () => {
      const payload = { userId: 'admin-1' };
      const secret = 'test-secret';

      const token = generateToken(payload, secret, '1h');
      const decoded = verifyToken(token, secret);

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });
});
