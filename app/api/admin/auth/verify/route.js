/**
 * Admin Token Verification API
 * GET /api/admin/auth/verify
 * 
 * Verifies JWT token from httpOnly cookie
 */

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Get token from cookie
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        error: 'No token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'thandi-admin-secret-key-change-in-production'
    );

    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    // Token invalid or expired
    return NextResponse.json({
      authenticated: false,
      error: 'Invalid or expired token',
    });
  }
}
