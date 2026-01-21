/**
 * API Key Authentication Middleware
 * Validates API keys for programmatic access (Kiro AI)
 * Created: January 20, 2026
 */

/**
 * Validate API key from request headers
 * @param {Request} request - Next.js request object
 * @returns {boolean} True if API key is valid
 */
export function validateAPIKey(request) {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return false;
  }

  // Check against environment variable
  const validAPIKey = process.env.KIRO_API_KEY || process.env.ADMIN_API_KEY;
  
  if (!validAPIKey) {
    console.error('API key not configured in environment variables');
    return false;
  }

  return apiKey === validAPIKey;
}

/**
 * Require API key authentication for a request
 * Returns error response if API key is invalid
 * Also enforces rate limiting
 * @param {Request} request - Next.js request object
 * @returns {Response|null} Error response or null to continue
 */
export function requireAPIKey(request) {
  const { NextResponse } = require('next/server');
  const { enforceRateLimit } = require('@/lib/admin/rate-limiter');
  
  if (!validateAPIKey(request)) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid or missing API key',
        message: 'Please provide a valid API key in the X-API-Key header'
      },
      { status: 401 }
    );
  }

  // Get API key for rate limiting
  const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
  
  // Enforce rate limiting
  const rateLimitResponse = enforceRateLimit(request, apiKey);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  return null; // Continue to route handler
}

/**
 * Check if request has valid authentication (either JWT or API key)
 * @param {Request} request - Next.js request object
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated(request) {
  // Check for JWT token
  const token = request.cookies.get('admin_token')?.value;
  if (token) {
    const { verifyToken } = require('@/lib/admin/auth');
    const user = verifyToken(token);
    if (user) return true;
  }

  // Check for API key
  return validateAPIKey(request);
}

/**
 * Require either JWT or API key authentication
 * @param {Request} request - Next.js request object
 * @returns {Response|null} Error response or null to continue
 */
export function requireAuth(request) {
  const { NextResponse } = require('next/server');
  
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication required',
        message: 'Please provide either a valid session cookie or API key'
      },
      { status: 401 }
    );
  }

  return null; // Continue to route handler
}
