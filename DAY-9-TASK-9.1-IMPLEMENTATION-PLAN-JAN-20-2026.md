# TASK 9.1: ADMIN AUTHENTICATION - IMPLEMENTATION PLAN
**Date**: January 20, 2026  
**Duration**: 2 hours  
**Status**: Ready to implement

---

## 🎯 OBJECTIVE

Build a secure admin authentication system with JWT tokens, login page, and protected routes.

---

## 📋 IMPLEMENTATION STEPS

### Step 1: Install Dependencies (5 minutes)
```bash
npm install bcryptjs jsonwebtoken cookie
```

**Packages**:
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT token generation/validation
- `cookie`: Cookie parsing

---

### Step 2: Add Environment Variables (2 minutes)

Add to `.env.local`:
```env
# Admin Authentication
JWT_SECRET=dev-jwt-secret-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h
```

**Security Note**: In production, use a strong random secret (64+ characters)

---

### Step 3: Create JWT Utilities (15 minutes)

**File**: `lib/admin/auth.js`

**Functions**:
1. `hashPassword(password)` - Hash password with bcrypt
2. `verifyPassword(password, hash)` - Verify password
3. `generateToken(user)` - Generate JWT token
4. `verifyToken(token)` - Verify JWT token
5. `setAuthCookie(response, token)` - Set httpOnly cookie
6. `clearAuthCookie(response)` - Clear cookie

**Implementation**:
```javascript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Hash password
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Set auth cookie
export function setAuthCookie(response, token) {
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  });
}

// Clear auth cookie
export function clearAuthCookie(response) {
  response.cookies.delete('admin_token');
}
```

---

### Step 4: Create Login API Endpoint (20 minutes)

**File**: `app/api/admin/auth/login/route.js`

**Endpoint**: `POST /api/admin/auth/login`

**Request Body**:
```json
{
  "email": "admin@thandi.co.za",
  "password": "secure_password"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@thandi.co.za",
    "role": "admin"
  }
}
```

**Implementation**:
```javascript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/admin/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, email, password_hash, role')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### Step 5: Create Logout API Endpoint (10 minutes)

**File**: `app/api/admin/auth/logout/route.js`

**Endpoint**: `POST /api/admin/auth/logout`

**Implementation**:
```javascript
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/admin/auth';

export async function POST(request) {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  clearAuthCookie(response);

  return response;
}
```

---

### Step 6: Create Authentication Middleware (20 minutes)

**File**: `middleware/admin-auth.js`

**Purpose**: Protect admin routes, verify JWT tokens

**Implementation**:
```javascript
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/admin/auth';

export function requireAuth(request) {
  // Get token from cookie
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Verify token
  const user = verifyToken(token);

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Add user to request
  request.user = user;

  return null; // Continue to route handler
}

export function getAuthUser(request) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
```

---

### Step 7: Create Login Page UI (30 minutes)

**File**: `app/admin/login/page.js`

**Features**:
- Email and password inputs
- Form validation
- Error messages
- Loading state
- Redirect after login

**Implementation**:
```javascript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Thandi Admin Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the admin panel
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="admin@thandi.co.za"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

### Step 8: Update Admin Dashboard to Check Auth (15 minutes)

**File**: `app/admin/page.js`

**Add authentication check**:
```javascript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardOverview from '@/components/admin/DashboardOverview';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify');
      const data = await response.json();

      if (!data.success) {
        router.push('/admin/login');
      } else {
        setLoading(false);
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return <DashboardOverview />;
}
```

---

### Step 9: Create Auth Verification Endpoint (10 minutes)

**File**: `app/api/admin/auth/verify/route.js`

**Endpoint**: `GET /api/admin/auth/verify`

**Implementation**:
```javascript
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/middleware/admin-auth';

export async function GET(request) {
  const user = getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
}
```

---

### Step 10: Add Logout Button to Dashboard (10 minutes)

**File**: `components/admin/AdminNav.jsx`

**Add logout button**:
```javascript
const handleLogout = async () => {
  try {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Add to navigation
<button
  onClick={handleLogout}
  className="text-gray-600 hover:text-gray-900"
>
  Logout
</button>
```

---

### Step 11: Test Authentication Flow (15 minutes)

**Test Cases**:
1. ✅ Login with valid credentials
2. ✅ Login with invalid credentials
3. ✅ Access protected route without auth
4. ✅ Access protected route with auth
5. ✅ Logout and verify redirect
6. ✅ Token expiry handling

**Test Script**: `scripts/test-admin-authentication.js`

---

## 📊 PROGRESS CHECKLIST

- [ ] Dependencies installed
- [ ] Environment variables added
- [ ] JWT utilities created
- [ ] Login API endpoint created
- [ ] Logout API endpoint created
- [ ] Authentication middleware created
- [ ] Login page UI created
- [ ] Dashboard auth check added
- [ ] Auth verification endpoint created
- [ ] Logout button added
- [ ] Authentication flow tested

---

## 🧪 TESTING COMMANDS

```bash
# Test login
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@thandi.co.za","password":"your_password"}'

# Test verify (with cookie)
curl http://localhost:3000/api/admin/auth/verify \
  -H "Cookie: admin_token=your_token"

# Test logout
curl -X POST http://localhost:3000/api/admin/auth/logout \
  -H "Cookie: admin_token=your_token"
```

---

## ✅ ACCEPTANCE CRITERIA

- ✅ Login page loads and displays correctly
- ✅ Valid credentials grant access
- ✅ Invalid credentials show error
- ✅ JWT token generated and stored in httpOnly cookie
- ✅ Protected routes require authentication
- ✅ Logout clears token and redirects
- ✅ Token expiry handled gracefully

---

**Ready to implement?** Let's start with Step 1! 🚀
