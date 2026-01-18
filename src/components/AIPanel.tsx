import { useState } from 'react';
import type { TrafficReport } from '../simulation/types';
import { getOptimizationSuggestions, isApiKeyConfigured } from '../services/gemini';

interface AIPanelProps {
  layout: string[];
  trafficReport: TrafficReport | null;
  onSuggestionsReceived: (suggestions: string[], newLayout: string[]) => void;
}

export function AIPanel({
  layout,
  trafficReport,
  onSuggestionsReceived,
}: AIPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const apiConfigured = isApiKeyConfigured();

  const handleOptimize = async () => {
    if (!trafficReport) return;

    setIsLoading(true);
    try {
      const result = await getOptimizationSuggestions(
        layout,
        trafficReport.maxCongestion,
        trafficReport.deadSpots
      );
      onSuggestionsReceived(result.suggestions, result.newLayout);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <svg className="h-6 w-6 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        AI Analysis
      </h2>

      {!apiConfigured && (
        <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <p className="text-yellow-400 text-sm">
            Gemini API key not configured. Add <code className="bg-black/30 px-1 rounded">VITE_GEMINI_API_KEY</code> to your .env file.
          </p>
        </div>
      )}

      {trafficReport && (
        <div className="space-y-3">
          <div className="p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
            <div className="flex items-center gap-2 text-amber-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-medium">Traffic Report</span>
            </div>
            <div className="mt-2 text-sm text-gray-300 space-y-1">
              <p>Max Congestion: <span className="text-white font-semibold">{trafficReport.maxCongestion}</span></p>
              <p>Dead Floor Spots: <span className="text-white font-semibold">{trafficReport.deadSpots}</span></p>
            </div>
          </div>

          <button
            onClick={handleOptimize}
            disabled={isLoading || !apiConfigured}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing patterns...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Optimize Layout
              </>
            )}
          </button>
        </div>
      )}

      {!trafficReport && (
        <p className="text-gray-500 text-sm">
          Run a simulation to generate traffic data for AI analysis.
        </p>
      )}
    </div>
  );
}
