#!/usr/bin/env node

/**
 * Fix teaching bias by implementing career diversity requirements
 * This will modify the career matching logic to ensure variety
 */

import { readFile, writeFile } from 'fs/promises';

async function fixTeachingBias() {
  console.log('🔧 FIXING TEACHING BIAS IN CAREER RECOMMENDATIONS');
  console.log('='.repeat(60));
  
  try {
    // Read the current career-matcher.js file
    const careerMatcherPath = 'lib/rag/career-matcher.js';
    let content = await readFile(careerMatcherPath, 'utf8');
    
    console.log('📖 Reading career-matcher.js...');
    
    // Find the applySubjectCategoryPrioritization function
    const functionStart = content.indexOf('function applySubjectCategoryPrioritization');
    
    if (functionStart === -1) {
      console.log('❌ Could not find applySubjectCategoryPrioritization function');
      return;
    }
    
    console.log('✅ Found applySubjectCategoryPrioritization function');
    
    // Add career diversity enforcement
    const diversityEnforcementCode = `
/**
 * ENHANCED: Enforce career diversity to prevent teaching bias
 * Ensures no single career category dominates recommendations
 * @param {Array} careers - Sorted careers
 * @param {Object} profile - Student profile
 * @returns {Array} - Diversity-enforced career list
 */
function enforceCareerDiversity(careers, profile) {
  if (!Array.isArray(careers) || careers.length <= 1) {
    return careers;
  }

  console.log('   🎨 Enforcing career diversity to prevent bias...');
  
  // Group careers by category
  const categoryGroups = {};
  careers.forEach(career => {
    const category = career.category || 'General';
    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
    }
    categoryGroups[category].push(career);
  });
  
  const categories = Object.keys(categoryGroups);
  console.log(\`   📊 Found \${categories.length} categories: \${categories.join(', ')}\`);
  
  // Check for teaching bias (more than 60% teaching careers)
  const teachingCategories = ['Education', 'Teaching'];
  const teachingCareers = careers.filter(c => 
    teachingCategories.includes(c.category) || 
    /teach|education|instructor|professor/gi.test(c.title || '')
  );
  
  const teachingPercentage = (teachingCareers.length / careers.length) * 100;
  console.log(\`   🎓 Teaching careers: \${teachingCareers.length}/\${careers.length} (\${teachingPercentage.toFixed(1)}%)\`);
  
  if (teachingPercentage > 60) {
    console.log('   ⚠️ TEACHING BIAS DETECTED - Applying diversity correction');
    
    // Limit teaching careers to maximum 1 in top 3
    const nonTeachingCareers = careers.filter(c => 
      !teachingCategories.includes(c.category) && 
      !/teach|education|instructor|professor/gi.test(c.title || '')
    );
    
    const diversifiedCareers = [];
    let teachingAdded = 0;
    const maxTeachingInTop3 = 1;
    
    // Add careers ensuring diversity
    for (const career of careers) {
      const isTeaching = teachingCategories.includes(career.category) || 
                        /teach|education|instructor|professor/gi.test(career.title || '');
      
      if (isTeaching) {
        if (teachingAdded < maxTeachingInTop3 || diversifiedCareers.length >= 3) {
          diversifiedCareers.push(career);
          if (diversifiedCareers.length <= 3) teachingAdded++;
        }
      } else {
        diversifiedCareers.push(career);
      }
      
      if (diversifiedCareers.length >= careers.length) break;
    }
    
    console.log(\`   ✅ Diversity correction applied: \${teachingAdded} teaching career(s) in top 3\`);
    return diversifiedCareers;
  }
  
  // No bias detected, return original order
  console.log('   ✅ No teaching bias detected, maintaining original order');
  return careers;
}

/**
 * ENHANCED: Boost STEM careers for mathematics students
 * @param {Array} careers - Career list
 * @param {Object} profile - Student profile
 * @returns {Array} - STEM-boosted career list
 */
function boostSTEMForMathStudents(careers, profile) {
  if (!profile.subjects || !Array.isArray(profile.subjects)) {
    return careers;
  }
  
  const hasMath = profile.subjects.some(subject => 
    /mathematics|math|physical sciences|physics/gi.test(subject)
  );
  
  if (!hasMath) {
    return careers;
  }
  
  console.log('   🧮 Mathematics student detected - boosting STEM careers');
  
  const stemCategories = ['Engineering', 'Technology', 'Science', 'Mathematics', 'Computer Science'];
  const stemKeywords = /engineer|software|programming|technology|science|research|data|computer|IT|developer|analyst/gi;
  
  const boostedCareers = careers.map(career => {
    const isSTEM = stemCategories.includes(career.category) || 
                   stemKeywords.test(career.title || '') ||
                   stemKeywords.test(career.description || '');
    
    if (isSTEM) {
      return {
        ...career,
        combinedScore: (career.combinedScore || career.similarity || 0.5) + 0.15, // Boost STEM
        stemBoosted: true
      };
    }
    
    return career;
  });
  
  // Re-sort with STEM boost
  boostedCareers.sort((a, b) => (b.combinedScore || b.similarity || 0) - (a.combinedScore || a.similarity || 0));
  
  const stemCount = boostedCareers.filter(c => c.stemBoosted).length;
  console.log(\`   ✅ STEM boost applied to \${stemCount} careers\`);
  
  return boostedCareers;
}`;
    
    // Find the end of the applySubjectCategoryPrioritization function
    let braceCount = 0;
    let functionEnd = functionStart;
    let inFunction = false;
    
    for (let i = functionStart; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inFunction = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (inFunction && braceCount === 0) {
          functionEnd = i + 1;
          break;
        }
      }
    }
    
    // Insert the diversity enforcement code after the function
    const beforeFunction = content.substring(0, functionEnd);
    const afterFunction = content.substring(functionEnd);
    
    // Modify the applySubjectCategoryPrioritization function to use diversity enforcement
    let modifiedContent = beforeFunction.replace(
      'return diversifiedCareers;',
      `// ENHANCED: Apply diversity enforcement and STEM boosting
  const diversityEnforced = enforceCareerDiversity(diversifiedCareers, profile);
  const stemBoosted = boostSTEMForMathStudents(diversityEnforced, profile);
  
  return stemBoosted;`
    );
    
    // Add the new functions
    modifiedContent += diversityEnforcementCode + afterFunction;
    
    // Write the modified content back
    await writeFile(careerMatcherPath, modifiedContent, 'utf8');
    
    console.log('✅ Successfully updated career-matcher.js with diversity enforcement');
    console.log('🎯 Changes applied:');
    console.log('   1. Added enforceCareerDiversity() function');
    console.log('   2. Added boostSTEMForMathStudents() function');
    console.log('   3. Modified applySubjectCategoryPrioritization() to use new functions');
    console.log('   4. Teaching careers limited to max 1 in top 3 recommendations');
    console.log('   5. STEM careers boosted for mathematics students');
    
    console.log('\n🚀 DEPLOYMENT READY');
    console.log('The fix will take effect on the next deployment.');
    console.log('Teaching bias should be significantly reduced.');
    
  } catch (error) {
    console.error('❌ Error applying fix:', error.message);
  }
}

fixTeachingBias();