import { ProgressBar } from './ProgressBar';

interface ControlPanelProps {
  simCount: number;
  isRunning: boolean;
  progress: number;
  onRunSimulation: () => void;
  onResetLayout: () => void;
}

export function ControlPanel({
  simCount,
  isRunning,
  progress,
  onRunSimulation,
  onResetLayout,
}: ControlPanelProps) {
  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Simulation
          {simCount > 0 && (
            <span className="ml-2 text-sm text-accent-cyan">(Run {simCount})</span>
          )}
        </h2>
      </div>

      <div className="space-y-4">
        <button
          onClick={onRunSimulation}
          disabled={isRunning}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isRunning ? (
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
              Running...
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Run Simulation
            </>
          )}
        </button>

        <button
          onClick={onResetLayout}
          disabled={isRunning}
          className="btn-secondary w-full"
        >
          Reset Layout
        </button>
      </div>

      {isRunning && (
        <ProgressBar progress={progress} label="Simulation Progress" />
      )}

      <div className="pt-4 border-t border-dark-border">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Simulation Info</h3>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>• 50 simulated shoppers</li>
          <li>• 400 simulation steps</li>
          <li>• Weighted shopping lists</li>
          <li>• Real-time pathfinding</li>
        </ul>
      </div>
    </div>
  );
}
