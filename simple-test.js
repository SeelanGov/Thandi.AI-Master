const ResultsParser = {
  parseResults(rawResponse, studentGrade) {
    console.log('parseResults called');
    return {
      headerData: { grade: parseInt(studentGrade) },
      programs: [],
      bursaries: [],
      actionPlan: { actionItems: [] },
      alternativeOptions: [],
      gradeContext: { grade: parseInt(studentGrade) }
    };
  }
};

export { ResultsParser };
export default ResultsParser;