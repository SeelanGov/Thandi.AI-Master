import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function restoreMedicine() {
  console.log('🚨 RESTORING SAQA_101600 (MEDICINE) - CRITICAL FIX');
  console.log('═══════════════════════════════════════════════════');
  
  const institutions = [
    {
      qualification_id: 'SAQA_101600',
      institution_name: 'University of Pretoria',
      qualification_name: 'MBChB Medicine',
      aps_min: 35,
      subject_rules: JSON.stringify([
        {"subject":"Core Mathematics","min_mark":70,"required":true},
        {"subject":"Physical Science","min_mark":70,"required":true},
        {"subject":"English","min_mark":65,"required":true}
      ]),
      disqualifiers: JSON.stringify(["Maths Literacy","APS less than 35"]),
      provisional_offer_criteria: '70% in G11 finals + 70% in G12 Sept'
    },
    {
      qualification_id: 'SAQA_101600',
      institution_name: 'University of the Witwatersrand',
      qualification_name: 'MBChB Medicine',
      aps_min: 42,
      subject_rules: JSON.stringify([
        {"subject":"Core Mathematics","min_mark":70,"required":true},
        {"subject":"Physical Science","min_mark":70,"required":true},
        {"subject":"English","min_mark":65,"required":true}
      ]),
      disqualifiers: JSON.stringify(["Maths Literacy","APS less than 42"]),
      provisional_offer_criteria: 'Final G12 results only'
    },
    {
      qualification_id: 'SAQA_101600',
      institution_name: 'University of Cape Town',
      qualification_name: 'MBChB Medicine',
      aps_min: 37,
      subject_rules: JSON.stringify([
        {"subject":"Core Mathematics","min_mark":70,"required":true},
        {"subject":"Physical Science","min_mark":70,"required":true},
        {"subject":"English","min_mark":65,"required":true}
      ]),
      disqualifiers: JSON.stringify(["Maths Literacy","APS less than 37"]),
      provisional_offer_criteria: '70% in G11 finals + 70% in G12 Sept'
    },
    {
      qualification_id: 'SAQA_101600',
      institution_name: 'University of KwaZulu-Natal',
      qualification_name: 'MBChB Medicine',
      aps_min: 38,
      subject_rules: JSON.stringify([
        {"subject":"Core Mathematics","min_mark":70,"required":true},
        {"subject":"Physical Science","min_mark":70,"required":true},
        {"subject":"English","min_mark":65,"required":true}
      ]),
      disqualifiers: JSON.stringify(["Maths Literacy","APS less than 38"]),
      provisional_offer_criteria: '70% in G11 finals + 70% in G12 Sept'
    },
    {
      qualification_id: 'SAQA_101600',
      institution_name: 'North-West University',
      qualification_name: 'MBChB Medicine',
      aps_min: 40,
      subject_rules: JSON.stringify([
        {"subject":"Core Mathematics","min_mark":70,"required":true},
        {"subject":"Physical Science","min_mark":70,"required":true},
        {"subject":"English","min_mark":65,"required":true}
      ]),
      disqualifiers: JSON.stringify(["Maths Literacy","APS less than 40"]),
      provisional_offer_criteria: '70% in G11 finals + 70% in G12 Sept'
    }
  ];
  
  console.log('Inserting 5 Medicine institutions...');
  const {error: instError} = await supabase
    .from('institution_gates')
    .insert(institutions);
    
  if (instError) {
    console.log('❌ Institution insert error:', instError.message);
    return;
  }
  console.log('✅ Medicine institutions restored');
  
  const logistics = {
    qualification_id: 'SAQA_101600',
    nbt_required: true,
    calculation_method: 'Life Orientation excluded. Uses final G11 marks + G12 Sept results.',
    additional_requirements: JSON.stringify([
      {"item":"NBT","deadline":"2025-08-31","type":"Quantitative Literacy"},
      {"item":"Interview","deadline":"2025-09-30","type":"Selection committee"}
    ])
  };
  
  console.log('Inserting Medicine logistics...');
  const {error: logError} = await supabase
    .from('g12_logistics')
    .insert([logistics]);
    
  if (logError) {
    console.log('❌ Logistics insert error:', logError.message);
    return;
  }
  console.log('✅ Medicine logistics restored');
  
  console.log('');
  console.log('🎉 SAQA_101600 (MEDICINE) FULLY RESTORED');
}

restoreMedicine().catch(console.error);
