import { PRODUCT_KEYS } from './constants';

/**
 * Sanitize layout to ensure it's exactly target dimensions
 */
export function sanitizeLayout(
  layout: string[],
  targetW: number = 48,
  targetH: number = 48
): string[] {
  // Ensure correct number of rows
  let result = [...layout];

  if (result.length > targetH) {
    result = result.slice(0, targetH);
  } else {
    while (result.length < targetH) {
      result.push('.'.repeat(targetW));
    }
  }

  // Ensure correct number of columns per row
  return result.map(row => {
    if (row.length > targetW) {
      return row.slice(0, targetW);
    } else if (row.length < targetW) {
      return row + '.'.repeat(targetW - row.length);
    }
    return row;
  });
}

/**
 * Generate initial store layout
 */
export function generateInitialLayout(width: number, height: number): string[] {
  // Create empty grid
  const layout: string[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill('.'));

  // Add walls around the perimeter
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        layout[y][x] = '#';
      }
    }
  }

  // Add perimeter anchors - Meat along bottom
  for (let x = 2; x < width - 2; x++) {
    layout[height - 2][x] = 'M';
  }

  // Frozen along left side
  for (let y = 5; y < height - 5; y++) {
    layout[y][2] = 'Z';
  }

  // Center aisles with striped variety
  for (let x = 8; x < width - 8; x += 5) {
    for (let y = 8; y < height - 8; y++) {
      // Create breaks in aisles for cross-traffic
      const midY = Math.floor(height / 2);
      if (y === midY || y === midY - 1) {
        continue;
      }

      // Alternate products for maximum color variety
      const prod = PRODUCT_KEYS[(y + x) % PRODUCT_KEYS.length];
      layout[y][x] = prod;
      layout[y][x + 1] = prod;
    }
  }

  // Add entrance and checkout
  const mid = Math.floor(width / 2);
  layout[1][mid] = 'E';
  layout[4][5] = 'X';

  return layout.map(row => row.join(''));
}

/**
 * Parse layout to extract product and structural positions
 */
export function parseLayout(layout: string[]): {
  spawnPoints: { x: number; y: number }[];
  productLocations: Map<string, { x: number; y: number }[]>;
  checkoutLocations: { x: number; y: number }[];
} {
  const spawnPoints: { x: number; y: number }[] = [];
  const productLocations = new Map<string, { x: number; y: number }[]>();
  const checkoutLocations: { x: number; y: number }[] = [];

  // Note: We process the layout in reversed order (like the Python code)
  // to match coordinate system expectations
  const reversedLayout = [...layout].reverse();

  for (let y = 0; y < reversedLayout.length; y++) {
    const row = reversedLayout[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];

      if (char === 'E') {
        spawnPoints.push({ x, y });
      } else if (char === 'X') {
        checkoutLocations.push({ x, y });
        if (!productLocations.has('Checkout')) {
          productLocations.set('Checkout', []);
        }
        productLocations.get('Checkout')!.push({ x, y });
      } else if (char !== '.' && char !== '#') {
        // It's a product shelf
        const productName = getProductName(char);
        if (productName && productName !== 'Floor') {
          if (!productLocations.has(productName)) {
            productLocations.set(productName, []);
          }
          productLocations.get(productName)!.push({ x, y });
        }
      }
    }
  }

  return { spawnPoints, productLocations, checkoutLocations };
}

import { PRODUCT_MAP } from './constants';

/**
 * Get product name from character code
 */
export function getProductName(char: string): string | undefined {
  return PRODUCT_MAP[char];
}
