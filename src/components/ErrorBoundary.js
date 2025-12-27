import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{
                    padding: '2rem',
                    backgroundColor: '#0f172a',
                    color: '#e2e8f0',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif'
                }}>
                    <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Something went wrong.</h1>
                    <p style={{ maxWidth: '600px', textAlign: 'center', marginBottom: '2rem' }}>
                        The application crashed. This is likely due to a configuration issue or a bug.
                    </p>
                    <div style={{
                        backgroundColor: '#1e293b',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        overflow: 'auto',
                        maxWidth: '80%',
                        border: '1px solid #334155'
                    }}>
                        <code style={{ color: '#fca5a5' }}>
                            {this.state.error && this.state.error.toString()}
                        </code>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '2rem',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#f59e0b',
                            color: '#0f172a',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
