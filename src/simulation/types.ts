export interface Position {
  x: number;
  y: number;
}

export interface Agent {
  id: number;
  pos: Position;
  shoppingList: string[];
  finishedShopping: boolean;
}

export interface Shelf {
  id: string;
  pos: Position;
  productType: string;
}

export interface StoreState {
  layout: string[];
  heatmap: number[][];
  agents: Agent[];
  shelves: Shelf[];
  spawnPoints: Position[];
  productLocations: Map<string, Position[]>;
  step: number;
  isRunning: boolean;
}

export type ViewMode = 'floor' | 'simulation' | 'heatmap';

export interface SimulationConfig {
  width: number;
  height: number;
  numShoppers: number;
  numSteps: number;
}

export interface TrafficReport {
  maxCongestion: number;
  deadSpots: number;
}

export interface AIResponse {
  suggestions: string[];
  newLayout: string[];
}
