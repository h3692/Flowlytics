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
1. "Focused Optimization": Make targeted adjustments to improve traffic flow. You may modify 3-5 sections per optimization cycle, but avoid restructuring the entire store at once.
2. "Smart Merchandising": Swap product categories or relocate sections where it makes sense. You can move items across the store if there's a clear benefit, but prefer logical groupings.
3. "Dead Spots": Address dead spots by relocating popular items nearby or swapping sections to draw traffic. Feel free to make meaningful changes to underperforming areas.
4. "Balanced Approach": You have flexibility to rearrange the interior layout, but preserve the general store organization. Focus on impactful changes rather than changing everything at once.

⚠️ CRITICAL - BORDER WALLS ARE UNTOUCHABLE ⚠️
The BLACK BORDER WALLS (#) form the store's structural perimeter. These are COMPLETELY OFF-LIMITS:
- Row 0 (top border): DO NOT TOUCH - copy EXACTLY as-is
- Row 47 (bottom border): DO NOT TOUCH - copy EXACTLY as-is
- Column 0 (left border): DO NOT TOUCH - every row must start with #
- Column 47 (right border): DO NOT TOUCH - every row must end with #
ANY modification to these border walls will BREAK the simulation. Leave them EXACTLY as they appear in the input.

ABSOLUTE RESTRICTIONS (NEVER VIOLATE):
1. ⛔ PERIMETER WALLS ARE SACRED: The first row (row 0), last row (row 47), first column (col 0), and last column (col 47) contain walls (#). NEVER modify these boundary walls under any circumstances. Copy them character-for-character from the input.
2. Maintain exactly 48 rows and 48 columns.
3. Keep Entrances (E) and Checkouts (X) in their exact positions.
4. Output MUST be a python list of strings.
5. DO NOT CREATE NEW PRODUCTS OR REMOVE EXISTING ONES - only move/swap existing product configurations.
6. ⛔ REPEAT: The black border walls (#) around the ENTIRE perimeter are structural and must remain COMPLETELY UNCHANGED. Do not add, remove, or modify ANY character in the border rows/columns.
7. When outputting suggestions, refer to sections by their product names (e.g., "Meat", "Dairy", "Frozen") instead of grid letters (e.g., "M", "D", "Z")
8. LIMIT SCOPE OF CHANGES: Make no more than 4-6 targeted changes per optimization. Avoid wholesale reorganizations that alter more than 20% of the interior layout.
9. ⛔ FINAL WARNING: Before outputting, verify that row 0, row 47, and the first/last character of EVERY row are IDENTICAL to the input. If not, you have made an error.

BEFORE OUTPUTING A RESPONSE:
- check edge boxes to ensure that the border walls have not been touched, if there has been an edit, undo and re-generate the suggested changes

RESPONSE FORMAT:
SUGGESTIONS:
- [Suggestion 1]
- [Suggestion 2]
LAYOUT:
['row1', 'row2', ...]
`;

  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
