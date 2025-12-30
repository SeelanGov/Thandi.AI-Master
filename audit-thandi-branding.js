#!/usr/bin/env node

/**
 * THANDI BRANDING AUDIT
 * Comprehensive check of branding consistency across assessment forms
 */

const fs = require('fs');
const path = require('path');

function auditFile(filePath, fileType) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for inconsistent branding
    const brandingChecks = [
      {
        pattern: /thandi\.ai/gi,
        expected: 'Thandi.ai',
        issue: 'Inconsistent domain casing'
      },
      {
        pattern: /THANDI/g,
        expected: 'Thandi',
        issue: 'All caps THANDI should be Thandi'
      },
      {
        pattern: /thandi(?!\.|\.ai)/gi,
        expected: 'Thandi',
        issue: 'Lowercase thandi should be Thandi'
      },
      {
        pattern: /"Student Registration"/g,
        expected: 'Thandi Student Registration',
        issue: 'Missing Thandi branding in title'
      },
      {
        pattern: /"Career Assessment"/g,
        expected: 'Thandi Career Assessment',
        issue: 'Missing Thandi branding in title'
      }
    ];
    
    brandingChecks.forEach(check => {
      const matches = content.match(check.pattern);
      if (matches) {
        matches.forEach(match => {
          if (match !== check.expected && !match.includes('thandi.ai')) {
            issues.push({
              type: check.issue,
              found: match,
              expected: check.expected,
              line: content.substring(0, content.indexOf(match)).split('\n').length
            });
          }
        });
      }
    });
    
    return issues;
  } catch (error) {
    return [{ type: 'File read error', error: error.message }];
  }
}

function auditBranding() {
  console.log('🎨 THANDI BRANDING AUDIT');
  console.log('========================');
  console.log('');
  
  const filesToAudit = [
    { path: 'components/BulletproofStudentRegistration.jsx', type: 'component' },
    { path: 'app/assessment/page.jsx', type: 'page' },
    { path: 'app/assessment/components/AssessmentForm.jsx', type: 'component' },
    { path: 'app/assessment/components/GradeSelector.jsx', type: 'component' },
    { path: 'app/layout.js', type: 'layout' },
    { path: 'app/globals.css', type: 'styles' }
  ];
  
  let totalIssues = 0;
  const auditResults = {};
  
  filesToAudit.forEach(file => {
    if (fs.existsSync(file.path)) {
      console.log(`🔍 Auditing: ${file.path}`);
      const issues = auditFile(file.path, file.type);
      auditResults[file.path] = issues;
      totalIssues += issues.length;
      
      if (issues.length === 0) {
        console.log('   ✅ No branding issues found');
      } else {
        console.log(`   ⚠️  Found ${issues.length} branding issues:`);
        issues.forEach(issue => {
          console.log(`      - Line ${issue.line}: ${issue.type}`);
          console.log(`        Found: "${issue.found}" | Expected: "${issue.expected}"`);
        });
      }
    } else {
      console.log(`   ❌ File not found: ${file.path}`);
    }
    console.log('');
  });
  
  console.log('📊 AUDIT SUMMARY');
  console.log('================');
  console.log(`Total files audited: ${filesToAudit.length}`);
  console.log(`Total branding issues: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('🎉 All branding is consistent!');
  } else {
    console.log('⚠️  Branding issues need attention before deployment');
  }
  
  return { auditResults, totalIssues };
}

// Run audit
const { auditResults, totalIssues } = auditBranding();
console.log(`\n📅 Audit completed: ${new Date().toISOString()}`);

// Export results for fixing
if (totalIssues > 0) {
  fs.writeFileSync('branding-audit-results.json', JSON.stringify(auditResults, null, 2));
  console.log('📄 Detailed results saved to: branding-audit-results.json');
}