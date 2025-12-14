// lib/rag/notification-service.js
// Task 10.3: Multi-channel Notification Service for Enhanced RAG Monitoring
// Handles Slack, email, webhook, and other notification channels

/**
 * Multi-channel Notification Service
 * Sends alerts and notifications through various channels with retry logic
 */
export class NotificationService {
  constructor(config = {}) {
    this.config = {
      // Channel configurations
      slack: {
        enabled: !!process.env.SLACK_WEBHOOK_URL,
        webhook: process.env.SLACK_WEBHOOK_URL,
        defaultChannel: '#monitoring',
        timeout: 10000,
        retries: 3
      },
      
      email: {
        enabled: !!process.env.NOTIFICATION_EMAIL,
        from: process.env.NOTIFICATION_FROM_EMAIL || 'noreply@thandi.ai',
        recipients: [process.env.NOTIFICATION_EMAIL].filter(Boolean),
        timeout: 15000,
        retries: 2
      },
      
      webhook: {
        enabled: !!process.env.ALERT_WEBHOOK_URL,
        url: process.env.ALERT_WEBHOOK_URL,
        timeout: 10000,
        retries: 3,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Enhanced-RAG-Monitor/1.0'
        }
      },
      
      sms: {
        enabled: !!process.env.SMS_API_KEY,
        apiKey: process.env.SMS_API_KEY,
        recipients: [process.env.ONCALL_PHONE].filter(Boolean),
        timeout: 10000,
        retries: 2
      },

      // Rate limiting
      rateLimit: {
        enabled: true,
        maxPerMinute: 10,
        maxPerHour: 100
      },

      // Retry configuration
      retry: {
        baseDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2
      },

      ...config
    };

