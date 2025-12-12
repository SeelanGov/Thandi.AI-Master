# Performance Optimization Design Document

## Overview

The Thandi AI system currently suffers from critical performance issues that prevent production deployment. With average response times of 12.6 seconds versus the required sub-2 second target, the system represents a 530% performance gap. This design addresses systematic optimization through a multi-layered approach: Edge Runtime migration, aggressive caching, API fixes, and comprehensive monitoring.

The optimization strategy follows a priority-based implementation sequence, ensuring critical API functionality is restored before pursuing response time improvements. The design incorporates contingency plans for each optimization approach and establishes clear go/no-go checkpoints throughout the 2-week implementation timeline.

## Architecture

### Current Performance Bottlenecks

Based on analysis of the existing system, the 12.6-second response time breaks down as follows:

```
500ms:  Vercel cold start (serverless function initialization)
1500ms: OpenAI embedding generation for query processing
8000ms: Groq/Anthropic LLM call for career description generation
1500ms: Supabase vector search across knowledge base
100ms:  CAG layer verification and quality checks
300ms:  Response formatting and serialization
------
12.6s:  TOTAL (unacceptable for production use)
```

### Target Performance Architecture

The optimized architecture implements a multi-tier performance strategy:

**Tier 1: Edge Runtime (Target: <500ms cold start)**
- Migrate from Node.js serverless to Edge Runtime
- Reduce cold start penalty from 500ms to <100ms
- Pin to single region (iad1) for consistency

**Tier 2: Aggressive Caching (Target: <50ms for cached responses)**
- Redis-based response caching with 1-hour TTL
- Pre-generated career templates to avoid LLM calls
- Intelligent cache key generation based on profile similarity

**Tier 3: LLM Optimization (Target: <1.5s for LLM calls)**
- Provider fallback: Groq → OpenAI GPT-3.5-turbo for speed
- Token optimization and prompt compression
- Streaming responses for perceived performance

**Tier 4: Vector Search Optimization (Target: <200ms)**
- Supabase connection pooling and query optimization
- Batch embedding generation for efficiency
- Index optimization for faster similarity search

## Components and Interfaces

### Performance Monitor Component

```javascript
interface PerformanceMonitor {
  trackRAGPerformance(duration: number, success: boolean): void;
  trackCachePerformance(hitRate: number, avgLatency: number): void;
  trackAPIHealth(endpoint: string, status: number, duration: number): void;
  getMetrics(): PerformanceMetrics;
}

interface PerformanceMetrics {
  avgResponseTime: number;
  p95ResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  uptime: number;
}
```

### Cache Manager Component

```javascript
interface CacheManager {
  getCachedResponse(profile: StudentProfile, query: string): Promise<CachedResponse | null>;
  setCachedResponse(profile: StudentProfile, query: string, response: RAGResponse): Promise<boolean>;
  invalidateCache(pattern: string): Promise<void>;
  getCacheStats(): Promise<CacheStats>;
}

interface CacheStats {
  hitRate: number;
  totalKeys: number;
  memoryUsage: number;
  avgLatency: number;
}
```

### LLM Provider Manager

```javascript
interface LLMProviderManager {
  getOptimalProvider(): LLMProvider;
  executeWithFallback(prompt: string, options: LLMOptions): Promise<LLMResponse>;
  trackProviderPerformance(provider: string, duration: number): void;
  switchProvider(reason: string): void;
}

interface LLMOptions {
  maxTokens: number;
  timeout: number;
  fallbackProvider?: string;
  enableStreaming?: boolean;
}
```

### API Health Manager

```javascript
interface APIHealthManager {
  validateEndpoint(endpoint: string): Promise<EndpointHealth>;
  fixMissingRoutes(): Promise<FixResult[]>;
  monitorEndpoints(): Promise<HealthReport>;
}

interface EndpointHealth {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: Date;
}
```

## Data Models

### Performance Metrics Model

```javascript
interface PerformanceMetric {
  id: string;
  timestamp: Date;
  endpoint: string;
  duration: number;
  success: boolean;
  cacheHit: boolean;
  provider: string;
  errorMessage?: string;
}
```

### Cache Entry Model

