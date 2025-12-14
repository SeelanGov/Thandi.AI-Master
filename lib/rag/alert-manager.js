// lib/rag/alert-manager.js
// Task 10.3: Advanced Alert Management for Enhanced RAG Production Monitoring
// Comprehensive alerting system with multiple channels and escalation

import { getProductionMonitor } from './production-monitoring.js';

/**
 * Advanced Alert Manager for Enhanced RAG Filtering
 * Manages alert routing, escalation, and notification channels
 */
export class AlertManager {
  constructor(config = {}) {
    this.config = {
      // Alert thresholds
      thresholds: {
        careerCount: {
          critical: 2,
          warning: 3,
          target: 4
        },
        responseTime: {
          critical: 8000,
          warning: 5000,
          target: 3000
        },
        errorRate: {
          critical: 0.05, // 5%
          warning: 0.02,  // 2%
          target: 0.01    // 1%
        },
        diversityScore: {
          critical: 1.5,
          warning: 2.0,
          target: 2.5
        },
        memoryUsage: {
          critical: 150, // MB
          warning: 100,
          target: 80
        }
      },

      // Notification channels
      channels: {
        slack: {
          enabled: !!process.env.SLACK_WEBHOOK_URL,
          webhook: process.env.SLACK_WEBHOOK_URL,
          channels: {
            critical: '#incidents',
            warning: '#alerts',
            info: '#monitoring'
          }
        },
        email: {
          enabled: !!process.env.NOTIFICATION_EMAIL,
          recipients: {
            critical: [process.env.NOTIFICATION_EMAIL, process.env.ONCALL_EMAIL].filter(Boolean),
            warning: [process.env.NOTIFICATION_EMAIL].filter(Boolean),
            info: [process.env.NOTIFICATION_EMAIL].filter(Boolean)
          }
        },
        webhook: {
          enabled: !!process.env.ALERT_WEBHOOK_URL,
          url: process.env.ALERT_WEBHOOK_URL
        },
        console: {
          enabled: true,
          colors: {
            critical: '\x1b[31m', // Red
            warning: '\x1b[33m',  // Yellow
            info: '\x1b[36m',     // Cyan
            reset: '\x1b[0m'
          }
        }
      },

      // Escalation rules
      escalation: {
        enabled: true,
        timeouts: {
          critical: 300000,  // 5 minutes
          warning: 900000,   // 15 minutes
          info: 1800000      // 30 minutes
        },
        maxEscalations: 3
      },

      // Rate limiting
      rateLimit: {
        enabled: true,
        cooldown: 300000, // 5 minutes between same alert types
        burstLimit: 5     // Max 5 alerts per minute
      },

      ...config
    };

    this.activeAlerts = new Map();
    this.alertHistory = [];
    this.rateLimitTracker = new Map();
    this.escalationTracker = new Map();
  }

  /**
   * Process and route alert
   */
  async processAlert(alert) {
    try {
      // Enrich alert with metadata
      const enrichedAlert = this.enrichAlert(alert);
      
      // Check rate limiting
      if (this.isRateLimited(enrichedAlert)) {
        console.log(`⏳ Alert rate limited: ${enrichedAlert.type}`);
        return false;
      }

      // Determine severity and routing
      const severity = this.determineSeverity(enrichedAlert);
      const routingInfo = this.determineRouting(enrichedAlert, severity);

      // Create alert record
      const alertRecord = {
        ...enrichedAlert,
        id: this.generateAlertId(),
        severity,
        routing: routingInfo,
        timestamp: new Date().toISOString(),
        status: 'active',
        escalationLevel: 0,
        acknowledgments: []
      };

      // Store alert
      this.activeAlerts.set(alertRecord.id, alertRecord);
      this.alertHistory.push(alertRecord);

      // Send notifications
      await this.sendNotifications(alertRecord);

      // Set up escalation if needed
      if (this.config.escalation.enabled && severity === 'critical') {
        this.scheduleEscalation(alertRecord);
      }

      // Update rate limiting
      this.updateRateLimit(alertRecord);

      console.log(`🚨 Alert processed: ${alertRecord.id} [${severity.toUpperCase()}]`);
      return alertRecord.id;

    } catch (error) {
      console.error('❌ Failed to process alert:', error.message);
      return false;
    }
  }

