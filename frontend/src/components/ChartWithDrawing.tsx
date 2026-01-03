import { useState, useRef } from 'react';
import { ChartDrawingTools, DrawingShape } from './ChartDrawingTools';

interface ChartWithDrawingProps {
  children: React.ReactNode;
  height?: number;
}

export function ChartWithDrawing({ children, height = 400 }: ChartWithDrawingProps) {
  const [drawings, setDrawings] = useState<DrawingShape[]>([]);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default margin - matches typical Recharts margin
  const margin = { top: 10, right: 30, left: 60, bottom: 80 };

  const handleSaveDrawings = () => {
    const data = JSON.stringify(drawings);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-drawings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadDrawings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setDrawings(data);
      } catch (error) {
        alert('Failed to load drawings file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative">
      {/* Toggle Drawing Mode Button */}
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        <button
          onClick={() => setIsDrawingEnabled(!isDrawingEnabled)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isDrawingEnabled
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {isDrawingEnabled ? '🎨 Drawing Mode ON' : '✏️ Enable Drawing'}
        </button>

        {drawings.length > 0 && (
          <>
            <button
              onClick={handleSaveDrawings}
              className="px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
              title="Save Drawings"
            >
              💾 Save
            </button>
            <label className="px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 cursor-pointer">
              📁 Load
              <input
                type="file"
                accept=".json"
                onChange={handleLoadDrawings}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>

      <div ref={containerRef} className="relative">
        {/* Original Chart */}
        {children}

        {/* Drawing Overlay */}
        {isDrawingEnabled && containerRef.current && (
          <ChartDrawingTools
            width={containerRef.current.offsetWidth}
            height={height}
            margin={margin}
            xScale={null}
            yScale={null}
            onDrawingsChange={setDrawings}
          />
        )}
      </div>

      {/* Drawing Instructions */}
      {isDrawingEnabled && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
          <p className="font-semibold text-blue-900 mb-1">Drawing Mode Active</p>
          <ul className="text-blue-800 space-y-1 text-xs">
            <li>• Select a tool from the toolbar at the top-left</li>
            <li>• Click and drag on the chart to draw</li>
            <li>• Use horizontal/vertical lines for support/resistance levels</li>
            <li>• Draw trend lines to identify patterns</li>
            <li>• Save your drawings to reload them later</li>
          </ul>
        </div>
      )}
    </div>
  );
}
