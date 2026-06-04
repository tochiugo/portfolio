import React from 'react';

// Isolates a section: if it throws, the rest of the page keeps working instead of
// white-screening. Shows a small, quiet fallback in place of the broken section.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error(`[section:${this.props.name || 'unknown'}]`, error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 text-center">
            <p className="font-mono text-xs text-zinc-500">
              This section hit a snag and was skipped. The rest of the page is unaffected.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
