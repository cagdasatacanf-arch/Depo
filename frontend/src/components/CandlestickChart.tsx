import { StockData } from '@/lib/api';
import { useMemo, useState } from 'react';
import { ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Customized, Brush, Line, Area, ReferenceLine } from 'recharts';

interface CandlestickChartProps {
  data: StockData[];
  height?: number;
  indicators?: {
    sma20?: boolean;
    sma50?: boolean;
    sma200?: boolean;
    ema20?: boolean;
    bollinger?: boolean;
    vwap?: boolean;
    sar?: boolean;
    fibonacci?: boolean;
  };
}

interface FibonacciLevel {
  level: number;
  price: number;
  label: string;
}

export function CandlestickChart({ data, height = 400, indicators = {} }: CandlestickChartProps) {
  // State for brush zoom
  const [brushStartIndex, setBrushStartIndex] = useState<number | undefined>(undefined);
  const [brushEndIndex, setBrushEndIndex] = useState<number | undefined>(undefined);

  // Keep data in original order (already reversed in parent component)
  const chartData = useMemo(() => {
    return data.map((item, index) => {
      const isGreen = item.close >= item.open;
      return {
        ...item,
        index,
        isGreen,
        color: isGreen ? '#10b981' : '#ef4444',
      };
    });
  }, [data]);

  // Filter data based on brush selection
  const displayData = useMemo(() => {
    if (brushStartIndex !== undefined && brushEndIndex !== undefined) {
      return chartData.slice(brushStartIndex, brushEndIndex + 1);
    }
    return chartData;
  }, [chartData, brushStartIndex, brushEndIndex]);

  // Calculate Fibonacci levels
  const fibonacciLevels = useMemo((): FibonacciLevel[] => {
    if (!indicators.fibonacci || displayData.length === 0) return [];

    const high = Math.max(...displayData.map(d => d.high));
    const low = Math.min(...displayData.map(d => d.low));
    const diff = high - low;

    return [
      { level: 0, price: high, label: '0% (High)' },
      { level: 0.236, price: high - diff * 0.236, label: '23.6%' },
      { level: 0.382, price: high - diff * 0.382, label: '38.2%' },
      { level: 0.5, price: high - diff * 0.5, label: '50%' },
      { level: 0.618, price: high - diff * 0.618, label: '61.8%' },
      { level: 0.786, price: high - diff * 0.786, label: '78.6%' },
      { level: 1, price: low, label: '100% (Low)' },
    ];
  }, [displayData, indicators.fibonacci]);

  // Calculate price domain
  const priceDomain = useMemo(() => {
    const allPrices = chartData.flatMap(d => [d.high, d.low]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const padding = (max - min) * 0.05;
    return [min - padding, max + padding];
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isGreen = data.close > data.open;

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.date}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700">Open: <span className="font-semibold">${data.open.toFixed(2)}</span></p>
            <p className="text-green-600">High: <span className="font-semibold">${data.high.toFixed(2)}</span></p>
            <p className="text-red-600">Low: <span className="font-semibold">${data.low.toFixed(2)}</span></p>
            <p className={`${isGreen ? 'text-green-600' : 'text-red-600'} font-bold`}>
              Close: ${data.close.toFixed(2)}
            </p>
            <p className="text-gray-600 pt-1 border-t">
              Change: <span className={`font-semibold ${isGreen ? 'text-green-600' : 'text-red-600'}`}>
                {isGreen ? '+' : ''}{(data.close - data.open).toFixed(2)}
                ({((data.close - data.open) / data.open * 100).toFixed(2)}%)
              </span>
            </p>
            <p className="text-gray-600">
              Volume: {(data.volume / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom candlestick renderer using Customized component
  const CandlestickLayer = (props: any) => {
    const { xAxisMap, yAxisMap, width, height, margin } = props;

    if (!xAxisMap || !yAxisMap) return null;

    const xAxis = xAxisMap[0];
    const yAxis = yAxisMap[0];

    if (!xAxis || !yAxis) return null;

    // Calculate the actual chart area width
    const chartWidth = width - (margin?.left || 0) - (margin?.right || 0);
    const barWidth = chartWidth / chartData.length;

    return (
      <g>
        {chartData.map((item, index) => {
          // Get X position - xAxis.scale returns the center position for band scale
          const xCenter = xAxis.scale(item.date);

          // If xAxis.scale returns undefined, calculate position manually
          const xPos = xCenter !== undefined
            ? xCenter + (xAxis.bandwidth ? xAxis.bandwidth() / 2 : 0)
            : (margin?.left || 0) + (index + 0.5) * barWidth;

          // Calculate candle dimensions
          const candleWidth = Math.max(barWidth * 0.7, 3);
          const wickX = xPos;
          const candleX = xPos - candleWidth / 2;

          // Get Y positions from yAxis scale
          const highY = yAxis.scale(item.high);
          const lowY = yAxis.scale(item.low);
          const openY = yAxis.scale(item.open);
          const closeY = yAxis.scale(item.close);

          const bodyTop = Math.min(openY, closeY);
          const bodyBottom = Math.max(openY, closeY);
          const bodyHeight = Math.max(Math.abs(closeY - openY), 1);

          return (
            <g key={`candlestick-${index}`}>
              {/* Upper wick */}
              <line
                x1={wickX}
                y1={highY}
                x2={wickX}
                y2={bodyTop}
                stroke={item.color}
                strokeWidth={1.5}
              />
              {/* Lower wick */}
              <line
                x1={wickX}
                y1={bodyBottom}
                x2={wickX}
                y2={lowY}
                stroke={item.color}
                strokeWidth={1.5}
              />
              {/* Candle body */}
              <rect
                x={candleX}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={item.color}
                stroke={item.color}
                strokeWidth={1}
              />
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 60, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 10 }}
          stroke="#6b7280"
          interval="preserveStartEnd"
        />
        <YAxis
          domain={priceDomain}
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          tickFormatter={(value) => `$${value.toFixed(2)}`}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }}
        />

        {/* Candlesticks layer */}
        <Customized component={CandlestickLayer} />

        {/* Bollinger Bands - Must be rendered as Area before Lines */}
        {indicators.bollinger && (
          <>
            <Area
              type="monotone"
              dataKey="bollingerUpper"
              stroke="#22c55e"
              fill="#22c55e20"
              strokeWidth={1}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="bollingerLower"
              stroke="#22c55e"
              fill="transparent"
              strokeWidth={1}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="bollingerMiddle"
              name="BB Middle"
              stroke="#22c55e"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          </>
        )}

        {/* Moving Average Indicators */}
        {indicators.sma20 && (
          <Line
            type="monotone"
            dataKey="sma20"
            name="SMA 20"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        )}
        {indicators.sma50 && (
          <Line
            type="monotone"
            dataKey="sma50"
            name="SMA 50"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        )}
        {indicators.sma200 && (
          <Line
            type="monotone"
            dataKey="sma200"
            name="SMA 200"
            stroke="#dc2626"
            strokeWidth={2}
            strokeDasharray="10 5"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        )}
        {indicators.ema20 && (
          <Line
            type="monotone"
            dataKey="ema20"
            name="EMA 20"
            stroke="#a855f7"
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        )}
        {indicators.vwap && (
          <Line
            type="monotone"
            dataKey="vwap"
            name="VWAP"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="3 3"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        )}
        {indicators.sar && (
          <Line
            type="monotone"
            dataKey="sar"
            name="Parabolic SAR"
            stroke="#84cc16"
            strokeWidth={0}
            dot={{ r: 3, fill: '#84cc16' }}
            connectNulls
            isAnimationActive={false}
          />
        )}

        {/* Zoom Brush */}
        <Brush
          dataKey="date"
          height={30}
          stroke="#3b82f6"
          fill="#f3f4f6"
          travellerWidth={10}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
