// Simple Academic Calendar for Testing
console.log('Loading simple calendar...');

class SimpleAcademicCalendar {
  constructor() {
    console.log('Creating SimpleAcademicCalendar instance...');
    this.currentYear = 2026;
    this.currentTerm = 1;
  }

  getCurrentAcademicYear() {
    return this.currentYear;
  }

  getCurrentTerm() {
    return this.currentTerm;
  }

  getStudentContext(grade) {
    return {
      grade,
      year: this.currentYear,
      term: this.currentTerm,
      context: grade === 10 ? 'new' : 'continuing'
    };
  }
}

console.log('Creating calendar instance...');
const calendar = new SimpleAcademicCalendar();

console.log('Setting up exports...');
const exports = {
  SimpleAcademicCalendar,
  calendar,
  test: 'working'
};

console.log('Exports object:', exports);

module.exports = exports;

console.log('Module exports set to:', module.exports);