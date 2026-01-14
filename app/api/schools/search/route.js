import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Add cache busting headers to response
function addCacheHeaders(response) {
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Cache-Bust', '2026-01-13T16:30:00.000Z');
  return response;
}


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const province = searchParams.get('province');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!query || query.length < 2) {
      return addCacheHeaders(NextResponse.json({
        error: 'Search query must be at least 2 characters',
        results: []
      }, { status: 400 }));
    }

    // Build search query - FILTER OUT PRIMARY SCHOOLS
    let searchQuery = supabase
      .from('school_master')
      .select('school_id, name, province, type, status')
      .not('type', 'ilike', '%PRIMARY%') // ✅ CRITICAL: Filter out primary schools
      .limit(limit);

    // Add text search on school name
    searchQuery = searchQuery.or(
      `name.ilike.%${query}%,school_id.eq.${query}`
    );

    // Add filters if provided
    if (province) {
      searchQuery = searchQuery.eq('province', province);
    }

    if (type) {
      searchQuery = searchQuery.ilike('type', `%${type}%`);
    }

    // Execute search
    const { data: schools, error } = await searchQuery;

    if (error) {
      console.error('School search error:', error);
      return addCacheHeaders(NextResponse.json({
        error: 'Search failed',
        results: []
      }, { status: 500 }));
    }

    // Format results for frontend
    const results = schools.map(school => ({
      school_id: school.school_id,
      name: school.name,
      province: school.province,
      type: school.type,
      status: school.status,
      claim_url: school.status === 'unclaimed' 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/school/claim/${school.school_id}`
        : null
    }));

    return addCacheHeaders(NextResponse.json({
      query,
      total: results.length,
      results
    }));

  } catch (error) {
    console.error('School search API error:', error);
    return addCacheHeaders(NextResponse.json({
      error: 'Internal server error',
      results: []
    }, { status: 500 }));
  }
}

// Get all provinces for filter dropdown
export async function POST(request) {
  try {
    const { action } = await request.json();

    if (action === 'get_provinces') {
      const { data: provinces, error } = await supabase
        .from('school_master')
        .select('province')
        .group('province')
        .order('province');

      if (error) {
        return addCacheHeaders(NextResponse.json({ error: 'Failed to fetch provinces' }, { status: 500 }));
      }

      return addCacheHeaders(NextResponse.json({
        provinces: provinces.map(p => p.province)
      }));
    }

    if (action === 'get_types') {
      const { data: types, error } = await supabase
        .from('school_master')
        .select('type')
        .group('type')
        .order('type');

      if (error) {
        return addCacheHeaders(NextResponse.json({ error: 'Failed to fetch types' }, { status: 500 }));
      }

      return addCacheHeaders(NextResponse.json({
        types: types.map(t => t.type)
      }));
    }

    return addCacheHeaders(NextResponse.json({ error: 'Invalid action' }, { status: 400 }));

  } catch (error) {
    console.error('School search POST error:', error);
    return addCacheHeaders(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
  }
}