/**
 * Admin Auth Verification API Endpoint
 * GET /api/admin/auth/verify
 * Created: January 20, 2026
 */

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
