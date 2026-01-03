# Candlestick Chart Updates - Fixed Zoom & Added Fibonacci

## What Was Fixed

### 1. Zoom/Brush Functionality - NOW WORKING!

**Previous Issue:**
- The zoom brush was breaking when you tried to use it
- Candlesticks would disappear or render incorrectly during zoom

**Fix Applied:**
- Implemented proper state management for brush zoom
- Chart now displays filtered data based on brush selection
- Price domain recalculates dynamically based on visible data
- Brush controls full dataset while main chart shows zoomed view

**How It Works Now:**
1. The Brush component operates on the full `chartData` array
2. When you drag the brush handles, it updates `brushStartIndex` and `brushEndIndex` state
3. The main chart displays only the filtered `displayData` (slice of full data)
4. Y-axis domain recalculates based on visible candles only
5. All indicators update to show only the zoomed range

**Usage:**
- Drag the handles on the brush to zoom in/out
- Drag the middle section to pan through time
- The chart automatically adjusts price range to fit visible candles

### 2. Fibonacci Retracement - NEW FEATURE!

**What It Does:**
- Calculates Fibonacci retracement levels based on the high/low of visible data
- Draws horizontal reference lines at key Fibonacci levels
- Updates dynamically when you zoom in/out

**Fibonacci Levels Drawn:**
- 0% (High) - Market high (dashed line)
- 23.6% - First Fibonacci level
- 38.2% - Second Fibonacci level
- 50% - Midpoint (common support/resistance)
- 61.8% - Golden ratio (most important level) - **Thicker, amber line**
- 78.6% - Deep retracement level
- 100% (Low) - Market low (dashed line)

**Visual Styling:**
- 61.8% level: Thicker orange line (#f59e0b) - Most important
- Other levels: Thinner yellow lines (#fbbf24)
- High/Low (0%, 100%): Dashed lines
- All others: Dotted lines
- Labels on the right side showing percentage

**How to Enable:**
1. Switch to "Candlestick" chart type
2. Click the "Fibonacci" button in the Technical Indicators section
3. The Fibonacci levels will overlay on the chart
4. Zoom in/out to see levels recalculate based on visible range

**Trading Use:**
- **61.8% level** is the golden ratio - strongest support/resistance
- **50% level** is psychological midpoint
- Price often bounces at these levels during retracements
- Works best when combined with candlestick patterns

## Implementation Details

### Files Modified

**1. CandlestickChart.tsx**
- Added `useState` for brush range tracking (`brushStartIndex`, `brushEndIndex`)
- Added `displayData` useMemo - filters `chartData` based on brush selection
- Added `fibonacciLevels` calculation based on visible data high/low
- Updated `priceDomain` to calculate from `displayData` instead of full `chartData`
- Updated `CandlestickLayer` to render `displayData` instead of `chartData`
- Added `handleBrushChange` callback for brush interaction
- Added Fibonacci `ReferenceLine` components rendering
- Fixed Bollinger Bands data keys: `bbUpper`, `bbMiddle`, `bbLower` (was `bollingerUpper`, etc.)

**2. StockChartsAdvanced.tsx**
- Added `fibonacci: false` to indicators state
- Added Fibonacci button to UI (amber colored when active)
- Passed `fibonacci` indicator to CandlestickChart component

### Key Code Changes

**Zoom State Management:**
```typescript
const [brushStartIndex, setBrushStartIndex] = useState<number | undefined>(undefined);
const [brushEndIndex, setBrushEndIndex] = useState<number | undefined>(undefined);

const displayData = useMemo(() => {
  if (brushStartIndex !== undefined && brushEndIndex !== undefined) {
    return chartData.slice(brushStartIndex, brushEndIndex + 1);
  }
  return chartData;
}, [chartData, brushStartIndex, brushEndIndex]);
```

**Fibonacci Calculation:**
```typescript
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
```

**Brush Configuration:**
```typescript
<Brush
  dataKey="date"
  height={30}
  stroke="#3b82f6"
  fill="#f3f4f6"
  travellerWidth={10}
  data={chartData}           // Full dataset for navigation
  onChange={handleBrushChange}
  startIndex={brushStartIndex}
  endIndex={brushEndIndex}
/>
```

## Testing

### Test Zoom Functionality:
1. Load candlestick chart with any stock data
2. Drag the brush handles at the bottom
3. Verify candlesticks zoom in correctly
4. Verify Y-axis adjusts to visible price range
5. Verify indicators (SMA, Bollinger, etc.) update for visible range
6. Drag middle of brush to pan - verify smooth movement

### Test Fibonacci:
1. Enable "Fibonacci" indicator
2. Verify 7 horizontal lines appear at correct levels
3. Verify 61.8% line is thicker and orange
4. Verify labels show percentages on the right
5. Zoom in/out and verify Fibonacci levels recalculate
6. Verify levels are based on visible high/low, not full dataset

### Test Combined:
1. Enable: Candlestick + SMA 20 + SMA 50 + Bollinger + Fibonacci
2. Zoom into recent 30 days
3. Verify all indicators render correctly
4. Look for price bouncing at Fibonacci levels with candlestick confirmations

## Usage Examples

### Example 1: Finding Support with Fibonacci
```
1. Switch to Candlestick chart
2. Enable: Fibonacci + SMA 20 + SMA 50
3. Zoom to recent downtrend
4. Look for price approaching 61.8% or 50% level
5. Watch for bullish candlestick pattern (hammer, engulfing) at Fibonacci level
6. If SMA 20 is above the Fibonacci level = strong support confluence
```

### Example 2: Resistance Levels
```
1. Enable: Fibonacci + Bollinger Bands
2. Zoom to recent uptrend
3. Price hitting upper Bollinger + 61.8% Fibonacci = strong resistance
4. Look for shooting star or bearish engulfing at this confluence
5. Potential reversal signal
```

### Example 3: Trend Following with Zoom
```
1. Start with full view to identify overall trend
2. Enable: SMA 20, SMA 50, SMA 200
3. Zoom to recent 60 days to see recent action
4. Enable Fibonacci on the zoomed view
5. Look for entries at Fibonacci support levels in uptrend
6. Use zoom to precisely time entry at golden ratio (61.8%)
```

## Important Notes

1. **Fibonacci recalculates on zoom** - This is intentional!
   - Full view shows Fibonacci for entire dataset
   - Zoomed view shows Fibonacci for visible range only
   - This helps find local support/resistance within the zoomed period

2. **61.8% Golden Ratio** is the most important level
   - Thicker line for emphasis
   - Strongest support/resistance historically
   - Watch for candlestick patterns here

3. **Performance** - Zoom filtering improves performance
   - Only visible candles are rendered
   - Indicators calculate on smaller dataset when zoomed
   - Smoother interaction with large datasets

4. **Bollinger Bands Fix** - Now using correct data keys
   - Was: `bollingerUpper`, `bollingerMiddle`, `bollingerLower`
   - Now: `bbUpper`, `bbMiddle`, `bbLower`
   - Matches the output from `indicators.ts`

## Summary

The candlestick chart now has:
- ✅ Working zoom/brush controls (FIXED!)
- ✅ Fibonacci Retracement indicator (NEW!)
- ✅ Dynamic price domain adjustment
- ✅ Proper data filtering during zoom
- ✅ All indicators work correctly with zoom
- ✅ Fixed Bollinger Bands data key mapping

Both features work together seamlessly - zoom to focus on a period, enable Fibonacci to find key levels, combine with other indicators for confluence, and use candlestick patterns for precise entry/exit timing!