```javascript
interface CacheEntry {
  key: string;
  value: RAGResponse;
  ttl: number;
  createdAt: Date;
  accessCount: number;
  profileSignature: string;
}
```

### API Monitoring Model

```javascript
interface APIMonitoring {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  errorDetails?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all properties identified in the prework, I identified several areas for consolidation:

- Properties 1.1, 1.2, 1.3, 1.4, and 1.5 all test different aspects of response time performance and can be combined into comprehensive timing properties
- Properties 2.1, 2.3, and 2.4 all test API functionality and can be consolidated into API health properties
- Properties 3.1 and 3.4 both test caching behavior and can be combined into cache performance properties
- Properties 3.2, 3.3, and 3.5 all test monitoring functionality and can be consolidated

**Property 1: Response Time Performance**
*For any* valid career guidance query, the system response time should be under 2 seconds, with cold starts under 500ms, vector searches under 200ms, and LLM calls under 1.5 seconds
**Validates: Requirements 1.1, 1.2, 1.4, 1.5**

**Property 2: Concurrent Load Performance**
*For any* set of concurrent users (up to 50), 95% of requests should complete within 3 seconds
**Validates: Requirements 1.3**

**Property 3: API Endpoint Reliability**
*For any* valid API request to assessment, consent, or privacy endpoints, the system should return appropriate data with 200 status codes rather than 404/405 errors
**Validates: Requirements 2.1, 2.3, 2.4**

**Property 4: Cache Performance**
*For any* identical query submitted twice, the second response should come from cache and complete within 50 milliseconds
**Validates: Requirements 3.1, 3.4**

**Property 5: Monitoring and Error Tracking**
*For any* system operation, performance metrics, errors, and cache statistics should be properly tracked and logged with sufficient detail for debugging
**Validates: Requirements 3.2, 3.3, 3.5**

**Property 6: Rate Limiting Protection**
*For any* client making excessive requests (>10 per minute), the system should block further requests while allowing normal usage patterns to continue
**Validates: Requirements 4.2**

**Property 7: Provider Fallback Behavior**
*For any* LLM provider failure or timeout, the system should automatically switch to the backup provider or return a graceful fallback response
**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

## Error Handling

### Performance Degradation Handling

**Cold Start Mitigation:**
- Implement keep-warm pings every 5 minutes during business hours
- Use Edge Runtime to reduce cold start penalty
- Fallback to cached responses during initialization

**LLM Timeout Handling:**
- 5-second timeout with automatic retry
- Provider switching: Groq → OpenAI → Mock fallback
- Streaming responses for long operations

**Cache Failure Handling:**
- Redis connection failures should not break the system
- Graceful degradation to direct database queries
- Background cache warming for popular queries

**API Error Recovery:**
- 404/405 errors trigger automatic route registration
- Circuit breaker pattern for failing endpoints
- Health check recovery with exponential backoff

### Monitoring and Alerting

**Performance Alerts:**
- Response time >5s triggers immediate alert
- Cache hit rate <60% triggers investigation
- Error rate >5% triggers escalation

**System Health Monitoring:**
- Real-time dashboard with key metrics
- Automated health checks every 30 seconds
- Performance trend analysis and predictions

## Testing Strategy

### Dual Testing Approach

The performance optimization requires both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests:**
- Specific API endpoint functionality
- Cache hit/miss scenarios
- Provider fallback mechanisms
- Error handling edge cases

**Property-Based Tests:**
- Response time properties across random inputs
- Concurrent load testing with varying user counts
- Cache performance with different query patterns
- Rate limiting behavior with various request patterns

### Property-Based Testing Framework

**Framework:** Artillery.js for load testing + Jest for property tests
**Configuration:** Minimum 100 iterations per property test
**Test Environment:** Vercel preview deployments for realistic testing

### Performance Testing Strategy

**Load Testing:**
- Simulate 1-50 concurrent users
- Test with realistic query patterns
- Measure P50, P95, P99 response times
- Validate cache hit rates under load

**Stress Testing:**
- Push system beyond normal limits
- Identify breaking points and failure modes
- Validate graceful degradation behavior
- Test recovery after overload conditions

**Monitoring Validation:**
- Verify all metrics are collected accurately
- Test alert thresholds and notification delivery
- Validate dashboard accuracy under various conditions