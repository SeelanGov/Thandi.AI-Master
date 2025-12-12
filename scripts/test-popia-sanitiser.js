// Test POPIA Sanitiser

import { POPIASanitiser } from '../lib/compliance/popia-sanitiser.js';

const sanitiser = new POPIASanitiser({ strictMode: true });

console.log('🔒 Testing POPIA Sanitiser\n');

// Test 1: Sanitise student profile with PII
console.log('Test 1: Student Profile Sanitisation');
const profileWithPII = {
  studentId: 'STU12345',
  name: 'Thabo',
  surname: 'Molefe',
  idNumber: '0305145678089',
  email: 'thabo.molefe@school.co.za',
  phone: '+27821234567',
  schoolName: 'Johannesburg High School',
  address: '123 Main Street, Sandton',
  grade: 11,
  mathType: 'Pure Mathematics',
  mathMark: 67,
  subjects: ['Mathematics', 'Physical Sciences', 'English'],
  marks: {
    'Mathematics': 67,
    'Physical Sciences': 72,
    'English': 65
  },
  location: 'Johannesburg, Gauteng',
  budgetLimit: 'low',
  interests: 'I want to be an engineer like my uncle Sipho Dlamini'
};

const sanitisedProfile = sanitiser.sanitiseProfile(profileWithPII);
console.log('Original keys:', Object.keys(profileWithPII));
console.log('Sanitised keys:', Object.keys(sanitisedProfile));
console.log('Sanitised profile:', JSON.stringify(sanitisedProfile, null, 2));

// Test 2: Validate sanitisation
console.log('\nTest 2: Validation');
const validation = sanitiser.validateSanitised(sanitisedProfile);
console.log('Valid:', validation.valid);
console.log('Violations:', validation.violations);

// Test 3: Sanitise report text
console.log('\nTest 3: Report Text Sanitisation');
const reportWithPII = `
Student Thabo Molefe (ID: 0305145678089) from Johannesburg High School
has been assessed. Contact: thabo.molefe@school.co.za or +27821234567.
Address: 123 Main Street, Sandton. Assessment date: 29/11/2025.
`;

const sanitisedReport = sanitiser.sanitiseReportText(reportWithPII);
console.log('Original:', reportWithPII);
console.log('Sanitised:', sanitisedReport);

// Test 4: Audit trail
console.log('\nTest 4: Audit Trail');
const auditTrail = sanitiser.getAuditTrail();
console.log('Audit entries:', auditTrail.length);
console.log('Sample entry:', auditTrail[0]);

// Test 5: Mark generalisation
console.log('\nTest 5: Mark Generalisation');
console.log('67% → ', sanitiser._generaliseMarks(67));
console.log('72% → ', sanitiser._generaliseMarks(72));
console.log('65% → ', sanitiser._generaliseMarks(65));

// Test 6: Location generalisation
console.log('\nTest 6: Location Generalisation');
console.log('Johannesburg → ', sanitiser._generaliseLocation('Johannesburg'));
console.log('Cape Town, Western Cape → ', sanitiser._generaliseLocation('Cape Town, Western Cape'));
console.log('123 Main St, Durban → ', sanitiser._generaliseLocation('123 Main St, Durban'));

console.log('\n✅ All tests complete');
