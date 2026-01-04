# DEPO Database Expansion Guide

This guide explains how to expand your stock and metal database with more assets.

---

## 📊 Current Database

**Current Assets**: 14 tickers
- **Tech Stocks**: GOOGL, MSFT, AAPL, TSLA, AMZN
- **Precious Metals**: XAU-USD, XAG-USD, XPT-USD, XPD-USD (Spot Prices)
- **Futures**: GC=F, SI=F, PL=F, PA=F, HG=F

---

## 🚀 Methods to Expand Database

### Method 1: Enhanced Bulk Download (Recommended)

Download 70+ assets across multiple categories.

```bash
cd backend
python download_stocks_enhanced.py
```

**What it includes:**
- ✅ **Tech Giants** (8): FAANG + NVIDIA, Tesla, Netflix
- ✅ **Financial** (7): JPM, BAC, WFC, GS, MS, V, MA
- ✅ **Energy** (4): XOM, CVX, COP, SLB
- ✅ **Precious Metals** (8): Gold, Silver, Platinum, Palladium (both spot and futures)
- ✅ **Industrial Metals** (2): Copper, Aluminum
- ✅ **Commodities** (6): Oil, Gas, Corn, Wheat, Soybeans
- ✅ **Cryptocurrency** (6): BTC, ETH, BNB, XRP, ADA, SOL
- ✅ **Indices** (5): S&P 500, Dow Jones, NASDAQ, Russell 2000, VIX
- ✅ **ETFs** (6): SPY, QQQ, GLD, SLV, USO, TLT

**Total**: ~70 assets with 15 years of historical data

---

### Method 2: Add Individual Tickers

Quickly add one or more specific tickers.

```bash
cd backend
python add_ticker.py TICKER1 [TICKER2 TICKER3 ...]
```

**Examples:**

Add Bitcoin and Ethereum:
```bash
python add_ticker.py BTC-USD ETH-USD
```

Add multiple stocks:
```bash
python add_ticker.py NFLX DIS BABA SHOP
```

Add rare earth metals:
```bash
python add_ticker.py REMX (Rare Earth ETF)
```

---

### Method 3: Edit and Customize

Edit `download_stocks_enhanced.py` to add your own custom lists:

```python
# Add your custom category
"Your Category": [
    "TICKER1",
    "TICKER2",
    # ... more tickers
],
```

Then run:
```bash
python download_stocks_enhanced.py
```

---

## 🔍 Finding Ticker Symbols

### Yahoo Finance Ticker Format

**Stocks**: Use regular ticker (e.g., `AAPL`, `GOOGL`)

**Metals & Commodities**:
- **Spot Prices**: `XAU-USD` (Gold), `XAG-USD` (Silver)
- **Futures**: `GC=F` (Gold), `SI=F` (Silver), `HG=F` (Copper)

**Cryptocurrency**: Add `-USD` suffix (e.g., `BTC-USD`, `ETH-USD`)

**Forex**: Format as `EURUSD=X`, `GBPUSD=X`

**Indices**: Prefix with `^` (e.g., `^GSPC` for S&P 500)

### Popular Additions by Category

**More Tech Stocks**:
```
AMD, INTC, QCOM, CRM, ORCL, ADBE, CSCO, IBM
```

**More Metals**:
```
PPLT (Platinum ETF), PALL (Palladium ETF), COPX (Copper Miners)
```

**More Commodities**:
```
KC=F (Coffee), SB=F (Sugar), CC=F (Cocoa), CT=F (Cotton)
```

**International Indices**:
```
^FTSE (UK), ^N225 (Japan), ^GDAXI (Germany), ^HSI (Hong Kong)
```

**More Crypto**:
```
DOGE-USD, DOT-USD, MATIC-USD, AVAX-USD, LINK-USD
```

---

## 🛠️ Advanced Usage

### Update Existing Data

To refresh data for existing tickers, just re-run the script. It will:
- Skip duplicate entries (same ticker + date)
- Add new recent data
- Fill any gaps

```bash
python download_stocks_enhanced.py
```

### Download Specific Time Range

Edit the script to change years:

```python
# Change from 15 years to 5 years
YEARS_OF_DATA = 5
```

Or specify custom dates:

```python
start_date = datetime(2020, 1, 1)
end_date = datetime(2024, 12, 31)
```

---

## 📝 Verify Database Contents

Check what's in your database:

```bash
python -c "from app.database import get_all_stocks; print(get_all_stocks())"
```

Count total records:

```bash
sqlite3 stock_data.db "SELECT COUNT(*) FROM stock_prices;"
```

Check specific ticker:

```bash
sqlite3 stock_data.db "SELECT COUNT(*) FROM stock_prices WHERE ticker='AAPL';"
```

---

## ⚠️ Important Notes

1. **Data Availability**: Not all tickers have 15 years of data (especially crypto)
2. **Rate Limits**: Yahoo Finance may throttle requests if too many at once
3. **Disk Space**: 70 tickers × 15 years ≈ 100-200 MB
4. **Download Time**: Full enhanced download takes ~5-10 minutes

---

## 🔥 Quick Start Examples

**Option A - Full Database (70+ assets)**:
```bash
cd backend
python download_stocks_enhanced.py
```

**Option B - Just Add a Few Tickers**:
```bash
cd backend
python add_ticker.py NFLX BTC-USD ^GSPC
```

**Option C - Update Original List**:
```bash
cd backend
python download_stocks.py
```

---

## 📚 Resources

- **Yahoo Finance**: https://finance.yahoo.com
- **Find Tickers**: Search on Yahoo Finance, use the symbol shown
- **Crypto Tickers**: https://finance.yahoo.com/cryptocurrencies
- **Futures Symbols**: https://finance.yahoo.com/commodities
- **yfinance Docs**: https://pypi.org/project/yfinance/

---

## 🆘 Troubleshooting

**Issue**: "No data available" for ticker
- **Solution**: Verify ticker symbol on Yahoo Finance
- Try alternate format (e.g., `BTC-USD` instead of `BTCUSD`)

**Issue**: Script hangs or is very slow
- **Solution**: Reduce `YEARS_OF_DATA` or use `add_ticker.py` for fewer assets

**Issue**: "Module not found" error
- **Solution**: Make sure you're in the `backend` directory and venv is activated

---

**Happy Trading! 📈💰**
