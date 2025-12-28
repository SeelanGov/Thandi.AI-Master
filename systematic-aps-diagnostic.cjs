#!/usr/bin/env node

/**
 * Systematic APS Diagnostic & Resolution Framework
 * Comprehensive analysis of the APS calculation system
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🔬 SYSTEMATIC APS DIAGNOSTIC FRAMEWORK');
console.log('='.repeat(70));
console.log('Lead Developer Analysis: Comprehensive Root Cause Investigation');
console.log('='.repeat(70));

class APSDiagnostic {
  constructor() {
    this.findings = [];
    this.errors = [];
    this.recommendations = [];
  }

  log(category, message, status = 'INFO') {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, category, message, status };
    this.findings.push(entry);
    
    const icon = status === 'ERROR' ? '❌' : status === 'WARNING' ? '⚠️' : status === 'SUCCESS' ? '✅' : 'ℹ️';
    console.log(`${icon} [${category}] ${message}`);
  }

  addRecommendation(priority, action, reason) {
    this.recommendations.push({ priority, action, reason });
  }

  // Phase 1: Architecture Analysis
  async analyzeArchitecture() {
    console.log('\n📐 PHASE 1: ARCHITECTURE ANALYSIS');
    console.log('-'.repeat(50));

    // 1.1 API Route Structure
    this.log('ARCHITECTURE', 'Analyzing API route structure...');
    
    const apiRoutePath = 'app/api/rag/query/route.js';
    if (fs.existsSync(apiRoutePath)) {
      const apiContent = fs.readFileSync(apiRoutePath, 'utf8');
      
      // Check for APS calculation logic
      const hasAPSLogic = apiContent.includes('aps') || apiContent.includes('APS');
      const hasMarksProcessing = apiContent.includes('marks') || apiContent.includes('subjects');
      const hasValidation = apiContent.includes('validation') || apiContent.includes('validate');
      const hasErrorHandling = apiContent.includes('try') && apiContent.includes('catch');
      
      this.log('API_STRUCTURE', `APS Logic Present: ${hasAPSLogic}`, hasAPSLogic ? 'SUCCESS' : 'ERROR');
      this.log('API_STRUCTURE', `Marks Processing: ${hasMarksProcessing}`, hasMarksProcessing ? 'SUCCESS' : 'ERROR');
      this.log('API_STRUCTURE', `Input Validation: ${hasValidation}`, hasValidation ? 'SUCCESS' : 'WARNING');
      this.log('API_STRUCTURE', `Error Handling: ${hasErrorHandling}`, hasErrorHandling ? 'SUCCESS' : 'WARNING');
      
      // Check for specific APS calculation patterns
      const apsCalculationPatterns = [
        /calculateAPS/gi,
        /aps.*calculation/gi,
        /marks.*points/gi,
        /grade.*points/gi
      ];
      
      let apsPatternFound = false;
      apsCalculationPatterns.forEach(pattern => {
        if (pattern.test(apiContent)) {
          apsPatternFound = true;
        }
      });
      
      this.log('API_STRUCTURE', `APS Calculation Pattern: ${apsPatternFound}`, apsPatternFound ? 'SUCCESS' : 'ERROR');
      
      if (!hasAPSLogic) {
        this.addRecommendation('CRITICAL', 'Implement APS calculation logic in API route', 'No APS calculation found in API');
      }
      
      if (!apsPatternFound) {
        this.addRecommendation('HIGH', 'Add proper APS calculation function', 'No APS calculation patterns detected');
      }
    } else {
      this.log('API_STRUCTURE', 'API route file not found', 'ERROR');
      this.addRecommendation('CRITICAL', 'Create API route file', 'Missing core API endpoint');
    }

    // 1.2 Frontend Component Analysis
    this.log('ARCHITECTURE', 'Analyzing frontend components...');
    
    const assessmentFormPath = 'app/assessment/components/AssessmentForm.jsx';
    if (fs.existsSync(assessmentFormPath)) {
      const formContent = fs.readFileSync(assessmentFormPath, 'utf8');
      
      const hasAPICall = formContent.includes('/api/rag/query') || formContent.includes('fetch');
      const hasDataStructure = formContent.includes('subjects') && formContent.includes('marks');
      const hasErrorHandling = formContent.includes('catch') || formContent.includes('error');
      const hasFormValidation = formContent.includes('validate') || formContent.includes('required');
      
      this.log('FRONTEND_STRUCTURE', `API Integration: ${hasAPICall}`, hasAPICall ? 'SUCCESS' : 'ERROR');
      this.log('FRONTEND_STRUCTURE', `Data Structure: ${hasDataStructure}`, hasDataStructure ? 'SUCCESS' : 'ERROR');
      this.log('FRONTEND_STRUCTURE', `Error Handling: ${hasErrorHandling}`, hasErrorHandling ? 'SUCCESS' : 'WARNING');
      this.log('FRONTEND_STRUCTURE', `Form Validation: ${hasFormValidation}`, hasFormValidation ? 'SUCCESS' : 'WARNING');
      
      if (!hasAPICall) {
        this.addRecommendation('CRITICAL', 'Implement API integration in AssessmentForm', 'No API call found');
      }
    }

    // 1.3 Data Flow Analysis
    this.log('ARCHITECTURE', 'Analyzing data flow patterns...');
    
    const resultsPagePath = 'app/results/page.jsx';
    if (fs.existsSync(resultsPagePath)) {
      const resultsContent = fs.readFileSync(resultsPagePath, 'utf8');
      
      const displaysAPS = resultsContent.includes('APS') || resultsContent.includes('aps');
      const hasDataRetrieval = resultsContent.includes('searchParams') || resultsContent.includes('query');
      const hasAPSDisplay = /Current.*APS.*Score/gi.test(resultsContent) || /Projected.*APS/gi.test(resultsContent);
      
      this.log('DATA_FLOW', `APS Display Logic: ${displaysAPS}`, displaysAPS ? 'SUCCESS' : 'ERROR');
      this.log('DATA_FLOW', `Data Retrieval: ${hasDataRetrieval}`, hasDataRetrieval ? 'SUCCESS' : 'WARNING');
      this.log('DATA_FLOW', `APS Display Format: ${hasAPSDisplay}`, hasAPSDisplay ? 'SUCCESS' : 'WARNING');
    }
  }

  // Phase 2: Live System Testing
  async testLiveSystem() {
    console.log('\n🧪 PHASE 2: LIVE SYSTEM TESTING');
    console.log('-'.repeat(50));

    this.log('LIVE_TESTING', 'Testing API endpoint with realistic data...');
    
    const testResult = await this.makeTestAPICall();
    
    if (testResult.success) {
      this.log('LIVE_TESTING', `API Response Status: ${testResult.status}`, 'SUCCESS');
      
      if (testResult.data) {
        this.analyzeAPIResponse(testResult.data);
      }
    } else {
      this.log('LIVE_TESTING', `API Call Failed: ${testResult.status} - ${testResult.error}`, 'ERROR');
      this.addRecommendation('CRITICAL', 'Fix API endpoint errors', `API returning ${testResult.status}: ${testResult.error}`);
    }

    if (testResult.rawResponse) {
      this.analyzeRawResponse(testResult.rawResponse);
    }
  }

  async makeTestAPICall() {
    const testData = {
      grade: 'grade10',
      curriculum: 'IEB',
      subjects: [
        { name: 'Mathematics', level: 'Higher Grade', mark: 85 },
        { name: 'Physical Sciences', level: 'Higher Grade', mark: 78 },
        { name: 'English Home Language', level: 'Higher Grade', mark: 82 },
        { name: 'Life Orientation', level: 'Standard Grade', mark: 75 },
        { name: 'Afrikaans First Additional Language', level: 'Higher Grade', mark: 70 },
        { name: 'Geography', level: 'Higher Grade', mark: 80 }
      ],
      interests: ['STEM', 'Engineering'],
      constraints: { location: 'Western Cape', budget: 'Medium' },
      openQuestions: { careerGoals: 'Engineering', strengths: 'Math', challenges: 'Time management' }
    };

    return new Promise((resolve) => {
      const postData = JSON.stringify(testData);
      
      const options = {
        hostname: 'thandiai.vercel.app',
        port: 443,
        path: '/api/rag/query',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'SystematicDiagnostic/1.0'
        },
        timeout: 15000
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            resolve({
              success: res.statusCode === 200,
              status: res.statusCode,
              data: parsed,
              rawResponse: responseData
            });
          } catch (error) {
            resolve({
              success: false,
              status: res.statusCode,
              error: 'Invalid JSON response',
              rawResponse: responseData
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          status: 'ERROR',
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          status: 'TIMEOUT',
          error: 'Request timeout'
        });
      });

      req.write(postData);
      req.end();
    });
  }

  analyzeAPIResponse(data) {
    this.log('RESPONSE_ANALYSIS', 'Analyzing API response structure...');
    
    const hasResponse = data.response && typeof data.response === 'string';
    const hasAPS = data.response && (data.response.includes('APS') || data.response.includes('aps'));
    const hasMarks = data.response && data.response.includes('marks');
    const hasCalculation = data.response && /\d+\s*points?/i.test(data.response);
    const hasZeroPoints = data.response && /0\s*points?/i.test(data.response);
    
    this.log('RESPONSE_ANALYSIS', `Response Field Present: ${hasResponse}`, hasResponse ? 'SUCCESS' : 'ERROR');
    this.log('RESPONSE_ANALYSIS', `APS Content Found: ${hasAPS}`, hasAPS ? 'SUCCESS' : 'ERROR');
    this.log('RESPONSE_ANALYSIS', `Marks Processing: ${hasMarks}`, hasMarks ? 'SUCCESS' : 'WARNING');
    this.log('RESPONSE_ANALYSIS', `Calculation Present: ${hasCalculation}`, hasCalculation ? 'SUCCESS' : 'ERROR');
    this.log('RESPONSE_ANALYSIS', `Zero Points Bug: ${hasZeroPoints}`, hasZeroPoints ? 'ERROR' : 'SUCCESS');
    
    if (!hasAPS) {
      this.addRecommendation('CRITICAL', 'Implement APS calculation in response generation', 'No APS content in API response');
    }
    
    if (!hasCalculation) {
      this.addRecommendation('CRITICAL', 'Add numerical APS calculation to response', 'No calculated APS values found');
    }
    
    if (hasZeroPoints) {
      this.addRecommendation('CRITICAL', 'Fix zero points calculation bug', 'APS calculation returning 0 points');
    }
  }

  analyzeRawResponse(rawResponse) {
    this.log('RAW_ANALYSIS', 'Analyzing raw response content...');
    
    // Calculate expected APS for comparison
    const expectedAPS = this.calculateExpectedAPS();
    this.log('RAW_ANALYSIS', `Expected APS for test data: ${expectedAPS} points`);
    
    // Look for specific patterns
    const patterns = {
      'Zero Points Bug': /0\s*points?/gi,
      'APS Calculation': /aps[:\s]*(\d+)/gi,
      'Current APS': /current\s+aps[:\s]*(\d+)/gi,
      'Projected APS': /projected[:\s]+.*aps[:\s]*(\d+)/gi,
      'Error Messages': /error|failed|invalid/gi,
      'Validation Errors': /validation|required|missing/gi
    };
    
    Object.entries(patterns).forEach(([name, pattern]) => {
      const matches = rawResponse.match(pattern);
      if (matches) {
        this.log('RAW_ANALYSIS', `${name}: Found ${matches.length} matches`);
        matches.slice(0, 2).forEach(match => {
          this.log('RAW_ANALYSIS', `  - "${match}"`);
        });
      } else {
        this.log('RAW_ANALYSIS', `${name}: No matches found`, name.includes('Error') ? 'SUCCESS' : 'WARNING');
      }
    });
    
    // Check response length
    this.log('RAW_ANALYSIS', `Response length: ${rawResponse.length} characters`);
    
    if (rawResponse.length < 100) {
      this.addRecommendation('HIGH', 'Investigate short API responses', 'Response may be truncated or incomplete');
    }
  }

  calculateExpectedAPS() {
    // Test data APS calculation
    const subjects = [
      { mark: 85 }, // 7 points
      { mark: 78 }, // 6 points  
      { mark: 82 }, // 7 points
      { mark: 75 }, // 6 points
      { mark: 70 }, // 6 points
      { mark: 80 }  // 7 points
    ];
    
    let totalAPS = 0;
    subjects.forEach(subject => {
      if (subject.mark >= 80) totalAPS += 7;
      else if (subject.mark >= 70) totalAPS += 6;
      else if (subject.mark >= 60) totalAPS += 5;
      else if (subject.mark >= 50) totalAPS += 4;
      else if (subject.mark >= 40) totalAPS += 3;
      else if (subject.mark >= 30) totalAPS += 2;
      else totalAPS += 1;
    });
    
    return totalAPS;
  }

  // Phase 3: Generate Comprehensive Report
  generateReport() {
    console.log('\n📊 PHASE 3: COMPREHENSIVE DIAGNOSTIC REPORT');
    console.log('='.repeat(70));

    // Categorize findings
    const errors = this.findings.filter(f => f.status === 'ERROR');
    const warnings = this.findings.filter(f => f.status === 'WARNING');
    const successes = this.findings.filter(f => f.status === 'SUCCESS');

    console.log(`\n📈 DIAGNOSTIC SUMMARY:`);
    console.log(`  ✅ Successful Checks: ${successes.length}`);
    console.log(`  ⚠️  Warnings: ${warnings.length}`);
    console.log(`  ❌ Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES (${errors.length}):`);
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.category}] ${error.message}`);
      });
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
      warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. [${warning.category}] ${warning.message}`);
      });
    }

    // Prioritized Recommendations
    console.log(`\n🎯 PRIORITIZED RECOMMENDATIONS:`);
    
    const sortedRecommendations = this.recommendations.sort((a, b) => {
      const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    sortedRecommendations.forEach((rec, index) => {
      const icon = rec.priority === 'CRITICAL' ? '🔴' : rec.priority === 'HIGH' ? '🟡' : '🟢';
      console.log(`  ${index + 1}. ${icon} [${rec.priority}] ${rec.action}`);
      console.log(`     Reason: ${rec.reason}`);
    });

    // Generate detailed report file
    this.saveDetailedReport();
    
    // Generate implementation plan
    this.generateImplementationPlan();
  }

  saveDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalChecks: this.findings.length,
        errors: this.findings.filter(f => f.status === 'ERROR').length,
        warnings: this.findings.filter(f => f.status === 'WARNING').length,
        successes: this.findings.filter(f => f.status === 'SUCCESS').length
      },
      findings: this.findings,
      recommendations: this.recommendations,
      expectedAPS: this.calculateExpectedAPS(),
      nextSteps: this.generateNextSteps()
    };

    fs.writeFileSync('APS-DIAGNOSTIC-REPORT.json', JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: APS-DIAGNOSTIC-REPORT.json`);
  }

  generateImplementationPlan() {
    console.log(`\n🛠️  IMPLEMENTATION PLAN:`);
    console.log(`1. 🔴 CRITICAL: Fix API endpoint validation (400 errors)`);
    console.log(`2. 🔴 CRITICAL: Implement APS calculation logic in backend`);
    console.log(`3. 🔴 CRITICAL: Fix zero points calculation bug`);
    console.log(`4. 🟡 HIGH: Add proper error handling and logging`);
    console.log(`5. 🟡 HIGH: Implement frontend-backend data validation`);
    console.log(`6. 🟢 MEDIUM: Add comprehensive unit tests`);
    console.log(`7. 🟢 MEDIUM: Implement monitoring and alerting`);
  }

  generateNextSteps() {
    return [
      'Fix API endpoint to accept and validate assessment data properly',
      'Implement APS calculation function in backend API',
      'Add proper error handling for malformed requests',
      'Create unit tests for APS calculation logic',
      'Add integration tests for full assessment flow',
      'Implement logging and monitoring for production debugging',
      'Add input validation on both frontend and backend'
    ];
  }
}

// Execute Systematic Diagnostic
async function runSystematicDiagnostic() {
  const diagnostic = new APSDiagnostic();
  
  try {
    await diagnostic.analyzeArchitecture();
    await diagnostic.testLiveSystem();
    diagnostic.generateReport();
    
    console.log('\n✅ SYSTEMATIC DIAGNOSTIC COMPLETE');
    console.log('📋 Review APS-DIAGNOSTIC-REPORT.json for detailed findings');
    console.log('🎯 Implement recommendations in priority order');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
    process.exit(1);
  }
}

// Execute
runSystematicDiagnostic();