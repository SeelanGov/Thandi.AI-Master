'use client';

import { Component } from 'react';
import { errorHandler } from '../../../lib/marks/ErrorHandler.js';

/**
 * ErrorBoundary - React error boundary for mark collection components
 * 
 * This component catches JavaScript errors in the component tree and
 * provides graceful error handling with recovery options.
 * 
 * Requirements: 9.4, 9.5
 */

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorInfo: null,
      errorResponse: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Handle the error using our error handler
    const context = {
      component: this.props.componentName || 'Unknown',
      props: this.props.errorContext || {},
      errorInfo: errorInfo
    };
    
    const errorResponse = errorHandler.handleComponentError(error, context);
    
    this.setState({
      errorInfo: error,
      errorResponse: errorResponse
    });
  }

  handleRecoveryAction = (action) => {
    switch (action) {
      case 'refresh_page':
        window.location.reload();
        break;
      
      case 'retry_render':
        this.setState({
          hasError: false,
          errorInfo: null,
          errorResponse: null
        });
        break;
      
      case 'continue_anyway':
        // Try to continue by clearing the error state
        this.setState({
          hasError: false,
          errorInfo: null,
          errorResponse: null
        });
        break;
      
      default:
        if (this.props.onRecoveryAction) {
          this.props.onRecoveryAction(action);
        }
    }
  };

  render() {
    if (this.state.hasError) {
      const { errorResponse } = this.state;
      const displayInfo = errorHandler.getDisplayMessage(
        errorResponse?.errorType || 'component',
        errorResponse?.severity || 'medium'
      );

      return (
        <div className="error-boundary">
          <div className={`error-card ${displayInfo.color}`}>
            <div className="error-header">
              <div className="error-icon">{displayInfo.icon}</div>
              <div className="error-content">
                <h3 className="error-title">{displayInfo.title}</h3>
                <p className="error-message">
                  {errorResponse?.userMessage || 'Something went wrong with this component.'}
                </p>
              </div>
            </div>

            {errorResponse?.recoveryOptions && errorResponse.recoveryOptions.length > 0 && (
              <div className="recovery-section">
                <h4>What would you like to do?</h4>
                <div className="recovery-options">
                  {errorResponse.recoveryOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => this.handleRecoveryAction(option.action)}
                      className="recovery-button"
                    >
                      <div className="recovery-label">{option.label}</div>
                      <div className="recovery-description">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Technical Details (Development)</summary>
                <pre className="error-stack">
                  {this.state.errorInfo?.toString()}
                  {this.state.errorInfo?.stack}
                </pre>
              </details>
            )}

            <div className="error-footer">
              <p className="error-id">
                Error ID: {errorResponse?.errorId || 'unknown'}
              </p>
            </div>
          </div>

          <style jsx>{`
            .error-boundary {
              padding: 20px;
              margin: 16px 0;
            }

            .error-card {
              border-radius: 12px;
              padding: 24px;
              border: 2px solid;
            }

            .error-card.amber {
              background: #fef3c7;
              border-color: #f59e0b;
            }

            .error-card.red {
              background: #fef2f2;
              border-color: #ef4444;
            }

            .error-card.blue {
              background: #eff6ff;
              border-color: #3b82f6;
            }

            .error-card.orange {
              background: #fff7ed;
              border-color: #f97316;
            }

            .error-card.gray {
              background: #f9fafb;
              border-color: #6b7280;
            }

            .error-header {
              display: flex;
              align-items: flex-start;
              gap: 16px;
              margin-bottom: 20px;
            }

            .error-icon {
              font-size: 32px;
              flex-shrink: 0;
            }

            .error-content {
              flex: 1;
            }

            .error-title {
              margin: 0 0 8px 0;
              font-size: 20px;
              font-weight: 600;
            }

            .error-card.amber .error-title { color: #92400e; }
            .error-card.red .error-title { color: #991b1b; }
            .error-card.blue .error-title { color: #1e40af; }
            .error-card.orange .error-title { color: #9a3412; }
            .error-card.gray .error-title { color: #374151; }

            .error-message {
              margin: 0;
              font-size: 16px;
              line-height: 1.5;
            }

            .error-card.amber .error-message { color: #b45309; }
            .error-card.red .error-message { color: #dc2626; }
            .error-card.blue .error-message { color: #1d4ed8; }
            .error-card.orange .error-message { color: #c2410c; }
            .error-card.gray .error-message { color: #4b5563; }

            .recovery-section {
              margin-bottom: 20px;
            }

            .recovery-section h4 {
              margin: 0 0 12px 0;
              font-size: 16px;
              font-weight: 600;
              color: inherit;
            }

            .recovery-options {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }

            .recovery-button {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 12px 16px;
              background: white;
              border: 2px solid rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
              text-align: left;
            }

            .recovery-button:hover {
              border-color: currentColor;
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .recovery-label {
              font-weight: 600;
              font-size: 14px;
              margin-bottom: 4px;
              color: inherit;
            }

            .recovery-description {
              font-size: 13px;
              opacity: 0.8;
              color: inherit;
            }

            .error-details {
              margin: 20px 0;
              padding: 16px;
              background: rgba(0, 0, 0, 0.05);
              border-radius: 8px;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              margin-bottom: 12px;
            }

            .error-stack {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              white-space: pre-wrap;
              overflow-x: auto;
              background: rgba(0, 0, 0, 0.1);
              padding: 12px;
              border-radius: 4px;
              margin: 0;
            }

            .error-footer {
              border-top: 1px solid rgba(0, 0, 0, 0.1);
              padding-top: 16px;
              text-align: center;
            }

            .error-id {
              margin: 0;
              font-size: 12px;
              opacity: 0.6;
              font-family: 'Courier New', monospace;
            }

            @media (max-width: 768px) {
              .error-boundary {
                padding: 16px;
              }

              .error-card {
                padding: 20px;
              }

              .error-header {
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 12px;
              }

              .recovery-button {
                padding: 16px;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;