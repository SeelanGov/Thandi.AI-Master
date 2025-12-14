/**
 * Systematic Knowledge Base Audit
 * Comprehensive analysis of content, structure, and relevance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Audit criteria
const AUDIT_CRITERIA = {
  content: {
    minLength: 100,
    maxLength: 5000,
    requiredSections: ['overview', 'requirements', 'career'],
    keyTerms: ['career', 'university', 'requirements', 'APS', 'subjects']
  },
  structure: {
    hasYamlFrontmatter: true,
    requiredMetadata: ['curriculum', 'category', 'last_updated'],
    fileNaming: /^[a-z-]+\.md$/
  },
  relevance: {
    thandiKeywords: ['career', 'university', 'admission', 'requirements', 'subjects', 'pathways'],
    curriculumSpecific: ['CAPS', 'IEB', 'NSC', 'APS', 'FPS'],
    studentFacing: ['grade', 'marks', 'percentage', 'level']
  }
};

class KnowledgeBaseAuditor {
  constructor() {
    this.auditResults = {
      summary: {
        totalFiles: 0,
        totalDirectories: 0,
        totalSize: 0,
        avgFileSize: 0
      },
      byCategory: {},
      issues: [],
      recommendations: []
    };
  }

  async auditDirectory(dirPath, relativePath = '') {
    const items = fs.readdirSync(dirPath);
    const results = {
      files: [],
      subdirectories: [],
      issues: []
    };

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const itemRelativePath = path.join(relativePath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        this.auditResults.summary.totalDirectories++;
        const subResults = await this.auditDirectory(fullPath, itemRelativePath);
        results.subdirectories.push({
          name: item,
          path: itemRelativePath,
          ...subResults
        });
      } else if (item.endsWith('.md')) {
        this.auditResults.summary.totalFiles++;
        this.auditResults.summary.totalSize += stats.size;
        
        const fileAudit = await this.auditFile(fullPath, itemRelativePath);
        results.files.push(fileAudit);
      }
    }

    return results;
  }

  async auditFile(filePath, relativePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    
    const audit = {
      name: path.basename(filePath),
      path: relativePath,
      size: stats.size,
      lastModified: stats.mtime,
      content: {
        length: content.length,
        lines: content.split('\n').length,
        hasYamlFrontmatter: content.startsWith('---'),
        sections: this.extractSections(content),
        keywords: this.extractKeywords(content)
      },
      structure: this.auditStructure(content, relativePath),
      relevance: this.auditRelevance(content),
      issues: [],
      score: 0
    };

    // Calculate issues and score
    audit.issues = this.identifyIssues(audit);
    audit.score = this.calculateScore(audit);

    return audit;
  }

  extractSections(content) {
    const sections = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('##') && !line.startsWith('###')) {
        const section = line.replace(/^##\s*/, '').toLowerCase();
        sections.push(section);
      }
    }
    
    return sections;
  }

  extractKeywords(content) {
    const text = content.toLowerCase();
    const keywords = {};
    
    // Count occurrences of key terms
    const allKeywords = [
      ...AUDIT_CRITERIA.relevance.thandiKeywords,
      ...AUDIT_CRITERIA.relevance.curriculumSpecific,
      ...AUDIT_CRITERIA.relevance.studentFacing
    ];

    for (const keyword of allKeywords) {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
      const matches = text.match(regex);
      keywords[keyword] = matches ? matches.length : 0;
    }

    return keywords;
  }

  auditStructure(content, relativePath) {
    const structure = {
      hasYamlFrontmatter: content.startsWith('---'),
      metadata: {},
      fileNaming: AUDIT_CRITERIA.structure.fileNaming.test(path.basename(relativePath)),
      curriculum: this.extractCurriculum(relativePath),
      category: this.extractCategory(relativePath)
    };

    // Extract YAML metadata
    if (structure.hasYamlFrontmatter) {
      const yamlEndIndex = content.indexOf('---', 3);
      if (yamlEndIndex !== -1) {
        const yamlContent = content.substring(3, yamlEndIndex);
        yamlContent.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            structure.metadata[key.trim()] = valueParts.join(':').trim();
          }
        });
      }
    }

    return structure;
  }

  extractCurriculum(relativePath) {
    const pathParts = relativePath.split(path.sep);
    if (pathParts.includes('ieb')) return 'ieb';
    if (pathParts.includes('caps')) return 'caps';
    if (pathParts.includes('shared')) return 'shared';
    return 'unknown';
  }

  extractCategory(relativePath) {
    const pathParts = relativePath.split(path.sep);
    if (pathParts.includes('subjects')) return 'subject';
    if (pathParts.includes('universities')) return 'university';
    if (pathParts.includes('requirements')) return 'requirement';
    if (pathParts.includes('pathways')) return 'pathway';
    return 'general';
  }

  auditRelevance(content) {
    const text = content.toLowerCase();
    const relevance = {
      thandiScore: 0,
      curriculumScore: 0,
      studentScore: 0,
      overallScore: 0
    };

    // Calculate relevance scores
    const thandiKeywords = AUDIT_CRITERIA.relevance.thandiKeywords;
    const curriculumKeywords = AUDIT_CRITERIA.relevance.curriculumSpecific;
    const studentKeywords = AUDIT_CRITERIA.relevance.studentFacing;

    relevance.thandiScore = thandiKeywords.reduce((score, keyword) => {
      return score + (text.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0) / thandiKeywords.length;

    relevance.curriculumScore = curriculumKeywords.reduce((score, keyword) => {
      return score + (text.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0) / curriculumKeywords.length;

    relevance.studentScore = studentKeywords.reduce((score, keyword) => {
      return score + (text.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0) / studentKeywords.length;

    relevance.overallScore = (relevance.thandiScore + relevance.curriculumScore + relevance.studentScore) / 3;

    return relevance;
  }

  identifyIssues(audit) {
    const issues = [];

    // Content issues
    if (audit.content.length < AUDIT_CRITERIA.content.minLength) {
      issues.push(`Content too short (${audit.content.length} chars, min ${AUDIT_CRITERIA.content.minLength})`);
    }
    if (audit.content.length > AUDIT_CRITERIA.content.maxLength) {
      issues.push(`Content too long (${audit.content.length} chars, max ${AUDIT_CRITERIA.content.maxLength})`);
    }

    // Structure issues
    if (!audit.structure.hasYamlFrontmatter) {
      issues.push('Missing YAML frontmatter');
    }
    if (!audit.structure.fileNaming) {
      issues.push('File naming doesn\'t follow convention (lowercase-with-hyphens.md)');
    }

    // Metadata issues
    const requiredMetadata = AUDIT_CRITERIA.structure.requiredMetadata;
    for (const field of requiredMetadata) {
      if (!audit.structure.metadata[field]) {
        issues.push(`Missing required metadata: ${field}`);
      }
    }

    // Relevance issues
    if (audit.relevance.overallScore < 0.3) {
      issues.push(`Low relevance score (${(audit.relevance.overallScore * 100).toFixed(1)}%)`);
    }

    // Keyword issues
    const totalKeywords = Object.values(audit.content.keywords).reduce((sum, count) => sum + count, 0);
    if (totalKeywords < 5) {
      issues.push(`Few relevant keywords found (${totalKeywords})`);
    }

    return issues;
  }

  calculateScore(audit) {
    let score = 100;

    // Deduct points for issues
    score -= audit.issues.length * 10;

    // Bonus for good structure
    if (audit.structure.hasYamlFrontmatter) score += 5;
    if (audit.structure.fileNaming) score += 5;

    // Bonus for relevance
    score += audit.relevance.overallScore * 20;

    // Bonus for appropriate length
    if (audit.content.length >= 200 && audit.content.length <= 2000) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  generateReport() {
    // Calculate averages
    this.auditResults.summary.avgFileSize = this.auditResults.summary.totalSize / this.auditResults.summary.totalFiles;

    const report = {
      timestamp: new Date().toISOString(),
      summary: this.auditResults.summary,
      analysis: this.generateAnalysis(),
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  generateAnalysis() {
    return {
      contentQuality: 'Analysis pending - run full audit first',
      structureCompliance: 'Analysis pending - run full audit first',
      relevanceScore: 'Analysis pending - run full audit first',
      curriculumCoverage: 'Analysis pending - run full audit first'
    };
  }

  generateRecommendations() {
    return [
      'Run full audit to generate specific recommendations',
      'Focus on content quality over quantity',
      'Ensure curriculum-specific terminology',
      'Standardize metadata across all files'
    ];
  }
}

async function runSystematicAudit() {
  console.log('🔍 STARTING SYSTEMATIC KNOWLEDGE BASE AUDIT');
  console.log('=' .repeat(60));
  
  const knowledgeBaseDir = path.join(__dirname, 'thandi_knowledge_base');
  
  if (!fs.existsSync(knowledgeBaseDir)) {
    console.error('❌ Knowledge base directory not found:', knowledgeBaseDir);
    return;
  }

  const auditor = new KnowledgeBaseAuditor();
  
  console.log('📁 Scanning knowledge base structure...');
  const auditResults = await auditor.auditDirectory(knowledgeBaseDir);
  
  console.log('📊 Generating audit report...');
  const report = auditor.generateReport();
  
  // Save detailed results
  fs.writeFileSync('knowledge-base-audit-results.json', JSON.stringify({
    auditResults,
    report
  }, null, 2));
  
  console.log('\n📋 AUDIT SUMMARY');
  console.log('-' .repeat(30));
  console.log(`Total Files: ${report.summary.totalFiles}`);
  console.log(`Total Directories: ${report.summary.totalDirectories}`);
  console.log(`Total Size: ${(report.summary.totalSize / 1024).toFixed(1)} KB`);
  console.log(`Average File Size: ${(report.summary.avgFileSize).toFixed(0)} bytes`);
  
  console.log('\n✅ Audit complete! Results saved to knowledge-base-audit-results.json');
  console.log('📄 Run detailed analysis next...');
  
  return { auditResults, report };
}

// Export for use in other scripts
export { KnowledgeBaseAuditor, runSystematicAudit };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSystematicAudit().catch(console.error);
}