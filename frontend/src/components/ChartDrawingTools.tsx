import { useState, useRef, useEffect } from 'react';

export type DrawingTool = 'none' | 'line' | 'horizontal' | 'vertical' | 'rectangle' | 'text';

export interface DrawingShape {
  id: string;
  type: DrawingTool;
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  color: string;
  text?: string;
}

interface ChartDrawingToolsProps {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  xScale: any;
  yScale: any;
  onDrawingsChange?: (drawings: DrawingShape[]) => void;
}

export function ChartDrawingTools({
  width,
  height,
  margin,
  xScale,
  yScale,
  onDrawingsChange,
}: ChartDrawingToolsProps) {
  const [activeTool, setActiveTool] = useState<DrawingTool>('none');
  const [drawings, setDrawings] = useState<DrawingShape[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingShape | null>(null);
  const [drawingColor, setDrawingColor] = useState('#2563eb');
  const svgRef = useRef<SVGSVGElement>(null);

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'none') return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - margin.left;
    const y = e.clientY - rect.top - margin.top;

    // Bounds check
    if (x < 0 || x > chartWidth || y < 0 || y > chartHeight) return;

    const newDrawing: DrawingShape = {
      id: Date.now().toString(),
      type: activeTool,
      startX: x,
      startY: y,
      color: drawingColor,
    };

    setCurrentDrawing(newDrawing);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!currentDrawing) return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - margin.left;
    const y = e.clientY - rect.top - margin.top;

    setCurrentDrawing({
      ...currentDrawing,
      endX: x,
      endY: y,
    });
  };

  const handleMouseUp = () => {
    if (currentDrawing && currentDrawing.endX !== undefined) {
      const newDrawings = [...drawings, currentDrawing];
      setDrawings(newDrawings);
      onDrawingsChange?.(newDrawings);
    }
    setCurrentDrawing(null);
  };

  const renderShape = (shape: DrawingShape) => {
    const { type, startX, startY, endX, endY, color } = shape;

    switch (type) {
      case 'line':
        if (endX === undefined || endY === undefined) return null;
        return (
          <line
            key={shape.id}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={color}
            strokeWidth={2}
          />
        );

      case 'horizontal':
        return (
          <line
            key={shape.id}
            x1={0}
            y1={startY}
            x2={chartWidth}
            y2={startY}
            stroke={color}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        );

      case 'vertical':
        return (
          <line
            key={shape.id}
            x1={startX}
            y1={0}
            x2={startX}
            y2={chartHeight}
            stroke={color}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        );

      case 'rectangle':
        if (endX === undefined || endY === undefined) return null;
        const rectX = Math.min(startX, endX);
        const rectY = Math.min(startY, endY);
        const rectWidth = Math.abs(endX - startX);
        const rectHeight = Math.abs(endY - startY);
        return (
          <rect
            key={shape.id}
            x={rectX}
            y={rectY}
            width={rectWidth}
            height={rectHeight}
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
        );

      case 'text':
        return (
          <text
            key={shape.id}
            x={startX}
            y={startY}
            fill={color}
            fontSize={14}
            fontWeight="bold"
          >
            {shape.text || 'Note'}
          </text>
        );

      default:
        return null;
    }
  };

  const clearDrawings = () => {
    setDrawings([]);
    onDrawingsChange?.([]);
  };

  const undoLast = () => {
    const newDrawings = drawings.slice(0, -1);
    setDrawings(newDrawings);
    onDrawingsChange?.(newDrawings);
  };

  return (
    <div className="relative">
      {/* Drawing Toolbar */}
      <div className="absolute top-2 left-2 z-10 bg-white rounded-lg shadow-lg p-2 flex gap-2 items-center">
        <button
          onClick={() => setActiveTool('none')}
          className={`p-2 rounded ${
            activeTool === 'none' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title="Select"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </button>

        <button
          onClick={() => setActiveTool('line')}
          className={`p-2 rounded ${
            activeTool === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title="Trend Line"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <button
          onClick={() => setActiveTool('horizontal')}
          className={`p-2 rounded ${
            activeTool === 'horizontal' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title="Horizontal Line"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <button
          onClick={() => setActiveTool('vertical')}
          className={`p-2 rounded ${
            activeTool === 'vertical' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title="Vertical Line"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16" />
          </svg>
        </button>

        <button
          onClick={() => setActiveTool('rectangle')}
          className={`p-2 rounded ${
            activeTool === 'rectangle' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title="Rectangle"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" strokeWidth={2} rx="2" />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        <input
          type="color"
          value={drawingColor}
          onChange={(e) => setDrawingColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer"
          title="Line Color"
        />

        <div className="w-px h-6 bg-gray-300"></div>

        <button
          onClick={undoLast}
          disabled={drawings.length === 0}
          className="p-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          title="Undo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        <button
          onClick={clearDrawings}
          disabled={drawings.length === 0}
          className="p-2 rounded bg-red-100 hover:bg-red-200 text-red-600 disabled:opacity-50"
          title="Clear All"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <span className="text-xs text-gray-600 ml-2">
          {drawings.length} drawing{drawings.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Drawing Canvas */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="absolute top-0 left-0 pointer-events-auto"
        style={{ cursor: activeTool !== 'none' ? 'crosshair' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Render all saved drawings */}
          {drawings.map(renderShape)}

          {/* Render current drawing being created */}
          {currentDrawing && renderShape(currentDrawing)}
        </g>
      </svg>
    </div>
  );
}
