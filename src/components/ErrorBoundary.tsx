// src/components/ErrorBoundary.tsx

'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // You could send this to your logging service here
    if (typeof window !== 'undefined') {
      console.trace('Error stack trace:', error.stack);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
          <span className="text-2xl text-destructive">⚠️</span>
        </div>
        
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Something went wrong
        </h1>
        
        <p className="text-muted-foreground mb-4">
          The application encountered an unexpected error. Please try reloading the page.
        </p>
        
        <details className="mb-4 text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Error details
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
            {error.message}
            {error.stack && '\n\n' + error.stack}
          </pre>
        </details>
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
