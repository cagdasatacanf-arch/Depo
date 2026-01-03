import { useState, useRef, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from 'recharts';
import { StockData } from '@/lib/api';
import { addIndicatorsToData } from '@/lib/indicators';
import { chartTemplates, applyTemplate } from '@/lib/chartTemplates';
import { CandlestickChart } from './CandlestickChart';

interface StockChartsAdvancedProps {
  data: StockData[];
  ticker: string;
}

export function StockChartsAdvanced({ data, ticker }: StockChartsAdvancedProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeChart, setActiveChart] = useState<string | null>(null);
  const [indicators, setIndicators] = useState({
    sma20: false,
    sma50: false,
    sma200: false,
    ema20: false,
    rsi: false,
    macd: false,
    bollinger: false,
    stochastic: false,
    atr: false,
    adx: false,
    cci: false,
    obv: false,
    vwap: false,
    sar: false,
  });
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  const fullScreenRef = useRef<HTMLDivElement>(null);

  // Apply template when selected
  const handleTemplateChange = (templateName: string) => {
    if (templateName === '') {
      setSelectedTemplate('');
      return;
    }
    const template = applyTemplate(templateName);
    setIndicators(prev => ({ ...prev, ...template }));
    setSelectedTemplate(templateName);
  };

  // Reverse data and add indicators
  const baseData = [...data].reverse();
  const chartData = addIndicatorsToData(baseData, indicators);

  // Calculate price change
  const latestPrice = data[0]?.close || 0;
  const oldestPrice = data[data.length - 1]?.close || 0;
  const priceChange = latestPrice - oldestPrice;
  const priceChangePercent = ((priceChange / oldestPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  // Full screen toggle (modal-style)
  const toggleFullScreen = (chartId: string) => {
    if (isFullScreen && activeChart === chartId) {
      setIsFullScreen(false);
      setActiveChart(null);
    } else {
      setIsFullScreen(true);
      setActiveChart(chartId);
    }
  };

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
        setActiveChart(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Toggle indicator
  const toggleIndicator = (indicator: keyof typeof indicators) => {
    setIndicators(prev => ({ ...prev, [indicator]: !prev[indicator] }));
  };

  // Reset zoom
  const resetZoom = () => {
    setZoomDomain(null);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? `$${entry.value.toFixed(2)}` : 'N/A'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const VolumeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-blue-600">
            Volume: {(payload[0].value / 1000000).toFixed(2)}M
          </p>
        </div>
      );
    }
    return null;
  };

  const RSITooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-purple-600">
            RSI: {payload[0].value.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {payload[0].value > 70 ? 'Overbought' : payload[0].value < 30 ? 'Oversold' : 'Neutral'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Chart controls component
  const ChartControls = ({ chartId, title }: { chartId: string; title: string }) => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="flex gap-2">
        {zoomDomain && (
          <button
            onClick={resetZoom}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title="Reset Zoom"
          >
            Reset Zoom
          </button>
        )}
        <button
          onClick={() => toggleFullScreen(chartId)}
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullScreen && activeChart === chartId ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>
    </div>
  );

  const chartHeight = isFullScreen ? 600 : 350;

  return (
    <div className={`space-y-6 ${isFullScreen ? 'fixed inset-0 z-50 bg-white overflow-auto p-8' : ''}`}>
        {/* Price Summary Card */}
        {!isFullScreen && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{ticker}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  ${latestPrice.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Change ({data.length} days)</p>
                <p
                  className={`text-2xl font-bold ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {priceChange.toFixed(2)} ({isPositive ? '+' : ''}
                  {priceChangePercent}%)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Template Selector and Chart Type */}
        {!isFullScreen && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Chart Templates</h3>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Custom (Select indicators manually)</option>
                  {Object.entries(chartTemplates).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Choose a pre-configured template or customize indicators below
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Chart Type</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartType('line')}
                    className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
                      chartType === 'line'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Line Chart
                  </button>
                  <button
                    onClick={() => setChartType('candlestick')}
                    className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
                      chartType === 'candlestick'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Candlestick
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Switch between line chart and candlestick visualization
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Indicator Controls */}
        {!isFullScreen && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Technical Indicators</h3>

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Moving Averages</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleIndicator('sma20')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.sma20
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  SMA 20
                </button>
                <button
                  onClick={() => toggleIndicator('sma50')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.sma50
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  SMA 50
                </button>
                <button
                  onClick={() => toggleIndicator('sma200')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.sma200
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  SMA 200
                </button>
                <button
                  onClick={() => toggleIndicator('ema20')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.ema20
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  EMA 20
                </button>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Trend & Volatility</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleIndicator('bollinger')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.bollinger
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bollinger Bands
                </button>
                <button
                  onClick={() => toggleIndicator('atr')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.atr
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ATR
                </button>
                <button
                  onClick={() => toggleIndicator('adx')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.adx
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ADX
                </button>
                <button
                  onClick={() => toggleIndicator('sar')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.sar
                      ? 'bg-lime-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Parabolic SAR
                </button>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Momentum Oscillators</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleIndicator('rsi')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.rsi
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  RSI
                </button>
                <button
                  onClick={() => toggleIndicator('macd')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.macd
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  MACD
                </button>
                <button
                  onClick={() => toggleIndicator('stochastic')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.stochastic
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Stochastic
                </button>
                <button
                  onClick={() => toggleIndicator('cci')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.cci
                      ? 'bg-rose-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  CCI
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Volume & Price Action</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleIndicator('obv')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.obv
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  OBV
                </button>
                <button
                  onClick={() => toggleIndicator('vwap')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    indicators.vwap
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  VWAP
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Click indicators to overlay them on charts or use templates above
            </p>
          </div>
        )}

        {/* Price Chart with Indicators */}
        {(!isFullScreen || activeChart === 'price') && (
          <div className="bg-white rounded-lg shadow p-6">
            <ChartControls chartId="price" title={`Price with Indicators (${chartType === 'candlestick' ? 'Candlestick' : 'Line Chart'})`} />
            {chartType === 'candlestick' ? (
              <CandlestickChart
                data={chartData}
                height={chartHeight}
                indicators={{
                  sma20: indicators.sma20,
                  sma50: indicators.sma50,
                  sma200: indicators.sma200,
                  ema20: indicators.ema20,
                  bollinger: indicators.bollinger,
                  vwap: indicators.vwap,
                  sar: indicators.sar,
                }}
              />
            ) : (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  domain={zoomDomain || ['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Brush dataKey="date" height={30} stroke="#2563eb" />

                {/* Bollinger Bands */}
                {indicators.bollinger && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="bbUpper"
                      name="BB Upper"
                      stroke="#86efac"
                      fill="#86efac20"
                      strokeWidth={1}
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="bbLower"
                      name="BB Lower"
                      stroke="#86efac"
                      fill="#86efac20"
                      strokeWidth={1}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="bbMiddle"
                      name="BB Middle"
                      stroke="#22c55e"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </>
                )}

                {/* Price Line */}
                <Line
                  type="monotone"
                  dataKey="close"
                  name="Close Price"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />

                {/* Moving Averages */}
                {indicators.sma20 && (
                  <Line
                    type="monotone"
                    dataKey="sma20"
                    name="SMA 20"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
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
                  />
                )}
                {indicators.sar && (
                  <Line
                    type="monotone"
                    dataKey="sar"
                    name="Parabolic SAR"
                    stroke="#84cc16"
                    strokeWidth={0}
                    dot={{ r: 2, fill: '#84cc16' }}
                  />
                )}
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* RSI Chart */}
        {indicators.rsi && (!isFullScreen || activeChart === 'rsi') && (
          <div className="bg-white rounded-lg shadow p-6">
            <ChartControls chartId="rsi" title="RSI (Relative Strength Index)" />
            <ResponsiveContainer width="100%" height={isFullScreen ? 400 : 250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip content={<RSITooltip />} />
                <Legend />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label="Overbought" />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" label="Oversold" />
                <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="2 2" />
                <Line
                  type="monotone"
                  dataKey="rsi"
                  name="RSI"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
                <Brush dataKey="date" height={25} stroke="#a855f7" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* MACD Chart */}
        {indicators.macd && (!isFullScreen || activeChart === 'macd') && (
          <div className="bg-white rounded-lg shadow p-6">
            <ChartControls chartId="macd" title="MACD (Moving Average Convergence Divergence)" />
            <ResponsiveContainer width="100%" height={isFullScreen ? 400 : 300}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={0} stroke="#6b7280" />
                <Bar
                  dataKey="macdHistogram"
                  name="Histogram"
                  fill="#8b5cf6"
                  opacity={0.6}
                />
                <Line
                  type="monotone"
                  dataKey="macd"
                  name="MACD"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="macdSignal"
                  name="Signal"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Brush dataKey="date" height={25} stroke="#2563eb" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stochastic Chart */}
        {indicators.stochastic && (!isFullScreen || activeChart === 'stochastic') && (
          <div className="bg-white rounded-lg shadow p-6">
            <ChartControls chartId="stochastic" title="Stochastic Oscillator" />
            <ResponsiveContainer width="100%" height={isFullScreen ? 400 : 300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label="Overbought" />
                <ReferenceLine y={20} stroke="#22c55e" strokeDasharray="3 3" label="Oversold" />
                <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="2 2" />
                <Line
                  type="monotone"
                  dataKey="stochK"
                  name="%K"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="stochD"
                  name="%D"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
                <Brush dataKey="date" height={25} stroke="#ec4899" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ATR Chart */}
        {indicators.atr && (!isFullScreen || activeChart === 'atr') && (
          <div className="bg-white rounded-lg shadow p-6">
            <ChartControls chartId="atr" title="ATR (Average True Range) - Volatility" />
            <ResponsiveContainer width="100%" height={isFullScreen ? 400 : 250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="atr"
                  name="ATR"
                  stroke="#14b8a6"
                  fill="#14b8a620"
                  strokeWidth={2}
                />
                <Brush dataKey="date" height={25} stroke="#14b8a6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ADX Chart */}
        {indicators.adx && (!isFullScreen || activeChart === 'adx') && (
          <div className="bg-white rounded-lg shadow p-6">
            <ChartControls chartId="adx" title="ADX (Average Directional Index) - Trend Strength" />
            <ResponsiveContainer width="100%" height={isFullScreen ? 400 : 300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={25} stroke="#22c55e" strokeDasharray="3 3" label="Strong Trend" />
                <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="3 3" label="Weak Trend" />
                <Line
                  type="monotone"
                  dataKey="adx"
                  name="ADX"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="plusDI"
                  name="+DI"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="minusDI"
                  name="-DI"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Brush dataKey="date" height={25} stroke="#06b6d4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* CCI Chart */}
        {indicators.cci && (!isFullScreen || activeChart === 'cci') && (
          <div className="bg-white rounded-lg shadow p-6">
            <ChartControls chartId="cci" title="CCI (Commodity Channel Index)" />
            <ResponsiveContainer width="100%" height={isFullScreen ? 400 : 300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label="Overbought" />
                <ReferenceLine y={-100} stroke="#22c55e" strokeDasharray="3 3" label="Oversold" />
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" />
                <Line
                  type="monotone"
                  dataKey="cci"
                  name="CCI"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={false}
                />
                <Brush dataKey="date" height={25} stroke="#f43f5e" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* OBV Chart */}
        {indicators.obv && (!isFullScreen || activeChart === 'obv') && (
          <div className="bg-white rounded-lg shadow p-6">
            <ChartControls chartId="obv" title="OBV (On-Balance Volume)" />
            <ResponsiveContainer width="100%" height={isFullScreen ? 400 : 300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="obv"
                  name="OBV"
                  stroke="#6366f1"
                  fill="#6366f120"
                  strokeWidth={2}
                />
                <Brush dataKey="date" height={25} stroke="#6366f1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* OHLC Area Chart */}
        {!isFullScreen && (
          <div className="bg-white rounded-lg shadow p-6">
            <ChartControls chartId="ohlc" title="OHLC (Open, High, Low, Close)" />
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Brush dataKey="date" height={30} stroke="#2563eb" />
                <Area
                  type="monotone"
                  dataKey="high"
                  name="High"
                  stroke="#10b981"
                  fill="#10b98120"
                  strokeWidth={1}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  name="Close"
                  stroke="#2563eb"
                  fill="#2563eb20"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="low"
                  name="Low"
                  stroke="#ef4444"
                  fill="#ef444420"
                  strokeWidth={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Volume Bar Chart */}
        {!isFullScreen && (
          <div className="bg-white rounded-lg shadow p-6">
            <ChartControls chartId="volume" title="Trading Volume" />
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip content={<VolumeTooltip />} />
                <Legend formatter={() => 'Volume (Millions)'} />
                <Brush dataKey="date" height={25} stroke="#8b5cf6" />
                <Bar
                  dataKey="volume"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
    </div>
  );
}
