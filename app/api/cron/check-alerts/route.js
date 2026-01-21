/**
 * Alert Check Cron Job
 * Scheduled to run every 5 minutes
 * Evaluates alert thresholds and sends notifications
 * Created: January 20, 2026
 */

import { NextResponse } from 'next/server';
import { evaluateAlerts } from '@/lib/admin/alert-engine';
import { sendAlertEmail } from '@/lib/admin/email-service';

/**
 * Validate cron secret (Vercel Cron Jobs)
 */
function validateCronSecret(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-cron-secret';
  
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * GET /api/cron/check-alerts
 * Run alert checks (called by Vercel Cron)
 */
export async function GET(request) {
  try {
    // Validate cron secret
    if (!validateCronSecret(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting alert check...');

    // Evaluate all alerts
    const result = await evaluateAlerts();

    if (!result.success) {
      console.error('[Cron] Alert evaluation failed:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    const { alerts_checked, alerts_triggered, triggered_alerts } = result.data;

    console.log(`[Cron] Checked ${alerts_checked} alert configurations`);
    console.log(`[Cron] Triggered ${alerts_triggered} alerts`);

    // Send email notifications for triggered alerts
    const emailResults = [];
    
    if (triggered_alerts && triggered_alerts.length > 0) {
      for (const alert of triggered_alerts) {
        try {
          // Get recipients from alert metadata
          const recipients = alert.metadata?.recipients || [];
          
          if (recipients.length > 0) {
            const emailResult = await sendAlertEmail(alert, recipients);
            emailResults.push({
              alert_id: alert.id,
              recipients: recipients.length,
              sent: emailResult.sent || 0,
              failed: emailResult.failed || 0
            });

            console.log(`[Cron] Sent alert email to ${emailResult.sent}/${recipients.length} recipients`);
          }
        } catch (error) {
          console.error('[Cron] Failed to send alert email:', error);
          emailResults.push({
            alert_id: alert.id,
            error: error.message
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        alerts_checked,
        alerts_triggered,
        emails_sent: emailResults.reduce((sum, r) => sum + (r.sent || 0), 0),
        email_results: emailResults
      },
      timestamp: new Date().toISOString(),
      message: 'Alert check completed successfully'
    });

  } catch (error) {
    console.error('[Cron] Error in alert check:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Alert check failed',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/check-alerts
 * Manual trigger for testing (requires API key)
 */
export async function POST(request) {
  try {
    // Validate API key for manual triggers
    const apiKey = request.headers.get('X-API-Key');
    const validKey = process.env.ADMIN_API_KEY || 'kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175';
    
    if (apiKey !== validKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    console.log('[Manual] Starting alert check...');

    // Evaluate all alerts
    const result = await evaluateAlerts();

    if (!result.success) {
      console.error('[Manual] Alert evaluation failed:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    const { alerts_checked, alerts_triggered, triggered_alerts } = result.data;

    console.log(`[Manual] Checked ${alerts_checked} alert configurations`);
    console.log(`[Manual] Triggered ${alerts_triggered} alerts`);

    // Send email notifications for triggered alerts
    const emailResults = [];
    
    if (triggered_alerts && triggered_alerts.length > 0) {
      for (const alert of triggered_alerts) {
        try {
          // Get recipients from alert metadata
          const recipients = alert.metadata?.recipients || [];
          
          if (recipients.length > 0) {
            const emailResult = await sendAlertEmail(alert, recipients);
            emailResults.push({
              alert_id: alert.id,
              recipients: recipients.length,
              sent: emailResult.sent || 0,
              failed: emailResult.failed || 0
            });

            console.log(`[Manual] Sent alert email to ${emailResult.sent}/${recipients.length} recipients`);
          }
        } catch (error) {
          console.error('[Manual] Failed to send alert email:', error);
          emailResults.push({
            alert_id: alert.id,
            error: error.message
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        alerts_checked,
        alerts_triggered,
        emails_sent: emailResults.reduce((sum, r) => sum + (r.sent || 0), 0),
        email_results: emailResults
      },
      timestamp: new Date().toISOString(),
      message: 'Alert check completed successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/cron/check-alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
