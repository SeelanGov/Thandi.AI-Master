#!/usr/bin/env node

/**
 * COMPREHENSIVE UI/UX AUDIT
 * Audits design consistency, functionality, and user experience
 */

const fs = require('fs');
const path = require('path');

function auditUIComponent(filePath, componentName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // UI Consistency Checks
    const uiChecks = [
      {
        name: 'Button Consistency',
        pattern: /className="[^"]*btn[^"]*"/g,
        validator: (matches) => {
          const inconsistent = matches.filter(m => 
            !m.includes('btn-assessment-primary') && 
            !m.includes('btn-assessment-secondary') &&
            !m.includes('btn-assessment-gold') &&
            !m.includes('bg-blue-500') // Temporary buttons
          );
          return inconsistent.length === 0 ? null : `Inconsistent button classes: ${inconsistent.slice(0,3).join(', ')}`;
        }
      },
      {
        name: 'Input Field Consistency',
        pattern: /input[^>]*className="[^"]*"/g,
        validator: (matches) => {
          const hasConsistentPadding = matches.every(m => m.includes('px-4 py-3') || m.includes('p-4'));
          const hasConsistentBorder = matches.every(m => m.includes('border') && m.includes('rounded'));
          const hasMinHeight = matches.every(m => m.includes('min-h-[48px]'));
          
          if (!hasConsistentPadding) return 'Inconsistent input padding';
          if (!hasConsistentBorder) return 'Inconsistent input borders';
          if (!hasMinHeight) return 'Missing minimum touch target height';
          return null;
        }
      },
      {
        name: 'Color Consistency',
        pattern: /(bg-|text-|border-)(blue|green|red|gray|teal)-\d+/g,
        validator: (matches) => {
          const colors = [...new Set(matches.map(m => m.match(/(blue|green|red|gray|teal)/)[1]))];
          const hasThandi = content.includes('--thandi-teal') || content.includes('thandi-teal');
          if (colors.includes('blue') && !hasThandi) return 'Using blue instead of Thandi teal';
          return null;
        }
      },
      {
        name: 'Responsive Design',
        pattern: /(sm:|md:|lg:)/g,
        validator: (matches) => {
          const hasResponsive = matches.length > 0;
          const hasMobileFirst = content.includes('sm:') || content.includes('max-w-');
          if (!hasResponsive) return 'Missing responsive design classes';
          if (!hasMobileFirst) return 'Not following mobile-first approach';
          return null;
        }
      },
      {
        name: 'Accessibility',
        pattern: /(aria-|role=|tabindex|alt=)/g,
        validator: (matches) => {
          const hasLabels = content.includes('<label') || content.includes('aria-label');
          const hasRequiredIndicators = content.includes('required') || content.includes('*');
          if (!hasLabels && content.includes('<input')) return 'Missing form labels';
          return null;
        }
      }
    ];
    
    // Functionality Checks
    const functionalityChecks = [
      {
        name: 'Error Handling',
        check: () => {
          const hasErrorStates = content.includes('error') || content.includes('catch') || content.includes('try');
          const hasUserFeedback = content.includes('alert') || content.includes('toast') || content.includes('error-message');
          if (!hasErrorStates) return 'Missing error handling';
          if (!hasUserFeedback) return 'Missing user error feedback';
          return null;
        }
      },
      {
        name: 'Loading States',
        check: () => {
          const hasLoading = content.includes('loading') || content.includes('Loading') || content.includes('spinner');
          const hasDisabledStates = content.includes('disabled') || content.includes('isLoading');
          if (content.includes('fetch') || content.includes('axios') || content.includes('submit')) {
            if (!hasLoading) return 'Missing loading states for async operations';
            if (!hasDisabledStates) return 'Missing disabled states during loading';
          }
          return null;
        }
      },
      {
        name: 'Form Validation',
        check: () => {
          const hasValidation = content.includes('required') || content.includes('validate') || content.includes('error');
          const hasClientValidation = content.includes('onChange') || content.includes('onBlur');
          if (content.includes('<form') || content.includes('input')) {
            if (!hasValidation) return 'Missing form validation';
            if (!hasClientValidation) return 'Missing real-time validation';
          }
          return null;
        }
      },
      {
        name: 'Data Persistence',
        check: () => {
          const hasStorage = content.includes('localStorage') || content.includes('sessionStorage');
          const hasStateManagement = content.includes('useState') || content.includes('useEffect');
          if (content.includes('assessment') || content.includes('form')) {
            if (!hasStorage) return 'Missing data persistence';
            if (!hasStateManagement) return 'Missing proper state management';
          }
          return null;
        }
      }
    ];
    
    // Run UI checks
    uiChecks.forEach(check => {
      const matches = content.match(check.pattern) || [];
      const result = check.validator(matches);
      if (result) {
        issues.push({ type: 'UI', category: check.name, issue: result });
      }
    });
    
    // Run functionality checks
    functionalityChecks.forEach(check => {
      const result = check.check();
      if (result) {
        issues.push({ type: 'Functionality', category: check.name, issue: result });
      }
    });
    
    return issues;
  } catch (error) {
    return [{ type: 'Error', category: 'File Access', issue: error.message }];
  }
}

