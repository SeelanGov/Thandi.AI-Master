/**
 * Admin Logout API Endpoint
 * POST /api/admin/auth/logout
 * Created: January 20, 2026
 */

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
