/**
 * Email Service
 * Handles sending email notifications for alerts and system events
 */

/**
 * Send email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email body (HTML or text)
 * @param {Object} options.data - Additional data to include
 * @returns {Promise<Object>} Result with success status
 */
async function sendEmail(options) {
  try {
    // Validate required fields
    if (!options.to) {
      return {
        success: false,
        error: 'Recipient email address is required'
      };
    }

    if (!options.subject) {
      return {
        success: false,
        error: 'Email subject is required'
      };
    }

    // In production, this would integrate with an email service like SendGrid, AWS SES, etc.
    // For now, we'll log the email and return success
    console.log('Email Service: Sending email', {
      to: options.to,
      subject: options.subject,
      timestamp: new Date().toISOString()
    });

    // Simulate email sending
    return {
      success: true,
      messageId: `email-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: `Email service error: ${error.message}`
    };
  }
}

/**
 * Send alert notification email
 * @param {Object} alertData - Alert data
 * @param {Object} recipients - Email recipients
 * @returns {Promise<Object>} Result
 */
async function sendAlertEmail(alertData, recipients) {
  try {
    const subject = `[${alertData.severity.toUpperCase()}] ${alertData.type}: ${alertData.message}`;
    const body = `
      <h2>System Alert</h2>
      <p><strong>Type:</strong> ${alertData.type}</p>
      <p><strong>Severity:</strong> ${alertData.severity}</p>
      <p><strong>Message:</strong> ${alertData.message}</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      ${alertData.metadata ? `<p><strong>Details:</strong> ${JSON.stringify(alertData.metadata, null, 2)}</p>` : ''}
    `;

    const results = [];
    for (const recipient of recipients) {
      const result = await sendEmail({
        to: recipient,
        subject,
        body,
        data: alertData
      });
      results.push({ recipient, ...result });
    }

    const allSuccessful = results.every(r => r.success);

    return {
      success: allSuccessful,
      results,
      sentCount: results.filter(r => r.success).length,
      failedCount: results.filter(r => !r.success).length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendEmail,
  sendAlertEmail
};
