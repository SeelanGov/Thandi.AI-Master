#!/usr/bin/env node

/**
 * ADMIN PANEL UI/UX AUDIT
 * Audits admin and school dashboard pages for branding and UI consistency
 */

const fs = require('fs');

function auditAdminComponent(filePath, componentName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Branding Consistency Checks
    const brandingChecks = [
      {
        name: 'Thandi Branding',
        check: () => {
          const hasIncorrectThandi = content.includes('THANDI') || content.includes('thandi');
          const hasCorrectThandi = content.includes('Thandi');
          
          if (hasIncorrectThandi) return 'Found incorrect "THANDI" or "thandi" - should be "Thandi"';
          if (!hasCorrectThandi && content.includes('school')) return 'Missing "Thandi" branding in school context';
          return null;
        }
      },
      {
        name: 'Title Consistency',
        check: () => {
          const titles = content.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/g) || [];
          const inconsistentTitles = titles.filter(title => 
            title.includes('THANDI') || 
            (title.includes('School') && !title.includes('Thandi'))
          );
          
          if (inconsistentTitles.length > 0) {
            return `Inconsistent titles: ${inconsistentTitles.slice(0, 2).join(', ')}`;
          }
          return null;
        }
      }
    ];
    
    // UI Consistency Checks
    const uiChecks = [
      {
        name: 'Color Consistency',
        check: () => {
          const hasBlueColors = content.match(/(bg-|text-|border-)blue-\d+/g);
          const hasThandiColors = content.includes('thandi-teal') || content.includes('thandi-gold');
          
          if (hasBlueColors && hasBlueColors.length > 0) {
            return `Found ${hasBlueColors.length} blue color instances - should use Thandi colors`;
          }
          if (!hasThandiColors) return 'Missing Thandi color scheme';
          return null;
        }
      },
      {
        name: 'Button Consistency',
        check: () => {
          const buttons = content.match(/className="[^"]*(?:bg-|border-)[^"]*"/g) || [];
          const inconsistentButtons = buttons.filter(btn => 
            btn.includes('bg-blue') || 
            (!btn.includes('thandi-') && (btn.includes('bg-') || btn.includes('border-')))
          );
          
          if (inconsistentButtons.length > 0) {
            return `Found ${inconsistentButtons.length} buttons not using Thandi design system`;
          }
          return null;
        }
      },
      {
        name: 'Responsive Design',
        check: () => {
          const hasResponsive = content.includes('sm:') || content.includes('md:') || content.includes('lg:');
          const hasMobileFirst = content.includes('max-w-') || content.includes('px-4');
          
          if (!hasResponsive) return 'Missing responsive design classes';
          if (!hasMobileFirst) return 'Not following mobile-first approach';
          return null;
        }
      },
      {
        name: 'Loading States',
        check: () => {
          const hasLoading = content.includes('loading') || content.includes('Loading');
          const hasSpinner = content.includes('animate-spin') || content.includes('spinner');
          
          if (content.includes('fetch') || content.includes('useEffect')) {
            if (!hasLoading) return 'Missing loading states for async operations';
            if (!hasSpinner) return 'Missing loading spinner/indicator';
          }
          return null;
        }
      },
      {
        name: 'Error Handling',
        check: () => {
          const hasErrorHandling = content.includes('error') || content.includes('catch') || content.includes('try');
          const hasErrorDisplay = content.includes('error') && content.includes('message');
          
          if (content.includes('fetch') || content.includes('async')) {
            if (!hasErrorHandling) return 'Missing error handling for async operations';
            if (!hasErrorDisplay) return 'Missing error message display';
          }
          return null;
        }
      },
      {
        name: 'Accessibility',
        check: () => {
          const hasAriaLabels = content.includes('aria-') || content.includes('role=');
          const hasAltText = content.includes('alt=');
          const hasFormLabels = content.includes('<label') || content.includes('aria-label');
          
          if (content.includes('<input') && !hasFormLabels) return 'Missing form labels';
          if (content.includes('<img') && !hasAltText) return 'Missing alt text for images';
          if (content.includes('button') && !hasAriaLabels && content.includes('icon')) return 'Missing aria labels for icon buttons';
          return null;
        }
      }
    ];
    
    // Run branding checks
    brandingChecks.forEach(check => {
      const result = check.check();
      if (result) {
        issues.push({ type: 'Branding', category: check.name, issue: result });
      }
    });
    
    // Run UI checks
    uiChecks.forEach(check => {
      const result = check.check();
      if (result) {
        issues.push({ type: 'UI', category: check.name, issue: result });
      }
    });
    
    return issues;
  } catch (error) {
    return [{ type: 'Error', category: 'File Access', issue: error.message }];
  }
}

