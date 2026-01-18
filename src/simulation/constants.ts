// Product character codes for center store aisles
export const PRODUCT_KEYS = ['c', 'j', 's', 'p', 'S', 'C', 'k', 'o', 'w', 'h', 'F', 'b', 't', 'V'];

// Map from character to product name
export const PRODUCT_MAP: Record<string, string> = {
  // Structure
  '#': 'Wall',
  '.': 'Floor',
  'E': 'Entrance',
  'X': 'Checkout',
  // Perimeter
  'M': 'Meat',
  'D': 'Dairy',
  'P': 'Produce',
  'B': 'Bakery',
  'Z': 'Frozen',
  // Center Store (The Variety)
  'c': 'Cereal',
  'j': 'Juice',
  's': 'Soda',
  'p': 'Pasta',
  'S': 'Sauce',
  'C': 'Chips',
  'k': 'Cookies',
  'o': 'Oil/Condiments',
  'w': 'Water',
  'h': 'Household',
  'F': 'Pet Food',
  'b': 'Baby',
  't': 'Tea/Coffee',
  'V': 'Canned Veg',
};

// Reverse map from product name to character
export const PRODUCT_CHAR_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCT_MAP).map(([k, v]) => [v, k])
);

// Distinct colors for every product type
export const COLOR_MAP: Record<string, string> = {
  Wall: '#000000',
  Floor: '#FAFAFA',
  Entrance: '#444444',
  Checkout: '#666666',
  Meat: '#EF5350',
  Dairy: '#FFF9C4',
  Produce: '#66BB6A',
  Bakery: '#D7CCC8',
  Frozen: '#4FC3F7',
  Cereal: '#FFF176',
  Juice: '#FFB74D',
  Soda: '#E53935',
  Pasta: '#FFE0B2',
  Sauce: '#BF360C',
  Chips: '#FFCA28',
  Cookies: '#8D6E63',
  'Oil/Condiments': '#FDD835',
  Water: '#29B6F6',
  Household: '#7E57C2',
  'Pet Food': '#5D4037',
  Baby: '#F48FB1',
  'Tea/Coffee': '#4E342E',
  'Canned Veg': '#33691E',
};

// Probability weights for shopping list (essentials are more common)
export const ITEM_ODDS: Record<string, number> = {
  Meat: 0.8,
  Dairy: 0.8,
  Produce: 0.8,
  Bakery: 0.6,
  Frozen: 0.5,
  Cereal: 0.4,
  Soda: 0.4,
  Chips: 0.4,
  Pasta: 0.3,
  Household: 0.1,
  Juice: 0.3,
  Water: 0.2,
  Baby: 0.1,
};

// Turbo colormap for heatmap visualization (approximation of matplotlib's turbo)
export const TURBO_COLORMAP = [
  [48, 18, 59],     // Dark blue
  [70, 107, 207],   // Blue
  [89, 165, 216],   // Light blue
  [96, 206, 184],   // Cyan
  [134, 232, 127],  // Green
  [194, 243, 68],   // Yellow-green
  [253, 205, 35],   // Yellow
  [255, 141, 28],   // Orange
  [238, 67, 37],    // Red-orange
  [205, 26, 42],    // Red
  [144, 12, 0],     // Dark red
];

// Convert value (0-1) to turbo color
export function turboColor(t: number): string {
  t = Math.max(0, Math.min(1, t));
  const idx = t * (TURBO_COLORMAP.length - 1);
  const low = Math.floor(idx);
  const high = Math.min(TURBO_COLORMAP.length - 1, low + 1);
  const frac = idx - low;

  const r = Math.round(TURBO_COLORMAP[low][0] * (1 - frac) + TURBO_COLORMAP[high][0] * frac);
  const g = Math.round(TURBO_COLORMAP[low][1] * (1 - frac) + TURBO_COLORMAP[high][1] * frac);
  const b = Math.round(TURBO_COLORMAP[low][2] * (1 - frac) + TURBO_COLORMAP[high][2] * frac);

  return `rgb(${r}, ${g}, ${b})`;
}

// Default simulation configuration
export const DEFAULT_CONFIG = {
  width: 48,
  height: 48,
  numShoppers: 50,
  numSteps: 400,
};
