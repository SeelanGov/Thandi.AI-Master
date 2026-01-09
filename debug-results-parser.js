// Debug ResultsParser specifically

class ResultsParser {
  static parseResults(rawResponse, studentGrade) {
    console.log('parseResults called');
    return { test: true };
  }
}

console.log('Direct test:', ResultsParser.parseResults('test', '12'));

export { ResultsParser };
export default ResultsParser;