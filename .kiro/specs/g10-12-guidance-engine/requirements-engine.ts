// Supabase Edge Function: requirements-engine
// Lean implementation - returns seeded data

import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

serve(async (req) => {
  const { learner_grade, subjects, career_interests, institution } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // G10: Check subject conflicts
  if (learner_grade === '10' && subjects?.includes('Maths Literacy') && career_interests?.includes('Engineering')) {
    const { data } = await supabase.from('g10_correction_gates')
      .select('*')
      .eq('subject_choice', 'Maths Literacy')
      .eq('career_category', 'Engineering');
    return new Response(JSON.stringify(data), { status: 200 });
  }

  // G11: Check institution gates
  if (learner_grade === '11' && institution) {
    const { data } = await supabase.from('institution_gates')
      .select('*')
      .ilike('institution_name', `%${institution}%`);
    return new Response(JSON.stringify(data), { status: 200 });
  }

  // G12: Check logistics
  if (learner_grade === '12') {
    const { data } = await supabase.from('g12_logistics')
      .select('*');
    return new Response(JSON.stringify(data), { status: 200 });
  }

  return new Response(JSON.stringify([]), { status: 200 });
});
