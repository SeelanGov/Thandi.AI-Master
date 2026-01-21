/**
 * Email Templates - Admin Dashboard
 * HTML and text templates for alert emails
 * Created: January 20, 2026
 */

/**
 * Get alert email template
 * @param {Object} alert - Alert data
 * @returns {Object} Email template (subject, html, text)
 */
export function getAlertEmailTemplate(alert) {
  const { alert_type, message, severity, metadata, triggered_at } = alert;

  // Determine severity color and icon
  const severityConfig = {
    info: { color: '#3B82F6', icon: 'ℹ️', label: 'Info' },
    warning: { color: '#F59E0B', icon: '⚠️', label: 'Warning' },
    critical: { color: '#EF4444', icon: '🚨', label: 'Critical' }
  };

  const config = severityConfig[severity] || severityConfig.info;

  // Format alert type for display
  const alertTypeDisplay = alert_type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Format timestamp
  const timestamp = new Date(triggered_at).toLocaleString('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Johannesburg'
  });

  // Build subject
  const subject = `${config.icon} [${config.label}] ${alertTypeDisplay} - Thandi Admin`;

  // Build HTML email
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: ${config.color}; padding: 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ${config.icon} ${config.label} Alert
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              
              <!-- Alert Type -->
              <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Alert Type
                </p>
                <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">
                  ${alertTypeDisplay}
                </p>
              </div>
              
              <!-- Message -->
              <div style="margin-bottom: 20px; padding: 15px; background-color: #f9fafb; border-left: 4px solid ${config.color}; border-radius: 4px;">
                <p style="margin: 0; color: #111827; font-size: 14px; line-height: 1.5;">
                  ${message}
                </p>
              </div>
              
              <!-- Timestamp -->
              <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Triggered At
                </p>
                <p style="margin: 0; color: #111827; font-size: 14px;">
                  ${timestamp}
                </p>
              </div>
              
              <!-- Metadata -->
              ${metadata ? `
              <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Details
                </p>
                <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f9fafb; border-radius: 4px;">
                  ${formatMetadata(metadata)}
                </table>
              </div>
              ` : ''}
              
              <!-- Action Button -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://thandi.co.za'}/admin/alerts" 
                   style="display: inline-block; padding: 12px 24px; background-color: #8B5CF6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  View in Dashboard
                </a>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                This is an automated alert from Thandi Admin Dashboard
              </p>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} Thandi.AI - Career Guidance Platform
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Build plain text email
  const text = `
${config.icon} ${config.label} ALERT - Thandi Admin Dashboard

Alert Type: ${alertTypeDisplay}

Message:
${message}

Triggered At: ${timestamp}

${metadata ? `
Details:
${formatMetadataText(metadata)}
` : ''}

View in Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://thandi.co.za'}/admin/alerts

---
This is an automated alert from Thandi Admin Dashboard
© ${new Date().getFullYear()} Thandi.AI - Career Guidance Platform
  `.trim();

  return { subject, html, text };
}

/**
 * Format metadata for HTML display
 * @param {Object} metadata - Metadata object
 * @returns {string} HTML rows
 */
function formatMetadata(metadata) {
  const rows = [];
  
  for (const [key, value] of Object.entries(metadata)) {
    // Skip complex objects and arrays for email display
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        rows.push(`
          <tr>
            <td style="color: #6b7280; font-size: 13px; padding: 4px 0;">
              ${formatKey(key)}:
            </td>
            <td style="color: #111827; font-size: 13px; padding: 4px 0; text-align: right;">
              ${value.length} items
            </td>
          </tr>
        `);
      }
      continue;
    }
    
    rows.push(`
      <tr>
        <td style="color: #6b7280; font-size: 13px; padding: 4px 0;">
          ${formatKey(key)}:
        </td>
        <td style="color: #111827; font-size: 13px; padding: 4px 0; text-align: right;">
          ${formatValue(value)}
        </td>
      </tr>
    `);
  }
  
  return rows.join('');
}

/**
 * Format metadata for plain text display
 * @param {Object} metadata - Metadata object
 * @returns {string} Formatted text
 */
function formatMetadataText(metadata) {
  const lines = [];
  
  for (const [key, value] of Object.entries(metadata)) {
    // Skip complex objects and arrays
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        lines.push(`  ${formatKey(key)}: ${value.length} items`);
      }
      continue;
    }
    
    lines.push(`  ${formatKey(key)}: ${formatValue(value)}`);
  }
  
  return lines.join('\n');
}

/**
 * Format metadata key for display
 * @param {string} key - Metadata key
 * @returns {string} Formatted key
 */
function formatKey(key) {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format metadata value for display
 * @param {*} value - Metadata value
 * @returns {string} Formatted value
 */
function formatValue(value) {
  if (typeof value === 'number') {
    // Format numbers with commas
    return value.toLocaleString();
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  return String(value);
}
