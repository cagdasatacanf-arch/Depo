# DEPO Dashboard - Chart Guide

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  CONTROLS PANEL                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │
│  │ Stock        │ │ Time Period  │ │ View Mode        │   │
│  │ [GOOGL  ▼]   │ │ [90 Days ▼]  │ │ [Charts] [Table] │   │
│  └──────────────┘ └──────────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CHART 1: PRICE SUMMARY                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  GOOGL                        Change (90 days)         │ │
│  │  $177.90                      +$12.40 (+7.52%)        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CHART 2: PRICE TREND                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │       ╱╲                                               │ │
│  │      ╱  ╲    ╱╲                                        │ │
│  │  ───╱    ╲──╱  ╲───                                    │ │
│  │                  ╲╱                                     │ │
│  │  [Blue line showing closing price over time]           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CHART 3: OHLC (Open, High, Low, Close)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ░░░ [Green area - High prices]                        │ │
│  │  ▓▓▓ [Blue area - Close prices]                        │ │
│  │  ███ [Red area - Low prices]                           │ │
│  │  [Layered areas showing price range]                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CHART 4: TRADING VOLUME                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ▌ ▌   ▌▌  ▌ ▌ ▌▌   ▌  ▌ ▌                           │ │
│  │  █ █   ██  █ █ ██   █  █ █                           │ │
│  │  █ █   ██  █ █ ██   █  █ █                           │ │
│  │  [Purple bars showing daily volume in millions]        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CHART 5: DAILY PRICE RANGE                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ─── [Green line - High]                               │ │
│  │  ··· [Orange dashed - Open]                            │ │
│  │  ─── [Red line - Low]                                  │ │
│  │  [Shows intraday price movement]                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Chart Types Explained

### 1. Price Summary Card
**Purpose**: Quick overview of current price and performance

**Shows**:
- Ticker symbol (e.g., GOOGL)
- Latest closing price
- Total price change in dollars
- Percentage change over selected period
- Color coding: Green = up, Red = down

**Use Case**:
- First glance at stock performance
- Compare % gains across different stocks
- Identify winners and losers

---

### 2. Price Trend Line Chart
**Purpose**: Visualize price movement over time

**Shows**:
- Blue line tracking closing prices
- X-axis: Dates
- Y-axis: Price in dollars
- Smooth continuous line

**How to Read**:
- **Upward slope** = Price increasing (bullish)
- **Downward slope** = Price decreasing (bearish)
- **Flat line** = Price stable (consolidation)
- **Steep changes** = High volatility

**Interactive**:
- Hover over any point to see exact date and price
- Tooltip shows: "Close Price: $XXX.XX"

**Use Case**:
- Identify overall trend direction
- Spot trend reversals
- Find support/resistance levels

---

### 3. OHLC Area Chart
**Purpose**: Show complete daily price range with layered areas

**Shows**:
- **Green area (top)**: High prices of each day
- **Blue area (middle)**: Closing prices
- **Red area (bottom)**: Low prices of each day
- All three overlaid to show relationship

**How to Read**:
- **Wide gap between areas** = High volatility
- **Narrow gap** = Low volatility, stable
- **Green above blue** = Bulls in control
- **Blue near red** = Bears in control

**Interactive**:
- Hover shows High, Close, Low for that date
- Compare all three values at once

**Use Case**:
- Understand daily price volatility
- Identify consolidation periods
- Spot breakout patterns
- Measure risk (wider range = higher risk)

---

### 4. Trading Volume Bar Chart
**Purpose**: Show trading activity intensity

**Shows**:
- Purple vertical bars
- Each bar = volume for that day
- Height = millions of shares traded
- Y-axis in millions (e.g., 25M = 25,000,000 shares)

**How to Read**:
- **Tall bars** = High trading activity
- **Short bars** = Low trading activity
- **Volume + Price up** = Strong buying
- **Volume + Price down** = Strong selling
- **Low volume** = Weak trend

**Interactive**:
- Hover shows exact volume: "Volume: XX.XXM"

**Use Case**:
- Confirm trend strength
- Identify institutional activity
- Spot potential reversals
- Find accumulation/distribution

**Important Patterns**:
```
Volume Spike + Price Up = Bullish (BUY signal)
Volume Spike + Price Down = Bearish (SELL signal)
High Volume Breakout = Strong trend continuation
Low Volume Breakout = Weak, likely to fail
```

---

### 5. Daily Price Range Chart
**Purpose**: Visualize intraday price movement

**Shows**:
- **Green line**: Daily high prices
- **Red line**: Daily low prices
- **Orange dashed line**: Opening prices
- All plotted over time

**How to Read**:
- **Green-Red gap**: Daily volatility measure
- **Open vs Close**: Direction of daily move
- **Widening gap**: Increasing volatility
- **Narrowing gap**: Decreasing volatility

**Interactive**:
- Hover shows Open, High, Low for any date

**Use Case**:
- Measure daily price swings
- Identify volatility trends
- Find support (lows) and resistance (highs)
- Set stop-loss levels

---

## Chart Color Scheme

| Color | Meaning | Used For |
|-------|---------|----------|
| 🟦 Blue | Primary/Neutral | Close prices, main trend |
| 🟩 Green | Positive/High | Gains, high prices, bullish |
| 🟥 Red | Negative/Low | Losses, low prices, bearish |
| 🟪 Purple | Volume | Trading volume bars |
| 🟧 Orange | Opening | Opening prices |
| ⬜ Gray | Background | Grid lines, labels |

