/**
 * Alert Check Cron Job
 * 
 * Runs automated alert checks every 5 minutes
 * Evaluates error rates, performance, and health check failures
 * Sends email notifications when thresholds are exceeded
 * 
 * Schedule: Every 5 minutes
 * Vercel Cron: 0,5,10,15,20,25,30,35,40,45,50,55 * * * *
 */

import { NextResponse } from 'next/server';
import { evaluateAlerts } from '@/lib/admin/alert-engine';

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

    console.log('[CRON] Running alert checks...');
    
    // Evaluate all alert configurations
    const results = await evaluateAlerts();
    
    console.log('[CRON] Alert checks complete:', {
      alertsTriggered: results.alertsTriggered,
      emailsSent: results.emailsSent,
      timestamp: results.timestamp
    });

    return NextResponse.json({
      success: true,
      message: 'Alert checks completed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[CRON] Alert check failed:', error);
    
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