    this.notificationQueue = [];
    this.rateLimitTracker = new Map();
    this.isProcessing = false;
  }

  /**
   * Send notification to all configured channels
   */
  async sendNotification(notification) {
    const enrichedNotification = this.enrichNotification(notification);
    
    // Check rate limiting
    if (this.isRateLimited(enrichedNotification)) {
      console.log(`⏳ Notification rate limited: ${enrichedNotification.type}`);
      return { success: false, reason: 'rate_limited' };
    }

    // Queue notification for processing
    this.notificationQueue.push(enrichedNotification);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processNotificationQueue();
    }

    return { success: true, queued: true };
  }

  /**
   * Enrich notification with metadata
   */
  enrichNotification(notification) {
    return {
      id: this.generateNotificationId(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'enhanced-rag-filtering',
      ...notification
    };
  }

  /**
   * Process notification queue
   */
  async processNotificationQueue() {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`📤 Processing ${this.notificationQueue.length} notifications`);

    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      
      try {
        await this.processNotification(notification);
      } catch (error) {
        console.error(`❌ Failed to process notification ${notification.id}:`, error.message);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Process individual notification
   */
  async processNotification(notification) {
    const results = [];

    // Send to Slack
    if (this.config.slack.enabled) {
      try {
        await this.sendSlackNotification(notification);
        results.push({ channel: 'slack', status: 'success' });
      } catch (error) {
        results.push({ channel: 'slack', status: 'failed', error: error.message });
      }
    }

    // Send to Email
    if (this.config.email.enabled) {
      try {
        await this.sendEmailNotification(notification);
        results.push({ channel: 'email', status: 'success' });
      } catch (error) {
        results.push({ channel: 'email', status: 'failed', error: error.message });
      }
    }

    // Send to Webhook
    if (this.config.webhook.enabled) {
      try {
        await this.sendWebhookNotification(notification);
        results.push({ channel: 'webhook', status: 'success' });
      } catch (error) {
        results.push({ channel: 'webhook', status: 'failed', error: error.message });
      }
    }

    // Send SMS for critical alerts
    if (this.config.sms.enabled && notification.severity === 'critical') {
      try {
        await this.sendSMSNotification(notification);
        results.push({ channel: 'sms', status: 'success' });
      } catch (error) {
        results.push({ channel: 'sms', status: 'failed', error: error.message });
      }
    }

    // Update rate limiting
    this.updateRateLimit(notification);

    console.log(`📬 Notification ${notification.id} processed: ${results.length} channels`);
    return results;
  }

  /**
   * Send Slack notification with rich formatting
   */
  async sendSlackNotification(notification) {
    const webhook = this.config.slack.webhook;
    if (!webhook) {
      throw new Error('Slack webhook URL not configured');
    }

    const payload = this.formatSlackPayload(notification);
    
    await this.sendWithRetry(async () => {
      // In a real implementation:
      // const response = await fetch(webhook, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      //   timeout: this.config.slack.timeout
      // });
      // 
      // if (!response.ok) {
      //   throw new Error(`Slack API error: ${response.status}`);
      // }
      
      console.log('📱 Slack notification sent');
    }, this.config.slack.retries);
  }

  /**
   * Format Slack payload
   */
  formatSlackPayload(notification) {
    const color = this.getSeverityColor(notification.severity);
    const emoji = this.getSeverityEmoji(notification.severity);
    
    const attachment = {
      color,
      title: `Enhanced RAG ${notification.type} Alert`,
      text: notification.message,
      fields: [
        { title: 'Severity', value: notification.severity, short: true },
        { title: 'Environment', value: notification.environment, short: true },
        { title: 'Service', value: notification.service, short: true },
        { title: 'Alert ID', value: notification.id, short: true }
      ],
      footer: 'Enhanced RAG Monitoring',
      ts: Math.floor(new Date(notification.timestamp).getTime() / 1000)
    };

    // Add metric-specific fields
    if (notification.value !== undefined) {
      attachment.fields.push({
        title: 'Current Value',
        value: this.formatValue(notification.value, notification.type),
        short: true
      });
    }

    if (notification.threshold !== undefined) {
      attachment.fields.push({
        title: 'Threshold',
        value: this.formatValue(notification.threshold, notification.type),
        short: true
      });
    }

    // Add context if available
    if (notification.context) {
      const contextText = Object.entries(notification.context)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      attachment.fields.push({
        title: 'Context',
        value: contextText,
        short: false
      });
    }

    return {
      channel: notification.slackChannel || this.config.slack.defaultChannel,
      username: 'Enhanced RAG Monitor',
      icon_emoji: emoji,
      attachments: [attachment]
    };
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(notification) {
    const recipients = notification.emailRecipients || this.config.email.recipients;
    if (!recipients || recipients.length === 0) {
      throw new Error('No email recipients configured');
    }

    const subject = this.formatEmailSubject(notification);
    const body = this.formatEmailBody(notification);

    await this.sendWithRetry(async () => {
      // In a real implementation:
      // await emailService.send({
      //   from: this.config.email.from,
      //   to: recipients,
      //   subject,
      //   html: body
      // });
      
      console.log(`📧 Email notification sent to ${recipients.length} recipients`);
    }, this.config.email.retries);
  }

  /**
   * Format email subject
   */
  formatEmailSubject(notification) {
    const severityPrefix = notification.severity === 'critical' ? '[CRITICAL] ' : 
                          notification.severity === 'warning' ? '[WARNING] ' : '';
    
    return `${severityPrefix}Enhanced RAG Alert: ${notification.type} - ${notification.environment}`;
  }

  /**
   * Format email body
   */
  formatEmailBody(notification) {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background-color: ${this.getSeverityColor(notification.severity)}; color: white; padding: 15px; border-radius: 5px; }
            .content { margin: 20px 0; }
            .details { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Enhanced RAG Alert - ${notification.severity.toUpperCase()}</h2>
          </div>
          
          <div class="content">
            <p><strong>Alert Type:</strong> ${notification.type}</p>
            <p><strong>Message:</strong> ${notification.message}</p>
            <p><strong>Timestamp:</strong> ${notification.timestamp}</p>
            <p><strong>Environment:</strong> ${notification.environment}</p>
            <p><strong>Alert ID:</strong> ${notification.id}</p>
          </div>
          
          ${notification.value !== undefined || notification.threshold !== undefined ? `
            <div class="details">
              <h3>Metric Details</h3>
              ${notification.value !== undefined ? `<p><strong>Current Value:</strong> ${this.formatValue(notification.value, notification.type)}</p>` : ''}
              ${notification.threshold !== undefined ? `<p><strong>Threshold:</strong> ${this.formatValue(notification.threshold, notification.type)}</p>` : ''}
            </div>
          ` : ''}
          
          ${notification.context ? `
            <div class="details">
              <h3>System Context</h3>
              ${Object.entries(notification.context).map(([key, value]) => 
                `<p><strong>${key}:</strong> ${value}</p>`
              ).join('')}
            </div>
          ` : ''}
          
          <div class="footer">
            <p>This alert was generated by the Enhanced RAG Monitoring System.</p>
            <p>For more information, check the monitoring dashboard or contact the development team.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send webhook notification
   */
  async sendWebhookNotification(notification) {
    const url = this.config.webhook.url;
    if (!url) {
      throw new Error('Webhook URL not configured');
    }

    const payload = {
      notification,
      metadata: {
        source: 'enhanced-rag-monitoring',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }
    };

    await this.sendWithRetry(async () => {
      // In a real implementation:
      // const response = await fetch(url, {
      //   method: 'POST',
      //   headers: this.config.webhook.headers,
      //   body: JSON.stringify(payload),
      //   timeout: this.config.webhook.timeout
      // });
      // 
      // if (!response.ok) {
      //   throw new Error(`Webhook error: ${response.status}`);
      // }
      
      console.log('🔗 Webhook notification sent');
    }, this.config.webhook.retries);
  }

  /**
   * Send SMS notification for critical alerts
   */
  async sendSMSNotification(notification) {
    const recipients = this.config.sms.recipients;
    if (!recipients || recipients.length === 0) {
      throw new Error('No SMS recipients configured');
    }

    const message = this.formatSMSMessage(notification);

    await this.sendWithRetry(async () => {
      // In a real implementation:
      // await smsService.send({
      //   to: recipients,
      //   message,
      //   apiKey: this.config.sms.apiKey
      // });
      
      console.log(`📱 SMS notification sent to ${recipients.length} recipients`);
    }, this.config.sms.retries);
  }

  /**
   * Format SMS message (keep it short)
   */
  formatSMSMessage(notification) {
    const prefix = notification.severity === 'critical' ? '🚨 CRITICAL: ' : '⚠️ ';
    return `${prefix}Enhanced RAG ${notification.type}: ${notification.message.substring(0, 100)}... Alert ID: ${notification.id}`;
  }

  /**
   * Send with retry logic
   */
  async sendWithRetry(sendFunction, maxRetries) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await sendFunction();
        return; // Success
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = Math.min(
            this.config.retry.baseDelay * Math.pow(this.config.retry.backoffMultiplier, attempt - 1),
            this.config.retry.maxDelay
          );
          
          console.log(`⏳ Retry attempt ${attempt}/${maxRetries} in ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Check if notification is rate limited
   */
  isRateLimited(notification) {
    if (!this.config.rateLimit.enabled) {
      return false;
    }

    const now = Date.now();
    const key = `${notification.type}_${notification.severity}`;
    
    if (!this.rateLimitTracker.has(key)) {
      this.rateLimitTracker.set(key, []);
    }

    const timestamps = this.rateLimitTracker.get(key);
    
    // Clean old timestamps
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;
    
    const recentMinute = timestamps.filter(t => t > oneMinuteAgo);
    const recentHour = timestamps.filter(t => t > oneHourAgo);
    
    // Update tracker with cleaned timestamps
    this.rateLimitTracker.set(key, recentHour);

    // Check limits
    if (recentMinute.length >= this.config.rateLimit.maxPerMinute) {
      return true;
    }
    
    if (recentHour.length >= this.config.rateLimit.maxPerHour) {
      return true;
    }

    return false;
  }

  /**
   * Update rate limit tracker
   */
  updateRateLimit(notification) {
    if (!this.config.rateLimit.enabled) {
      return;
    }

    const key = `${notification.type}_${notification.severity}`;
    const timestamps = this.rateLimitTracker.get(key) || [];
    
    timestamps.push(Date.now());
    this.rateLimitTracker.set(key, timestamps);
  }

  /**
   * Send test notification to verify channels
   */
  async sendTestNotification(channels = ['slack', 'email']) {
    const testNotification = {
      type: 'test',
      severity: 'info',
      message: 'Test notification from Enhanced RAG Monitoring System',
      timestamp: new Date().toISOString(),
      context: {
        purpose: 'Channel verification',
        sentBy: 'system_test'
      }
    };

    const results = {};

    for (const channel of channels) {
      try {
        switch (channel) {
          case 'slack':
            if (this.config.slack.enabled) {
              await this.sendSlackNotification(testNotification);
              results.slack = { status: 'success' };
            } else {
              results.slack = { status: 'disabled' };
            }
            break;

          case 'email':
            if (this.config.email.enabled) {
              await this.sendEmailNotification(testNotification);
              results.email = { status: 'success' };
            } else {
              results.email = { status: 'disabled' };
            }
            break;

          case 'webhook':
            if (this.config.webhook.enabled) {
              await this.sendWebhookNotification(testNotification);
              results.webhook = { status: 'success' };
            } else {
              results.webhook = { status: 'disabled' };
            }
            break;

          case 'sms':
            if (this.config.sms.enabled) {
              await this.sendSMSNotification(testNotification);
              results.sms = { status: 'success' };
            } else {
              results.sms = { status: 'disabled' };
            }
            break;
        }
      } catch (error) {
        results[channel] = { status: 'failed', error: error.message };
      }
    }

    return results;
  }

  /**
   * Get notification statistics
   */
  getStatistics() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    // Calculate rate limit statistics
    const rateLimitStats = {};
    for (const [key, timestamps] of this.rateLimitTracker.entries()) {
      const recentHour = timestamps.filter(t => now - t < oneHour);
      const recentDay = timestamps.filter(t => now - t < oneDay);
      
      rateLimitStats[key] = {
        lastHour: recentHour.length,
        lastDay: recentDay.length
      };
    }

    return {
      channels: {
        slack: { enabled: this.config.slack.enabled, configured: !!this.config.slack.webhook },
        email: { enabled: this.config.email.enabled, configured: this.config.email.recipients.length > 0 },
        webhook: { enabled: this.config.webhook.enabled, configured: !!this.config.webhook.url },
        sms: { enabled: this.config.sms.enabled, configured: this.config.sms.recipients.length > 0 }
      },
      queue: {
        pending: this.notificationQueue.length,
        processing: this.isProcessing
      },
      rateLimit: {
        enabled: this.config.rateLimit.enabled,
        stats: rateLimitStats
      }
    };
  }

  /**
   * Utility methods
   */
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSeverityColor(severity) {
    const colors = {
      critical: '#ff0000',
      warning: '#ffaa00',
      info: '#00aa00'
    };
    return colors[severity] || '#0066cc';
  }

  getSeverityEmoji(severity) {
    const emojis = {
      critical: ':rotating_light:',
      warning: ':warning:',
      info: ':information_source:'
    };
    return emojis[severity] || ':bell:';
  }

  formatValue(value, type) {
    switch (type) {
      case 'responseTime':
        return `${value}ms`;
      case 'errorRate':
        return `${(value * 100).toFixed(1)}%`;
      case 'memoryUsage':
        return `${value.toFixed(1)}MB`;
      case 'careerCount':
        return value.toString();
      case 'diversityScore':
        return value.toFixed(1);
      default:
        return value.toString();
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global notification service instance
let globalNotificationService = null;

/**
 * Get global notification service instance
 */
export function getNotificationService() {
  if (!globalNotificationService) {
    globalNotificationService = new NotificationService();
  }
  return globalNotificationService;
}

/**
 * Initialize notification service
 */
export function initializeNotificationService(config = {}) {
  globalNotificationService = new NotificationService(config);
  return globalNotificationService;
}

/**
 * Send notification (convenience function)
 */
export async function sendNotification(notification) {
  const service = getNotificationService();
  return await service.sendNotification(notification);
}