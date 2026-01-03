import { StockData } from '@/lib/api';
import { useMemo } from 'react';
import { ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Bar, Line, Area, ReferenceLine, Cell, Brush } from 'recharts';

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
  // Transform data for rendering
  const chartData = useMemo(() => {
    return data.map((item) => {
      const isGreen = item.close >= item.open;
      return {
        ...item,
        isGreen,
        // For bar chart representation
        highLow: [item.low, item.high],
        openClose: [Math.min(item.open, item.close), Math.max(item.open, item.close)],
        bodyColor: isGreen ? '#10b981' : '#ef4444',
      };
    });
  }, [data]);

  // Calculate Fibonacci levels
  const fibonacciLevels = useMemo((): FibonacciLevel[] => {
    if (!indicators.fibonacci || chartData.length === 0) return [];

    const high = Math.max(...chartData.map(d => d.high));
    const low = Math.min(...chartData.map(d => d.low));
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
  }, [chartData, indicators.fibonacci]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isGreen = data.close >= data.open;

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
          domain={['auto', 'auto']}
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          tickFormatter={(value) => `$${value.toFixed(2)}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Brush dataKey="date" height={30} stroke="#2563eb" />

        {/* Fibonacci Retracement Levels */}
        {indicators.fibonacci && fibonacciLevels.map((fib) => (
          <ReferenceLine
            key={fib.level}
            y={fib.price}
            stroke={fib.level === 0.618 ? '#f59e0b' : '#fbbf24'}
            strokeDasharray={fib.level === 0 || fib.level === 1 ? '5 5' : '3 3'}
            strokeWidth={fib.level === 0.618 ? 2 : 1}
            label={{
              value: fib.label,
              position: 'right',
              fill: fib.level === 0.618 ? '#f59e0b' : '#fbbf24',
              fontSize: 10,
            }}
          />
        ))}

        {/* Candlestick Body using Bar */}
        <Bar dataKey="openClose" fill="#8884d8" barSize={8}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.bodyColor} />
          ))}
        </Bar>

        {/* Bollinger Bands */}
        {indicators.bollinger && (
          <>
            <Area
              type="monotone"
              dataKey="bbUpper"
              stroke="#22c55e"
              fill="#22c55e20"
              strokeWidth={1}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="bbLower"
              stroke="#22c55e"
              fill="transparent"
              strokeWidth={1}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="bbMiddle"
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
      </ComposedChart>
    </ResponsiveContainer>
  );
}
