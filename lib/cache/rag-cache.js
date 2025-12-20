// Redis Cache for RAG Pipeline - Phase 2 Performance Optimization
// Target: 40% latency reduction via caching
// Vercel-compatible: Uses Upstash Redis (serverless)

import { Redis } from '@upstash/redis';
import crypto from 'crypto';

let client = null;
let isConnected = false;

// Initialize Redis client (Upstash for Vercel)
async function initializeRedis() {
  if (client && isConnected) return client;
  
  try {
    // Upstash Redis REST API for Vercel
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    // Test connection
    await client.ping();
    isConnected = true;
    console.log('✅ Upstash Redis cache initialized');
    return client;
    
  } catch (error) {
    console.error('❌ Upstash Redis initialization failed:', error.message);
    isConnected = false;
    return null;
  }
}

// Generate deterministic cache key from student profile + query + marks data
function generateCacheKey(profile, query) {
  const version = 'v1.3'; // Increment when cache structure changes - FIXED CACHE COLLISION
  
  // CRITICAL FIX: Include marks data in cache key to prevent collision
  let marksSignature = 'no-marks';
  if (profile.marksData?.exactMarks) {
    // Create deterministic signature from marks
    const sortedMarks = Object.entries(profile.marksData.exactMarks)
      .filter(([_, mark]) => mark && mark !== '')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([subject, mark]) => `${subject}:${mark}`)
      .join('|');
    
    if (sortedMarks) {
      marksSignature = crypto
        .createHash('md5')
        .update(sortedMarks)
        .digest('hex')
        .substring(0, 8);
    }
  } else if (profile.marks && Object.keys(profile.marks).length > 0) {
    // Fallback for legacy marks format
    const sortedMarks = Object.entries(profile.marks)
      .filter(([_, mark]) => mark && mark !== 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([subject, mark]) => `${subject}:${mark}`)
      .join('|');
    
    if (sortedMarks) {
      marksSignature = crypto
        .createHash('md5')
        .update(sortedMarks)
        .digest('hex')
        .substring(0, 8);
    }
  }
  
  // Add session timestamp to ensure uniqueness per assessment session
  const sessionId = profile.sessionId || Date.now().toString();
  const sessionHash = crypto
    .createHash('md5')
    .update(sessionId)
    .digest('hex')
    .substring(0, 6);
  
  // Create profile signature (deterministic)
  const profileSig = [
    `g${profile.grade || 'unknown'}`,
    `marks:${marksSignature}`,
    `session:${sessionHash}`,
    ...(profile.subjects || []).slice(0, 3).sort(),
    ...(profile.interests || []).slice(0, 2).sort(),
    `fin${profile.financialConstraints || 'unknown'}`
  ].join('-');
  
  // Hash query for consistent key length
  const queryHash = crypto
    .createHash('md5')
    .update(query.toLowerCase().trim())
    .digest('hex')
    .substring(0, 8);
  
  return `thandi:${version}:rag:${profileSig}:${queryHash}`;
}

// Get cached RAG response
export async function getCachedResponse(profile, query) {
  const startTime = Date.now();
  
  try {
    const redis = await initializeRedis();
    if (!redis || !isConnected) {
      console.log('⚪ Cache SKIP (Redis unavailable)');
      return null;
    }
    
    const key = generateCacheKey(profile, query);
    const cached = await redis.get(key);
    
    const duration = Date.now() - startTime;
    
    if (cached) {
      console.log(`🟢 Cache HIT (${duration}ms) - Key: ${key.substring(0, 50)}...`);
      
      try {
        // Upstash returns parsed JSON directly
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
        
        // Add cache metadata
        return {
          ...parsed,
          cache: {
            status: 'HIT',
            duration,
            key: key.substring(0, 20) + '...',
            timestamp: new Date().toISOString()
          }
        };
      } catch (parseError) {
        console.error('❌ Cache parse error:', parseError.message);
        // Delete corrupted cache entry
        await redis.del(key);
        return null;
      }
    }
    
    console.log(`⚪ Cache MISS (${duration}ms) - Key: ${key.substring(0, 50)}...`);
    return null;
    
  } catch (error) {
    console.error('❌ Cache GET error:', error.message);
    return null; // Fail silently - cache is not critical
  }
}

// Set cached RAG response
export async function setCachedResponse(profile, query, response) {
  const startTime = Date.now();
  
  try {
    const redis = await initializeRedis();
    if (!redis || !isConnected) {
      console.log('⚪ Cache SKIP SET (Redis unavailable)');
      return false;
    }
    
    const key = generateCacheKey(profile, query);
    
    // Remove cache metadata before storing
    const cleanResponse = { ...response };
    delete cleanResponse.cache;
    
    // Store with 1 hour TTL (3600 seconds) - Upstash format
    await redis.set(key, cleanResponse, { ex: 3600 });
    
    const duration = Date.now() - startTime;
    console.log(`💾 Cache SET (${duration}ms) - Key: ${key.substring(0, 50)}...`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Cache SET error:', error.message);
    return false; // Fail silently
  }
}

// Cache statistics for monitoring
export async function getCacheStats() {
  try {
    const redis = await initializeRedis();
    if (!redis || !isConnected) {
      return { status: 'disconnected', keys: 0 };
    }
    
    // Upstash doesn't support info command, so we'll return basic stats
    return {
      status: 'connected',
      keys: 'unknown', // Upstash REST doesn't expose dbSize
      provider: 'upstash',
      connected: isConnected
    };
    
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

// Health check
export async function pingCache() {
  try {
    const redis = await initializeRedis();
    if (!redis || !isConnected) {
      return { status: 'down', latency: null };
    }
    
    const start = Date.now();
    const result = await redis.ping();
    const latency = Date.now() - start;
    
    return { status: 'up', latency, result };
    
  } catch (error) {
    return { status: 'error', error: error.message, latency: null };
  }
}