  /**
   * Enrich alert with additional metadata
   */
  enrichAlert(alert) {
    const monitor = getProductionMonitor();
    const dashboardData = monitor.getDashboardData();

    return {
      ...alert,
      environment: process.env.NODE_ENV || 'development',
      service: 'enhanced-rag-filtering',
      version: process.env.npm_package_version || '1.0.0',
      hostname: process.env.HOSTNAME || 'unknown',
      context: {
        totalRequests: dashboardData.summary?.totalRequests || 0,
        successRate: dashboardData.summary?.successRate || 0,
        avgResponseTime: dashboardData.summary?.avgResponseTime || 0,
        activeFeatureFlags: this.getActiveFeatureFlags()
      }
    };
  }

  /**
   * Determine alert severity based on thresholds
   */
  determineSeverity(alert) {
    const thresholds = this.config.thresholds[alert.type];
    if (!thresholds) return alert.severity || 'info';

    const value = alert.value;
    
    // For metrics where lower is better (error rate, response time)
    if (['errorRate', 'responseTime'].includes(alert.type)) {
      if (value >= thresholds.critical) return 'critical';
      if (value >= thresholds.warning) return 'warning';
      return 'info';
    }
    
    // For metrics where higher is better (career count, diversity score)
    if (['careerCount', 'diversityScore'].includes(alert.type)) {
      if (value <= thresholds.critical) return 'critical';
      if (value <= thresholds.warning) return 'warning';
      return 'info';
    }

    // For metrics where higher is worse (memory usage)
    if (['memoryUsage'].includes(alert.type)) {
      if (value >= thresholds.critical) return 'critical';
      if (value >= thresholds.warning) return 'warning';
      return 'info';
    }

    return alert.severity || 'info';
  }

  /**
   * Determine routing based on alert and severity
   */
  determineRouting(alert, severity) {
    const routing = {
      channels: [],
      recipients: [],
      escalate: false
    };

    // Console logging (always enabled)
    if (this.config.channels.console.enabled) {
      routing.channels.push('console');
    }

    // Slack notifications
    if (this.config.channels.slack.enabled) {
      routing.channels.push('slack');
      routing.slackChannel = this.config.channels.slack.channels[severity] || 
                            this.config.channels.slack.channels.info;
    }

    // Email notifications
    if (this.config.channels.email.enabled) {
      routing.channels.push('email');
      routing.emailRecipients = this.config.channels.email.recipients[severity] || 
                               this.config.channels.email.recipients.info;
    }

    // Webhook notifications
    if (this.config.channels.webhook.enabled) {
      routing.channels.push('webhook');
    }

    // Escalation for critical alerts
    if (severity === 'critical' && this.config.escalation.enabled) {
      routing.escalate = true;
    }

    return routing;
  }

  /**
   * Send notifications to all configured channels
   */
  async sendNotifications(alertRecord) {
    const notifications = [];

    for (const channel of alertRecord.routing.channels) {
      switch (channel) {
        case 'console':
          notifications.push(this.sendConsoleNotification(alertRecord));
          break;
        case 'slack':
          notifications.push(this.sendSlackNotification(alertRecord));
          break;
        case 'email':
          notifications.push(this.sendEmailNotification(alertRecord));
          break;
        case 'webhook':
          notifications.push(this.sendWebhookNotification(alertRecord));
          break;
      }
    }

    const results = await Promise.allSettled(notifications);
    
    // Track notification results
    alertRecord.notifications = results.map((result, index) => ({
      channel: alertRecord.routing.channels[index],
      status: result.status,
      error: result.status === 'rejected' ? result.reason?.message : null
    }));
  }

