// Redis Cache for RAG Pipeline - Phase 2 Performance Optimization
// Target: 40% latency reduction via caching
// Vercel-compatible: Uses Upstash Redis REST API (serverless)

import crypto from 'crypto';

// Upstash REST API client (no persistent connection needed)
class UpstashRedisClient {
  constructor() {
    this.restUrl = process.env.UPSTASH_REDIS_REST_URL;
    this.token = process.env.UPSTASH_REDIS_REST_TOKEN;
    this.isAvailable = !!(this.restUrl && this.token);
  }

  async get(key) {
    if (!this.isAvailable) return null;
    
    try {
      const response = await fetch(`${this.restUrl}/get/${encodeURIComponent(key)}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('❌ Upstash GET error:', error.message);
      return null;
    }
  }

  async setEx(key, ttl, value) {
    if (!this.isAvailable) return false;
    
    try {
      const response = await fetch(`${this.restUrl}/setex/${encodeURIComponent(key)}/${ttl}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(value)
      });
      
      return response.ok;
    } catch (error) {
      console.error('❌ Upstash SETEX error:', error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.isAvailable) return false;
    
    try {
      const response = await fetch(`${this.restUrl}/del/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('❌ Upstash DEL error:', error.message);
      return false;
    }
  }

  async ping() {
    if (!this.isAvailable) return false;
    
    try {
      const start = Date.now();
      const response = await fetch(`${this.restUrl}/ping`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const latency = Date.now() - start;
      return response.ok ? latency : false;
    } catch (error) {
      console.error('❌ Upstash PING error:', error.message);
      return false;
    }
  }

  async dbSize() {
    if (!this.isAvailable) return 0;
    
    try {
      const response = await fetch(`${this.restUrl}/dbsize`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) return 0;
      
      const data = await response.json();
      return data.result || 0;
    } catch (error) {
      console.error('❌ Upstash DBSIZE error:', error.message);
      return 0;
    }
  }
}

const client = new UpstashRedisClient();

// Generate deterministic cache key from student profile + query
function generateCacheKey(profile, query) {
  const version = 'v1.3'; // Increment when cache structure changes - FIXED: Now includes questionnaire data
  
  // Create profile signature (deterministic)
  const profileSig = [
    `g${profile.grade || 'unknown'}`,
    ...(profile.subjects || []).slice(0, 5).sort(),
    ...(profile.interests || []).slice(0, 3).sort(),
    `fin${profile.financialConstraints || 'unknown'}`,
    `avg${Math.floor((profile.averageMark || 0) / 10) * 10}` // Round to nearest 10
  ].join('-');
  
  // CRITICAL FIX: Extract questionnaire data from query text
  // The enhanced system embeds motivation/concerns in structured query sections
  // This ensures students with different questionnaire responses get different cache entries
  let questionnaireHash = '';
  
  if (query && query.length > 200) { // Enhanced queries are much longer
    // Look for enhanced query sections that contain questionnaire data
    const hasMotivationSection = query.includes('=== WHAT MOTIVATES ME ===');
    const hasConcernsSection = query.includes('=== MY CONCERNS ABOUT THE FUTURE ===');
    const hasCriticalRequest = query.includes('CRITICAL STUDENT REQUEST:');
    
    if (hasMotivationSection || hasConcernsSection || hasCriticalRequest) {
      // This is an enhanced query with questionnaire data - use full query hash
      questionnaireHash = crypto
        .createHash('md5')
        .update(query.toLowerCase().trim())
        .digest('hex')
        .substring(0, 12); // Use more chars for enhanced queries
    }
  }
  
  // For legacy queries or enhanced queries, create appropriate cache key
  if (questionnaireHash) {
    // Enhanced query with questionnaire data - use questionnaire-aware key
    return `thandi:${version}:enhanced:${profileSig}:${questionnaireHash}`;
  } else {
    // Legacy query or basic query - use simple key
    const queryHash = crypto
      .createHash('md5')
      .update(query.toLowerCase().trim())
      .digest('hex')
      .substring(0, 8);
    return `thandi:${version}:basic:${profileSig}:${queryHash}`;
  }
}

// Get cached RAG response
export async function getCachedResponse(profile, query) {
  const startTime = Date.now();
  
  try {
    if (!client.isAvailable) {
      console.log('⚪ Cache SKIP (Upstash not configured)');
      return null;
    }
    
    const key = generateCacheKey(profile, query);
    const cached = await client.get(key);
    
    const duration = Date.now() - startTime;
    
    if (cached) {
      console.log(`🟢 Cache HIT (${duration}ms) - Key: ${key.substring(0, 50)}...`);
      
      try {
        const parsed = JSON.parse(cached);
        
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
        await client.del(key);
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
    if (!client.isAvailable) {
      console.log('⚪ Cache SKIP SET (Upstash not configured)');
      return false;
    }
    
    const key = generateCacheKey(profile, query);
    
    // Remove cache metadata before storing
    const cleanResponse = { ...response };
    delete cleanResponse.cache;
    
    // Store with 1 hour TTL (3600 seconds)
    const success = await client.setEx(key, 3600, JSON.stringify(cleanResponse));
    
    const duration = Date.now() - startTime;
    console.log(`💾 Cache SET (${duration}ms) - Key: ${key.substring(0, 50)}...`);
    
    return success;
    
  } catch (error) {
    console.error('❌ Cache SET error:', error.message);
    return false; // Fail silently
  }
}

// Cache statistics for monitoring
export async function getCacheStats() {
  try {
    if (!client.isAvailable) {
      return { status: 'not_configured', keys: 0 };
    }
    
    const keyCount = await client.dbSize();
    
    return {
      status: 'connected',
      keys: keyCount,
      connected: client.isAvailable
    };
    
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

// Health check
export async function pingCache() {
  try {
    if (!client.isAvailable) {
      return { status: 'not_configured', latency: null };
    }
    
    const latency = await client.ping();
    
    return { 
      status: latency !== false ? 'up' : 'down', 
      latency: latency !== false ? latency : null 
    };
    
  } catch (error) {
    return { status: 'error', error: error.message, latency: null };
  }
}
