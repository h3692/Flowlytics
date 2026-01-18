import { useEffect, useRef, useCallback } from 'react';
import type { ViewMode, Agent } from '../simulation/types';
import { PRODUCT_MAP, COLOR_MAP, turboColor } from '../simulation/constants';

interface StoreCanvasProps {
  layout: string[];
  heatmap: number[][] | null;
  agents: Agent[];
  viewMode: ViewMode;
  maxHeat?: number;
}

const CELL_SIZE = 10;

export function StoreCanvas({
  layout,
  heatmap,
  agents,
  viewMode,
  maxHeat = 30,
}: StoreCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const width = layout[0]?.length || 48;
  const height = layout.length;

  const drawFloorPlan = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Reverse layout to match coordinate system
      const reversedLayout = [...layout].reverse();

      for (let y = 0; y < height; y++) {
        const row = reversedLayout[y] || '';
        for (let x = 0; x < width; x++) {
          const char = row[x] || '.';
          const productName = PRODUCT_MAP[char] || 'Floor';
          const color = COLOR_MAP[productName] || COLOR_MAP.Floor;

          ctx.fillStyle = color;
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    },
    [layout, width, height]
  );

  const drawAgents = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 0.5;

      for (const agent of agents) {
        if (agent.pos) {
          const x = agent.pos.x * CELL_SIZE + CELL_SIZE / 2;
          const y = agent.pos.y * CELL_SIZE + CELL_SIZE / 2;

          ctx.beginPath();
          ctx.arc(x, y, CELL_SIZE / 2 - 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    },
    [agents]
  );

  const drawHeatmap = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!heatmap) return;

      // Reverse layout to match coordinate system
      const reversedLayout = [...layout].reverse();

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const heat = heatmap[x]?.[y] || 0;
          const cell = reversedLayout[y]?.[x] || '.';

          // Shelves and walls are black
          if (cell !== '.' && cell !== 'E' && cell !== 'X') {
            ctx.fillStyle = '#000000';
          } else if (heat === 0) {
            // Dead spots (no traffic) are dark
            ctx.fillStyle = '#1a1a2e';
          } else {
            // Use turbo colormap for traffic intensity
            const normalizedHeat = Math.min(heat / maxHeat, 1);
            ctx.fillStyle = turboColor(normalizedHeat);
          }

          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    },
    [heatmap, layout, width, height, maxHeat]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (viewMode === 'heatmap' && heatmap) {
      drawHeatmap(ctx);
    } else {
      drawFloorPlan(ctx);

      if (viewMode === 'simulation' && agents.length > 0) {
        drawAgents(ctx);
      }
    }
  }, [viewMode, heatmap, agents, drawFloorPlan, drawAgents, drawHeatmap]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div ref={containerRef} className="relative">
      <canvas
        ref={canvasRef}
        width={width * CELL_SIZE}
        height={height * CELL_SIZE}
        className="rounded-lg shadow-lg"
        style={{
          imageRendering: 'pixelated',
          width: `${width * CELL_SIZE}px`,
          height: `${height * CELL_SIZE}px`,
        }}
      />

      {/* View mode label */}
      <div className="absolute top-2 left-2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-md text-sm font-medium">
        {viewMode === 'floor' && 'Floor Plan'}
        {viewMode === 'simulation' && 'Simulation Live...'}
        {viewMode === 'heatmap' && 'Traffic Intensity'}
      </div>

      {/* Heatmap color scale */}
      {viewMode === 'heatmap' && (
        <div className="absolute bottom-2 right-2 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-md text-xs">
          <span>0</span>
          <div
            className="h-3 w-24 rounded"
            style={{
              background: `linear-gradient(to right, ${turboColor(0)}, ${turboColor(0.25)}, ${turboColor(0.5)}, ${turboColor(0.75)}, ${turboColor(1)})`,
            }}
          />
          <span>{maxHeat}+</span>
        </div>
      )}
    </div>
  );
}
