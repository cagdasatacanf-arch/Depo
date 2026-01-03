# DEPO Dashboard - Quick Start with Charts

## 🚀 Start in 3 Steps

### Step 1: Start Backend
```bash
cd C:\Users\cagda\OneDrive\Desktop\Calismalar\Depo\backend
python run.py
```
✅ Wait for: `Uvicorn running on http://0.0.0.0:8000`

### Step 2: Start Frontend (New Terminal)
```bash
cd C:\Users\cagda\OneDrive\Desktop\Calismalar\Depo\frontend
npm run dev
```
✅ Wait for: `Local: http://localhost:5173`

### Step 3: Open Browser
Navigate to: **http://localhost:5173**

---

## 📊 What You'll See

### Control Panel (Top)
```
┌─────────────────────────────────────────────┐
│ [Stock: GOOGL ▼] [Period: 90d ▼] [Charts]  │
└─────────────────────────────────────────────┘
```

### 5 Charts (Below)
1. **💰 Price Summary** - Current price + % change
2. **📈 Price Trend** - Blue line showing price movement
3. **📊 OHLC Chart** - Green/Blue/Red areas for High/Close/Low
4. **📊 Volume Bars** - Purple bars showing trading activity
5. **📉 Price Range** - Green/Red lines for daily high/low

---

## 🎮 How to Use

| Action | How To |
|--------|--------|
| **Change Stock** | Click stock dropdown → Select ticker |
| **Change Period** | Click period dropdown → Select timeframe |
| **See Table** | Click "Table" button |
| **See Charts** | Click "Charts" button |
| **See Details** | Hover mouse over any chart |
| **Analyze** | Compare price with volume |

---

## 🎯 Quick Analysis Guide

### Check Trend
1. Look at **Price Trend Chart** (Chart 2)
2. Line going up = 📈 Bullish (good)
3. Line going down = 📉 Bearish (bad)
4. Flat line = 😐 Neutral

### Check Strength
1. Look at **Volume Chart** (Chart 4)
2. High bars + Price up = 💪 Strong uptrend
3. High bars + Price down = 💀 Strong downtrend
4. Low bars = 🤷 Weak trend

### Check Volatility
1. Look at **OHLC Chart** (Chart 3)
2. Wide gap = 🎢 High risk/reward
3. Narrow gap = 😌 Stable/safe

---

## 🎨 Color Guide

| Color | Meaning |
|-------|---------|
| 🟦 Blue | Closing prices, neutral |
| 🟩 Green | Gains, highs, positive |
| 🟥 Red | Losses, lows, negative |
| 🟪 Purple | Trading volume |
| 🟧 Orange | Opening prices |

---

## ⚡ Available Stocks

- **AAPL** - Apple
- **AMZN** - Amazon
- **GOOGL** - Google
- **MSFT** - Microsoft
- **TSLA** - Tesla

---

## ⏱️ Time Periods

| Period | Best For |
|--------|----------|
| 30 Days | Day trading, short-term |
| 90 Days | Swing trading, medium-term |
| 6 Months | Position trading |
| 1 Year | Investment decisions |
| 2 Years | Long-term strategy |

---

## 🐛 Troubleshooting

**Problem**: "Cannot connect to backend"
**Fix**: Make sure backend is running (Step 1)

**Problem**: "No charts showing"
**Fix**: Refresh browser, check console (F12)

**Problem**: "Tooltip not showing"
**Fix**: Move mouse slowly over chart area

---

## 📚 Documentation

| File | What It Contains |
|------|------------------|
| `START_HERE.md` | Complete setup guide |
| `CHARTS_ADDED.md` | Feature documentation |
| `CHART_GUIDE.md` | How to read each chart |
| `VISUALIZATION_SUMMARY.md` | Technical details |

---

## 🎓 Learn More

### Understand the Charts
Read: `CHART_GUIDE.md`

### See All Features
Read: `CHARTS_ADDED.md`

### Technical Details
Read: `VISUALIZATION_SUMMARY.md`

---

## ✅ Quick Checklist

Before analyzing:
- [ ] Backend running (port 8000)
- [ ] Frontend running (port 5173)
- [ ] Browser open to localhost:5173
- [ ] Stock selected
- [ ] Time period selected
- [ ] Charts view active

---

## 💡 Pro Tips

1. **Start with 90 days** - Good balance of detail vs. trend
2. **Check volume first** - Confirms trend strength
3. **Use multiple periods** - Compare short vs. long term
4. **Hover for details** - Exact values in tooltips
5. **Switch to table** - Verify numbers

---

## 🎯 Example Analysis

### "Is GOOGL trending up?"

1. Select **GOOGL** from dropdown
2. Choose **90 Days** period
3. Look at **Price Trend Chart**
   - Going up? = YES ✅
   - Going down? = NO ❌
4. Check **Volume Chart**
   - High bars while rising? = STRONG 💪
   - Low bars? = WEAK 🤷
5. Check **Price Summary**
   - Green number? = Gained value 🟢
   - Red number? = Lost value 🔴

### "Should I buy AAPL?"

1. Select **AAPL**
2. Choose **1 Year** for long-term view
3. Check **Price Trend**
   - Consistent uptrend? = Good sign
4. Switch to **30 Days**
   - Short-term dip? = Buying opportunity
5. Check **Volume**
   - Increasing? = Money flowing in
6. **Make decision** based on your strategy

---

## 🚨 Important Notes

- ⚠️ **Historical data only** - Not real-time
- ⚠️ **Past ≠ Future** - Charts don't predict
- ⚠️ **Do your research** - Don't rely on charts alone
- ⚠️ **Consider risk** - Invest responsibly

---

## 🎉 You're Ready!

Your DEPO Dashboard has:
- ✅ 5 professional charts
- ✅ 5 major stocks
- ✅ 5 time periods
- ✅ Interactive tooltips
- ✅ Beautiful design
- ✅ Fast performance

**Start exploring your financial data with stunning visualizations!**

---

**Need Help?** Read the detailed guides:
- 📘 `CHART_GUIDE.md` - Understanding charts
- 📗 `CHARTS_ADDED.md` - All features
- 📕 `START_HERE.md` - Setup help
