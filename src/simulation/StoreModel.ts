import type { Position, Agent } from './types';
import { ShopperAgent } from './ShopperAgent';
import { parseLayout } from './layout';
import { DEFAULT_CONFIG } from './constants';

/**
 * Store simulation model that manages agents and heatmap
 */
export class StoreModel {
  layout: string[];
  width: number;
  height: number;
  grid: string[][]; // 2D array for fast lookup
  agents: ShopperAgent[];
  heatmap: number[][];
  spawnPoints: Position[];
  productLocations: Map<string, Position[]>;
  currentStep: number;

  constructor(layout: string[], numShoppers: number = DEFAULT_CONFIG.numShoppers) {
    this.layout = layout;
    this.height = layout.length;
    this.width = layout[0]?.length || 0;

    // Convert layout to 2D grid (reversed to match coordinate system)
    const reversedLayout = [...layout].reverse();
    this.grid = reversedLayout.map(row => row.split(''));

    // Initialize heatmap
    this.heatmap = Array(this.width)
      .fill(null)
      .map(() => Array(this.height).fill(0));

    // Parse layout for spawn points and product locations
    const parsed = parseLayout(layout);
    this.spawnPoints = parsed.spawnPoints;
    this.productLocations = parsed.productLocations;

    // Initialize agents
    this.agents = [];
    for (let i = 0; i < numShoppers; i++) {
      const spawnPos = this.spawnPoints.length > 0
        ? this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)]
        : { x: 1, y: 1 };

      this.agents.push(new ShopperAgent(i, spawnPos));
    }

    this.currentStep = 0;
  }

  /**
   * Run one simulation step
   */
  step(): void {
    // Shuffle agents for random activation order
    const shuffled = [...this.agents].sort(() => Math.random() - 0.5);

    for (const agent of shuffled) {
      const result = agent.step(
        this.grid,
        this.width,
        this.height,
        this.productLocations,
        this.spawnPoints
      );

      // Update heatmap
      if (
        result.pos.x >= 0 &&
        result.pos.x < this.width &&
        result.pos.y >= 0 &&
        result.pos.y < this.height
      ) {
        this.heatmap[result.pos.x][result.pos.y] += result.heat;
      }
    }

    this.currentStep++;
  }

  /**
   * Get agent positions for rendering
   */
  getAgentPositions(): Agent[] {
    return this.agents.map(agent => ({
      id: agent.id,
      pos: { ...agent.pos },
      shoppingList: [...agent.shoppingList],
      finishedShopping: agent.finishedShopping,
    }));
  }

  /**
   * Get heatmap data
   */
  getHeatmap(): number[][] {
    return this.heatmap;
  }

  /**
   * Calculate traffic statistics
   */
  getTrafficStats(): { maxCongestion: number; deadSpots: number } {
    let maxCongestion = 0;
    let deadSpots = 0;

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const heat = this.heatmap[x][y];
        maxCongestion = Math.max(maxCongestion, heat);

        // Check if it's a floor tile with zero traffic
        const cell = this.grid[y]?.[x];
        if (cell === '.' && heat === 0) {
          deadSpots++;
        }
      }
    }

    return { maxCongestion, deadSpots };
  }

  /**
   * Reset heatmap
   */
  resetHeatmap(): void {
    this.heatmap = Array(this.width)
      .fill(null)
      .map(() => Array(this.height).fill(0));
  }
}