function auditCSS(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // CSS Design System Checks
    const cssChecks = [
      {
        name: 'Design System Variables',
        check: () => {
          const hasThemeVars = content.includes('--thandi-') && content.includes(':root');
          const hasConsistentSpacing = content.includes('--space-') || content.includes('space-y-') || content.includes('gap-');
          const hasTypography = content.includes('--font-') || content.includes('font-');
          
          if (!hasThemeVars) return 'Missing Thandi design system variables';
          if (!hasConsistentSpacing) return 'Inconsistent spacing system';
          if (!hasTypography) return 'Missing typography system';
          return null;
        }
      },
      {
        name: 'Mobile Responsiveness',
        check: () => {
          const hasMobileBreakpoints = content.includes('@media') && content.includes('max-width');
          const hasTouchTargets = content.includes('min-height: 48px') || content.includes('min-h-[48px]');
          const hasMobileFonts = content.includes('font-size: 16px') || content.includes('text-base');
          
          if (!hasMobileBreakpoints) return 'Missing mobile breakpoints';
          if (!hasTouchTargets) return 'Missing proper touch targets';
          if (!hasMobileFonts) return 'Missing mobile-friendly font sizes';
          return null;
        }
      },
      {
        name: 'Animation & Transitions',
        check: () => {
          const hasTransitions = content.includes('transition') || content.includes('animate-');
          const hasHoverStates = content.includes(':hover') || content.includes('hover:');
          const hasFocusStates = content.includes(':focus') || content.includes('focus:');
          
          if (!hasTransitions) return 'Missing smooth transitions';
          if (!hasHoverStates) return 'Missing hover states';
          if (!hasFocusStates) return 'Missing focus states for accessibility';
          return null;
        }
      }
    ];
    
    cssChecks.forEach(check => {
      const result = check.check();
      if (result) {
        issues.push({ type: 'CSS', category: check.name, issue: result });
      }
    });
    
    return issues;
  } catch (error) {
    return [{ type: 'Error', category: 'CSS Access', issue: error.message }];
  }
}

