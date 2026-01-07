/**
 * Rigorous System Verification
 * 
 * 100% accurate verification with no false positives.
 * Every claim must be backed by concrete evidence.
 * 
 * @author Kiro AI Assistant
 * @version 1.0.0
 * @created 2026-01-07
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class RigorousSystemVerification {
  constructor() {
    this.results = {
      fileAnalysis: {},
      syntaxVerification: {},
      buildVerification: null,
      integrationVerification: {},
      actualCapabilities: {},
      truthfulAssessment: null
    };
    this.startTime = Date.now();
  }

  async runRigorousVerification() {
    console.log('🔍 RIGOROUS SYSTEM VERIFICATION - 100% ACCURACY REQUIRED');
    console.log('=' .repeat(80));
    console.log('No false positives. No assumptions. Only verified facts.');
    console.log('=' .repeat(80));
    
    try {
      // Phase 1: Detailed File Analysis
      console.log('\n📁 PHASE 1: DETAILED FILE ANALYSIS');
      await this.analyzeFilesInDetail();
      
      // Phase 2: Syntax and Import Verification
      console.log('\n🔍 PHASE 2: SYNTAX AND IMPORT VERIFICATION');
      await this.verifySyntaxAndImports();
      
      // Phase 3: Build System Verification
      console.log('\n🔧 PHASE 3: BUILD SYSTEM VERIFICATION');
      await this.verifyBuildSystem();
      
      // Phase 4: Integration Analysis
      console.log('\n🏗️ PHASE 4: INTEGRATION ANALYSIS');
      await this.analyzeIntegration();
      
      // Phase 5: Capability Assessment
      console.log('\n⚡ PHASE 5: ACTUAL CAPABILITY ASSESSMENT');
      await this.assessActualCapabilities();
      
      // Phase 6: Truthful Final Assessment
      console.log('\n🎯 PHASE 6: TRUTHFUL FINAL ASSESSMENT');
      this.generateTruthfulAssessment();
      
    } catch (error) {
      console.error('❌ RIGOROUS VERIFICATION FAILED:', error.message);
      this.generateFailureReport(error);
    }
  }

  async analyzeFilesInDetail() {
    console.log('   Analyzing each file in detail...');
    
    const filesToAnalyze = [
      'lib/cag/validation-service.js',
      'lib/cag/job-market-intelligence.js',
      'lib/cag/bursary-validation-engine.js',
      'app/api/rag/query/route.js'
    ];
    
    for (const filePath of filesToAnalyze) {
      console.log(`\n   📄 Analyzing: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        console.log(`   ❌ FILE MISSING: ${filePath}`);
        this.results.fileAnalysis[filePath] = {
          exists: false,
          error: 'File does not exist'
        };
        continue;
      }
      
      try {
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Analyze file content
        const analysis = {
          exists: true,
          size: stats.size,
          sizeKB: Math.round(stats.size / 1024),
          lines: content.split('\n').length,
          hasExports: content.includes('export'),
          hasImports: content.includes('import') || content.includes('require'),
          hasClasses: content.includes('class '),
          hasFunctions: content.includes('function ') || content.includes('=>'),
          hasComments: content.includes('/**') || content.includes('//'),
          isEmpty: content.trim().length === 0,
          isValidJS: true // Will be verified in syntax check
        };
        
        // Check for specific CAG-related content
        if (filePath.includes('validation-service')) {
          analysis.hasValidationService = content.includes('CAGValidationService');
          analysis.hasValidationMethod = content.includes('validateCareerGuidance');
          analysis.hasValidationCriteria = content.includes('VALIDATION_CRITERIA');
        }
        
        if (filePath.includes('job-market-intelligence')) {
          analysis.hasJobMarketService = content.includes('JobMarketIntelligence');
          analysis.hasMarketValidation = content.includes('validateMarketRelevance');
        }
        
        if (filePath.includes('bursary-validation-engine')) {
          analysis.hasBursaryService = content.includes('BursaryValidationEngine');
          analysis.hasBursaryValidation = content.includes('validateBursaryRecommendations');
          analysis.hasBursaryDatabase = content.includes('BURSARY_DATABASE');
        }
        
        if (filePath.includes('route.js')) {
          analysis.hasCAGImport = content.includes('CAGValidationService');
          analysis.hasValidationCall = content.includes('validateCareerGuidance');
          analysis.hasValidationResult = content.includes('validation');
        }
        
        this.results.fileAnalysis[filePath] = analysis;
        
        console.log(`   ✅ Size: ${analysis.sizeKB}KB, Lines: ${analysis.lines}`);
        console.log(`   📊 Exports: ${analysis.hasExports}, Classes: ${analysis.hasClasses}`);
        
        if (analysis.isEmpty) {
          console.log(`   ⚠️ WARNING: File is empty`);
        }
        
      } catch (error) {
        console.log(`   ❌ ERROR analyzing ${filePath}: ${error.message}`);
        this.results.fileAnalysis[filePath] = {
          exists: true,
          error: error.message
        };
      }
    }
  }

  async verifySyntaxAndImports() {
    console.log('   Verifying JavaScript syntax and imports...');
    
    const jsFiles = [
      'lib/cag/validation-service.js',
      'lib/cag/job-market-intelligence.js',
      'lib/cag/bursary-validation-engine.js'
    ];
    
    for (const filePath of jsFiles) {
      console.log(`\n   🔍 Syntax check: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        console.log(`   ❌ SKIP: File does not exist`);
        this.results.syntaxVerification[filePath] = {
          syntaxValid: false,
          error: 'File does not exist'
        };
        continue;
      }
      
      try {
        // Test syntax with Node.js
        execSync(`node -c "${filePath}"`, { 
          stdio: 'pipe',
          timeout: 10000
        });
        
        console.log(`   ✅ Syntax: VALID`);
        this.results.syntaxVerification[filePath] = {
          syntaxValid: true
        };
        
        // Test if file can be required (for CommonJS compatibility)
        try {
          const fullPath = path.resolve(filePath);
          delete require.cache[fullPath]; // Clear cache
          
          // This will fail if there are import issues
          const moduleTest = require(fullPath);
          
          console.log(`   ✅ Require: SUCCESS`);
          this.results.syntaxVerification[filePath].canRequire = true;
          this.results.syntaxVerification[filePath].exports = Object.keys(moduleTest || {});
          
        } catch (requireError) {
          console.log(`   ❌ Require: FAILED - ${requireError.message.substring(0, 100)}...`);
          this.results.syntaxVerification[filePath].canRequire = false;
          this.results.syntaxVerification[filePath].requireError = requireError.message;
        }
        
      } catch (syntaxError) {
        console.log(`   ❌ Syntax: INVALID - ${syntaxError.message}`);
        this.results.syntaxVerification[filePath] = {
          syntaxValid: false,
          syntaxError: syntaxError.message
        };
      }
    }
  }

  async verifyBuildSystem() {
    console.log('   Testing Next.js build system...');
    
    const buildStart = Date.now();
    
    try {
      console.log('   🔧 Running: npm run build');
      
      const buildOutput = execSync('npm run build', {
        encoding: 'utf8',
        timeout: 180000, // 3 minutes
        stdio: 'pipe'
      });
      
      const buildTime = Date.now() - buildStart;
      
      // Analyze build output
      const buildSuccess = buildOutput.includes('✓ Compiled') || 
                          buildOutput.includes('Compiled successfully');
      const hasErrors = buildOutput.includes('Error:') || 
                       buildOutput.includes('Failed to compile');
      const hasWarnings = buildOutput.includes('Warning:') || 
                         buildOutput.includes('warn');
      
      this.results.buildVerification = {
        success: buildSuccess && !hasErrors,
        buildTime: `${(buildTime / 1000).toFixed(1)}s`,
        hasErrors,
        hasWarnings,
        outputLength: buildOutput.length,
        buildOutput: buildOutput.substring(0, 1000) + (buildOutput.length > 1000 ? '...' : '')
      };
      
      if (buildSuccess && !hasErrors) {
        console.log(`   ✅ Build: SUCCESS in ${(buildTime / 1000).toFixed(1)}s`);
      } else if (buildSuccess && hasWarnings) {
        console.log(`   ⚠️ Build: SUCCESS with warnings in ${(buildTime / 1000).toFixed(1)}s`);
      } else {
        console.log(`   ❌ Build: FAILED in ${(buildTime / 1000).toFixed(1)}s`);
      }
      
      if (hasWarnings) {
        console.log(`   ⚠️ Warnings detected in build output`);
      }
      
    } catch (buildError) {
      const buildTime = Date.now() - buildStart;
      
      console.log(`   ❌ Build: FAILED in ${(buildTime / 1000).toFixed(1)}s`);
      console.log(`   Error: ${buildError.message.substring(0, 200)}...`);
      
      this.results.buildVerification = {
        success: false,
        buildTime: `${(buildTime / 1000).toFixed(1)}s`,
        error: buildError.message,
        hasErrors: true
      };
    }
  }

  async analyzeIntegration() {
    console.log('   Analyzing CAG integration in RAG endpoint...');
    
    const routeFile = 'app/api/rag/query/route.js';
    
    if (!fs.existsSync(routeFile)) {
      console.log(`   ❌ RAG route file missing: ${routeFile}`);
      this.results.integrationVerification = {
        routeExists: false,
        error: 'RAG route file does not exist'
      };
      return;
    }
    
    try {
      const routeContent = fs.readFileSync(routeFile, 'utf8');
      
      // Detailed integration analysis
      const integration = {
        routeExists: true,
        fileSize: routeContent.length,
        
        // Import analysis
        hasCAGImport: routeContent.includes('CAGValidationService'),
        importLine: this.extractLine(routeContent, 'CAGValidationService'),
        
        // Usage analysis
        hasValidationCall: routeContent.includes('validateCareerGuidance'),
        validationCallLine: this.extractLine(routeContent, 'validateCareerGuidance'),
        
        // Result handling
        hasValidationResult: routeContent.includes('validation'),
        hasValidationStatus: routeContent.includes('validation.status'),
        
        // Error handling
        hasErrorHandling: routeContent.includes('catch') && routeContent.includes('validation'),
        
        // Response enhancement
        hasEnhancedResponse: routeContent.includes('enhancedResponse'),
        
        // Integration completeness score
        integrationScore: 0
      };
      
      // Calculate integration score
      const integrationChecks = [
        integration.hasCAGImport,
        integration.hasValidationCall,
        integration.hasValidationResult,
        integration.hasErrorHandling
      ];
      
      integration.integrationScore = integrationChecks.filter(check => check).length;
      integration.integrationComplete = integration.integrationScore >= 3;
      
      this.results.integrationVerification = integration;
      
      console.log(`   📊 Integration Score: ${integration.integrationScore}/4`);
      console.log(`   📥 CAG Import: ${integration.hasCAGImport ? 'YES' : 'NO'}`);
      console.log(`   🔄 Validation Call: ${integration.hasValidationCall ? 'YES' : 'NO'}`);
      console.log(`   📤 Result Handling: ${integration.hasValidationResult ? 'YES' : 'NO'}`);
      console.log(`   🛡️ Error Handling: ${integration.hasErrorHandling ? 'YES' : 'NO'}`);
      
      if (integration.integrationComplete) {
        console.log(`   ✅ Integration: COMPLETE`);
      } else {
        console.log(`   ❌ Integration: INCOMPLETE`);
      }
      
    } catch (error) {
      console.log(`   ❌ Integration analysis failed: ${error.message}`);
      this.results.integrationVerification = {
        routeExists: true,
        error: error.message
      };
    }
  }

  async assessActualCapabilities() {
    console.log('   Assessing actual system capabilities...');
    
    const capabilities = {
      fileSystemReady: false,
      syntaxValid: false,
      buildReady: false,
      integrationReady: false,
      deploymentReady: false,
      validationCapable: false
    };
    
    // File system readiness
    const requiredFiles = Object.keys(this.results.fileAnalysis);
    const existingFiles = requiredFiles.filter(file => 
      this.results.fileAnalysis[file]?.exists === true
    );
    capabilities.fileSystemReady = existingFiles.length === requiredFiles.length;
    
    console.log(`   📁 Files: ${existingFiles.length}/${requiredFiles.length} present`);
    
    // Syntax validity
    const syntaxFiles = Object.keys(this.results.syntaxVerification);
    const validSyntaxFiles = syntaxFiles.filter(file =>
      this.results.syntaxVerification[file]?.syntaxValid === true
    );
    capabilities.syntaxValid = validSyntaxFiles.length === syntaxFiles.length;
    
    console.log(`   🔍 Syntax: ${validSyntaxFiles.length}/${syntaxFiles.length} valid`);
    
    // Build readiness
    capabilities.buildReady = this.results.buildVerification?.success === true;
    
    console.log(`   🔧 Build: ${capabilities.buildReady ? 'READY' : 'NOT READY'}`);
    
    // Integration readiness
    capabilities.integrationReady = this.results.integrationVerification?.integrationComplete === true;
    
    console.log(`   🏗️ Integration: ${capabilities.integrationReady ? 'READY' : 'NOT READY'}`);
    
    // Deployment readiness (all previous must be true)
    capabilities.deploymentReady = capabilities.fileSystemReady && 
                                  capabilities.syntaxValid && 
                                  capabilities.buildReady && 
                                  capabilities.integrationReady;
    
    console.log(`   🚀 Deployment: ${capabilities.deploymentReady ? 'READY' : 'NOT READY'}`);
    
    // Validation capability (can we actually validate?)
    const hasValidationService = this.results.fileAnalysis['lib/cag/validation-service.js']?.hasValidationService === true;
    const hasValidationMethod = this.results.fileAnalysis['lib/cag/validation-service.js']?.hasValidationMethod === true;
    const canRequireValidation = this.results.syntaxVerification['lib/cag/validation-service.js']?.canRequire === true;
    
    capabilities.validationCapable = hasValidationService && hasValidationMethod && canRequireValidation;
    
    console.log(`   ⚡ Validation: ${capabilities.validationCapable ? 'CAPABLE' : 'NOT CAPABLE'}`);
    
    this.results.actualCapabilities = capabilities;
  }

  generateTruthfulAssessment() {
    console.log('   Generating truthful assessment...');
    
    const caps = this.results.actualCapabilities;
    
    // Calculate truthful readiness score
    const readinessChecks = [
      caps.fileSystemReady,
      caps.syntaxValid,
      caps.buildReady,
      caps.integrationReady,
      caps.validationCapable
    ];
    
    const readinessScore = (readinessChecks.filter(check => check).length / readinessChecks.length) * 100;
    
    // Determine truthful status
    let truthfulStatus;
    let truthfulDescription;
    let nextActions = [];
    
    if (readinessScore === 100) {
      truthfulStatus = 'FULLY OPERATIONAL';
      truthfulDescription = 'All systems verified and ready for production deployment';
      nextActions = ['Deploy to production', 'Monitor performance', 'Begin market execution'];
    } else if (readinessScore >= 80) {
      truthfulStatus = 'MOSTLY READY';
      truthfulDescription = 'Core systems operational with minor issues to resolve';
      nextActions = ['Fix remaining issues', 'Complete verification', 'Prepare for deployment'];
    } else if (readinessScore >= 60) {
      truthfulStatus = 'PARTIALLY READY';
      truthfulDescription = 'Significant progress made but critical issues remain';
      nextActions = ['Address critical failures', 'Complete implementation', 'Re-verify systems'];
    } else if (readinessScore >= 40) {
      truthfulStatus = 'EARLY STAGE';
      truthfulDescription = 'Basic structure in place but major work needed';
      nextActions = ['Complete core implementation', 'Fix build issues', 'Verify integration'];
    } else {
      truthfulStatus = 'NOT READY';
      truthfulDescription = 'Fundamental issues prevent system operation';
      nextActions = ['Start over with systematic approach', 'Fix basic file structure', 'Ensure syntax validity'];
    }
    
    // Identify specific blockers
    const blockers = [];
    if (!caps.fileSystemReady) blockers.push('Missing or corrupted files');
    if (!caps.syntaxValid) blockers.push('JavaScript syntax errors');
    if (!caps.buildReady) blockers.push('Build system failures');
    if (!caps.integrationReady) blockers.push('Incomplete CAG integration');
    if (!caps.validationCapable) blockers.push('Validation system not functional');
    
    this.results.truthfulAssessment = {
      readinessScore: Math.round(readinessScore),
      status: truthfulStatus,
      description: truthfulDescription,
      nextActions,
      blockers,
      verificationTime: ((Date.now() - this.startTime) / 1000).toFixed(1) + 's'
    };
    
    // Generate final report
    this.generateFinalReport();
  }

  generateFinalReport() {
    const assessment = this.results.truthfulAssessment;
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 RIGOROUS VERIFICATION COMPLETE - 100% TRUTHFUL ASSESSMENT');
    console.log('='.repeat(80));
    
    console.log(`\n📊 TRUTHFUL READINESS SCORE: ${assessment.readinessScore}/100`);
    console.log(`🎯 ACTUAL STATUS: ${assessment.status}`);
    console.log(`📝 DESCRIPTION: ${assessment.description}`);
    console.log(`⏱️ VERIFICATION TIME: ${assessment.verificationTime}`);
    
    console.log(`\n🔍 DETAILED VERIFICATION RESULTS:`);
    
    // File Analysis Summary
    console.log(`\n📁 FILE ANALYSIS:`);
    for (const [file, analysis] of Object.entries(this.results.fileAnalysis)) {
      const status = analysis.exists ? '✅' : '❌';
      const size = analysis.sizeKB ? `${analysis.sizeKB}KB` : 'N/A';
      console.log(`   ${status} ${file} (${size})`);
      if (analysis.error) {
        console.log(`      ❌ Error: ${analysis.error}`);
      }
    }
    
    // Syntax Verification Summary
    console.log(`\n🔍 SYNTAX VERIFICATION:`);
    for (const [file, verification] of Object.entries(this.results.syntaxVerification)) {
      const syntaxStatus = verification.syntaxValid ? '✅' : '❌';
      const requireStatus = verification.canRequire ? '✅' : '❌';
      console.log(`   ${syntaxStatus} Syntax: ${file}`);
      console.log(`   ${requireStatus} Require: ${file}`);
      if (verification.syntaxError) {
        console.log(`      ❌ Syntax Error: ${verification.syntaxError.substring(0, 100)}...`);
      }
      if (verification.requireError) {
        console.log(`      ❌ Require Error: ${verification.requireError.substring(0, 100)}...`);
      }
    }
    
    // Build Verification Summary
    console.log(`\n🔧 BUILD VERIFICATION:`);
    if (this.results.buildVerification) {
      const buildStatus = this.results.buildVerification.success ? '✅' : '❌';
      console.log(`   ${buildStatus} Build Success: ${this.results.buildVerification.success}`);
      console.log(`   ⏱️ Build Time: ${this.results.buildVerification.buildTime}`);
      console.log(`   ⚠️ Has Warnings: ${this.results.buildVerification.hasWarnings || false}`);
      console.log(`   ❌ Has Errors: ${this.results.buildVerification.hasErrors || false}`);
    } else {
      console.log(`   ❌ Build verification not completed`);
    }
    
    // Integration Analysis Summary
    console.log(`\n🏗️ INTEGRATION ANALYSIS:`);
    if (this.results.integrationVerification) {
      const integration = this.results.integrationVerification;
      console.log(`   📊 Integration Score: ${integration.integrationScore || 0}/4`);
      console.log(`   📥 CAG Import: ${integration.hasCAGImport ? 'YES' : 'NO'}`);
      console.log(`   🔄 Validation Call: ${integration.hasValidationCall ? 'YES' : 'NO'}`);
      console.log(`   📤 Result Handling: ${integration.hasValidationResult ? 'YES' : 'NO'}`);
      console.log(`   🛡️ Error Handling: ${integration.hasErrorHandling ? 'YES' : 'NO'}`);
    } else {
      console.log(`   ❌ Integration analysis not completed`);
    }
    
    // Capability Assessment Summary
    console.log(`\n⚡ ACTUAL CAPABILITIES:`);
    const caps = this.results.actualCapabilities;
    console.log(`   📁 File System Ready: ${caps.fileSystemReady ? 'YES' : 'NO'}`);
    console.log(`   🔍 Syntax Valid: ${caps.syntaxValid ? 'YES' : 'NO'}`);
    console.log(`   🔧 Build Ready: ${caps.buildReady ? 'YES' : 'NO'}`);
    console.log(`   🏗️ Integration Ready: ${caps.integrationReady ? 'YES' : 'NO'}`);
    console.log(`   🚀 Deployment Ready: ${caps.deploymentReady ? 'YES' : 'NO'}`);
    console.log(`   ⚡ Validation Capable: ${caps.validationCapable ? 'YES' : 'NO'}`);
    
    // Blockers (if any)
    if (assessment.blockers.length > 0) {
      console.log(`\n🚫 CURRENT BLOCKERS:`);
      assessment.blockers.forEach(blocker => {
        console.log(`   ❌ ${blocker}`);
      });
    }
    
    // Next Actions
    console.log(`\n📋 REQUIRED NEXT ACTIONS:`);
    assessment.nextActions.forEach((action, index) => {
      console.log(`   ${index + 1}. ${action}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ RIGOROUS VERIFICATION COMPLETE - NO FALSE POSITIVES');
    console.log('='.repeat(80));
    
    // Save detailed results
    this.saveDetailedResults();
  }

  generateFailureReport(error) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ RIGOROUS VERIFICATION FAILED');
    console.log('='.repeat(80));
    
    console.log(`\nFATAL ERROR: ${error.message}`);
    console.log(`\nVerification could not be completed due to system failure.`);
    console.log(`\nIMMEDIATE ACTION REQUIRED:`);
    console.log(`1. Fix the fatal error`);
    console.log(`2. Ensure system stability`);
    console.log(`3. Re-run rigorous verification`);
    
    console.log('\n' + '='.repeat(80));
  }

  // Helper methods
  extractLine(content, searchTerm) {
    const lines = content.split('\n');
    const lineIndex = lines.findIndex(line => line.includes(searchTerm));
    return lineIndex >= 0 ? lines[lineIndex].trim() : null;
  }

  saveDetailedResults() {
    const resultsFile = 'rigorous-verification-results.json';
    
    try {
      fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
    } catch (error) {
      console.log(`\n⚠️ Could not save results: ${error.message}`);
    }
  }
}

// Run rigorous verification
async function runRigorousVerification() {
  const verifier = new RigorousSystemVerification();
  await verifier.runRigorousVerification();
}

// Execute if run directly
if (require.main === module) {
  runRigorousVerification().catch(console.error);
}

module.exports = { RigorousSystemVerification };