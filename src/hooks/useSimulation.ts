import { useState, useRef, useCallback } from 'react';
import { StoreModel } from '../simulation/StoreModel';
import { generateInitialLayout } from '../simulation/layout';
import type { Agent, ViewMode, TrafficReport } from '../simulation/types';
import { DEFAULT_CONFIG } from '../simulation/constants';

export interface UseSimulationReturn {
  layout: string[];
  heatmap: number[][] | null;
  agents: Agent[];
  viewMode: ViewMode;
  isRunning: boolean;
  progress: number;
  simCount: number;
  trafficReport: TrafficReport | null;
  suggestions: string[];
  proposedLayout: string[] | null;
  runSimulation: () => void;
  resetLayout: () => void;
  setSuggestions: (suggestions: string[], newLayout: string[]) => void;
  applyProposedLayout: () => void;
}

export function useSimulation(): UseSimulationReturn {
  const [layout, setLayout] = useState<string[]>(() =>
    generateInitialLayout(DEFAULT_CONFIG.width, DEFAULT_CONFIG.height)
  );
  const [heatmap, setHeatmap] = useState<number[][] | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('floor');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [simCount, setSimCount] = useState(0);
  const [trafficReport, setTrafficReport] = useState<TrafficReport | null>(null);
  const [suggestions, setSuggestionsState] = useState<string[]>([]);
  const [proposedLayout, setProposedLayout] = useState<string[] | null>(null);

  const modelRef = useRef<StoreModel | null>(null);

  const runSimulation = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    setProgress(0);
    setViewMode('simulation');
    setHeatmap(null);
    setSuggestionsState([]);
    setProposedLayout(null);

    // Create new model
    const model = new StoreModel(layout, DEFAULT_CONFIG.numShoppers);
    modelRef.current = model;

    let step = 0;
    const totalSteps = DEFAULT_CONFIG.numSteps;
    const updateInterval = 25; // Update UI every 25 steps

    const runStep = () => {
      if (step >= totalSteps) {
        // Simulation complete
        setHeatmap(model.getHeatmap());
        setAgents([]);
        setViewMode('heatmap');
        setIsRunning(false);
        setProgress(100);
        setTrafficReport(model.getTrafficStats());
        setSimCount(prev => prev + 1);
        return;
      }

      // Run steps in batches for performance
      const batchSize = Math.min(updateInterval, totalSteps - step);
      for (let i = 0; i < batchSize; i++) {
        model.step();
      }
      step += batchSize;

      // Update progress and agents
      setProgress((step / totalSteps) * 100);
      setAgents(model.getAgentPositions());

      // Schedule next batch
      requestAnimationFrame(runStep);
    };

    // Start simulation
    requestAnimationFrame(runStep);
  }, [isRunning, layout]);

  const resetLayout = useCallback(() => {
    const newLayout = generateInitialLayout(DEFAULT_CONFIG.width, DEFAULT_CONFIG.height);
    setLayout(newLayout);
    setHeatmap(null);
    setAgents([]);
    setViewMode('floor');
    setProgress(0);
    setTrafficReport(null);
    setSuggestionsState([]);
    setProposedLayout(null);
    setSimCount(0);
  }, []);

  const setSuggestions = useCallback((newSuggestions: string[], newLayout: string[]) => {
    setSuggestionsState(newSuggestions);
    setProposedLayout(newLayout);
  }, []);

  const applyProposedLayout = useCallback(() => {
    if (proposedLayout) {
      setLayout(proposedLayout);
      setHeatmap(null);
      setAgents([]);
      setViewMode('floor');
      setTrafficReport(null);
      setSuggestionsState([]);
      setProposedLayout(null);
    }
  }, [proposedLayout]);

  return {
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
  };
}
