#!/usr/bin/env node

/**
 * Framework Directory Analysis
 * Analyzes all framework directories to assess relevance, quality, and optimization opportunities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Framework directory analysis
function analyzeFrameworkDirectory(dirPath, dirName) {
  const analysis = {
    name: dirName,
    path: dirPath,
    exists: false,
    fileCount: 0,
    files: [],
    formats: {},
    totalSize: 0,
    relevanceScore: 0,
    qualityScore: 0,
    recommendations: []
  };

  try {
    if (!fs.existsSync(dirPath)) {
      return analysis;
    }

    analysis.exists = true;
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    files.forEach(file => {
      if (file.isFile()) {
        const filePath = path.join(dirPath, file.name);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file.name).toLowerCase();
        
        analysis.files.push({
          name: file.name,
          size: stats.size,
          extension: ext,
          lastModified: stats.mtime
        });
        
        analysis.fileCount++;
        analysis.totalSize += stats.size;
        analysis.formats[ext] = (analysis.formats[ext] || 0) + 1;
      }
    });

    // Calculate relevance score based on directory name and content
    analysis.relevanceScore = calculateRelevanceScore(dirName, analysis.files);
    analysis.qualityScore = calculateQualityScore(analysis.files, analysis.totalSize);
    analysis.recommendations = generateRecommendations(analysis);

  } catch (error) {
    console.error(`Error analyzing ${dirName}:`, error.message);
  }

  return analysis;
}

// Calculate relevance score (0-100) based on how important this is for Thandi's core mission
function calculateRelevanceScore(dirName, files) {
  const highRelevanceKeywords = [
    'university', 'career', 'curriculum', 'nsfas', 'bursary', 'scholarship',
    'pathways', 'tvet', 'seta', 'caps', 'ieb'
  ];
  
  const mediumRelevanceKeywords = [
    'private', 'institution', 'framework', 'application', 'decision'
  ];
  
  const lowRelevanceKeywords = [
    'qa', 'setup', 'guide', 'openai', 'misconception', '4ir', 'future'
  ];

  let score = 0;
  const lowerName = dirName.toLowerCase();

  // Check directory name relevance
  if (highRelevanceKeywords.some(keyword => lowerName.includes(keyword))) {
    score += 60;
  } else if (mediumRelevanceKeywords.some(keyword => lowerName.includes(keyword))) {
    score += 30;
  } else if (lowRelevanceKeywords.some(keyword => lowerName.includes(keyword))) {
    score += 10;
  }

  // Bonus for having actual content files
  if (files.some(f => f.extension === '.md')) score += 20;
  if (files.some(f => f.extension === '.json')) score += 15;
  if (files.some(f => f.extension === '.html')) score += 10;

  // Penalty for being empty or having only spec files
  if (files.length === 0) score = 0;
  if (files.every(f => f.name.includes('SPEC') || f.name.includes('README'))) {
    score = Math.max(5, score - 30);
  }

  return Math.min(100, score);
}

// Calculate quality score based on file structure and content
function calculateQualityScore(files, totalSize) {
  if (files.length === 0) return 0;

  let score = 50; // Base score

  // Prefer markdown files for RAG optimization
  const mdFiles = files.filter(f => f.extension === '.md');
  if (mdFiles.length > 0) score += 20;

  // Prefer structured content over large files
  const avgFileSize = totalSize / files.length;
  if (avgFileSize < 5000) score += 15; // Good for chunking
  if (avgFileSize > 20000) score -= 15; // Too large for optimal RAG

  // Prefer recent updates
  const recentFiles = files.filter(f => {
    const daysSinceUpdate = (Date.now() - f.lastModified.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate < 90; // Updated in last 3 months
  });
  if (recentFiles.length > 0) score += 10;

  // Penalty for mixed formats (harder to maintain)
  const formatCount = Object.keys(files.reduce((acc, f) => {
    acc[f.extension] = true;
    return acc;
  }, {})).length;
  if (formatCount > 2) score -= 10;

  return Math.max(0, Math.min(100, score));
}

// Generate recommendations for each directory
function generateRecommendations(analysis) {
  const recommendations = [];

  if (analysis.relevanceScore < 30) {
    recommendations.push('ARCHIVE: Low relevance to core mission');
  }

  if (analysis.qualityScore < 40) {
    recommendations.push('IMPROVE: Poor content quality or structure');
  }

  if (analysis.fileCount === 0) {
    recommendations.push('DELETE: Empty directory');
  }

  if (analysis.files.every(f => f.name.includes('SPEC'))) {
    recommendations.push('ARCHIVE: Only specification files, no user content');
  }

  const hasLargeFiles = analysis.files.some(f => f.size > 20000);
  if (hasLargeFiles) {
    recommendations.push('OPTIMIZE: Break large files into smaller chunks');
  }

  const hasMultipleFormats = Object.keys(analysis.formats).length > 2;
  if (hasMultipleFormats) {
    recommendations.push('STANDARDIZE: Convert to consistent format (preferably .md)');
  }

  if (analysis.relevanceScore >= 70 && analysis.qualityScore >= 60) {
    recommendations.push('KEEP: High value content');
  }

  if (analysis.relevanceScore >= 50 && analysis.qualityScore < 60) {
    recommendations.push('IMPROVE: Good relevance but needs quality improvements');
  }

  return recommendations;
}

// Main analysis function
async function analyzeAllFrameworks() {
  console.log('🔍 FRAMEWORK DIRECTORY ANALYSIS');
  console.log('===============================\n');

  const knowledgeBaseDir = path.join(__dirname, 'thandi_knowledge_base');
  const frameworkDirs = [
    '4ir_careers_framework',
    'busary_scholarship_framework',
    'career_misconceptions_framework',
    'critical_skills_framework',
    'curriculum_gates',
    'decision_making_framework',
    'future_trends_framework',
    'healthcare_careers',
    'nsc_framework',
    'nsfas_framework',
    'openai_setup_guide',
    'pathways',
    'private_higher_ed',
    'private_institutions',
    'qa_framework',
    'rpl_framework',
    'saqa_framework',
    'seta_learnership_framework',
    'seta_pathways',
    'shared',
    'tvet_framework',
    'tvet_pathways',
    'university_framework',
    'university_pathways'
  ];

  const analyses = [];
  let totalFiles = 0;
  let totalSize = 0;

  // Analyze each framework directory
  frameworkDirs.forEach(dirName => {
    const dirPath = path.join(knowledgeBaseDir, dirName);
    const analysis = analyzeFrameworkDirectory(dirPath, dirName);
    analyses.push(analysis);
    totalFiles += analysis.fileCount;
    totalSize += analysis.totalSize;
  });

  // Sort by relevance score (highest first)
  analyses.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Display results
  console.log('📊 FRAMEWORK ANALYSIS RESULTS:\n');
  
  analyses.forEach(analysis => {
    const status = getStatusIcon(analysis);
    console.log(`${status} ${analysis.name}`);
    console.log(`   Relevance: ${analysis.relevanceScore}/100 | Quality: ${analysis.qualityScore}/100`);
    console.log(`   Files: ${analysis.fileCount} | Size: ${(analysis.totalSize / 1024).toFixed(1)}KB`);
    console.log(`   Formats: ${Object.keys(analysis.formats).join(', ') || 'none'}`);
    
    if (analysis.recommendations.length > 0) {
      console.log(`   Recommendations: ${analysis.recommendations.join(', ')}`);
    }
    console.log('');
  });

  // Summary statistics
  console.log('📈 SUMMARY STATISTICS:');
  console.log(`Total Framework Directories: ${analyses.length}`);
  console.log(`Total Files: ${totalFiles}`);
  console.log(`Total Size: ${(totalSize / 1024 / 1024).toFixed(2)}MB\n`);

  // Categorize directories
  const highValue = analyses.filter(a => a.relevanceScore >= 70);
  const mediumValue = analyses.filter(a => a.relevanceScore >= 40 && a.relevanceScore < 70);
  const lowValue = analyses.filter(a => a.relevanceScore < 40);

  console.log('🎯 CATEGORIZATION:');
  console.log(`✅ High Value (Keep): ${highValue.length} directories`);
  console.log(`⚠️  Medium Value (Review): ${mediumValue.length} directories`);
  console.log(`❌ Low Value (Archive/Delete): ${lowValue.length} directories\n`);

  // Optimization recommendations
  console.log('💡 OPTIMIZATION RECOMMENDATIONS:\n');

  console.log('🗂️  HIGH VALUE DIRECTORIES (Keep & Optimize):');
  highValue.forEach(a => {
    console.log(`   • ${a.name} (${a.relevanceScore}/100) - ${a.recommendations.join(', ')}`);
  });

  console.log('\n📋 MEDIUM VALUE DIRECTORIES (Review & Improve):');
  mediumValue.forEach(a => {
    console.log(`   • ${a.name} (${a.relevanceScore}/100) - ${a.recommendations.join(', ')}`);
  });

  console.log('\n🗑️  LOW VALUE DIRECTORIES (Archive/Delete):');
  lowValue.forEach(a => {
    console.log(`   • ${a.name} (${a.relevanceScore}/100) - ${a.recommendations.join(', ')}`);
  });

  // Calculate potential space savings
  const archiveCandidates = lowValue.concat(
    analyses.filter(a => a.recommendations.includes('ARCHIVE: Only specification files, no user content'))
  );
  const potentialSavings = archiveCandidates.reduce((sum, a) => sum + a.totalSize, 0);

  console.log('\n📊 OPTIMIZATION IMPACT:');
  console.log(`Directories to Archive: ${archiveCandidates.length}/${analyses.length}`);
  console.log(`Potential Space Savings: ${(potentialSavings / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Maintenance Reduction: ${((archiveCandidates.length / analyses.length) * 100).toFixed(1)}%`);

  return {
    analyses,
    summary: {
      total: analyses.length,
      highValue: highValue.length,
      mediumValue: mediumValue.length,
      lowValue: lowValue.length,
      totalFiles,
      totalSize,
      potentialSavings
    }
  };
}

// Get status icon based on scores
function getStatusIcon(analysis) {
  if (analysis.relevanceScore >= 70) return '✅';
  if (analysis.relevanceScore >= 40) return '⚠️ ';
  return '❌';
}

// Run the analysis
analyzeAllFrameworks()
  .then(results => {
    console.log('\n🎉 Analysis complete!');
    console.log('Ready to discuss optimization strategy.');
  })
  .catch(console.error);