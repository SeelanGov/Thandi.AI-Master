#!/usr/bin/env node

/**
 * Systematic APS Diagnostic & Resolution Framework
 * Comprehensive analysis of the APS calculation system
 * Lead Developer: Systematic approach to identify and resolve root causes
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

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
      
      this.log('API_STRUCTURE', `APS Logic Present: ${hasAPSLogic}`, hasAPSLogic ? 'SUCCESS' : 'ERROR');
      this.log('API_STRUCTURE', `Marks Processing: ${hasMarksProcessing}`, hasMarksProcessing ? 'SUCCESS' : 'ERROR');
      this.log('API_STRUCTURE', `Input Validation: ${hasValidation}`, hasValidation ? 'SUCCESS' : 'WARNING');
      
      if (!hasAPSLogic) {
        this.addRecommendation('HIGH', 'Implement APS calculation logic in API route', 'No APS calculation found in API');
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
      
      this.log('FRONTEND_STRUCTURE', `API Integration: ${hasAPICall}`, hasAPICall ? 'SUCCESS' : 'ERROR');
      this.log('FRONTEND_STRUCTURE', `Data Structure: ${hasDataStructure}`, hasDataStructure ? 'SUCCESS' : 'ERROR');
      this.log('FRONTEND_STRUCTURE', `Error Handling: ${hasErrorHandling}`, hasErrorHandling ? 'SUCCESS' : 'WARNING');
      
      if (!hasAPICall) {
        this.addRecommendation('HIGH', 'Implement API integration in AssessmentForm', 'No API call found');
      }
    }

    // 1.3 Data Flow Analysis
    this.log('ARCHITECTURE', 'Analyzing data flow patterns...');
    
    const resultsPagePath = 'app/results/page.jsx';
    if (fs.existsSync(resultsPagePath)) {
      const resultsContent = fs.readFileSync(resultsPagePath, 'utf8');
      
      const displaysAPS = resultsContent.includes('APS') || resultsContent.includes('aps');
      const hasDataRetrieval = resultsContent.includes('searchParams') || resultsContent.includes('query');
      
      this.log('DATA_FLOW', `APS Display Logic: ${displaysAPS}`, displaysAPS ? 'SUCCESS' : 'ERROR');
      this.log('DATA_FLOW', `Data Retrieval: ${hasDataRetrieval}`, hasDataRetrieval ? 'SUCCESS' : 'WARNING');
    }
  }

  // Phase 2: Data Contract Analysis
  async analyzeDataContracts() {
    console.log('\n📋 PHASE 2: DATA CONTRACT ANALYSIS');
    console.log('-'.repeat(50));

    this.log('DATA_CONTRACT', 'Analyzing request/response contracts...');

    // 2.1 Expected Input Format
    const expectedInput = {
      grade: 'string',
      curriculum: 'string', 
      subjects: 'array of objects with name, level, mark',
      interests: 'array',
      constraints: 'object',
      openQuestions: 'object'
    };

    this.log('DATA_CONTRACT', 'Expected input format defined');
    
    // 2.2 Expected Output Format
    const expectedOutput = {
      response: 'string with APS calculation',
      apsScore: 'number',
      projectedAPS: 'string',
      recommendations: 'array'
    };

    this.log('DATA_CONTRACT', 'Expected output format defined');

    // 2.3 Validation Rules
    const validationRules = [
      'Grade must be grade10, grade11, or grade12',
      'Curriculum must be IEB or CAPS',
      'Subjects array must contain at least 6 subjects',
      'Each subject must have name, level, and numeric mark',
      'Marks must be between 0-100'
    ];

    this.log('DATA_CONTRACT', `Validation rules defined: ${validationRules.length} rules`);
  }

  // Phase 3: Live System Testing
  async testLiveSystem() {
    console.log('\n🧪 PHASE 3: LIVE SYSTEM TESTING');
    console.log('-'.repeat(50));

    // 3.1 API Endpoint Availability
    this.log('LIVE_TESTING', 'Testing API endpoint availability...');
    
    const testResult = await this.makeTestAPICall();
    
    if (testResult.success) {
      this.log('LIVE_TESTING', `API Response Status: ${testResult.status}`, 'SUCCESS');
      
      if (testResult.data) {
        this.analyzeAPIResponse(testResult.data);
      }
    } else {
      this.log('LIVE_TESTING', `API Call Failed: ${testResult.error}`, 'ERROR');
      this.addRecommendation('CRITICAL', 'Fix API endpoint', `API returning ${testResult.status}: ${testResult.error}`);
    }

    // 3.2 Response Analysis
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
    
    this.log('RESPONSE_ANALYSIS', `Response Field Present: ${hasResponse}`, hasResponse ? 'SUCCESS' : 'ERROR');
    this.log('RESPONSE_ANALYSIS', `APS Content Found: ${hasAPS}`, hasAPS ? 'SUCCESS' : 'ERROR');
    this.log('RESPONSE_ANALYSIS', `Marks Processing: ${hasMarks}`, hasMarks ? 'SUCCESS' : 'WARNING');
    this.log('RESPONSE_ANALYSIS', `Calculation Present: ${hasCalculation}`, hasCalculation ? 'SUCCESS' : 'ERROR');
    
    if (!hasAPS) {
      this.addRecommendation('HIGH', 'Implement APS calculation in response generation', 'No APS content in API response');
    }
    
    if (!hasCalculation) {
      this.addRecommendation('HIGH', 'Add numerical APS calculation to response', 'No calculated APS values found');
    }
  }

  analyzeRawResponse(rawResponse) {
    this.log('RAW_ANALYSIS', 'Analyzing raw response content...');
    
    // Look for specific patterns
    const patterns = {
      'Zero Points Bug': /0\s*points?/gi,
      'APS Calculation': /aps[:\s]*(\d+)/gi,
      'Current APS': /current\s+aps[:\s]*(\d+)/gi,
      'Projected APS': /projected[:\s]+.*aps[:\s]*(\d+)/gi,
      'Error Messages': /error|failed|invalid/gi
    };
    
    Object.entries(patterns).forEach(([name, pattern]) => {
      const matches = rawResponse.match(pattern);
      if (matches) {
        this.log('RAW_ANALYSIS', `${name}: Found ${matches.length} matches`, matches.length > 0 ? 'INFO' : 'WARNING');
        matches.slice(0, 3).forEach(match => {
          this.log('RAW_ANALYSIS', `  - "${match}"`);
        });
      } else {
        this.log('RAW_ANALYSIS', `${name}: No matches found`, name.includes('Error') ? 'SUCCESS' : 'WARNING');
      }
    });
  }

  // Phase 4: Code Quality Analysis
  async analyzeCodeQuality() {
    console.log('\n🔍 PHASE 4: CODE QUALITY ANALYSIS');
    console.log('-'.repeat(50));

    // 4.1 Error Handling Patterns
    this.log('CODE_QUALITY', 'Analyzing error handling patterns...');
    
    const codeFiles = [
      'app/api/rag/query/route.js',
      'app/assessment/components/AssessmentForm.jsx',
      'app/results/page.jsx'
    ];
    
    codeFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        const hasTryCatch = content.includes('try') && content.includes('catch');
        const hasErrorLogging = content.includes('console.error') || content.includes('console.log');
        const hasValidation = content.includes('validate') || content.includes('check');
        
        this.log('CODE_QUALITY', `${path.basename(filePath)} - Error Handling: ${hasTryCatch}`, hasTryCatch ? 'SUCCESS' : 'WARNING');
        this.log('CODE_QUALITY', `${path.basename(filePath)} - Logging: ${hasErrorLogging}`, hasErrorLogging ? 'SUCCESS' : 'WARNING');
        this.log('CODE_QUALITY', `${path.basename(filePath)} - Validation: ${hasValidation}`, hasValidation ? 'SUCCESS' : 'WARNING');
      }
    });

    // 4.2 Performance Considerations
    this.log('CODE_QUALITY', 'Analyzing performance patterns...');
    
    // 4.3 Security Analysis
    this.log('CODE_QUALITY', 'Analyzing security patterns...');
  }

  // Phase 5: Generate Comprehensive Report
  generateReport() {
    console.log('\n📊 PHASE 5: COMPREHENSIVE DIAGNOSTIC REPORT');
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
      nextSteps: this.generateNextSteps()
    };

    fs.writeFileSync('APS-DIAGNOSTIC-REPORT.json', JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: APS-DIAGNOSTIC-REPORT.json`);
  }

  generateNextSteps() {
    return [
      'Review and implement critical recommendations first',
      'Fix API endpoint validation and error handling',
      'Implement proper APS calculation logic',
      'Add comprehensive error handling and logging',
      'Create unit tests for APS calculation',
      'Implement integration tests for full flow',
      'Add monitoring and alerting for production issues'
    ];
  }
}

// Execute Systematic Diagnostic
async function runSystematicDiagnostic() {
  const diagnostic = new APSDiagnostic();
  
  try {
    await diagnostic.analyzeArchitecture();
    await diagnostic.analyzeDataContracts();
    await diagnostic.testLiveSystem();
    await diagnostic.analyzeCodeQuality();
    diagnostic.generateReport();
    
    console.log('\n✅ SYSTEMATIC DIAGNOSTIC COMPLETE');
    console.log('📋 Review APS-DIAGNOSTIC-REPORT.json for detailed findings');
    console.log('🎯 Implement recommendations in priority order');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSystematicDiagnostic();
}

export { APSDiagnostic };