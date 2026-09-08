import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled React Render Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] w-full flex items-center justify-center p-8 bg-canvas-bg">
          <div className="bg-surface-card rounded-2xl p-8 max-w-xl w-full border border-border-structural shadow-lg flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-status-error/10 text-status-error flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <div>
              <h2 className="font-heading font-bold text-lg text-text-primary">
                Application Exception Encountered
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                A rendering component encountered an unexpected error. You can recover immediately by reloading the view.
              </p>
            </div>

            <div className="p-3 bg-black/90 text-red-400 font-mono text-[11px] rounded-lg w-full text-left overflow-x-auto max-h-32">
              {this.state.error ? this.state.error.toString() : "Unknown Render Error"}
            </div>

            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-heading text-xs font-bold hover:bg-primary-container shadow-md transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reset &amp; Reload DigiLand Platform
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
