// lib/rag/monitoring-dashboard.js
// Task 10.3: Web-based Monitoring Dashboard for Enhanced RAG System
// Real-time dashboard interface for production monitoring

import { getProductionMonitor } from './production-monitoring.js';

/**
 * Web-based Monitoring Dashboard
 * Provides real-time monitoring interface for Enhanced RAG system
 */
export class MonitoringDashboard {
  constructor(config = {}) {
    this.config = {
      // Dashboard settings
      refreshInterval: 30000, // 30 seconds
      maxDataPoints: 100,
      chartColors: {
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8',
        primary: '#007bff'
      },
      
      // Display settings
      showDetailedMetrics: true,
      showAlertHistory: true,
      showPerformanceCharts: true,
      autoRefresh: true,
      
      ...config
    };

    this.productionMonitor = getProductionMonitor();
    this.dashboardData = null;
    this.refreshTimer = null;
    this.isActive = false;
  }

  /**
   * Initialize dashboard
   */
  async initialize() {
    console.log('📊 Initializing Enhanced RAG Monitoring Dashboard');
    
    try {
      // Get initial data
      await this.refreshData();
      
      // Start auto-refresh if enabled
      if (this.config.autoRefresh) {
        this.startAutoRefresh();
      }
      
      this.isActive = true;
      console.log('✅ Monitoring dashboard initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize dashboard:', error.message);
      throw error;
    }
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    this.refreshTimer = setInterval(async () => {
      if (this.isActive) {
        await this.refreshData();
      }
    }, this.config.refreshInterval);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Refresh dashboard data
   */
  async refreshData() {
    try {
      this.dashboardData = this.productionMonitor.getDashboardData();
      return this.dashboardData;
    } catch (error) {
      console.error('❌ Failed to refresh dashboard data:', error.message);
      throw error;
    }
  }

  /**
   * Generate HTML dashboard
   */
  generateHTML() {
    if (!this.dashboardData) {
      return this.generateLoadingHTML();
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced RAG Monitoring Dashboard</title>
    <style>
        ${this.getCSS()}
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="dashboard">
        ${this.generateHeader()}
        ${this.generateSummaryCards()}
        ${this.generateHealthStatus()}
        ${this.generateMetricsSection()}
        ${this.generateAlertsSection()}
        ${this.generateSystemInfo()}
    </div>
    
    <script>
        ${this.getJavaScript()}
    </script>
</body>
</html>`;

    return html;
  }

  /**
   * Generate loading HTML
   */
  generateLoadingHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced RAG Monitoring Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .loading { text-align: center; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="loading">
        <div class="spinner"></div>
        <h2>Loading Enhanced RAG Monitoring Dashboard...</h2>
        <p>Initializing monitoring data...</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate dashboard header
   */
  generateHeader() {
    const status = this.dashboardData.status;
    const statusClass = this.getStatusClass(status);
    const lastUpdate = new Date(this.dashboardData.timestamp).toLocaleString();

    return `
    <header class="dashboard-header">
        <div class="header-content">
            <h1>Enhanced RAG Monitoring Dashboard</h1>
            <div class="status-info">
                <span class="status-badge ${statusClass}">${status.toUpperCase()}</span>
                <span class="last-update">Last Update: ${lastUpdate}</span>
            </div>
        </div>
        <div class="header-actions">
            <button onclick="refreshDashboard()" class="btn btn-primary">Refresh</button>
            <button onclick="toggleAutoRefresh()" class="btn btn-secondary" id="autoRefreshBtn">
                ${this.config.autoRefresh ? 'Disable' : 'Enable'} Auto-Refresh
            </button>
        </div>
    </header>`;
  }

  /**
   * Generate summary cards
   */
  generateSummaryCards() {
    const summary = this.dashboardData.summary || {};
    
    return `
    <section class="summary-cards">
        <div class="card">
            <div class="card-header">
                <h3>Total Requests</h3>
                <i class="icon">📊</i>
            </div>
            <div class="card-value">${summary.totalRequests || 0}</div>
            <div class="card-subtitle">Last hour</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Success Rate</h3>
                <i class="icon">✅</i>
            </div>
            <div class="card-value">${((summary.successRate || 0) * 100).toFixed(1)}%</div>
            <div class="card-subtitle">Current period</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Avg Response Time</h3>
                <i class="icon">⚡</i>
            </div>
            <div class="card-value">${Math.round(summary.avgResponseTime || 0)}ms</div>
            <div class="card-subtitle">Last hour</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Avg Career Count</h3>
                <i class="icon">🎯</i>
            </div>
            <div class="card-value">${(summary.avgCareerCount || 0).toFixed(1)}</div>
            <div class="card-subtitle">Per request</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Active Alerts</h3>
                <i class="icon">🚨</i>
            </div>
            <div class="card-value ${summary.activeAlerts > 0 ? 'alert-count' : ''}">${summary.activeAlerts || 0}</div>
            <div class="card-subtitle">Current</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Health Score</h3>
                <i class="icon">💚</i>
            </div>
            <div class="card-value ${this.getHealthScoreClass(summary.healthScore)}">${Math.round(summary.healthScore || 0)}</div>
            <div class="card-subtitle">Overall system</div>
        </div>
    </section>`;
  }

  /**
   * Generate health status section
   */
  generateHealthStatus() {
    const health = this.dashboardData.health || {};
    const components = health.components || {};
    
    return `
    <section class="health-status">
        <h2>System Health</h2>
        <div class="health-overview">
            <div class="overall-health ${this.getStatusClass(health.overall)}">
                <h3>Overall Status: ${(health.overall || 'unknown').toUpperCase()}</h3>
                <p>Last checked: ${health.timestamp ? new Date(health.timestamp).toLocaleString() : 'Never'}</p>
            </div>
        </div>
        
        <div class="component-health">
            ${Object.entries(components).map(([name, component]) => `
                <div class="component ${this.getStatusClass(component.status)}">
                    <h4>${this.formatComponentName(name)}</h4>
                    <div class="component-status">${component.status}</div>
                    <div class="component-details">
                        ${this.formatComponentDetails(name, component)}
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${health.issues && health.issues.length > 0 ? `
            <div class="health-issues">
                <h3>Current Issues</h3>
                <ul>
                    ${health.issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    </section>`;
  }

  /**
   * Generate metrics section
   */
  generateMetricsSection() {
    const metrics = this.dashboardData.metrics || {};
    
    return `
    <section class="metrics-section">
        <h2>Performance Metrics</h2>
        
        ${metrics.realtime ? `
            <div class="metrics-grid">
                <div class="metric-card">
                    <h3>Request Volume</h3>
                    <div class="metric-value">${metrics.realtime.volume?.totalRequests || 0}</div>
                    <div class="metric-subtitle">${(metrics.realtime.volume?.requestsPerSecond || 0).toFixed(2)} req/sec</div>
                </div>
                
                <div class="metric-card">
                    <h3>Career Distribution</h3>
                    <div class="career-breakdown">
                        <div>RAG: ${(metrics.realtime.careers?.avgRAG || 0).toFixed(1)}</div>
                        <div>Fallback: ${(metrics.realtime.careers?.avgFallback || 0).toFixed(1)}</div>
                        <div>Emergency: ${(metrics.realtime.careers?.avgEmergency || 0).toFixed(1)}</div>
                    </div>
                </div>
                
                <div class="metric-card">
                    <h3>Response Times</h3>
                    <div class="response-times">
                        <div>Avg: ${Math.round(metrics.realtime.performance?.avgResponseTime || 0)}ms</div>
                        <div>P95: ${Math.round(metrics.realtime.performance?.p95ResponseTime || 0)}ms</div>
                        <div>P99: ${Math.round(metrics.realtime.performance?.p99ResponseTime || 0)}ms</div>
                    </div>
                </div>
                
                <div class="metric-card">
                    <h3>Error Metrics</h3>
                    <div class="error-metrics">
                        <div>Rate: ${((metrics.realtime.errors?.errorRate || 0) * 100).toFixed(2)}%</div>
                        <div>Total: ${metrics.realtime.errors?.totalErrors || 0}</div>
                        <div>Warnings: ${metrics.realtime.errors?.totalWarnings || 0}</div>
                    </div>
                </div>
            </div>
        ` : '<p>No real-time metrics available</p>'}
        
        ${this.config.showPerformanceCharts ? `
            <div class="charts-container">
                <div class="chart-wrapper">
                    <canvas id="responseTimeChart"></canvas>
                </div>
                <div class="chart-wrapper">
                    <canvas id="careerCountChart"></canvas>
                </div>
            </div>
        ` : ''}
    </section>`;
  }

  /**
   * Generate alerts section
   */
  generateAlertsSection() {
    const alerts = this.dashboardData.alerts || {};
    const stats = alerts.statistics || {};
    
    return `
    <section class="alerts-section">
        <h2>Alert Status</h2>
        
        <div class="alert-summary">
            <div class="alert-stat">
                <h3>Active Alerts</h3>
                <div class="stat-value ${stats.active > 0 ? 'alert-active' : ''}">${stats.active || 0}</div>
            </div>
            <div class="alert-stat">
                <h3>Last Hour</h3>
                <div class="stat-value">${stats.lastHour || 0}</div>
            </div>
            <div class="alert-stat">
                <h3>Last Day</h3>
                <div class="stat-value">${stats.lastDay || 0}</div>
            </div>
        </div>
        
        ${stats.bySeverity ? `
            <div class="alert-breakdown">
                <h3>By Severity (Last Hour)</h3>
                <div class="severity-breakdown">
                    <div class="severity-item critical">
                        <span>Critical</span>
                        <span>${stats.bySeverity.critical || 0}</span>
                    </div>
                    <div class="severity-item warning">
                        <span>Warning</span>
                        <span>${stats.bySeverity.warning || 0}</span>
                    </div>
                    <div class="severity-item info">
                        <span>Info</span>
                        <span>${stats.bySeverity.info || 0}</span>
                    </div>
                </div>
            </div>
        ` : ''}
        
        ${stats.byType && Object.keys(stats.byType).length > 0 ? `
            <div class="alert-types">
                <h3>By Type (Last Hour)</h3>
                <div class="type-breakdown">
                    ${Object.entries(stats.byType).map(([type, count]) => `
                        <div class="type-item">
                            <span>${this.formatAlertType(type)}</span>
                            <span>${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    </section>`;
  }

  /**
   * Generate system info section
   */
  generateSystemInfo() {
    const uptime = this.formatUptime(this.dashboardData.summary?.uptime || 0);
    const environment = process.env.NODE_ENV || 'development';
    const version = process.env.npm_package_version || '1.0.0';
    
    return `
    <section class="system-info">
        <h2>System Information</h2>
        <div class="info-grid">
            <div class="info-item">
                <label>Environment:</label>
                <span class="env-badge ${environment}">${environment}</span>
            </div>
            <div class="info-item">
                <label>Version:</label>
                <span>${version}</span>
            </div>
            <div class="info-item">
                <label>Uptime:</label>
                <span>${uptime}</span>
            </div>
            <div class="info-item">
                <label>Status:</label>
                <span class="status-badge ${this.getStatusClass(this.dashboardData.status)}">${this.dashboardData.status}</span>
            </div>
        </div>
    </section>`;
  }

  /**
   * Get CSS styles
   */
  getCSS() {
    return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8f9fa;
            color: #333;
            line-height: 1.6;
        }
        
        .dashboard {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .dashboard-header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .dashboard-header h1 {
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .status-info {
            display: flex;
            gap: 15px;
            align-items: center;
        }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-badge.running { background: #d4edda; color: #155724; }
        .status-badge.warning { background: #fff3cd; color: #856404; }
        .status-badge.error { background: #f8d7da; color: #721c24; }
        .status-badge.stopped { background: #e2e3e5; color: #383d41; }
        
        .last-update {
            font-size: 14px;
            color: #6c757d;
        }
        
        .header-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }
        
        .btn-primary { background: #007bff; color: white; }
        .btn-primary:hover { background: #0056b3; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn-secondary:hover { background: #545b62; }
        
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .card-header h3 {
            font-size: 14px;
            color: #6c757d;
            font-weight: 500;
        }
        
        .icon {
            font-size: 20px;
        }
        
        .card-value {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .card-value.alert-count {
            color: #dc3545;
        }
        
        .card-value.health-good { color: #28a745; }
        .card-value.health-warning { color: #ffc107; }
        .card-value.health-danger { color: #dc3545; }
        
        .card-subtitle {
            font-size: 12px;
            color: #6c757d;
        }
        
        .health-status, .metrics-section, .alerts-section, .system-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .health-status h2, .metrics-section h2, .alerts-section h2, .system-info h2 {
            color: #2c3e50;
            margin-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 10px;
        }
        
        .health-overview {
            margin-bottom: 20px;
        }
        
        .overall-health {
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        
        .overall-health.healthy { background: #d4edda; color: #155724; }
        .overall-health.warning { background: #fff3cd; color: #856404; }
        .overall-health.unhealthy { background: #f8d7da; color: #721c24; }
        
        .component-health {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .component {
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid;
        }
        
        .component.healthy { background: #f8f9fa; border-color: #28a745; }
        .component.warning { background: #fffbf0; border-color: #ffc107; }
        .component.unhealthy { background: #fdf2f2; border-color: #dc3545; }
        
        .component h4 {
            margin-bottom: 8px;
            color: #2c3e50;
        }
        
        .component-status {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            margin-bottom: 8px;
        }
        
        .component-details {
            font-size: 14px;
            color: #6c757d;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .metric-card {
            padding: 15px;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            text-align: center;
        }
        
        .metric-card h3 {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 10px;
        }
        
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .metric-subtitle {
            font-size: 12px;
            color: #6c757d;
        }
        
        .career-breakdown, .response-times, .error-metrics {
            font-size: 14px;
        }
        
        .career-breakdown div, .response-times div, .error-metrics div {
            margin-bottom: 3px;
        }
        
        .charts-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        
        .chart-wrapper {
            height: 300px;
        }
        
        .alert-summary {
            display: flex;
            gap: 30px;
            margin-bottom: 20px;
        }
        
        .alert-stat {
            text-align: center;
        }
        
        .alert-stat h3 {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 8px;
        }
        
        .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .stat-value.alert-active {
            color: #dc3545;
        }
        
        .alert-breakdown, .alert-types {
            margin-bottom: 20px;
        }
        
        .severity-breakdown, .type-breakdown {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .severity-item, .type-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            border-radius: 4px;
            background: #f8f9fa;
        }
        
        .severity-item.critical {
            background: #f8d7da;
            color: #721c24;
        }
        
        .severity-item.warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .severity-item.info {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        
        .info-item label {
            font-weight: 500;
            color: #6c757d;
        }
        
        .env-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .env-badge.development { background: #fff3cd; color: #856404; }
        .env-badge.staging { background: #d1ecf1; color: #0c5460; }
        .env-badge.production { background: #d4edda; color: #155724; }
        
        @media (max-width: 768px) {
            .dashboard { padding: 10px; }
            .dashboard-header { flex-direction: column; gap: 15px; text-align: center; }
            .summary-cards { grid-template-columns: 1fr; }
            .charts-container { grid-template-columns: 1fr; }
            .alert-summary { flex-direction: column; gap: 15px; }
        }
    `;
  }

  /**
   * Get JavaScript code
   */
  getJavaScript() {
    return `
        let autoRefreshEnabled = ${this.config.autoRefresh};
        let refreshInterval;
        
        function refreshDashboard() {
            location.reload();
        }
        
        function toggleAutoRefresh() {
            autoRefreshEnabled = !autoRefreshEnabled;
            const btn = document.getElementById('autoRefreshBtn');
            
            if (autoRefreshEnabled) {
                btn.textContent = 'Disable Auto-Refresh';
                startAutoRefresh();
            } else {
                btn.textContent = 'Enable Auto-Refresh';
                stopAutoRefresh();
            }
        }
        
        function startAutoRefresh() {
            if (refreshInterval) clearInterval(refreshInterval);
            refreshInterval = setInterval(refreshDashboard, ${this.config.refreshInterval});
        }
        
        function stopAutoRefresh() {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                refreshInterval = null;
            }
        }
        
        // Initialize auto-refresh if enabled
        if (autoRefreshEnabled) {
            startAutoRefresh();
        }
        
        // Initialize charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            // Response time chart
            const responseTimeCtx = document.getElementById('responseTimeChart');
            if (responseTimeCtx) {
                new Chart(responseTimeCtx, {
                    type: 'line',
                    data: {
                        labels: ['5m ago', '4m ago', '3m ago', '2m ago', '1m ago', 'Now'],
                        datasets: [{
                            label: 'Response Time (ms)',
                            data: [3200, 2800, 3100, 2900, 3300, ${Math.round(this.dashboardData.summary?.avgResponseTime || 0)}],
                            borderColor: '${this.config.chartColors.primary}',
                            backgroundColor: '${this.config.chartColors.primary}20',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Response Time (ms)'
                                }
                            }
                        }
                    }
                });
            }
            
            // Career count chart
            const careerCountCtx = document.getElementById('careerCountChart');
            if (careerCountCtx) {
                new Chart(careerCountCtx, {
                    type: 'bar',
                    data: {
                        labels: ['RAG', 'Fallback', 'Emergency'],
                        datasets: [{
                            label: 'Average Career Count',
                            data: [
                                ${(this.dashboardData.metrics?.realtime?.careers?.avgRAG || 0).toFixed(1)},
                                ${(this.dashboardData.metrics?.realtime?.careers?.avgFallback || 0).toFixed(1)},
                                ${(this.dashboardData.metrics?.realtime?.careers?.avgEmergency || 0).toFixed(1)}
                            ],
                            backgroundColor: [
                                '${this.config.chartColors.success}',
                                '${this.config.chartColors.warning}',
                                '${this.config.chartColors.danger}'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Career Count'
                                }
                            }
                        }
                    }
                });
            }
        }
    `;
  }

  /**
   * Helper methods
   */
  getStatusClass(status) {
    const statusMap = {
      'running': 'running',
      'healthy': 'running',
      'warning': 'warning',
      'unhealthy': 'error',
      'error': 'error',
      'stopped': 'stopped'
    };
    return statusMap[status] || 'stopped';
  }

  getHealthScoreClass(score) {
    if (score >= 80) return 'health-good';
    if (score >= 60) return 'health-warning';
    return 'health-danger';
  }

  formatComponentName(name) {
    return name.replace(/([A-Z])/g, ' $1')
               .replace(/^./, str => str.toUpperCase())
               .replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  formatComponentDetails(name, component) {
    const details = [];
    
    Object.entries(component).forEach(([key, value]) => {
      if (key !== 'status' && value !== undefined) {
        if (typeof value === 'object') {
          details.push(`${key}: ${JSON.stringify(value)}`);
        } else {
          details.push(`${key}: ${value}`);
        }
      }
    });
    
    return details.join('<br>');
  }

  formatAlertType(type) {
    return type.replace(/([A-Z])/g, ' $1')
               .replace(/^./, str => str.toUpperCase())
               .replace(/_/g, ' ');
  }

  formatUptime(uptime) {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Cleanup dashboard
   */
  cleanup() {
    this.stopAutoRefresh();
    this.isActive = false;
    console.log('🧹 Monitoring dashboard cleaned up');
  }
}

// Export functions
export function createMonitoringDashboard(config = {}) {
  return new MonitoringDashboard(config);
}

export async function generateDashboardHTML(config = {}) {
  const dashboard = new MonitoringDashboard(config);
  await dashboard.initialize();
  return dashboard.generateHTML();
}