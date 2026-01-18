import type { Position } from './types';
import { ITEM_ODDS, PRODUCT_KEYS, PRODUCT_MAP } from './constants';

/**
 * Shopper agent that navigates the store with a shopping list
 */
export class ShopperAgent {
  id: number;
  pos: Position;
  shoppingList: string[];
  finishedShopping: boolean;

  constructor(id: number, startPos: Position) {
    this.id = id;
    this.pos = { ...startPos };
    this.shoppingList = this.generateWeightedList();
    this.finishedShopping = false;
  }

  /**
   * Generate a shopping list with weighted probabilities
   */
  generateWeightedList(): string[] {
    const myList: string[] = [];

    // 1. Essentials based on probability weights
    for (const [item, chance] of Object.entries(ITEM_ODDS)) {
      if (Math.random() < chance) {
        myList.push(item);
      }
    }

    // 2. Random variety items from center store (force them into aisles)
    for (let i = 0; i < 3; i++) {
      const randomKey = PRODUCT_KEYS[Math.floor(Math.random() * PRODUCT_KEYS.length)];
      const productName = PRODUCT_MAP[randomKey];
      if (productName) {
        myList.push(productName);
      }
    }

    // Shuffle the list
    return this.shuffleArray(myList);
  }

  /**
   * Fisher-Yates shuffle
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Reset agent at spawn point with new shopping list
   */
  respawn(spawnPoints: Position[]): void {
    this.shoppingList = this.generateWeightedList();
    this.finishedShopping = false;

    if (spawnPoints.length > 0) {
      const newPos = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
      this.pos = { ...newPos };
    } else {
      this.pos = { x: 1, y: 1 };
    }
  }

  /**
   * Find the nearest location of a product type
   */
  findNearest(
    productType: string,
    productLocations: Map<string, Position[]>
  ): Position | null {
    const locs = productLocations.get(productType);
    if (!locs || locs.length === 0) return null;

    let nearest = locs[0];
    let minDist = Math.abs(locs[0].x - this.pos.x) + Math.abs(locs[0].y - this.pos.y);

    for (const loc of locs) {
      const dist = Math.abs(loc.x - this.pos.x) + Math.abs(loc.y - this.pos.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = loc;
      }
    }

    return nearest;
  }

  /**
   * Get valid moves (cells not blocked by shelves)
   */
  getValidMoves(
    grid: string[][],
    width: number,
    height: number
  ): Position[] {
    const neighbors: Position[] = [];

    // Moore neighborhood (8 directions)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const nx = this.pos.x + dx;
        const ny = this.pos.y + dy;

        // Bounds check
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

        // Check if cell is walkable (floor, entrance, or checkout)
        const cell = grid[ny][nx];
        if (cell === '.' || cell === 'E' || cell === 'X') {
          neighbors.push({ x: nx, y: ny });
        }
      }
    }

    return neighbors;
  }

  /**
   * Move toward target or random valid cell
   */
  move(
    grid: string[][],
    width: number,
    height: number,
    productLocations: Map<string, Position[]>,
    spawnPoints: Position[]
  ): void {
    if (this.finishedShopping) {
      this.respawn(spawnPoints);
      return;
    }

    const targetType = this.shoppingList.length === 0 ? 'Checkout' : this.shoppingList[0];
    const targetPos = this.findNearest(targetType, productLocations);

    const validMoves = this.getValidMoves(grid, width, height);
    if (validMoves.length === 0) return;

    let nextPos: Position;

    if (targetPos) {
      // Sort by Manhattan distance to target
      validMoves.sort((a, b) => {
        const distA = Math.abs(a.x - targetPos.x) + Math.abs(a.y - targetPos.y);
        const distB = Math.abs(b.x - targetPos.x) + Math.abs(b.y - targetPos.y);
        return distA - distB;
      });

      // Add some randomness (10% chance to pick random valid move)
      if (Math.random() > 0.1) {
        nextPos = validMoves[0];
      } else {
        nextPos = validMoves[Math.floor(Math.random() * validMoves.length)];
      }
    } else {
      // Random move if no target found
      nextPos = validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    this.pos = nextPos;
  }

  /**
   * Check if adjacent to target product and interact
   * Returns dwell time bonus for heatmap
   */
  interact(grid: string[][], width: number, height: number): number {
    if (this.shoppingList.length === 0) {
      // Check if at checkout
      if (grid[this.pos.y]?.[this.pos.x] === 'X') {
        this.finishedShopping = true;
      }
      return 0;
    }

    const target = this.shoppingList[0];

    // Check Moore neighborhood for matching product
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const nx = this.pos.x + dx;
        const ny = this.pos.y + dy;

        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

        const cell = grid[ny][nx];
        const productName = PRODUCT_MAP[cell];

        if (productName === target) {
          // Found the product - remove from list
          this.shoppingList.shift();
          // Return dwell time bonus
          return 5;
        }
      }
    }

    return 0;
  }

  /**
   * Perform one simulation step
   * Returns heatmap contribution at current position
   */
  step(
    grid: string[][],
    width: number,
    height: number,
    productLocations: Map<string, Position[]>,
    spawnPoints: Position[]
  ): { pos: Position; heat: number } {
    // Track current position for heatmap
    const currentPos = { ...this.pos };
    let heat = 1;

    // Move first
    this.move(grid, width, height, productLocations, spawnPoints);

    // Then interact
    heat += this.interact(grid, width, height);

    return { pos: currentPos, heat };
  }
}
