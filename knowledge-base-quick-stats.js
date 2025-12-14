/**
 * Quick Knowledge Base Statistics
 * Provides actionable insights for immediate improvements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function analyzeKnowledgeBase() {
  const knowledgeBaseDir = path.join(__dirname, 'thandi_knowledge_base');
  
  const stats = {
    totalDirectories: 0,
    totalFiles: 0,
    byFormat: {},
    byCurriculum: {
      ieb: { files: 0, subjects: 0, universities: 0 },
      caps: { files: 0, subjects: 0, universities: 0 },
      shared: { files: 0 }
    },
    highPriorityDirs: [],
    lowPriorityDirs: [],
    recommendations: []
  };

  function scanDirectory(dirPath, relativePath = '') {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const itemRelativePath = path.join(relativePath, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        stats.totalDirectories++;
        
        // Categorize directories
        if (item === 'ieb' || item === 'caps') {
          stats.highPriorityDirs.push(itemRelativePath);
          scanDirectory(fullPath, itemRelativePath);
        } else if (['university_framework', 'pathways', 'nsfas_framework'].includes(item)) {
          stats.highPriorityDirs.push(itemRelativePath);
          scanDirectory(fullPath, itemRelativePath);
        } else if (item.includes('framework') || item.includes('pathways')) {
          stats.lowPriorityDirs.push(itemRelativePath);
          scanDirectory(fullPath, itemRelativePath);
        } else {
          scanDirectory(fullPath, itemRelativePath);
        }
      } else {
        stats.totalFiles++;
        
        // Count by format
        const ext = path.extname(item);
        stats.byFormat[ext] = (stats.byFormat[ext] || 0) + 1;
        
        // Count by curriculum
        if (relativePath.includes('ieb')) {
          stats.byCurriculum.ieb.files++;
          if (relativePath.includes('subjects')) stats.byCurriculum.ieb.subjects++;
          if (relativePath.includes('universities')) stats.byCurriculum.ieb.universities++;
        } else if (relativePath.includes('caps')) {
          stats.byCurriculum.caps.files++;
          if (relativePath.includes('subjects')) stats.byCurriculum.caps.subjects++;
          if (relativePath.includes('universities')) stats.byCurriculum.caps.universities++;
        } else {
          stats.byCurriculum.shared.files++;
        }
      }
    }
  }

  scanDirectory(knowledgeBaseDir);
  
  // Generate recommendations
  generateRecommendations(stats);
  
  return stats;
}

function generateRecommendations(stats) {
  const recommendations = [];
  
  // Critical curriculum imbalance
  if (stats.byCurriculum.caps.files < stats.byCurriculum.ieb.files / 2) {
    recommendations.push({
      priority: 'CRITICAL',
      issue: 'CAPS curriculum severely underrepresented',
      action: `Add ${stats.byCurriculum.ieb.subjects - stats.byCurriculum.caps.subjects} CAPS subject files`,
      impact: 'Will fix 0-source CAPS queries causing 58.3% accuracy'
    });
  }
  
  // University coverage gap
  if (stats.byCurriculum.caps.universities === 0) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'No CAPS university requirements',
      action: `Add ${stats.byCurriculum.ieb.universities} CAPS university files`,
      impact: 'Will enable university comparison queries'
    });
  }
  
  // Content complexity
  if (stats.lowPriorityDirs.length > 15) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Too many low-priority framework directories',
      action: `Archive ${stats.lowPriorityDirs.length - 10} least-used directories`,
      impact: 'Will reduce maintenance overhead and improve focus'
    });
  }
  
  // Format inconsistency
  const mdFiles = stats.byFormat['.md'] || 0;
  const totalFiles = stats.totalFiles;
  if (mdFiles / totalFiles < 0.5) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Mixed file formats affecting RAG performance',
      action: 'Convert high-value JSON/HTML files to Markdown',
      impact: 'Will improve embedding generation and retrieval'
    });
  }
  
  stats.recommendations = recommendations;
}

function printReport(stats) {
  console.log('📊 KNOWLEDGE BASE QUICK STATISTICS');
  console.log('=' .repeat(50));
  
  console.log('\n📁 STRUCTURE OVERVIEW');
  console.log(`Total Directories: ${stats.totalDirectories}`);
  console.log(`Total Files: ${stats.totalFiles}`);
  
  console.log('\n📄 FILE FORMATS');
  Object.entries(stats.byFormat).forEach(([ext, count]) => {
    console.log(`  ${ext || 'no extension'}: ${count} files`);
  });
  
  console.log('\n🎓 CURRICULUM COVERAGE');
  console.log(`IEB: ${stats.byCurriculum.ieb.files} files (${stats.byCurriculum.ieb.subjects} subjects, ${stats.byCurriculum.ieb.universities} universities)`);
  console.log(`CAPS: ${stats.byCurriculum.caps.files} files (${stats.byCurriculum.caps.subjects} subjects, ${stats.byCurriculum.caps.universities} universities)`);
  console.log(`Shared: ${stats.byCurriculum.shared.files} files`);
  
  console.log('\n🎯 HIGH PRIORITY DIRECTORIES');
  stats.highPriorityDirs.forEach(dir => console.log(`  ✅ ${dir}`));
  
  console.log('\n⚠️ LOW PRIORITY DIRECTORIES');
  stats.lowPriorityDirs.slice(0, 10).forEach(dir => console.log(`  📦 ${dir}`));
  if (stats.lowPriorityDirs.length > 10) {
    console.log(`  ... and ${stats.lowPriorityDirs.length - 10} more`);
  }
  
  console.log('\n🚨 CRITICAL RECOMMENDATIONS');
  stats.recommendations.forEach((rec, i) => {
    console.log(`\n${i + 1}. [${rec.priority}] ${rec.issue}`);
    console.log(`   Action: ${rec.action}`);
    console.log(`   Impact: ${rec.impact}`);
  });
  
  console.log('\n📋 IMMEDIATE NEXT STEPS');
  console.log('1. Add CAPS subject files to match IEB coverage');
  console.log('2. Add CAPS university requirement files');
  console.log('3. Optimize keywords in existing files');
  console.log('4. Test accuracy improvements');
  
  console.log('\n🎯 SUCCESS TARGET');
  console.log('Improve accuracy from 58.3% to 75%+ by addressing CAPS gap');
}

// Run analysis
const stats = analyzeKnowledgeBase();
printReport(stats);

// Save detailed results
fs.writeFileSync('knowledge-base-stats.json', JSON.stringify(stats, null, 2));
console.log('\n✅ Detailed stats saved to knowledge-base-stats.json');