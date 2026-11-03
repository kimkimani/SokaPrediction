import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SokaPredictions] Uncaught React Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#8D0E83] flex items-center justify-center text-2xl mb-4">
            <i className="fas fa-futbol"></i>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
            Soka Predictions
          </h1>
          <p className="text-sm text-gray-600 max-w-md mb-6 leading-relaxed">
            We encountered a temporary interface display issue. Click below to reload the latest verified football predictions.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#8D0E83] hover:bg-[#6e0a66] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <i className="fas fa-rotate-right mr-2"></i>
              Reload Predictions
            </button>
            <a
              href="/"
              className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition"
            >
              Return Home
            </a>
          </div>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <pre className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl text-left max-w-xl overflow-auto font-mono">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
