import { useState } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { StoreCanvas } from './components/StoreCanvas';
import { ControlPanel } from './components/ControlPanel';
import { AIPanel } from './components/AIPanel';
import { Legend } from './components/Legend';
import { LaunchPage } from './components/LaunchPage';

function App() {
  const [currentView, setCurrentView] = useState<'launch' | 'dashboard'>('launch');

  const {
    layout,
    heatmap,
    agents,
    viewMode,
    isRunning,
    progress,
    simCount,
    trafficReport,
    suggestions,
    proposedLayout,
    runSimulation,
    resetLayout,
    setSuggestions,
    applyProposedLayout,
  } = useSimulation();

  if (currentView === 'launch') {
    return <LaunchPage onProceed={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between mb-6">
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          {/* CORRECTED UPLOAD BUTTON: Removed btn-primary, added manual sizing + red gradient */}
          <button className="
            flex items-center gap-2 
            px-6 py-3 rounded-xl font-semibold
            bg-gradient-to-r from-red-600 to-orange-500 text-white
            transition-all duration-300
            hover:scale-105 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]
          ">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload New Footage
          </button>

          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center justify-center gap-3">
          <span className="
            text-4xl
            inline-block 
            transition-transform 
            duration-300 
            hover:scale-110
            cursor-pointer
          ">🛒</span>
          <span 
            className="
              bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400
              bg-clip-text text-transparent 
              inline-block 
              transition-transform 
              duration-300 
              hover:scale-110
              cursor-pointer
            "
          >
            Flowlytics
          </span>
        </h1>
        <p className="text-gray-400 mt-2 flex justify-center items-center">
          Retail store traffic simulation and AI-powered layout optimization
        </p>
      </header>

      {/* Main content - 3 column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left panel - Legend */}
        <div className="lg:col-span-2 h-full">
          <Legend />
        </div>

        {/* Center panel - Canvas */}
        <div className="lg:col-span-5 h-full">
          <div className="glass-card p-6 h-full">
            <div className="flex justify-center h-full items-center">
              <StoreCanvas
                layout={layout}
                heatmap={heatmap}
                agents={agents}
                viewMode={viewMode}
                maxHeat={30}
              />
            </div>
          </div>
        </div>

        {/* Right panel - Controls & AI */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <ControlPanel
            simCount={simCount}
            isRunning={isRunning}
            progress={progress}
            onRunSimulation={runSimulation}
            onResetLayout={resetLayout}
          />

          <AIPanel
            layout={layout}
            trafficReport={trafficReport}
            onSuggestionsReceived={setSuggestions}
          />
        </div>
      </div>

      {/* Full-width Suggestions Panel */}
      {suggestions.length > 0 && (
        <div className="mt-6 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            {/* Changed from Emerald (Green) to Orange/Red theme */}
            <div className="flex items-center gap-2 text-orange-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold">AI Optimization Suggestions</h2>
            </div>
            {proposedLayout && (
              <button
                onClick={applyProposedLayout}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white
                  bg-gradient-to-r from-orange-500 to-red-500 
                  hover:from-orange-400 hover:to-red-400
                  transition-all duration-200
                "
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Apply Changes
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 bg-orange-900/20 border border-orange-700/50 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 text-white text-sm flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <p className="text-gray-300">{suggestion.replace(/^-\s*/, '')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Powered by Gemini AI for layout optimization</p>
      </footer>
    </div>
  );
}

export default App;