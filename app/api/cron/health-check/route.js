/**
 * Health Check Cron Job
 * 
 * Runs automated health checks every 5 minutes
 * Checks database, API endpoints, and RAG system
 * Stores results in system_health_checks table
 * 
 * Schedule: Every 5 minutes
 * Vercel Cron: 0,5,10,15,20,25,30,35,40,45,50,55 * * * *
 */

import { NextResponse } from 'next/server';
import { runHealthChecks } from '@/lib/admin/health-checker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Verify cron secret (Vercel cron jobs include this header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Running health checks...');
    
    // Run health checks
    const results = await runHealthChecks();
    
    console.log('[CRON] Health checks complete:', {
      database: results.database.status,
      api: results.api.status,
      rag: results.rag.status,
      timestamp: results.timestamp
    });

    return NextResponse.json({
      success: true,
      message: 'Health checks completed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[CRON] Health check failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request) {
  return GET(request);
}
