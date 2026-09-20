import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React ErrorBoundary Caught Error]:', error, errorInfo);
    this.setState({ errorInfo });

    // Handle stale chunk after fresh deployment
    const errMsg = (error?.message || error?.toString() || '').toLowerCase();
    if (errMsg.includes('dynamically imported module') || errMsg.includes('loading chunk') || errMsg.includes('mime type')) {
      const lastReload = sessionStorage.getItem('wf_chunk_reload');
      const now = Date.now();
      if (!lastReload || (now - parseInt(lastReload, 10)) > 8000) {
        sessionStorage.setItem('wf_chunk_reload', now.toString());
        window.location.reload();
      }
    }
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '0.5rem',
                backgroundColor: '#dc2626',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.25rem'
              }}>!</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#f8fafc' }}>
                  WorkForge Enterprise Runtime Recovery
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>
                  An unexpected error was intercepted during page rendering.
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#090d16',
              border: '1px solid #1e293b',
              borderRadius: '0.5rem',
              padding: '1rem',
              fontSize: '0.75rem',
              color: '#f87171',
              fontFamily: 'monospace',
              marginBottom: '1.5rem',
              maxHeight: '200px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Reload Webapp
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  backgroundColor: '#334155',
                  color: '#f8fafc',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Reset App & Clear Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
