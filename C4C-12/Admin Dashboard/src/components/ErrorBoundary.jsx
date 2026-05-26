/**
 * Error Boundary Component - Catches rendering errors and displays fallback UI
 * Location: /src/components/ErrorBoundary.jsx
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          backgroundColor: 'var(--bg-main)',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            textAlign: 'center',
            padding: '2rem',
            borderRadius: '12px',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #fee2e2'
          }}>
            <AlertTriangle
              size={48}
              style={{
                color: '#ef4444',
                marginBottom: '1rem',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            />
            <h2 style={{
              color: '#0F172A',
              marginBottom: '0.5rem',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Something Went Wrong
            </h2>
            <p style={{
              color: '#64748B',
              marginBottom: '1.5rem',
              fontSize: '0.95rem'
            }}>
              The application encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                textAlign: 'left',
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#fef2f2',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: '#7f1d1d'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600' }}>Error Details</summary>
                <pre style={{
                  marginTop: '0.5rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={this.resetError}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0D9488',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.25s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0F766E'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#0D9488'}
            >
              <RefreshCw size={16} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