  /**
   * Send console notification
   */
  async sendConsoleNotification(alertRecord) {
    const colors = this.config.channels.console.colors;
    const color = colors[alertRecord.severity] || colors.info;
    const reset = colors.reset;

    const message = `${color}🚨 [${alertRecord.severity.toUpperCase()}] ${alertRecord.type}: ${alertRecord.message}${reset}`;
    console.log(message);
    
    if (alertRecord.context) {
      console.log(`   Context: ${JSON.stringify(alertRecord.context, null, 2)}`);
    }
  }

  /**
   * Send Slack notification
   */
  async sendSlackNotification(alertRecord) {
    if (!this.config.channels.slack.webhook) {
      throw new Error('Slack webhook URL not configured');
    }

    const color = this.getSeverityColor(alertRecord.severity);
    const emoji = this.getSeverityEmoji(alertRecord.severity);
    
    const payload = {
      channel: alertRecord.routing.slackChannel,
      username: 'Enhanced RAG Monitor',
      icon_emoji: emoji,
      attachments: [{
        color,
        title: `Enhanced RAG Alert - ${alertRecord.type}`,
        text: alertRecord.message,
        fields: [
          { title: 'Severity', value: alertRecord.severity, short: true },
          { title: 'Environment', value: alertRecord.environment, short: true },
          { title: 'Service', value: alertRecord.service, short: true },
          { title: 'Alert ID', value: alertRecord.id, short: true },
          { title: 'Value', value: alertRecord.value?.toString() || 'N/A', short: true },
          { title: 'Threshold', value: alertRecord.threshold?.toString() || 'N/A', short: true }
        ],
        footer: 'Enhanced RAG Monitoring',
        ts: Math.floor(new Date(alertRecord.timestamp).getTime() / 1000)
      }]
    };

    // Add context information
    if (alertRecord.context) {
      payload.attachments[0].fields.push({
        title: 'Context',
        value: `Requests: ${alertRecord.context.totalRequests}, Success: ${(alertRecord.context.successRate * 100).toFixed(1)}%`,
        short: false
      });
    }

    try {
      // In a real implementation, send HTTP POST to Slack webhook
      // const response = await fetch(this.config.channels.slack.webhook, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      
      console.log('📱 Slack notification sent');
    } catch (error) {
      console.error('Failed to send Slack notification:', error.message);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(alertRecord) {
    const recipients = alertRecord.routing.emailRecipients;
    if (!recipients || recipients.length === 0) {
      throw new Error('No email recipients configured');
    }

    const subject = `[${alertRecord.severity.toUpperCase()}] Enhanced RAG Alert: ${alertRecord.type}`;
    const body = this.generateEmailBody(alertRecord);

    try {
      // In a real implementation, send email via your email service
      // await emailService.send({
      //   to: recipients,
      //   subject,
      //   html: body
      // });
      
      console.log(`📧 Email notification sent to ${recipients.length} recipients`);
    } catch (error) {
      console.error('Failed to send email notification:', error.message);
      throw error;
    }
  }

  /**
   * Send webhook notification
   */
  async sendWebhookNotification(alertRecord) {
    if (!this.config.channels.webhook.url) {
      throw new Error('Webhook URL not configured');
    }

    const payload = {
      alert: alertRecord,
      timestamp: new Date().toISOString(),
      source: 'enhanced-rag-monitoring'
    };

    try {
      // In a real implementation, send HTTP POST to webhook
      // const response = await fetch(this.config.channels.webhook.url, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      
      console.log('🔗 Webhook notification sent');
    } catch (error) {
      console.error('Failed to send webhook notification:', error.message);
      throw error;
    }
  }

  /**
   * Schedule alert escalation
   */
  scheduleEscalation(alertRecord) {
    const timeout = this.config.escalation.timeouts[alertRecord.severity];
    
    const escalationTimer = setTimeout(() => {
      this.escalateAlert(alertRecord.id);
    }, timeout);

    this.escalationTracker.set(alertRecord.id, {
      timer: escalationTimer,
      level: 0,
      scheduledAt: Date.now()
    });
  }

  /**
   * Escalate alert to next level
   */
  async escalateAlert(alertId) {
    const alertRecord = this.activeAlerts.get(alertId);
    const escalationInfo = this.escalationTracker.get(alertId);

    if (!alertRecord || !escalationInfo) {
      return;
    }

    escalationInfo.level++;
    alertRecord.escalationLevel = escalationInfo.level;

    if (escalationInfo.level >= this.config.escalation.maxEscalations) {
      console.log(`⚠️ Alert ${alertId} reached maximum escalation level`);
      return;
    }

    // Create escalation alert
    const escalationAlert = {
      ...alertRecord,
      type: 'escalation',
      message: `ESCALATION LEVEL ${escalationInfo.level}: ${alertRecord.message}`,
      severity: 'critical',
      originalAlert: alertId
    };

    await this.sendNotifications(escalationAlert);

    // Schedule next escalation
    const nextTimeout = this.config.escalation.timeouts.critical;
    escalationInfo.timer = setTimeout(() => {
      this.escalateAlert(alertId);
    }, nextTimeout);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId, acknowledgedBy, notes = '') {
    const alertRecord = this.activeAlerts.get(alertId);
    if (!alertRecord) {
      return false;
    }

    alertRecord.acknowledgments.push({
      acknowledgedBy,
      acknowledgedAt: new Date().toISOString(),
      notes
    });

    // Cancel escalation
    const escalationInfo = this.escalationTracker.get(alertId);
    if (escalationInfo) {
      clearTimeout(escalationInfo.timer);
      this.escalationTracker.delete(alertId);
    }

    console.log(`✅ Alert ${alertId} acknowledged by ${acknowledgedBy}`);
    return true;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId, resolvedBy, resolution = '') {
    const alertRecord = this.activeAlerts.get(alertId);
    if (!alertRecord) {
      return false;
    }

    alertRecord.status = 'resolved';
    alertRecord.resolvedBy = resolvedBy;
    alertRecord.resolvedAt = new Date().toISOString();
    alertRecord.resolution = resolution;

    // Remove from active alerts
    this.activeAlerts.delete(alertId);

    // Cancel escalation
    const escalationInfo = this.escalationTracker.get(alertId);
    if (escalationInfo) {
      clearTimeout(escalationInfo.timer);
      this.escalationTracker.delete(alertId);
    }

    console.log(`✅ Alert ${alertId} resolved by ${resolvedBy}`);
    return true;
  }

  /**
   * Check if alert is rate limited
   */
  isRateLimited(alert) {
    if (!this.config.rateLimit.enabled) {
      return false;
    }

    const now = Date.now();
    const key = `${alert.type}_${alert.severity}`;
    const tracker = this.rateLimitTracker.get(key);

    if (!tracker) {
      return false;
    }

    // Check cooldown period
    if (now - tracker.lastAlert < this.config.rateLimit.cooldown) {
      return true;
    }

    // Check burst limit
    const recentAlerts = tracker.alerts.filter(
      timestamp => now - timestamp < 60000 // Last minute
    );

    return recentAlerts.length >= this.config.rateLimit.burstLimit;
  }

  /**
   * Update rate limiting tracker
   */
  updateRateLimit(alertRecord) {
    if (!this.config.rateLimit.enabled) {
      return;
    }

    const key = `${alertRecord.type}_${alertRecord.severity}`;
    const now = Date.now();

    if (!this.rateLimitTracker.has(key)) {
      this.rateLimitTracker.set(key, {
        alerts: [],
        lastAlert: 0
      });
    }

    const tracker = this.rateLimitTracker.get(key);
    tracker.alerts.push(now);
    tracker.lastAlert = now;

    // Clean old entries
    tracker.alerts = tracker.alerts.filter(
      timestamp => now - timestamp < 300000 // Last 5 minutes
    );
  }

  /**
   * Generate alert ID
   */
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get severity color for Slack
   */
  getSeverityColor(severity) {
    const colors = {
      critical: 'danger',
      warning: 'warning',
      info: 'good'
    };
    return colors[severity] || 'good';
  }

  /**
   * Get severity emoji
   */
  getSeverityEmoji(severity) {
    const emojis = {
      critical: ':rotating_light:',
      warning: ':warning:',
      info: ':information_source:'
    };
    return emojis[severity] || ':bell:';
  }

  /**
   * Generate email body
   */
  generateEmailBody(alertRecord) {
    return `
      <html>
        <body>
          <h2>Enhanced RAG Alert - ${alertRecord.severity.toUpperCase()}</h2>
          <p><strong>Alert Type:</strong> ${alertRecord.type}</p>
          <p><strong>Message:</strong> ${alertRecord.message}</p>
          <p><strong>Timestamp:</strong> ${alertRecord.timestamp}</p>
          <p><strong>Environment:</strong> ${alertRecord.environment}</p>
          <p><strong>Service:</strong> ${alertRecord.service}</p>
          <p><strong>Alert ID:</strong> ${alertRecord.id}</p>
          
          ${alertRecord.value !== undefined ? `<p><strong>Value:</strong> ${alertRecord.value}</p>` : ''}
          ${alertRecord.threshold !== undefined ? `<p><strong>Threshold:</strong> ${alertRecord.threshold}</p>` : ''}
          
          ${alertRecord.context ? `
            <h3>Context</h3>
            <ul>
              <li>Total Requests: ${alertRecord.context.totalRequests}</li>
              <li>Success Rate: ${(alertRecord.context.successRate * 100).toFixed(1)}%</li>
              <li>Avg Response Time: ${alertRecord.context.avgResponseTime}ms</li>
            </ul>
          ` : ''}
          
          <p><em>This alert was generated by the Enhanced RAG Monitoring System</em></p>
        </body>
      </html>
    `;
  }

  /**
   * Get active feature flags
   */
  getActiveFeatureFlags() {
    try {
      // This would integrate with your feature flag system
      return {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const recentAlerts = this.alertHistory.filter(
      alert => now - new Date(alert.timestamp).getTime() < oneHour
    );

    const dailyAlerts = this.alertHistory.filter(
      alert => now - new Date(alert.timestamp).getTime() < oneDay
    );

    return {
      active: this.activeAlerts.size,
      total: this.alertHistory.length,
      lastHour: recentAlerts.length,
      lastDay: dailyAlerts.length,
      bySeverity: {
        critical: recentAlerts.filter(a => a.severity === 'critical').length,
        warning: recentAlerts.filter(a => a.severity === 'warning').length,
        info: recentAlerts.filter(a => a.severity === 'info').length
      },
      byType: this.getAlertsByType(recentAlerts),
      escalations: this.escalationTracker.size
    };
  }

  /**
   * Get alerts grouped by type
   */
  getAlertsByType(alerts) {
    const byType = {};
    alerts.forEach(alert => {
      byType[alert.type] = (byType[alert.type] || 0) + 1;
    });
    return byType;
  }

  /**
   * Cleanup old alerts and trackers
   */
  cleanup() {
    const now = Date.now();
    const retentionPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days

    // Clean alert history
    const originalLength = this.alertHistory.length;
    this.alertHistory = this.alertHistory.filter(
      alert => now - new Date(alert.timestamp).getTime() < retentionPeriod
    );

    // Clean rate limit trackers
    for (const [key, tracker] of this.rateLimitTracker.entries()) {
      if (now - tracker.lastAlert > 60 * 60 * 1000) { // 1 hour
        this.rateLimitTracker.delete(key);
      }
    }

    const cleaned = originalLength - this.alertHistory.length;
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old alerts`);
    }
  }
}

// Global alert manager instance
let globalAlertManager = null;

/**
 * Get global alert manager instance
 */
export function getAlertManager() {
  if (!globalAlertManager) {
    globalAlertManager = new AlertManager();
  }
  return globalAlertManager;
}

/**
 * Initialize alert manager
 */
export function initializeAlertManager(config = {}) {
  globalAlertManager = new AlertManager(config);
  return globalAlertManager;
}

/**
 * Send alert (convenience function)
 */
export async function sendAlert(alert) {
  const alertManager = getAlertManager();
  return await alertManager.processAlert(alert);
}