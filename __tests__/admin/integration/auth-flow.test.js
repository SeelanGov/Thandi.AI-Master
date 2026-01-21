/**
 * Integration Tests: Authentication Flow
 * 
 * Tests the complete authentication workflow:
 * 1. Login with credentials
 * 2. Access protected routes
 * 3. Token verification
 * 4. Logout
 * 5. Session management
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@thandi.co.za';
const ADMIN_PASSWORD = 'Admin@Thandi2026';

describe('Authentication Integration Flow', () => {
  let authCookie = null;

  describe('Complete Authentication Flow', () => {
    test('should login with valid credentials', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(ADMIN_EMAIL);
      expect(data.user.role).toBe('admin');

      // Extract cookie from response
      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain('admin_token');
      
      // Store cookie for subsequent requests
      authCookie = setCookie.split(';')[0];
    });

    test('should reject login with invalid credentials', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: 'WrongPassword123!'
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    test('should reject login with non-existent user', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!'
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    test('should verify valid token', async () => {
      expect(authCookie).toBeDefined();

      const response = await fetch(`${BASE_URL}/api/admin/auth/verify`, {
        headers: {
          'Cookie': authCookie
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(ADMIN_EMAIL);
      expect(data.user.role).toBe('admin');
    });

    test('should reject verification without token', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/verify`);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    test('should access protected endpoint with valid token', async () => {
      expect(authCookie).toBeDefined();

      const response = await fetch(`${BASE_URL}/api/admin/dashboard/overview`, {
        headers: {
          'Cookie': authCookie
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.overview).toBeDefined();
    });

    test('should reject protected endpoint without token', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/dashboard/overview`);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    test('should logout successfully', async () => {
      expect(authCookie).toBeDefined();

      const response = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      // Cookie should be cleared
      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain('admin_token=;');
      expect(setCookie).toContain('Max-Age=0');
    });

    test('should reject access after logout', async () => {
      // Try to access protected endpoint with old cookie
      const response = await fetch(`${BASE_URL}/api/admin/dashboard/overview`, {
        headers: {
          'Cookie': authCookie
        }
      });

      // Should be rejected (token is invalidated)
      expect(response.status).toBe(401);
    });
  });

  describe('Session Management', () => {
    let sessionCookie = null;

    beforeAll(async () => {
      // Login to get a fresh session
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        })
      });

      const setCookie = response.headers.get('set-cookie');
      sessionCookie = setCookie.split(';')[0];
    });

    test('should maintain session across multiple requests', async () => {
      expect(sessionCookie).toBeDefined();

      // Make multiple requests with same cookie
      for (let i = 0; i < 3; i++) {
        const response = await fetch(`${BASE_URL}/api/admin/auth/verify`, {
          headers: {
            'Cookie': sessionCookie
          }
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.user.email).toBe(ADMIN_EMAIL);
      }
    });

    test('should access different protected endpoints with same session', async () => {
      expect(sessionCookie).toBeDefined();

      const endpoints = [
        '/api/admin/dashboard/overview',
        '/api/admin/errors',
        '/api/admin/performance',
        '/api/admin/activity'
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          headers: {
            'Cookie': sessionCookie
          }
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    });

    afterAll(async () => {
      // Cleanup: logout
      if (sessionCookie) {
        await fetch(`${BASE_URL}/api/admin/auth/logout`, {
          method: 'POST',
          headers: {
            'Cookie': sessionCookie
          }
        });
      }
    });
  });

  describe('Security Features', () => {
    test('should use httpOnly cookies', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        })
      });

      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toContain('HttpOnly');
    });

    test('should use secure flag in production', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        })
      });

      const setCookie = response.headers.get('set-cookie');
      
      // In production, should have Secure flag
      if (process.env.NODE_ENV === 'production') {
        expect(setCookie).toContain('Secure');
      }
    });

    test('should use sameSite protection', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        })
      });

      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toContain('SameSite');
    });

    test('should not expose sensitive data in token', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        })
      });

      const data = await response.json();
      
      // User object should not contain password or sensitive data
      expect(data.user.password).toBeUndefined();
      expect(data.user.passwordHash).toBeUndefined();
      expect(data.user.apiKey).toBeUndefined();
    });

    test('should reject SQL injection attempts', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: "admin@thandi.co.za' OR '1'='1",
          password: "anything"
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe('Input Validation', () => {
    test('should reject login without email', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: ADMIN_PASSWORD
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    test('should reject login without password', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    test('should reject login with invalid email format', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'not-an-email',
          password: ADMIN_PASSWORD
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    test('should reject login with empty credentials', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: '',
          password: ''
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('Token Expiration', () => {
    test('should include expiration time in token', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        })
      });

      const setCookie = response.headers.get('set-cookie');
      
      // Cookie should have Max-Age or Expires
      expect(setCookie).toMatch(/Max-Age=\d+|Expires=/);
    });

    // Note: Testing actual token expiration would require waiting 24 hours
    // or manipulating system time, which is not practical for integration tests
  });
});
