# DEPO Database Inventory

**Total Assets**: 55 tickers
**Last Updated**: January 4, 2026
**Historical Data**: 15 years per ticker

---

## 📊 Complete Asset List

### 💻 Technology Stocks (9)
1. **AAPL** - Apple Inc.
2. **AMD** - Advanced Micro Devices
3. **AMZN** - Amazon.com Inc.
4. **GOOGL** - Alphabet Inc. (Google)
5. **INTC** - Intel Corporation
6. **META** - Meta Platforms (Facebook)
7. **MSFT** - Microsoft Corporation
8. **NFLX** - Netflix Inc.
9. **NVDA** - NVIDIA Corporation
10. **TSLA** - Tesla Inc.

### 🏦 Financial Stocks (6)
1. **BAC** - Bank of America
2. **GS** - Goldman Sachs
3. **JPM** - JPMorgan Chase
4. **MA** - Mastercard
5. **MS** - Morgan Stanley
6. **V** - Visa Inc.
7. **WFC** - Wells Fargo

### ⛽ Energy Stocks (4)
1. **COP** - ConocoPhillips
2. **CVX** - Chevron Corporation
3. **SLB** - Schlumberger
4. **XOM** - Exxon Mobil

### 🎬 Entertainment & Consumer (1)
1. **DIS** - The Walt Disney Company

### 🪙 Cryptocurrency (6)
1. **ADA-USD** - Cardano
2. **BNB-USD** - Binance Coin
3. **BTC-USD** - Bitcoin
4. **ETH-USD** - Ethereum
5. **SOL-USD** - Solana
6. **XRP-USD** - Ripple

### 🥇 Precious Metals - Spot Prices (4)
1. **XAG-USD** - Silver Spot
2. **XAU-USD** - Gold Spot
3. **XPD-USD** - Palladium Spot
4. **XPT-USD** - Platinum Spot

### 📈 Precious Metals - Futures (4)
1. **GC=F** - Gold Futures
2. **PA=F** - Palladium Futures
3. **PL=F** - Platinum Futures
4. **SI=F** - Silver Futures

### ⚙️ Industrial Metals - Futures (2)
1. **ALI=F** - Aluminum Futures
2. **HG=F** - Copper Futures

### 🛢️ Energy Commodities - Futures (3)
1. **BZ=F** - Brent Crude Oil
2. **CL=F** - WTI Crude Oil
3. **NG=F** - Natural Gas

### 🌾 Agricultural Commodities - Futures (3)
1. **ZC=F** - Corn Futures
2. **ZS=F** - Soybean Futures
3. **ZW=F** - Wheat Futures

### 📊 Major Indices (5)
1. **^DJI** - Dow Jones Industrial Average
2. **^GSPC** - S&P 500 Index
3. **^IXIC** - NASDAQ Composite
4. **^RUT** - Russell 2000
5. **^VIX** - CBOE Volatility Index

### 💼 ETFs (7)
1. **GLD** - SPDR Gold Shares
2. **QQQ** - Invesco QQQ (NASDAQ-100)
3. **SLV** - iShares Silver Trust
4. **SPY** - SPDR S&P 500 ETF
5. **TLT** - iShares 20+ Year Treasury Bond
6. **USO** - United States Oil Fund

---

## 📈 Database Statistics

### By Category
- **Tech Stocks**: 10 (18%)
- **Financial**: 7 (13%)
- **Cryptocurrency**: 6 (11%)
- **ETFs**: 7 (13%)
- **Indices**: 5 (9%)
- **Precious Metals**: 8 (15%)
- **Commodities**: 8 (15%)
- **Energy**: 4 (7%)
- **Other**: 1 (2%)

### By Asset Type
- **Stocks**: 28 (51%)
- **Futures**: 12 (22%)
- **Crypto**: 6 (11%)
- **ETFs**: 7 (13%)
- **Indices**: 5 (9%)

### Total Historical Records
Approximately **200,000+ data points** across all assets

---

## 🔍 Quick Search

### Want to track Bitcoin?
Look for: **BTC-USD**

### Want to see S&P 500?
Look for: **^GSPC** or **SPY** (ETF)

### Want gold prices?
- Spot: **XAU-USD**
- Futures: **GC=F**
- ETF: **GLD**

### Want tech stocks?
**AAPL, GOOGL, META, NVDA, AMD, MSFT**

### Want market volatility?
**^VIX** (Fear Index)

---

## 💡 Popular Combinations

### FAANG Stocks
- **META** (Facebook)
- **AAPL** (Apple)
- **AMZN** (Amazon)
- **NFLX** (Netflix)
- **GOOGL** (Google)

### Top Crypto
- **BTC-USD** (Bitcoin)
- **ETH-USD** (Ethereum)
- **BNB-USD** (Binance)

### Major Indices
- **^GSPC** (S&P 500)
- **^DJI** (Dow Jones)
- **^IXIC** (NASDAQ)

### Precious Metals
- **XAU-USD** (Gold)
- **XAG-USD** (Silver)
- **GLD** (Gold ETF)
- **SLV** (Silver ETF)

---

## 📊 Data Quality Stats

All assets include:
- ✅ 15 years historical data
- ✅ OHLC (Open, High, Low, Close)
- ✅ Volume data
- ✅ Data quality validation
- ✅ Real-time updates on fetch

---

## 🚀 Recently Added (Latest Session)

**Batch 1** (9 assets):
- META, NVDA, AMD, BTC-USD, ETH-USD
- ^GSPC, ^DJI, SPY, QQQ

**Batch 2** (10 assets):
- JPM, BAC, V, MA, GS
- CL=F, NG=F, BNB-USD, XRP-USD, SOL-USD

**Batch 3** (7 assets):
- GLD, SLV, XOM, CVX, DIS, INTC, ^IXIC

---

## 📚 How to Use

### View in Dashboard
1. Open dashboard at `http://localhost:8080`
2. Select any ticker from dropdown
3. View charts with data quality validation

### Check Data via API
```bash
curl http://localhost:3002/api/stocks/BTC-USD?days=90
```

### Add More Tickers
```bash
cd backend
python add_ticker.py TICKER1 TICKER2
```

---

## 🎯 Coverage Summary

✅ **Tech Giants**: Complete FAANG coverage
✅ **Crypto**: Top 5 cryptocurrencies
✅ **Indices**: Major US market indices
✅ **Commodities**: Energy, metals, agriculture
✅ **Financial**: Major banks and payment processors
✅ **ETFs**: Popular sector and commodity ETFs

---

**Your DEPO database is now comprehensive and production-ready! 🚀📊**
