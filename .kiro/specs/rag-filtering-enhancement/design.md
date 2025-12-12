# RAG Filtering Enhancement - Design Document

**Date:** December 12, 2024  
**Feature:** Enhanced RAG filtering for diverse career recommendations  
**Version:** 1.0  

---

## Overview

The RAG Filtering Enhancement addresses the critical issue where students receive only 2 career recommendations instead of the expected 3-5 diverse options. The current system has overly restrictive metadata filtering that drops 40+ potential career matches to just 2 careers. This design implements a multi-layered approach to enhance filtering flexibility while maintaining quality standards and performance requirements.

The solution involves three main components: enhanced metadata filtering with multiple identification methods, an intelligent fallback system for insufficient matches, and subject-category matching for improved relevance. All changes maintain backward compatibility with the existing knowledge base and preserve all safety and verification systems.

## Architecture

### Current System Flow
```
Student Profile → RAG Search → Similarity Filter → Metadata Filter → Enrichment → 2 Careers
                                    (40 careers)      (40→2 DROP)
```

### Enhanced System Flow  
```
Student Profile → RAG Search → Similarity Filter → Enhanced Metadata Filter → Enrichment → Fallback Check → 3-5 Careers
                                    (40 careers)         (40→8+ careers)                      (if <3, add more)
```

### Component Architecture

**1. Enhanced Metadata Filter**
- Multiple identification methods (career_code, career_title, source tags, text patterns)
- Graceful degradation when metadata is incomplete
- Backward compatibility with existing data structures

**2. Intelligent Fallback System**
- Subject-based career prioritization
- Grade-appropriate career selection
- Diversity maintenance across categories
- Confidence level adjustment for fallback careers

**3. Subject-Category Matcher**
- STEM → Engineering, Technology, Science careers
- Business → Finance, Economics, Management careers  
- Arts → Creative, Design, Media careers
- Mixed subjects → Interdisciplinary careers

## Components and Interfaces

### Enhanced Career Matcher (`lib/rag/career-matcher.js`)

**Interface:**
```javascript
export async function matchCareersToProfile(profile, options = {}) {
  // Returns: Promise<Array<Career>> with minimum 3 careers
}

export async function getFallbackCareers(profile, existingCareers = []) {
  // Returns: Promise<Array<Career>> for insufficient matches
}
```

**Key Methods:**
- `enhancedMetadataFilter(chunks)` - Multi-criteria filtering
- `extractCareerFromText(chunkText)` - Text pattern matching
- `selectSubjectBasedFallbacks(profile, count)` - Subject-aware fallbacks
- `ensureCareerDiversity(careers)` - Category diversity validation

### Metadata Filter Engine (`lib/rag/metadata-filter.js`)

**Interface:**
```javascript
export class MetadataFilter {
  filter(chunks, options = {}) {
    // Returns: Array<Chunk> with enhanced filtering
  }
  
  validateCareerChunk(chunk) {
    // Returns: boolean - whether chunk represents a career
  }
}
```

**Filtering Criteria (Priority Order):**
1. **Primary**: `career_code`, `career_title`, `career_name`
2. **Secondary**: Source tags containing "career"
3. **Tertiary**: Text patterns like "Career:", "Occupation:"
4. **Fallback**: Category metadata indicating career content

### Fallback Career Selector (`lib/rag/fallback-selector.js`)

**Interface:**
```javascript
export class FallbackSelector {
  async selectFallbacks(profile, existingCareers, targetCount) {
    // Returns: Promise<Array<Career>> to reach targetCount
  }
  
  prioritizeBySubjects(careers, subjects) {
    // Returns: Array<Career> sorted by subject relevance
  }
}
```

**Selection Strategy:**
1. **Subject Match**: Careers requiring student's subjects
2. **Category Match**: Careers in related categories
3. **Grade Appropriate**: Careers suitable for student's timeline
4. **High Demand**: Popular careers with good prospects
5. **Diversity**: Ensure different career categories represented

## Data Models

### Enhanced Career Object
```javascript
{
  title: string,              // Career title
  code: string,               // Unique career identifier
  category: string,           // Career category (Engineering, Business, etc.)
  description: string,        // Career description
  similarity: number,         // RAG similarity score (0-1)
  confidence: number,         // Overall confidence (0-1)
  source: string,             // "rag" | "fallback" | "hybrid"
  
  // Requirements
  education: string,          // Required education level
  subjects: Array<string>,    // Required subjects
  qualifications: string,     // Additional qualifications
  
  // Career data
  salaryRange: Object,        // Salary information
  pathways: Array<string>,    // Education pathways
  demand: string,             // Job market demand
  outlook: string,            // Career outlook
  
  // Metadata
  metadata: Object,           // Original chunk metadata
  enrichmentSource: string    // How career data was obtained
}
```

