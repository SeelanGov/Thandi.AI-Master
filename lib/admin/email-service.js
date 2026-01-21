/**
 * Email Service - Admin Dashboard
 * Sends email notifications for alerts
 * Created: January 20, 2026
 */

import { Resend } from 'resend';
import { getAlertEmailTemplate } from './email-templates';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Send alert email notification
 * @param {Object} alert - Alert data
 * @param {Array} recipients - Email recipients
 * @returns {Promise<Object>} Send result
 */
export async function sendAlertEmail(alert, recipients) {
  try {
    // Validate inputs
    if (!alert) {
      return {
        success: false,
        error: 'Alert data is required'
      };
    }

    if (!recipients || recipients.length === 0) {
      return {
        success: false,
        error: 'Recipients are required'
      };
    }

    // Check if Resend is configured
    if (!resend) {
      console.warn('Resend API key not configured, skipping email send');
      return {
        success: false,
        error: 'Email service not configured',
        skipped: true
      };
    }

    // Generate email content
    const { subject, html, text } = getAlertEmailTemplate(alert);

    // Send email to all recipients
    const results = [];
    for (const recipient of recipients) {
      try {
        const result = await resend.emails.send({
          from: 'Thandi Admin <alerts@thandi.co.za>',
          to: recipient,
          subject,
          html,
          text
        });

        results.push({
          recipient,
          success: true,
          id: result.id
        });

      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
        results.push({
          recipient,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      success: successCount > 0,
      sent: successCount,
      failed: failureCount,
      results
    };

  } catch (error) {
    console.error('Error in sendAlertEmail:', error);
    return {
      success: false,
      error: 'Failed to send alert email',
      details: error.message
    };
  }
}

/**
 * Send test email
 * @param {string} recipient - Test recipient
 * @returns {Promise<Object>} Send result
 */
export async function sendTestEmail(recipient) {
  try {
    if (!resend) {
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    const result = await resend.emails.send({
      from: 'Thandi Admin <alerts@thandi.co.za>',
      to: recipient,
      subject: 'Thandi Admin Dashboard - Test Email',
      html: '<p>This is a test email from Thandi Admin Dashboard.</p><p>If you received this, email notifications are working correctly.</p>',
      text: 'This is a test email from Thandi Admin Dashboard. If you received this, email notifications are working correctly.'
    });

    return {
      success: true,
      id: result.id,
      message: 'Test email sent successfully'
    };

  } catch (error) {
    console.error('Error sending test email:', error);
    return {
      success: false,
      error: 'Failed to send test email',
      details: error.message
    };
  }
}

/**
 * Validate email address
 * @param {string} email - Email address
 * @returns {boolean} Is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate recipients array
 * @param {Array} recipients - Email recipients
 * @returns {Object} Validation result
 */
export function validateRecipients(recipients) {
  if (!Array.isArray(recipients)) {
    return {
      valid: false,
      error: 'Recipients must be an array'
    };
  }

  if (recipients.length === 0) {
    return {
      valid: false,
      error: 'At least one recipient is required'
    };
  }

  const invalidEmails = recipients.filter(email => !isValidEmail(email));
  
  if (invalidEmails.length > 0) {
    return {
      valid: false,
      error: `Invalid email addresses: ${invalidEmails.join(', ')}`
    };
  }

  return {
    valid: true
  };
}
