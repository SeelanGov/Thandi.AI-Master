// Cache health check endpoint
import { NextResponse } from 'next/server';
import { pingCache, getCacheStats } from '@/lib/cache/rag-cache.js';

// Add cache busting headers to response
function addCacheHeaders(response) {
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Cache-Bust', '2026-01-13T16:30:00.000Z');
  return response;
}


export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test cache connectivity
    const pingResult = await pingCache();
    const stats = await getCacheStats();
    
    const totalTime = Date.now() - startTime;
    
    const response = {
      status: 'ok',
      cache: {
        ping: pingResult,
        stats: stats,
        environment: {
          hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
          hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
          redisUrlFormat: process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'missing',
          provider: 'upstash'
        }
      },
      performance: {
        totalTime,
        timestamp: new Date().toISOString()
      }
    };
    
    return addCacheHeaders(NextResponse.json(response));
    
  } catch (error) {
    console.error('Cache health check error:', error);
    
    return addCacheHeaders(NextResponse.json({
      status: 'error',
      error: error.message,
      cache: {
        status: 'unavailable'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 }));
  }
}