### Filter Configuration
```javascript
{
  minSimilarity: 0.6,         // Minimum semantic similarity
  targetCount: 5,             // Target number of careers
  minCount: 3,                // Minimum number of careers
  maxFallbacks: 2,            // Maximum fallback careers
  diversityThreshold: 0.7,    // Minimum category diversity
  performanceTimeout: 2000    // Maximum processing time (ms)
}
```

### Subject-Category Mapping
```javascript
{
  "Mathematics": ["Engineering", "Technology", "Finance", "Science"],
  "Physical Sciences": ["Engineering", "Technology", "Science", "Research"],
  "Life Sciences": ["Healthcare", "Science", "Research", "Environment"],
  "Business Studies": ["Business", "Management", "Finance", "Marketing"],
  "Accounting": ["Finance", "Business", "Auditing"],
  "Information Technology": ["Technology", "Engineering", "Digital"],
  "Visual Arts": ["Creative", "Design", "Media", "Arts"],
  "English": ["Education", "Media", "Communications", "Arts"]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all identified properties, several can be consolidated:
- Properties 1.1, 1.2, and 3.1 all test the minimum career count requirement and can be combined
- Properties 2.1-2.5 all test different aspects of metadata filtering and should remain separate for comprehensive coverage
- Properties 4.1-4.3 test subject-category matching for different domains and should remain separate
- Performance properties 6.1-6.5 test different performance aspects and should remain separate

**Property 1: Minimum Career Count Guarantee**
*For any* valid student profile, the system should return at least 3 career recommendations, using fallback careers if necessary
**Validates: Requirements 1.1, 1.2, 3.1**

**Property 2: Enhanced Metadata Recognition**
*For any* career chunk with career_code, career_title, career source tags, or "Career:" text patterns, the metadata filter should include it in results
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

**Property 3: Subject-Category Alignment**
*For any* student profile with specific subject areas (STEM, Business, Arts), the returned careers should prioritize appropriate categories
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

**Property 4: Fallback Quality Maintenance**
*For any* fallback career selection, the careers should match the student's subjects when possible and maintain appropriate confidence levels
**Validates: Requirements 3.2, 3.3, 3.5**

**Property 5: Career Diversity Preservation**
*For any* set of career recommendations, they should span multiple career categories when the knowledge base contains diverse options
**Validates: Requirements 1.3, 3.4**

**Property 6: Performance Boundary Compliance**
*For any* career matching request, the enhanced filtering should complete within 2 seconds, with fallback selection adding no more than 1 second
**Validates: Requirements 6.1, 6.2, 6.3**

**Property 7: Scalability Maintenance**
*For any* knowledge base size and concurrent load, the system should maintain sub-3-second response times while preserving minimum career count
**Validates: Requirements 6.4, 6.5**

**Property 8: Broad Profile Handling**
*For any* student with comprehensive subject profiles, the system should return up to 5 career recommendations without artificial limits
**Validates: Requirements 1.4, 1.5**

**Property 9: Unusual Subject Accommodation**
*For any* student with unusual or interdisciplinary subject combinations, the system should find meaningful career matches or appropriate fallbacks
**Validates: Requirements 4.5**

## Error Handling

### Metadata Filter Failures
- **Missing Metadata**: Use text pattern matching as backup
- **Malformed Data**: Log warning and skip chunk gracefully
- **Empty Results**: Trigger fallback system immediately

### Fallback System Failures
- **No Subject Matches**: Use high-demand careers for grade level
- **Database Errors**: Use hardcoded emergency careers
- **Timeout Issues**: Return partial results with warning

### Performance Degradation
- **Slow Queries**: Implement query timeout and caching
- **Memory Issues**: Process careers in batches
- **High Load**: Prioritize speed over perfect diversity

### Data Quality Issues
- **Duplicate Careers**: Deduplicate by career_code and title
- **Invalid Salary Data**: Use "Competitive salary" fallback
- **Missing Descriptions**: Generate basic description from title

## Testing Strategy

### Unit Testing Approach
- **Metadata Filter Tests**: Verify each identification method works correctly
- **Fallback Selector Tests**: Test subject-based prioritization logic
- **Career Enrichment Tests**: Verify database integration and data formatting
- **Performance Tests**: Measure processing time for different profile sizes

### Property-Based Testing Framework
**Library**: Jest with fast-check for JavaScript property testing
**Configuration**: Minimum 100 iterations per property test
**Generators**: 
- Student profile generator (random grades, subjects, interests)
- Career chunk generator (various metadata formats)
- Knowledge base state generator (different sizes and content)

### Property Test Implementation

**Property 1 Test**: Generate random student profiles, verify ≥3 careers returned
```javascript
// **Feature: rag-filtering-enhancement, Property 1: Minimum Career Count Guarantee**
fc.assert(fc.property(
  studentProfileGenerator(),
  async (profile) => {
    const careers = await matchCareersToProfile(profile);
    return careers.length >= 3;
  }
), { numRuns: 100 });
```

**Property 2 Test**: Generate career chunks with different metadata, verify filtering
```javascript
// **Feature: rag-filtering-enhancement, Property 2: Enhanced Metadata Recognition**
fc.assert(fc.property(
  careerChunkGenerator(),
  (chunk) => {
    const hasCareerIdentifier = chunk.metadata?.career_code || 
                               chunk.metadata?.career_title ||
                               chunk.metadata?.source?.includes('career') ||
                               chunk.chunk_text?.includes('Career:');
    const passesFilter = metadataFilter.validateCareerChunk(chunk);
    return !hasCareerIdentifier || passesFilter;
  }
), { numRuns: 100 });
```

**Property 6 Test**: Measure performance across different scenarios
```javascript
// **Feature: rag-filtering-enhancement, Property 6: Performance Boundary Compliance**
fc.assert(fc.property(
  studentProfileGenerator(),
  async (profile) => {
    const startTime = Date.now();
    const careers = await matchCareersToProfile(profile);
    const duration = Date.now() - startTime;
    return duration <= 3000 && careers.length >= 3;
  }
), { numRuns: 100 });
```

### Integration Testing
- **End-to-End Flow**: Test complete student assessment to career recommendation flow
- **Database Integration**: Verify Supabase queries work with enhanced filtering
- **Cache Integration**: Test Redis caching with new career structures
- **CAG Integration**: Ensure enhanced careers pass through quality verification

### Load Testing
- **Concurrent Users**: Test 50+ simultaneous career matching requests
- **Knowledge Base Scale**: Test with 100+ career entries
- **Memory Usage**: Monitor memory consumption during peak load
- **Response Time Distribution**: Verify 95th percentile under 5 seconds

## Implementation Plan

### Phase 1: Enhanced Metadata Filtering (Week 1)
1. Implement `MetadataFilter` class with multiple identification methods
2. Update `career-matcher.js` to use enhanced filtering
3. Add text pattern matching for career identification
4. Implement comprehensive unit tests

### Phase 2: Fallback System (Week 2)  
1. Implement `FallbackSelector` class with subject-based prioritization
2. Create subject-category mapping configuration
3. Integrate fallback system into career matching flow
4. Add fallback-specific property tests

### Phase 3: Performance Optimization (Week 3)
1. Implement parallel processing for filter criteria
2. Add query optimization and caching strategies
3. Implement performance monitoring and alerting
4. Conduct load testing and optimization

### Phase 4: Integration and Validation (Week 4)
1. Integration testing with existing RAG and CAG systems
2. End-to-end testing with diverse student profiles
3. Performance validation under realistic load
4. Documentation and deployment preparation

## Deployment Strategy

### Feature Flags
- `enhanced_rag_filtering`: Enable/disable enhanced filtering
- `fallback_careers`: Enable/disable fallback system
- `performance_monitoring`: Enable detailed performance logging

### Rollout Plan
1. **Development**: Full testing with synthetic data
2. **Staging**: Testing with production data copy
3. **Canary**: 10% of traffic for 48 hours
4. **Gradual**: 50% of traffic for 1 week
5. **Full**: 100% of traffic with monitoring

### Rollback Strategy
- Immediate rollback capability via feature flags
- Fallback to original filtering logic if issues detected
- Performance monitoring with automatic alerts
- Manual override capability for emergency situations

### Success Metrics
- **Career Count**: 95% of requests return ≥3 careers
- **Response Time**: 95th percentile under 3 seconds
- **Error Rate**: <0.1% system errors
- **Diversity Score**: Average 2.5+ career categories per response
