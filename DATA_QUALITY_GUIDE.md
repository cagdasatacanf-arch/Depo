# Data Quality Feature Guide

Your DEPO dashboard now includes comprehensive data quality validation! Here's how to use it.

---

## 📊 What is Data Quality Validation?

Every time you load stock data, the backend automatically runs 8 quality checks:

1. **Required Fields** - Ensures all OHLC data is present
2. **OHLC Relationships** - Validates High ≥ Low, High ≥ Open/Close, etc.
3. **Price Anomalies** - Detects unusual price movements (>3 standard deviations)
4. **Volume Anomalies** - Identifies unusual trading volume
5. **Date Gaps** - Finds missing trading days
6. **Duplicate Dates** - Checks for duplicate entries
7. **Negative Values** - Ensures no negative prices
8. **Data Freshness** - Warns if data is outdated

---

## 🎨 How It Looks

### Data Quality Badge

After selecting a stock, you'll see a colorful badge showing the data quality status:

- **Green** ✓ - No issues (All good!)
- **Blue** ℹ️ - Informational notices (e.g., unusual volume)
- **Yellow** ⚡ - Warnings (e.g., data gaps)
- **Red** ⚠️ - Errors (e.g., invalid OHLC relationships)

### Example Badge Display

```
┌─────────────────────────────────────┐
│ ℹ️  Data Info                       │
│     Info: 1                         │
│     Click for details               │
└─────────────────────────────────────┘
```

---

## 🔍 Viewing Detailed Reports

**Step 1**: Click on the Data Quality Badge

**Step 2**: A detailed panel opens showing:
- **Summary Statistics**: Total issues, errors, warnings, info
- **Grouped Issues**: Organized by severity (Errors → Warnings → Info)
- **Issue Details**: Click any issue to expand and see specifics

**Step 3**: Close the panel when done

---

## 📋 Understanding Quality Issues

### Severity Levels

**🔴 ERRORS** (Critical)
- Invalid OHLC relationships (e.g., High < Low)
- Missing required fields
- Negative price values
- Duplicate dates

**🟡 WARNINGS** (Important)
- Date gaps (missing trading days >5 days)
- Stale data (>7 days old)

**🔵 INFO** (Informational)
- Volume anomalies (unusual trading volume)
- Price anomalies (large price movements)
- Recent data (2-7 days old)

---

## 💡 Example Quality Report

### AAPL - All Good
```
Total Issues: 0
Errors: 0
Warnings: 0
Info: 0

✓ All Good!
No data quality issues detected for AAPL
```

### TSLA - With Volume Anomaly
```
Total Issues: 1
Errors: 0
Warnings: 0
Info: 1

🔵 INFORMATION (1)
─────────────────────────────────
VOLUME_ANOMALY
Unusual volume at index 8

Details:
{
  "record_index": 8,
  "volume": 144632000,
  "mean": 42454029.07,
  "deviation": 4.52
}

Detected at: 1/4/2026, 12:57:21 AM
```

---

## 🧪 Testing Data Quality

### Test with Real Data

1. **Start the backend**:
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --port 3002
   ```

2. **Open your browser** at `http://localhost:8080`

3. **Select a stock** (e.g., AAPL, TSLA, BTC-USD)

4. **Look for the badge** below the stock selector

5. **Click the badge** to see the full report

### Test with Different Stocks

Different stocks may have different quality issues:

- **Tech Stocks (AAPL, GOOGL)**: Usually very clean data
- **Crypto (BTC-USD, ETH-USD)**: May have volume anomalies
- **Commodities (GC=F, SI=F)**: May have date gaps on weekends
- **New Stocks**: May have data freshness warnings

---

## 🔧 API Response Format

The backend now returns data quality information with every stock request:

```json
{
  "status": "ok",
  "ticker": "AAPL",
  "data": [ /* OHLC data */ ],
  "count": 90,
  "data_quality": {
    "is_valid": true,
    "total_issues": 1,
    "errors": 0,
    "warnings": 0,
    "info": 1,
    "issues": [
      {
        "severity": "info",
        "category": "volume_anomaly",
        "message": "Unusual volume at index 8",
        "details": {
          "record_index": 8,
          "volume": 144632000,
          "mean": 42454029.07,
          "deviation": 4.52
        },
        "timestamp": "2026-01-04T00:57:21.202856"
      }
    ]
  },
  "metadata": {
    "total_records": 90,
    "period": "90d",
    "interval": "1d",
    "fetched_at": "2026-01-04T00:57:21.198645",
    "start_date": "2025-10-06",
    "end_date": "2026-01-03"
  }
}
```

---

## 🎯 Best Practices

1. **Always Check the Badge**: Before making trading decisions, glance at the data quality
2. **Investigate Errors**: Red badges indicate data problems that should be addressed
3. **Context Matters**: Blue (info) badges are often normal (e.g., earnings day volume spikes)
4. **Refresh Data**: If you see freshness warnings, the data might be outdated

---

## 🚀 What's Next?

Data quality is just Phase 1! Coming soon:
- **Phase 2**: Advanced indicators (RSI, MACD, Stochastic)
- **Phase 3**: Drawing tools (trendlines, annotations)
- **Phase 4**: Alerts and notifications
- **Phase 5**: Multi-chart comparison

---

## ❓ FAQ

**Q: What if I see a red error badge?**
A: Click it to see details. The data may have integrity issues. Consider refreshing or checking the source.

**Q: Are blue info badges bad?**
A: No! They're just informational. Volume anomalies during earnings are normal.

**Q: Can I disable data quality checks?**
A: Not currently, but you can ignore the badge if you don't need it.

**Q: How often is data validated?**
A: Every time you load or change stocks.

---

**Enjoy exploring data quality! 📊✨**
