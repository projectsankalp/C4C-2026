import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
          <div className="bg-surface-1 border border-status-red/50 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
            <h2 className="text-xl font-bold text-status-red mb-4">Something went wrong while loading this workspace.</h2>
            <p className="text-sm font-medium text-text-muted mb-6">
              A critical error prevented this page from rendering correctly.
            </p>
            {import.meta.env.MODE === 'development' && this.state.error && (
              <div className="bg-surface-2 p-4 rounded-lg text-left text-xs font-mono text-status-red/80 overflow-auto mb-6 max-h-40">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-surface-2 hover:bg-border-primary/50 border border-border-primary/50 text-text-main text-sm font-bold rounded-lg transition-colors shadow-sm w-full"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
