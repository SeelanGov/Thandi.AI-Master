/**
 * Test Runner for Results Page Redesign
 * Tests parsing, validation, and component rendering
 */

import { ResultsParser } from '../services/resultsParser.js';
import { GradeSpecificValidator } from '../services/gradeSpecificValidator.js';
import { sampleResponses, invalidResponse } from './sampleResponses.js';

class ResultsTestRunner {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting Results Page Redesign Tests...\n');

    // Test 1: Grade-specific parsing
    await this.testGradeSpecificParsing();

    // Test 2: Content validation
    await this.testContentValidation();

    // Test 3: Component data structure
    await this.testComponentDataStructure();

    // Test 4: Error handling
    await this.testErrorHandling();

    // Test 5: Grade-specific compliance
    await this.testGradeCompliance();

    // Print summary
    this.printTestSummary();

    return {
      passed: this.passedTests,
      failed: this.failedTests,
      total: this.testResults.length,
      results: this.testResults
    };
  }

  /**
   * Test grade-specific parsing for all grades
   */
  async testGradeSpecificParsing() {
    console.log('📋 Testing Grade-Specific Parsing...');

    for (const [grade, response] of Object.entries(sampleResponses)) {
      try {
        const parsed = ResultsParser.parseResults(response.fullResponse, response.grade);
        
        // Validate structure
        const hasRequiredFields = parsed.headerData && parsed.programs && 
                                 parsed.bursaries && parsed.actionPlan && 
                                 parsed.gradeContext;

        if (hasRequiredFields) {
          this.logTest(`✅ Grade ${response.grade} parsing`, 'PASS', 
            `Parsed ${parsed.programs.length} programs, ${parsed.bursaries.length} bursaries`);
        } else {
          this.logTest(`❌ Grade ${response.grade} parsing`, 'FAIL', 
            'Missing required fields in parsed result');
        }

        // Validate grade context
        if (parsed.gradeContext.grade === parseInt(response.grade)) {
          this.logTest(`✅ Grade ${response.grade} context`, 'PASS', 
            `Correct grade context: ${parsed.gradeContext.phase}`);
        } else {
          this.logTest(`❌ Grade ${response.grade} context`, 'FAIL', 
            `Grade mismatch: expected ${response.grade}, got ${parsed.gradeContext.grade}`);
        }

      } catch (error) {
        this.logTest(`❌ Grade ${response.grade} parsing`, 'FAIL', error.message);
      }
    }
  }

  /**
   * Test content validation
   */
  async testContentValidation() {
    console.log('\n🔍 Testing Content Validation...');

    // Test valid content
    for (const [grade, response] of Object.entries(sampleResponses)) {
      const validator = new GradeSpecificValidator(response.grade);
      
      try {
        const validatedContent = validator.validateContent(response.fullResponse);
        
        if (validatedContent === response.fullResponse) {
          this.logTest(`✅ Grade ${response.grade} validation`, 'PASS', 
            'Content validated successfully');
        } else {
          this.logTest(`❌ Grade ${response.grade} validation`, 'FAIL', 
            'Content was modified during validation');
        }
      } catch (error) {
        this.logTest(`❌ Grade ${response.grade} validation`, 'FAIL', error.message);
      }
    }

    // Test invalid content
    const invalidValidator = new GradeSpecificValidator(invalidResponse.grade);
    try {
      // Capture console warnings
      const originalWarn = console.warn;
      let warnings = [];
      console.warn = (...args) => warnings.push(args.join(' '));

      invalidValidator.validateContent(invalidResponse.fullResponse);

      console.warn = originalWarn;

      if (warnings.length > 0) {
        this.logTest('✅ Invalid content detection', 'PASS', 
          `Detected ${warnings.length} validation issues`);
      } else {
        this.logTest('❌ Invalid content detection', 'FAIL', 
          'Should have detected validation issues');
      }
    } catch (error) {
      this.logTest('❌ Invalid content detection', 'FAIL', error.message);
    }
  }

  /**
   * Test component data structure
   */
  async testComponentDataStructure() {
    console.log('\n🏗️ Testing Component Data Structure...');

    const grade12Response = sampleResponses.grade12;
    const parsed = ResultsParser.parseResults(grade12Response.fullResponse, grade12Response.grade);

    // Test HeaderCard data
    const headerTests = [
      ['gradeLevel', typeof parsed.headerData.gradeLevel === 'number'],
      ['studentStatus', typeof parsed.headerData.studentStatus === 'string'],
      ['hasMarks', typeof parsed.headerData.hasMarks === 'boolean'],
      ['apsScore', parsed.headerData.apsScore !== undefined]
    ];

    headerTests.forEach(([field, condition]) => {
      if (condition) {
        this.logTest(`✅ HeaderCard.${field}`, 'PASS', 'Correct data type');
      } else {
        this.logTest(`❌ HeaderCard.${field}`, 'FAIL', 'Incorrect or missing data');
      }
    });

    // Test ProgramCard data
    if (parsed.programs.length > 0) {
      const program = parsed.programs[0];
      const programTests = [
        ['program', typeof program.program === 'string'],
        ['university', typeof program.university === 'string'],
        ['apsRequired', typeof program.apsRequired === 'number'],
        ['admissionChance', typeof program.admissionChance === 'number'],
        ['feasibility', ['High', 'Medium', 'Low', 'Exploratory'].includes(program.feasibility)]
      ];

      programTests.forEach(([field, condition]) => {
        if (condition) {
          this.logTest(`✅ ProgramCard.${field}`, 'PASS', 'Correct data structure');
        } else {
          this.logTest(`❌ ProgramCard.${field}`, 'FAIL', 'Incorrect data structure');
        }
      });
    }

    // Test ActionCard data
    const actionTests = [
      ['timeline', typeof parsed.actionPlan.timeline === 'string'],
      ['urgency', ['HIGH', 'MEDIUM', 'LOW'].includes(parsed.actionPlan.urgency)],
      ['focusAreas', Array.isArray(parsed.actionPlan.focusAreas)],
      ['actionItems', Array.isArray(parsed.actionPlan.actionItems)]
    ];

    actionTests.forEach(([field, condition]) => {
      if (condition) {
        this.logTest(`✅ ActionCard.${field}`, 'PASS', 'Correct data structure');
      } else {
        this.logTest(`❌ ActionCard.${field}`, 'FAIL', 'Incorrect data structure');
      }
    });
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    console.log('\n🚨 Testing Error Handling...');

    // Test empty response
    try {
      const parsed = ResultsParser.parseResults('', '12');
      if (parsed && parsed.headerData) {
        this.logTest('✅ Empty response handling', 'PASS', 'Graceful fallback provided');
      } else {
        this.logTest('❌ Empty response handling', 'FAIL', 'No fallback for empty response');
      }
    } catch (error) {
      this.logTest('❌ Empty response handling', 'FAIL', 'Should not throw on empty response');
    }

    // Test malformed response
    try {
      const parsed = ResultsParser.parseResults('This is not a structured response', '11');
      if (parsed && parsed.headerData) {
        this.logTest('✅ Malformed response handling', 'PASS', 'Graceful fallback provided');
      } else {
        this.logTest('❌ Malformed response handling', 'FAIL', 'No fallback for malformed response');
      }
    } catch (error) {
      this.logTest('❌ Malformed response handling', 'FAIL', 'Should not throw on malformed response');
    }

    // Test invalid grade
    try {
      const parsed = ResultsParser.parseResults(sampleResponses.grade12.fullResponse, 'invalid');
      if (parsed && parsed.gradeContext) {
        this.logTest('✅ Invalid grade handling', 'PASS', 'Handled invalid grade gracefully');
      } else {
        this.logTest('❌ Invalid grade handling', 'FAIL', 'Did not handle invalid grade');
      }
    } catch (error) {
      this.logTest('❌ Invalid grade handling', 'FAIL', 'Should not throw on invalid grade');
    }
  }

  /**
   * Test grade-specific compliance
   */
  async testGradeCompliance() {
    console.log('\n🎯 Testing Grade-Specific Compliance...');

    // Grade 10 compliance tests
    const grade10Parsed = ResultsParser.parseResults(
      sampleResponses.grade10.fullResponse, 
      sampleResponses.grade10.grade
    );

    // Grade 10 should not have current APS score
    if (grade10Parsed.headerData.apsScore === null) {
      this.logTest('✅ Grade 10 APS compliance', 'PASS', 'No current APS score shown');
    } else {
      this.logTest('❌ Grade 10 APS compliance', 'FAIL', 'Should not show current APS for Grade 10');
    }

    // Grade 10 should have exploration focus
    const hasExplorationFocus = grade10Parsed.actionPlan.focusAreas.some(area => 
      area.toLowerCase().includes('exploration') || area.toLowerCase().includes('discovery')
    );
    if (hasExplorationFocus) {
      this.logTest('✅ Grade 10 focus compliance', 'PASS', 'Includes exploration focus');
    } else {
      this.logTest('❌ Grade 10 focus compliance', 'FAIL', 'Missing exploration focus');
    }

    // Grade 12 compliance tests
    const grade12Parsed = ResultsParser.parseResults(
      sampleResponses.grade12.fullResponse, 
      sampleResponses.grade12.grade
    );

    // Grade 12 should have high urgency
    if (grade12Parsed.actionPlan.urgency === 'HIGH') {
      this.logTest('✅ Grade 12 urgency compliance', 'PASS', 'High urgency for final year');
    } else {
      this.logTest('❌ Grade 12 urgency compliance', 'FAIL', 'Should have high urgency for Grade 12');
    }

    // Grade 12 should have application focus
    const hasApplicationFocus = grade12Parsed.actionPlan.focusAreas.some(area => 
      area.toLowerCase().includes('application') || area.toLowerCase().includes('deadline')
    );
    if (hasApplicationFocus) {
      this.logTest('✅ Grade 12 focus compliance', 'PASS', 'Includes application focus');
    } else {
      this.logTest('❌ Grade 12 focus compliance', 'FAIL', 'Missing application focus');
    }
  }

  /**
   * Log test result
   */
  logTest(name, status, details) {
    const result = { name, status, details, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    
    if (status === 'PASS') {
      this.passedTests++;
    } else {
      this.failedTests++;
    }
    
    console.log(`  ${name}: ${details}`);
  }

  /**
   * Print test summary
   */
  printTestSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📊 Total: ${this.testResults.length}`);
    console.log(`🎯 Success Rate: ${Math.round((this.passedTests / this.testResults.length) * 100)}%`);
    
    if (this.failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults
        .filter(test => test.status === 'FAIL')
        .forEach(test => console.log(`  - ${test.name}: ${test.details}`));
    }
    
    console.log('\n🎉 Testing complete!');
  }

  /**
   * Generate test report
   */
  generateReport() {
    return {
      summary: {
        passed: this.passedTests,
        failed: this.failedTests,
        total: this.testResults.length,
        successRate: Math.round((this.passedTests / this.testResults.length) * 100)
      },
      results: this.testResults,
      timestamp: new Date().toISOString()
    };
  }
}

// Export for use in browser or Node.js
export { ResultsTestRunner };

// Auto-run if called directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.ResultsTestRunner = ResultsTestRunner;
  console.log('Results Test Runner loaded. Run: new ResultsTestRunner().runAllTests()');
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = { ResultsTestRunner };
}