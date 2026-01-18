import { GoogleGenerativeAI } from '@google/generative-ai';
import { sanitizeLayout } from '../simulation/layout';
import type { AIResponse } from '../simulation/types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!API_KEY) {
      throw new Error('VITE_GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

export function isApiKeyConfigured(): boolean {
  return !!API_KEY;
}

export async function getOptimizationSuggestions(
  layout: string[],
  maxTraffic: number,
  deadSpots: number
): Promise<AIResponse> {
  const report = `Max Traffic: ${maxTraffic}, Unvisited Floor Tiles: ${deadSpots}`;

  const prompt = `
You are a Retail Merchandising AI. Your goal is to optimize product placement without expensive construction.

CURRENT LAYOUT (ASCII):
${layout.join('\n')}

TRAFFIC REPORT:
${report}

STRATEGY:
1. "Active Optimization": You have freedom to rearrange product placements within the store interior to improve traffic flow.
2. "Merchandising": Swap product categories on shelves, relocate sections, and reposition items to balance traffic and reduce congestion.
3. "Dead Spots": If a floor area has 0 traffic, move popular items nearby or reorganize the section to draw customers in.
4. Be creative with interior layouts - you can move shelves, swap entire sections, and reorganize aisles.

ABSOLUTE RESTRICTIONS (NEVER VIOLATE):
1. PERIMETER WALLS ARE SACRED: The first row (row 0), last row (row 47), first column (col 0), and last column (col 47) contain walls (#). NEVER modify these boundary walls under any circumstances.
2. Maintain exactly 48 rows and 48 columns.
3. Keep Entrances (E) and Checkouts (X) in their exact positions.
4. Output MUST be a python list of strings.
5. DO NOT CREATE NEW PRODUCTS OR REMOVE EXISTING ONES - only move/swap existing product configurations.
6. The black border walls (#) around the entire perimeter are structural and must remain completely unchanged.
7. When outputting suggestions, refer to sections by their product names (e.g., "Meat", "Dairy", "Frozen") instead of grid letters (e.g., "M", "D", "Z")

RESPONSE FORMAT:
SUGGESTIONS:
- [Suggestion 1]
- [Suggestion 2]
LAYOUT:
['row1', 'row2', ...]
`;

  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse suggestions
    const suggestions: string[] = [];
    if (text.includes('SUGGESTIONS:')) {
      const parts = text.split('SUGGESTIONS:')[1].split('LAYOUT:')[0];
      const lines = parts.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('-')) {
          suggestions.push(trimmed);
        }
      }
    }

    // Parse layout
    let newLayout: string[] = layout;
    const match = text.match(/\[[\s\S]*?\]/);
    if (match) {
      try {
        // Parse the Python-style list of strings
        const listStr = match[0];
        // Remove brackets and split by quotes
        const parsed = listStr
          .slice(1, -1) // Remove [ ]
          .split(/,\s*/)
          .map(s => s.replace(/^['"]|['"]$/g, '').trim())
          .filter(s => s.length > 0);

        if (parsed.length > 0) {
          newLayout = sanitizeLayout(parsed);
        }
      } catch (parseError) {
        console.error('Failed to parse layout:', parseError);
      }
    }

    return { suggestions, newLayout };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      suggestions: [`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      newLayout: layout,
    };
  }
}
