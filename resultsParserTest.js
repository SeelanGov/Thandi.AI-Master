/**
 * Results Parser Service - Test version in root
 */

class ResultsParser {
  static parseResults(rawResponse, studentGrade) {
    console.log('🔄 parseResults called');
    return { test: true, grade: studentGrade };
  }
}

export { ResultsParser };
export default ResultsParser;