/**
 * Rate Limiter for API Key Authentication
 * Limits requests to 100 per minute per API key
 * Created: January 20, 2026
 */

// In-memory store for rate limiting
// In production, use Redis for distributed rate limiting
const requestCounts = new Map();

// Configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

/**
 * Clean up old entries from the rate limit store
 */
function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.windowStart > RATE_LIMIT_WINDOW) {
      requestCounts.delete(key);
    }
  }
}

/**
 * Check if a request should be rate limited
 * @param {string} identifier - API key or IP address
 * @returns {Object} { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(identifier) {
  const now = Date.now();
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    cleanupOldEntries();
  }

  // Get or create rate limit data for this identifier
  let data = requestCounts.get(identifier);

  if (!data || now - data.windowStart > RATE_LIMIT_WINDOW) {
    // Start new window
    data = {
      windowStart: now,
      count: 0
    };
    requestCounts.set(identifier, data);
  }

  // Increment request count
  data.count++;

  // Calculate remaining requests and reset time
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - data.count);
  const resetAt = data.windowStart + RATE_LIMIT_WINDOW;

  return {
    allowed: data.count <= RATE_LIMIT_MAX_REQUESTS,
    remaining,
    resetAt,
    limit: RATE_LIMIT_MAX_REQUESTS
  };
}

/**
 * Middleware to enforce rate limiting
 * @param {Request} request - Next.js request object
 * @param {string} identifier - API key or IP address
 * @returns {Response|null} Error response if rate limited, null to continue
 */
export function enforceRateLimit(request, identifier) {
  const { NextResponse } = require('next/server');
  
  const rateLimit = checkRateLimit(identifier);

  // Add rate limit headers to response
  const headers = {
    'X-RateLimit-Limit': rateLimit.limit.toString(),
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString()
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${rateLimit.limit} requests per minute`,
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers
      }
    );
  }

  return null; // Continue to route handler
}

/**
 * Get rate limit status for an identifier
 * @param {string} identifier - API key or IP address
 * @returns {Object} Rate limit status
 */
export function getRateLimitStatus(identifier) {
  const data = requestCounts.get(identifier);
  const now = Date.now();

  if (!data || now - data.windowStart > RATE_LIMIT_WINDOW) {
    return {
      count: 0,
      remaining: RATE_LIMIT_MAX_REQUESTS,
      resetAt: now + RATE_LIMIT_WINDOW,
      limit: RATE_LIMIT_MAX_REQUESTS
    };
  }

  return {
    count: data.count,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - data.count),
    resetAt: data.windowStart + RATE_LIMIT_WINDOW,
    limit: RATE_LIMIT_MAX_REQUESTS
  };
}

/**
 * Reset rate limit for an identifier (for testing)
 * @param {string} identifier - API key or IP address
 */
export function resetRateLimit(identifier) {
  requestCounts.delete(identifier);
}

/**
 * Clear all rate limit data (for testing)
 */
export function clearAllRateLimits() {
  requestCounts.clear();
}