function runComprehensiveAudit() {
  console.log('🎨 COMPREHENSIVE UI/UX AUDIT');
  console.log('=============================');
  console.log('');
  
  const componentsToAudit = [
    { path: 'components/BulletproofStudentRegistration.jsx', name: 'Student Registration' },
    { path: 'app/assessment/components/AssessmentForm.jsx', name: 'Assessment Form' },
    { path: 'app/assessment/components/GradeSelector.jsx', name: 'Grade Selector' },
    { path: 'app/assessment/page.jsx', name: 'Assessment Page' }
  ];
  
  const cssFiles = [
    { path: 'app/globals.css', name: 'Global Styles' }
  ];
  
  let totalIssues = 0;
  const auditResults = {};
  
  // Audit React components
  console.log('🔍 AUDITING REACT COMPONENTS');
  console.log('=============================');
  componentsToAudit.forEach(component => {
    if (fs.existsSync(component.path)) {
      console.log(`\n📱 ${component.name} (${component.path})`);
      const issues = auditUIComponent(component.path, component.name);
      auditResults[component.path] = issues;
      totalIssues += issues.length;
      
      if (issues.length === 0) {
        console.log('   ✅ No issues found');
      } else {
        const uiIssues = issues.filter(i => i.type === 'UI');
        const funcIssues = issues.filter(i => i.type === 'Functionality');
        
        if (uiIssues.length > 0) {
          console.log(`   🎨 UI Issues (${uiIssues.length}):`);
          uiIssues.forEach(issue => {
            console.log(`      - ${issue.category}: ${issue.issue}`);
          });
        }
        
        if (funcIssues.length > 0) {
          console.log(`   ⚙️  Functionality Issues (${funcIssues.length}):`);
          funcIssues.forEach(issue => {
            console.log(`      - ${issue.category}: ${issue.issue}`);
          });
        }
      }
    } else {
      console.log(`   ❌ File not found: ${component.path}`);
    }
  });
  
  // Audit CSS files
  console.log('\n\n🎨 AUDITING CSS FILES');
  console.log('=====================');
  cssFiles.forEach(cssFile => {
    if (fs.existsSync(cssFile.path)) {
      console.log(`\n🎨 ${cssFile.name} (${cssFile.path})`);
      const issues = auditCSS(cssFile.path);
      auditResults[cssFile.path] = issues;
      totalIssues += issues.length;
      
      if (issues.length === 0) {
        console.log('   ✅ No issues found');
      } else {
        issues.forEach(issue => {
          console.log(`   - ${issue.category}: ${issue.issue}`);
        });
      }
    }
  });
  
  // Overall assessment
  console.log('\n\n📊 COMPREHENSIVE AUDIT SUMMARY');
  console.log('===============================');
  console.log(`Total components audited: ${componentsToAudit.length}`);
  console.log(`Total CSS files audited: ${cssFiles.length}`);
  console.log(`Total issues found: ${totalIssues}`);
  
  // Categorize issues
  const allIssues = Object.values(auditResults).flat();
  const uiIssues = allIssues.filter(i => i.type === 'UI').length;
  const funcIssues = allIssues.filter(i => i.type === 'Functionality').length;
  const cssIssues = allIssues.filter(i => i.type === 'CSS').length;
  
  console.log(`\n📈 Issue Breakdown:`);
  console.log(`   🎨 UI/Design Issues: ${uiIssues}`);
  console.log(`   ⚙️  Functionality Issues: ${funcIssues}`);
  console.log(`   🎨 CSS Issues: ${cssIssues}`);
  
  // Priority recommendations
  console.log('\n🎯 PRIORITY RECOMMENDATIONS');
  console.log('===========================');
  
  if (totalIssues === 0) {
    console.log('🎉 Excellent! No critical issues found.');
    console.log('✅ UI/UX is consistent and functional.');
    console.log('🚀 Ready for deployment!');
  } else if (totalIssues <= 5) {
    console.log('✅ Good overall state with minor issues.');
    console.log('🔧 Address issues before deployment for best UX.');
  } else if (totalIssues <= 15) {
    console.log('⚠️  Moderate issues that should be addressed.');
    console.log('🔧 Focus on functionality and consistency fixes.');
  } else {
    console.log('❌ Significant issues requiring attention.');
    console.log('🛠️  Major UI/UX improvements needed before deployment.');
  }
  
  // Save detailed results
  fs.writeFileSync('ui-ux-audit-results.json', JSON.stringify(auditResults, null, 2));
  console.log('\n📄 Detailed results saved to: ui-ux-audit-results.json');
  
  return { totalIssues, auditResults };
}

// Run comprehensive audit
const { totalIssues, auditResults } = runComprehensiveAudit();
console.log(`\n📅 Audit completed: ${new Date().toISOString()}`);
console.log(`🎯 Overall Status: ${totalIssues <= 5 ? 'READY FOR DEPLOYMENT' : 'NEEDS ATTENTION'}`);