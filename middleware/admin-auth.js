/**
 * Admin Authentication Middleware
 * Protects admin routes and validates JWT tokens
 * Created: January 20, 2026
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/admin/auth';

/**
 * Require authentication for a request
 * Returns error response if not authenticated
 * @param {Request} request - Next.js request object
 * @returns {NextResponse|null} Error response or null to continue
 */
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

/**
 * Get authenticated user from request
 * Returns null if not authenticated
 * @param {Request} request - Next.js request object
 * @returns {Object|null} User object or null
 */
export function getAuthUser(request) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
