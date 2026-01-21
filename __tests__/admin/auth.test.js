/**
 * Unit Tests: Authentication
 * Tests JWT and password utilities
 * Created: January 20, 2026
 */

import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
} from '@/lib/admin/auth';

describe('Admin Authentication', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('');

      expect(hash).toBeDefined();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('testpassword123!', hash);

      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('password');

      const isValid = await verifyPassword('', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const user = {
        id: 'user-123',
        email: 'admin@thandi.co.za',
        role: 'admin'
      };

      const token = generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in token', () => {
      const user = {
        id: 'user-123',
        email: 'admin@thandi.co.za',
        role: 'admin'
      };

      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });

    it('should set expiration time', () => {
      const user = {
        id: 'user-123',
        email: 'admin@thandi.co.za',
        role: 'admin'
      };

      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const user = {
        id: 'user-123',
        email: 'admin@thandi.co.za',
        role: 'admin'
      };

      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(user.id);
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';

      const decoded = verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('should reject expired token', () => {
      // Create token with very short expiry
      const jwt = require('jsonwebtoken');
      const user = {
        id: 'user-123',
        email: 'admin@thandi.co.za',
        role: 'admin'
      };

      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1ms' });

      // Wait for token to expire
      setTimeout(() => {
        const decoded = verifyToken(token);
        expect(decoded).toBeNull();
      }, 10);
    });

    it('should reject tampered token', () => {
      const user = {
        id: 'user-123',
        email: 'admin@thandi.co.za',
        role: 'admin'
      };

      const token = generateToken(user);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      const decoded = verifyToken(tamperedToken);

      expect(decoded).toBeNull();
    });
  });

  describe('Token Security', () => {
    it('should not include sensitive data in token', () => {
      const user = {
        id: 'user-123',
        email: 'admin@thandi.co.za',
        role: 'admin',
        password: 'should-not-be-included'
      };

      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(decoded.password).toBeUndefined();
    });

    it('should use secure JWT secret', () => {
      const secret = process.env.JWT_SECRET;

      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThan(32);
    });
  });

  describe('Password Strength', () => {
    it('should handle various password lengths', async () => {
      const passwords = [
        'short',
        'medium-length-password',
        'very-long-password-with-many-characters-1234567890'
      ];

      for (const password of passwords) {
        const hash = await hashPassword(password);
        const isValid = await verifyPassword(password, hash);
        expect(isValid).toBe(true);
      }
    });

    it('should handle special characters', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should handle unicode characters', async () => {
      const password = 'パスワード123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });
});
