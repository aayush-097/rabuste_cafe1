import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h1 className="section-title">Something went wrong</h1>
          <p className="muted" style={{ marginTop: '16px' }}>
            We're sorry, but something unexpected happened. Please refresh the page.
          </p>
          <button
            className="cta"
            onClick={() => {
              window.location.href = '/';
            }}
            style={{ marginTop: '24px' }}
          >
            Go Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;









