// app/api/monitoring/bias-dashboard/route.js
// API endpoint for bias mitigation monitoring dashboard

import { NextResponse } from 'next/server';
import { getDashboardHTML, getDashboardData } from '../../../../lib/rag/bias-monitoring-dashboard.js';

/**
 * GET /api/monitoring/bias-dashboard
 * Returns the bias mitigation monitoring dashboard
 * 
 * Query parameters:
 * - format: 'html' (default) or 'json'
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'html';
    
    if (format === 'json') {
      // Return JSON data for API consumption
      const dashboardData = getDashboardData();
      
      return NextResponse.json({
        success: true,
        data: dashboardData
      });
    } else {
      // Return HTML dashboard for browser viewing
      const dashboardHTML = getDashboardHTML();
      
      return new NextResponse(dashboardHTML, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
  } catch (error) {
    console.error('❌ Error serving bias dashboard:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate dashboard',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * POST /api/monitoring/bias-dashboard/reset
 * Reset dashboard metrics (for testing)
 */
export async function POST(request) {
  try {
    const { action } = await request.json();
    
    if (action === 'reset') {
      const { biasMonitoringDashboard } = await import('../../../../lib/rag/bias-monitoring-dashboard.js');
      biasMonitoringDashboard.resetMetrics();
      
      return NextResponse.json({
        success: true,
        message: 'Dashboard metrics reset successfully'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Error resetting dashboard:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to reset dashboard',
      details: error.message
    }, { status: 500 });
  }
}