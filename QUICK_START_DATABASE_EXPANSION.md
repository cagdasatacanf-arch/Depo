# Quick Start: Database Expansion

Your DEPO database currently has **15 tickers**. Here's how to expand it.

---

## 🚀 Three Easy Ways

### 1. Add Specific Tickers (Fastest)

```bash
cd backend
python add_ticker.py TICKER1 TICKER2 TICKER3
```

**Examples:**

Add cryptocurrency:
```bash
python add_ticker.py BTC-USD ETH-USD
```

Add tech stocks:
```bash
python add_ticker.py META NVDA AMD INTC
```

Add indices:
```bash
python add_ticker.py ^GSPC ^DJI ^IXIC
```

---

### 2. Bulk Download (70+ Assets)

```bash
cd backend
python download_stocks_enhanced.py
```

**What you'll get:**
- 8 Tech Giants (FAANG, NVIDIA, Tesla, Netflix)
- 7 Financial stocks
- 8 Precious metals (spot + futures)
- 6 Cryptocurrencies
- 5 Major indices
- 6 Popular ETFs
- And more...

**Time**: ~5-10 minutes
**Total**: 70+ assets with 15 years of data

---

### 3. Update Original List

```bash
cd backend
python download_stocks.py
```

Refreshes the original 14 tickers with latest data.

---

## 📊 Popular Ticker Suggestions

### Tech Stocks
```
META NVDA AMD INTC CRM ORCL ADBE CSCO IBM
```

### Financial
```
JPM BAC WFC GS MS V MA
```

### Energy
```
XOM CVX COP SLB
```

### Cryptocurrency
```
BTC-USD ETH-USD BNB-USD XRP-USD ADA-USD SOL-USD DOGE-USD
```

### Indices
```
^GSPC (S&P 500)
^DJI (Dow Jones)
^IXIC (NASDAQ)
^VIX (Volatility)
```

### ETFs
```
SPY (S&P 500 ETF)
QQQ (NASDAQ ETF)
GLD (Gold ETF)
SLV (Silver ETF)
```

### Commodities
```
CL=F (Crude Oil)
NG=F (Natural Gas)
ZC=F (Corn)
ZW=F (Wheat)
```

---

## ✅ Verify Your Database

Check what's in your database:

```bash
python -c "from app.database import get_all_stocks; print(get_all_stocks())"
```

Check total records:

```bash
sqlite3 stock_data.db "SELECT COUNT(*) FROM stock_prices;"
```

---

## 💡 Pro Tips

1. **Start Small**: Add a few tickers first to test
2. **Check Symbols**: Verify ticker on yahoo finance.com first
3. **Crypto Format**: Use `-USD` suffix (e.g., `BTC-USD`)
4. **Futures**: Use `=F` suffix (e.g., `GC=F` for gold)
5. **Indices**: Use `^` prefix (e.g., `^GSPC`)

---

## 🎯 Example Workflow

Let's say you want to add Bitcoin, S&P 500, and Netflix:

```bash
cd backend
python add_ticker.py BTC-USD ^GSPC NFLX
```

Output:
```
[OK] Successfully added: 3
   BTC-USD, ^GSPC, NFLX
```

Now refresh your frontend and they'll appear in the dropdown!

---

**Current Status**: ✅ 15 tickers loaded
**Backend**: ✅ Running on port 3002
**Data Quality**: ✅ Validated with metadata

Ready to expand! 🚀
