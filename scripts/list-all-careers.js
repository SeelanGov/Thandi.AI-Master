// List all careers in database

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listCareers() {
  const { data, error } = await supabase
    .from('careers')
    .select('career_code, career_title, career_category')
    .order('career_category, career_title');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`\n📊 Total careers in database: ${data.length}\n`);
  
  // Group by category
  const byCategory = {};
  data.forEach(career => {
    if (!byCategory[career.career_category]) {
      byCategory[career.career_category] = [];
    }
    byCategory[career.career_category].push(career);
  });

  Object.keys(byCategory).sort().forEach(category => {
    console.log(`\n${category} (${byCategory[category].length} careers):`);
    console.log('─'.repeat(60));
    byCategory[category].forEach(c => {
      console.log(`  ${c.career_code.padEnd(35)} ${c.career_title}`);
    });
  });

  console.log('\n');
}

listCareers();
