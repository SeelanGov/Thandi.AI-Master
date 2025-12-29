/**
 * MOBILE UI ISSUES CODE ANALYSIS
 * 
 * Analyzing the codebase for mobile UI issues without browser automation
 */

const fs = require('fs');
const path = require('path');

function analyzeMobileUIIssues() {
  console.log('🔍 ANALYZING MOBILE UI ISSUES IN CODEBASE...');
  
  const issues = {
    brandingSequenceIssues: [],
    responsiveDesignIssues: [],
    registrationFlowIssues: [],
    touchInteractionIssues: [],
    cssIssues: []
  };

  // 1. Analyze BulletproofStudentRegistration component
  console.log('📝 Analyzing BulletproofStudentRegistration.jsx...');
  
  try {
    const registrationContent = fs.readFileSync('components/BulletproofStudentRegistration.jsx', 'utf8');
    
    // Check for mobile-specific CSS classes
    if (!registrationContent.includes('sm:') && !registrationContent.includes('md:') && !registrationContent.includes('lg:')) {
      issues.responsiveDesignIssues.push('BulletproofStudentRegistration: Missing Tailwind responsive breakpoints (sm:, md:, lg:)');
    }
    
    // Check for fixed widths that might cause mobile issues
    const fixedWidthMatches = registrationContent.match(/w-\d+(?!%)/g);
    if (fixedWidthMatches && fixedWidthMatches.length > 0) {
      issues.responsiveDesignIssues.push(`BulletproofStudentRegistration: Found fixed width classes: ${fixedWidthMatches.join(', ')}`);
    }
    
    // Check for proper mobile form layout
    if (!registrationContent.includes('flex-col') && !registrationContent.includes('grid')) {
      issues.responsiveDesignIssues.push('BulletproofStudentRegistration: No mobile-friendly layout (flex-col or grid) detected');
    }
    
    // Check for touch-friendly button sizes
    if (!registrationContent.includes('py-3') && !registrationContent.includes('py-4')) {
      issues.touchInteractionIssues.push('BulletproofStudentRegistration: Buttons may not have adequate touch target size (missing py-3 or py-4)');
    }
    
    // Check for proper mobile spacing
    if (!registrationContent.includes('px-4') && !registrationContent.includes('px-6')) {
      issues.responsiveDesignIssues.push('BulletproofStudentRegistration: May lack proper mobile padding (missing px-4 or px-6)');
    }
    
    // Check for registration flow completion logic
    if (!registrationContent.includes('onComplete') || !registrationContent.includes('handleRegistrationSubmit')) {
      issues.registrationFlowIssues.push('BulletproofStudentRegistration: Missing proper completion callback or submit handler');
    }
    
    // Check for error handling in registration
    if (!registrationContent.includes('catch') || !registrationContent.includes('error')) {
      issues.registrationFlowIssues.push('BulletproofStudentRegistration: Limited error handling for registration failures');
    }
    
  } catch (error) {
    issues.registrationFlowIssues.push(`Failed to analyze BulletproofStudentRegistration: ${error.message}`);
  }

  // 2. Analyze AssessmentForm component
  console.log('📋 Analyzing AssessmentForm.jsx...');
  
  try {
    const assessmentContent = fs.readFileSync('app/assessment/components/AssessmentForm.jsx', 'utf8');
    
    // Check for proper mobile navigation
    if (!assessmentContent.includes('scroll') || !assessmentContent.includes('scrollTo')) {
      issues.responsiveDesignIssues.push('AssessmentForm: Missing mobile scroll management between steps');
    }
    
    // Check for mobile-friendly step transitions
    if (!assessmentContent.includes('animate-') && !assessmentContent.includes('transition')) {
      issues.responsiveDesignIssues.push('AssessmentForm: No smooth transitions for mobile step changes');
    }
    
    // Check for proper loading states on mobile
    if (!assessmentContent.includes('loading-overlay') || !assessmentContent.includes('backdrop-filter')) {
      issues.responsiveDesignIssues.push('AssessmentForm: Loading overlay may not be mobile-optimized');
    }
    
    // Check for registration completion handling
    if (!assessmentContent.includes('handleStudentRegistration')) {
      issues.registrationFlowIssues.push('AssessmentForm: Missing student registration completion handler');
    }
    
    // Check for URL parameter handling that might cause mobile issues
    if (assessmentContent.includes('initialGrade') && assessmentContent.includes('initialStep')) {
      if (!assessmentContent.includes('useEffect') || !assessmentContent.includes('useState')) {
        issues.registrationFlowIssues.push('AssessmentForm: URL parameter handling may not be properly initialized');
      }
    }
    
  } catch (error) {
    issues.registrationFlowIssues.push(`Failed to analyze AssessmentForm: ${error.message}`);
  }

  // 3. Analyze main assessment page
  console.log('📄 Analyzing assessment page.jsx...');
  
  try {
    const pageContent = fs.readFileSync('app/assessment/page.jsx', 'utf8');
    
    // Check for proper mobile viewport meta tag handling
    if (!pageContent.includes('metadata') || !pageContent.includes('viewport')) {
      issues.responsiveDesignIssues.push('Assessment page: Missing mobile viewport metadata');
    }
    
    // Check for Suspense boundary for mobile loading
    if (!pageContent.includes('Suspense') || !pageContent.includes('BulletproofLoading')) {
      issues.responsiveDesignIssues.push('Assessment page: Missing proper loading boundary for mobile');
    }
    
  } catch (error) {
    issues.registrationFlowIssues.push(`Failed to analyze assessment page: ${error.message}`);
  }

  // 4. Check for global CSS issues
  console.log('🎨 Checking for CSS and styling issues...');
  
  try {
    // Check if Tailwind config exists
    if (fs.existsSync('tailwind.config.js')) {
      const tailwindContent = fs.readFileSync('tailwind.config.js', 'utf8');
      
      if (!tailwindContent.includes('screens') || !tailwindContent.includes('sm:')) {
        issues.responsiveDesignIssues.push('Tailwind config: Missing or incomplete responsive breakpoints configuration');
      }
    } else {
      issues.responsiveDesignIssues.push('Missing tailwind.config.js - responsive design may not be properly configured');
    }
    
    // Check for global CSS files
    const possibleCSSFiles = ['globals.css', 'styles.css', 'app/globals.css'];
    let foundCSS = false;
    
    for (const cssFile of possibleCSSFiles) {
      if (fs.existsSync(cssFile)) {
        foundCSS = true;
        const cssContent = fs.readFileSync(cssFile, 'utf8');
        
        // Check for mobile-first responsive design
        if (!cssContent.includes('@media') && !cssContent.includes('min-width')) {
          issues.responsiveDesignIssues.push(`${cssFile}: No mobile-first media queries detected`);
        }
        
        // Check for touch-friendly styles
        if (!cssContent.includes('touch') && !cssContent.includes('tap')) {
          issues.touchInteractionIssues.push(`${cssFile}: No touch-specific styles detected`);
        }
        break;
      }
    }
    
    if (!foundCSS) {
      issues.cssIssues.push('No global CSS file found - styling may be incomplete');
    }
    
  } catch (error) {
    issues.cssIssues.push(`Failed to analyze CSS: ${error.message}`);
  }

  // 5. Analyze specific mobile UI patterns
  console.log('📱 Analyzing mobile UI patterns...');
  
  // Check for common mobile UI anti-patterns in the registration component
  try {
    const registrationContent = fs.readFileSync('components/BulletproofStudentRegistration.jsx', 'utf8');
    
    // Look for THANDI branding sequence issues
    const brandingMatches = registrationContent.match(/THANDI|Career Assessment|Welcome/g);
    if (brandingMatches && brandingMatches.length > 0) {
      // Check if branding elements have proper mobile styling
      if (!registrationContent.includes('text-center') && !registrationContent.includes('mx-auto')) {
        issues.brandingSequenceIssues.push('THANDI branding may not be properly centered on mobile');
      }
      
      // Check for responsive text sizing
      if (!registrationContent.includes('text-sm') && !registrationContent.includes('text-lg') && !registrationContent.includes('text-xl')) {
        issues.brandingSequenceIssues.push('THANDI branding text may not be responsive');
      }
    }
    
    // Check for form field mobile optimization
    const inputMatches = registrationContent.match(/input|select|textarea/g);
    if (inputMatches && inputMatches.length > 0) {
      if (!registrationContent.includes('focus:ring') || !registrationContent.includes('focus:border')) {
        issues.touchInteractionIssues.push('Form inputs missing mobile-friendly focus states');
      }
    }
    
    // Check for mobile-specific button layouts
    const buttonMatches = registrationContent.match(/button/g);
    if (buttonMatches && buttonMatches.length > 0) {
      if (!registrationContent.includes('flex-col sm:flex-row') && !registrationContent.includes('w-full')) {
        issues.touchInteractionIssues.push('Buttons may not stack properly on mobile');
      }
    }
    
  } catch (error) {
    issues.brandingSequenceIssues.push(`Failed to analyze branding: ${error.message}`);
  }

  // Generate report
  console.log('\n📊 MOBILE UI ANALYSIS RESULTS:');
  console.log('=====================================');
  
  let totalIssues = 0;
  
  console.log('\n🎨 THANDI BRANDING SEQUENCE ISSUES:');
  if (issues.brandingSequenceIssues.length === 0) {
    console.log('✅ No obvious branding sequence issues detected in code');
  } else {
    issues.brandingSequenceIssues.forEach(issue => {
      console.log(`❌ ${issue}`);
      totalIssues++;
    });
  }
  
  console.log('\n📱 RESPONSIVE DESIGN ISSUES:');
  if (issues.responsiveDesignIssues.length === 0) {
    console.log('✅ No obvious responsive design issues detected in code');
  } else {
    issues.responsiveDesignIssues.forEach(issue => {
      console.log(`❌ ${issue}`);
      totalIssues++;
    });
  }
  
  console.log('\n📝 REGISTRATION FLOW ISSUES:');
  if (issues.registrationFlowIssues.length === 0) {
    console.log('✅ No obvious registration flow issues detected in code');
  } else {
    issues.registrationFlowIssues.forEach(issue => {
      console.log(`❌ ${issue}`);
      totalIssues++;
    });
  }
  
  console.log('\n👆 TOUCH INTERACTION ISSUES:');
  if (issues.touchInteractionIssues.length === 0) {
    console.log('✅ No obvious touch interaction issues detected in code');
  } else {
    issues.touchInteractionIssues.forEach(issue => {
      console.log(`❌ ${issue}`);
      totalIssues++;
    });
  }
  
  console.log('\n🎨 CSS ISSUES:');
  if (issues.cssIssues.length === 0) {
    console.log('✅ No obvious CSS issues detected');
  } else {
    issues.cssIssues.forEach(issue => {
      console.log(`❌ ${issue}`);
      totalIssues++;
    });
  }

  console.log(`\n📈 TOTAL ISSUES DETECTED: ${totalIssues}`);
  
  // Save results
  fs.writeFileSync('mobile-ui-analysis-results.json', JSON.stringify(issues, null, 2));
  console.log('\n💾 Detailed results saved to: mobile-ui-analysis-results.json');
  
  // Generate specific fix recommendations
  console.log('\n🔧 SPECIFIC FIX RECOMMENDATIONS:');
  console.log('=====================================');
  
  if (issues.brandingSequenceIssues.length > 0) {
    console.log('\n🎨 BRANDING FIXES:');
    console.log('• Add responsive text sizing (text-sm md:text-lg lg:text-xl)');
    console.log('• Ensure proper centering (text-center mx-auto)');
    console.log('• Check z-index stacking for mobile overlays');
  }
  
  if (issues.responsiveDesignIssues.length > 0) {
    console.log('\n📱 RESPONSIVE DESIGN FIXES:');
    console.log('• Add Tailwind responsive breakpoints (sm:, md:, lg:)');
    console.log('• Replace fixed widths with responsive units');
    console.log('• Add proper mobile padding and margins');
    console.log('• Implement mobile-first CSS approach');
  }
  
  if (issues.registrationFlowIssues.length > 0) {
    console.log('\n📝 REGISTRATION FLOW FIXES:');
    console.log('• Add comprehensive error handling and user feedback');
    console.log('• Ensure proper state management between steps');
    console.log('• Test API endpoints on mobile networks');
    console.log('• Add loading states for slow connections');
  }
  
  if (issues.touchInteractionIssues.length > 0) {
    console.log('\n👆 TOUCH INTERACTION FIXES:');
    console.log('• Increase button sizes (min 44x44px touch targets)');
    console.log('• Add proper focus states for mobile');
    console.log('• Ensure adequate spacing between interactive elements');
    console.log('• Stack buttons vertically on mobile (flex-col sm:flex-row)');
  }

  return issues;
}

// Run the analysis
if (require.main === module) {
  analyzeMobileUIIssues();
}

module.exports = { analyzeMobileUIIssues };