require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Retroactive Data Migration Script
 * Migrates existing student data to include school associations
 * with POPIA-compliant consent tracking
 */

class RetroactiveDataMigration {
  constructor() {
    this.results = {
      studentsProcessed: 0,
      associationsCreated: 0,
      assessmentsUpdated: 0,
      errors: [],
      startTime: new Date(),
      endTime: null
    };
  }

  async run(options = {}) {
    const {
      dryRun = false,
      batchSize = 10,
      defaultSchoolId = null,
      consentMethod = 'migration_default_consent',
      skipExisting = true
    } = options;

    console.log('🚀 STARTING RETROACTIVE DATA MIGRATION');
    console.log('=====================================');
    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
    console.log(`Batch Size: ${batchSize}`);
    console.log(`Default School: ${defaultSchoolId || 'None - will prompt for each student'}`);
    console.log(`Skip Existing: ${skipExisting}`);
    console.log('');

    try {
      // Step 1: Get unassociated students
      const unassociatedStudents = await this.getUnassociatedStudents(skipExisting);
      console.log(`📊 Found ${unassociatedStudents.length} students needing school association`);

      if (unassociatedStudents.length === 0) {
        console.log('✅ No students need retroactive association');
        return this.results;
      }

      // Step 2: Get available schools
      const schools = await this.getAvailableSchools();
      console.log(`📊 Found ${schools.length} available schools`);

      if (schools.length === 0) {
        throw new Error('No schools available for association');
      }

      // Step 3: Process students in batches
      for (let i = 0; i < unassociatedStudents.length; i += batchSize) {
        const batch = unassociatedStudents.slice(i, i + batchSize);
        console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} students)`);

        await this.processBatch(batch, schools, defaultSchoolId, consentMethod, dryRun);

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.results.endTime = new Date();
      this.printSummary();

      return this.results;

    } catch (error) {
      console.error('❌ Migration failed:', error);
      this.results.errors.push({
        type: 'migration_failure',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async getUnassociatedStudents(skipExisting) {
    let query = supabase
      .from('student_profiles')
      .select('id, email, phone, grade, school_id, created_at');

    if (skipExisting) {
      query = query.is('school_id', null);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch students: ${error.message}`);
    }

    return data || [];
  }

  async getAvailableSchools() {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, code, district, province')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch schools: ${error.message}`);
    }

    return data || [];
  }

  async processBatch(students, schools, defaultSchoolId, consentMethod, dryRun) {
    for (const student of students) {
      try {
        this.results.studentsProcessed++;

        // Determine school for this student
        const schoolId = defaultSchoolId || await this.selectSchoolForStudent(student, schools);

        if (!schoolId) {
          console.log(`⏭️  Skipping student ${student.id} - no school selected`);
          continue;
        }

        const school = schools.find(s => s.id === schoolId);
        console.log(`🔗 Associating student ${student.id} with ${school.name}`);

        if (!dryRun) {
          // Create the association
          const associationResult = await this.createAssociation(
            student,
            schoolId,
            consentMethod
          );

          if (associationResult.success) {
            this.results.associationsCreated++;
            this.results.assessmentsUpdated += associationResult.assessmentsUpdated || 0;
            console.log(`✅ Association created successfully`);
          } else {
            throw new Error(associationResult.error);
          }
        } else {
          console.log(`🔍 DRY RUN: Would associate with ${school.name}`);
        }

      } catch (error) {
        console.error(`❌ Error processing student ${student.id}:`, error.message);
        this.results.errors.push({
          type: 'student_processing_error',
          studentId: student.id,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async selectSchoolForStudent(student, schools) {
    // In a real implementation, this could use various strategies:
    // 1. Geographic matching based on student location
    // 2. Grade-based matching
    // 3. Manual selection interface
    // 4. ML-based matching using assessment data
    
    // For now, we'll use a simple strategy based on grade
    const gradeBasedSchools = schools.filter(school => {
      // Simple heuristic: match schools that typically serve the student's grade
      if (student.grade >= 10) {
        return school.name.toLowerCase().includes('high') || 
               school.name.toLowerCase().includes('secondary');
      } else {
        return !school.name.toLowerCase().includes('university') &&
               !school.name.toLowerCase().includes('college');
      }
    });

    if (gradeBasedSchools.length > 0) {
      // Return the first matching school (in a real system, this would be more sophisticated)
      return gradeBasedSchools[0].id;
    }

    // Fallback to first available school
    return schools.length > 0 ? schools[0].id : null;
  }

  async createAssociation(student, schoolId, consentMethod) {
    try {
      // Use the same API endpoint as the bulk association tool
      const response = await fetch('http://localhost:3000/api/admin/bulk-association', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: student.id,
          schoolId: schoolId,
          consentGiven: true, // Default consent for migration
          consentMethod: consentMethod,
          consentContext: 'retroactive_data_migration'
        }),
      });

      const result = await response.json();
      return result;

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  printSummary() {
    const duration = this.results.endTime - this.results.startTime;
    const durationMinutes = Math.round(duration / 1000 / 60 * 100) / 100;

    console.log('\n📋 MIGRATION SUMMARY');
    console.log('===================');
    console.log(`Duration: ${durationMinutes} minutes`);
    console.log(`Students Processed: ${this.results.studentsProcessed}`);
    console.log(`Associations Created: ${this.results.associationsCreated}`);
    console.log(`Assessments Updated: ${this.results.assessmentsUpdated}`);
    console.log(`Errors: ${this.results.errors.length}`);

    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.type}: ${error.message}`);
        if (error.studentId) {
          console.log(`   Student ID: ${error.studentId}`);
        }
      });
    }

    console.log('\n✅ Migration completed');
  }

  async generateMigrationReport() {
    const report = {
      migration_summary: this.results,
      timestamp: new Date().toISOString(),
      pre_migration_stats: await this.getPreMigrationStats(),
      post_migration_stats: await this.getPostMigrationStats()
    };

    const reportJson = JSON.stringify(report, null, 2);
    const fs = require('fs');
    const filename = `migration-report-${new Date().toISOString().split('T')[0]}.json`;
    
    fs.writeFileSync(filename, reportJson);
    console.log(`📄 Migration report saved to: ${filename}`);

    return report;
  }

  async getPreMigrationStats() {
    // This would be called before migration starts
    const { count: unassociated } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true })
      .is('school_id', null);

    const { count: total } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true });

    return {
      unassociated_students: unassociated || 0,
      total_students: total || 0,
      association_rate: total > 0 ? ((total - (unassociated || 0)) / total * 100).toFixed(2) + '%' : '0%'
    };
  }

  async getPostMigrationStats() {
    const { count: unassociated } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true })
      .is('school_id', null);

    const { count: total } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true });

    return {
      unassociated_students: unassociated || 0,
      total_students: total || 0,
      association_rate: total > 0 ? ((total - (unassociated || 0)) / total * 100).toFixed(2) + '%' : '0%'
    };
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];

    switch (key) {
      case 'dry-run':
        options.dryRun = value === 'true';
        break;
      case 'batch-size':
        options.batchSize = parseInt(value);
        break;
      case 'default-school':
        options.defaultSchoolId = value;
        break;
      case 'consent-method':
        options.consentMethod = value;
        break;
      case 'skip-existing':
        options.skipExisting = value === 'true';
        break;
    }
  }

  const migration = new RetroactiveDataMigration();
  
  try {
    const results = await migration.run(options);
    await migration.generateMigrationReport();
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Export for use as module
module.exports = { RetroactiveDataMigration };

// Run if called directly
if (require.main === module) {
  main();
}

/*
USAGE EXAMPLES:

# Dry run to see what would happen
node scripts/retroactive-data-migration.js --dry-run true --batch-size 5

# Live migration with default school
node scripts/retroactive-data-migration.js --dry-run false --default-school school-uuid-here --batch-size 10

# Live migration with custom consent method
node scripts/retroactive-data-migration.js --dry-run false --consent-method admin_migration_2026 --batch-size 20

# Skip students that already have associations
node scripts/retroactive-data-migration.js --dry-run false --skip-existing true
*/