function runAdminPanelAudit() {
  console.log('🏫 ADMIN PANEL UI/UX AUDIT');
  console.log('==========================');
  console.log('');
  
  const adminComponents = [
    { path: 'app/admin/page.js', name: 'Admin Page' },
    { path: 'app/school/claim/page.js', name: 'School Claim Page' },
    { path: 'app/school/verify/page.js', name: 'School Verify Page' },
    { path: 'app/school/dashboard/simple-page.js', name: 'School Dashboard' }
  ];
  
  let totalIssues = 0;
  const auditResults = {};
  
  console.log('🔍 AUDITING ADMIN COMPONENTS');
  console.log('=============================');
  
  adminComponents.forEach(component => {
    if (fs.existsSync(component.path)) {
      console.log(`\n🏫 ${component.name} (${component.path})`);
      const issues = auditAdminComponent(component.path, component.name);
      auditResults[component.path] = issues;
      totalIssues += issues.length;
      
      if (issues.length === 0) {
        console.log('   ✅ No issues found');
      } else {
        const brandingIssues = issues.filter(i => i.type === 'Branding');
        const uiIssues = issues.filter(i => i.type === 'UI');
        
        if (brandingIssues.length > 0) {
          console.log(`   🏷️  Branding Issues (${brandingIssues.length}):`);
          brandingIssues.forEach(issue => {
            console.log(`      - ${issue.category}: ${issue.issue}`);
          });
        }
        
        if (uiIssues.length > 0) {
          console.log(`   🎨 UI Issues (${uiIssues.length}):`);
          uiIssues.forEach(issue => {
            console.log(`      - ${issue.category}: ${issue.issue}`);
          });
        }
      }
    } else {
      console.log(`   ❌ File not found: ${component.path}`);
    }
  });
  
  // Overall assessment
  console.log('\n\n📊 ADMIN PANEL AUDIT SUMMARY');
  console.log('=============================');
  console.log(`Total admin components audited: ${adminComponents.length}`);
  console.log(`Total issues found: ${totalIssues}`);
  
  // Categorize issues
  const allIssues = Object.values(auditResults).flat();
  const brandingIssues = allIssues.filter(i => i.type === 'Branding').length;
  const uiIssues = allIssues.filter(i => i.type === 'UI').length;
  
  console.log(`\n📈 Issue Breakdown:`);
  console.log(`   🏷️  Branding Issues: ${brandingIssues}`);
  console.log(`   🎨 UI Issues: ${uiIssues}`);
  
  // Priority recommendations
  console.log('\n🎯 ADMIN PANEL RECOMMENDATIONS');
  console.log('==============================');
  
  if (totalIssues === 0) {
    console.log('🎉 Excellent! Admin panel is consistent and ready.');
    console.log('✅ All branding and UI standards met.');
    console.log('🚀 Ready for deployment!');
  } else if (totalIssues <= 3) {
    console.log('✅ Good overall state with minor issues.');
    console.log('🔧 Address issues for perfect consistency.');
  } else if (totalIssues <= 8) {
    console.log('⚠️  Moderate issues that should be addressed.');
    console.log('🔧 Focus on branding and UI consistency fixes.');
  } else {
    console.log('❌ Significant issues requiring attention.');
    console.log('🛠️  Major admin panel improvements needed.');
  }
  
  // Save detailed results
  fs.writeFileSync('admin-panel-audit-results.json', JSON.stringify(auditResults, null, 2));
  console.log('\n📄 Detailed results saved to: admin-panel-audit-results.json');
  
  return { totalIssues, auditResults };
}

// Run admin panel audit
const { totalIssues, auditResults } = runAdminPanelAudit();
console.log(`\n📅 Admin audit completed: ${new Date().toISOString()}`);
console.log(`🎯 Overall Status: ${totalIssues <= 3 ? 'READY FOR DEPLOYMENT' : 'NEEDS ATTENTION'}`);