require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExistingData() {
  console.log('🔍 CHECKING EXISTING STUDENT DATA FOR RETROACTIVE ASSOCIATION');
  console.log('================================================================');
  
  try {
    // Check student_profiles without school association
    const { data: unassociatedStudents, error: studentsError } = await supabase
      .from('student_profiles')
      .select('*')
      .is('school_id', null)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (studentsError) {
      console.error('❌ Error checking student profiles:', studentsError);
    } else {
      console.log(`📊 Found ${unassociatedStudents?.length || 0} students without school association`);
      if (unassociatedStudents?.length > 0) {
        console.log('Sample unassociated students:');
        unassociatedStudents.slice(0, 5).forEach(student => {
          console.log(`  - Student ID: ${student.id} (Grade ${student.grade || 'N/A'}) - Created: ${student.created_at}`);
        });
        console.log('First student structure:', JSON.stringify(unassociatedStudents[0], null, 2));
      }
    }
    
    // Check student_assessments without school association
    const { data: unassociatedAssessments, error: assessmentsError } = await supabase
      .from('student_assessments')
      .select('id, student_profile_id, school_id, created_at')
      .is('school_id', null)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (assessmentsError) {
      console.error('❌ Error checking assessments:', assessmentsError);
    } else {
      console.log(`📊 Found ${unassociatedAssessments?.length || 0} assessments without school association`);
    }
    
    // Check total student count
    const { count: totalStudents, error: countError } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`📊 Total students in database: ${totalStudents}`);
    }
    
    // Check schools available for association
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name, code, district')
      .order('name')
      .limit(5);
    
    if (!schoolsError && schools) {
      console.log(`📊 Available schools for association: ${schools.length}`);
      schools.forEach(school => {
        console.log(`  - ${school.name} (${school.code}) - ${school.district}`);
      });
    }
    
    console.log('\n✅ Data analysis complete');
    
  } catch (error) {
    console.error('❌ Exception checking existing data:', error);
  }
}

checkExistingData();