---

## Reading Tooltips

When you hover over any chart, a tooltip appears:

```
┌──────────────────────┐
│ 2025-12-15          │  ← Date
│ Close Price: $177.90 │  ← Exact value
│ High: $178.20        │  ← Additional data
│ Low: $175.50         │  ← Additional data
└──────────────────────┘
```

**Tips**:
- Move mouse slowly for stable tooltip
- Click and drag to compare multiple points
- Tooltips auto-hide when mouse leaves

---

## Common Chart Patterns to Look For

### 1. Uptrend
```
         ╱
        ╱
       ╱
      ╱
```
**Characteristics**: Higher highs and higher lows
**Signal**: Bullish, consider buying
**Confirmation**: Increasing volume

### 2. Downtrend
```
╲
 ╲
  ╲
   ╲
```
**Characteristics**: Lower highs and lower lows
**Signal**: Bearish, consider selling
**Confirmation**: Increasing volume

### 3. Support Level
```
    ╱╲    ╱╲
   ╱  ╲  ╱  ╲
──────────────── ← Support (price bounces here)
```
**Characteristics**: Price bounces up from same level
**Signal**: Potential buying opportunity
**Action**: Buy near support, stop-loss below

### 4. Resistance Level
```
──────────────── ← Resistance (price fails here)
   ╲  ╱  ╲  ╱
    ╲╱    ╲╱
```
**Characteristics**: Price fails to break above
**Signal**: Potential selling opportunity
**Action**: Sell near resistance, stop-loss above

### 5. Breakout
```
──────────────── ← Old resistance
        ╱
       ╱ ← Breakout
      ╱
```
**Characteristics**: Price breaks through resistance
**Signal**: Strong bullish move
**Confirmation**: High volume on breakout

### 6. Volume Confirmation
```
Price:    ╱
         ╱
        ╱

Volume:  ▌
        ▌▌  ← Volume increases with price
       ▌▌▌
```
**Good Sign**: Volume rises with price
**Bad Sign**: Price rises but volume falls

---

## Time Period Selection Guide

| Period | Best For | Noise Level | Use Case |
|--------|----------|-------------|----------|
| 30 Days | Short-term trading | High | Day/swing trading |
| 90 Days | Medium-term trends | Medium | Position trading |
| 6 Months | Seasonal patterns | Low | Trend confirmation |
| 1 Year | Long-term trends | Low | Investment decisions |
| 2 Years | Major trends | Very Low | Strategic planning |

---

## Quick Analysis Workflow

1. **Select Stock**: Choose ticker
2. **Set Time Period**: Start with 90 days
3. **Check Price Summary**: Note % change
4. **View Price Trend**: Identify trend direction
5. **Check OHLC**: Assess volatility
6. **Analyze Volume**: Confirm trend strength
7. **Check Price Range**: Find support/resistance
8. **Switch Time Periods**: Compare trends
9. **Toggle to Table**: See exact numbers
10. **Make Decision**: Buy/Sell/Hold

---

## Pro Tips

### Tip 1: Compare Multiple Time Frames
```
30 Days:  ╲  (Short-term down)
          ╲
90 Days:  ╱  (Medium-term up)
         ╱
1 Year:   ╱  (Long-term up)
         ╱
```
**Interpretation**: Long-term bullish, short-term correction

### Tip 2: Volume Precedes Price
- Volume increases → Price will follow
- Watch for volume spikes
- Low volume rallies are weak

### Tip 3: Support Becomes Resistance
```
Old Support: ───────  (price was above)
Now Resistance: ─────  (price is below)
```
When price breaks support, it becomes new resistance

### Tip 4: Use Multiple Charts Together
1. Price Trend → Direction
2. Volume → Confirmation
3. OHLC → Volatility
4. Price Range → Entry/Exit levels

### Tip 5: Zoom In for Details
- Short time period (30 days) for detailed view
- Long time period (1-2 years) for big picture

---

## Keyboard Shortcuts (Future Enhancement)

These could be added later:
- **Arrow Keys**: Navigate between dates
- **+/-**: Zoom in/out
- **Space**: Toggle view mode
- **1-5**: Jump to specific time periods
- **C/T**: Switch Charts/Table

---

## Mobile Usage

Charts are responsive and work on mobile:
- **Tap** instead of hover for tooltips
- **Pinch** to zoom (if enabled)
- **Swipe** to scroll through data
- **Rotate** device for better view

---

## Troubleshooting

### Chart Not Showing
- Check backend is running (port 8000)
- Verify data exists for selected stock
- Check browser console for errors

### Tooltip Not Appearing
- Ensure mouse is over chart area
- Try refreshing the page
- Check if JavaScript is enabled

### Chart Looks Compressed
- Expand browser window
- Charts are responsive and will resize
- Try different time period

### Data Seems Wrong
- Verify correct ticker selected
- Check time period matches expectation
- Compare with Table view for accuracy

---

**Happy Trading!** 📈

Use these charts to make informed investment decisions. Remember: Past performance doesn't guarantee future results. Always do your own research and consider your risk tolerance.
