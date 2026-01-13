# Product Requirements Document: DEPO Financial Dashboard

## Project Overview

**DEPO** is a professional-grade stock and metal price analysis platform with real-time data visualization. It combines a Python/FastAPI backend with a React/TypeScript frontend to provide comprehensive financial market analysis tools.

**Current Status:** Production-ready (Phase 1 & 2 complete)

## Project Goals

1. Provide professional-grade financial market analysis tools
2. Enable technical analysis with 14+ indicators and pattern detection
3. Deliver real-time data visualization with interactive charts
4. Ensure data quality through comprehensive validation
5. Support portfolio management and price alerting

## Technical Architecture

### Backend Stack
- **Framework:** FastAPI 0.104.1
- **Server:** Uvicorn 0.24.0 (ASGI)
- **Database:** SQLite with SQLAlchemy 2.0.23 ORM
- **Data Source:** yfinance 0.2.32
- **Language:** Python 3.8+

### Frontend Stack
- **Framework:** React 18.3.1 with TypeScript 5.8.3
- **Charts:** Recharts 2.15.4
- **UI:** shadcn-ui with Tailwind CSS 3.4.17
- **State:** React Query 5.83.0
- **Build:** Vite 5.4.19

### Database Schema
```sql
Table: stock_prices
- id (INTEGER PRIMARY KEY)
- ticker (TEXT, NOT NULL)
- date (TEXT, NOT NULL)
- open, high, low, close (REAL)
- volume (INTEGER)
- created_at (TEXT)
- UNIQUE(ticker, date)
```

**Current Data:**
- 5 stocks: AAPL, AMZN, GOOGL, MSFT, TSLA
- 5 metals: XAU-USD, XAG-USD, XPT-USD, XPD-USD, HG=F
- 5-15 years historical data
- 6,280+ total records

## Core Features

### 1. Data Management
- [x] Historical data storage (5-15 years)
- [x] Multi-asset support (stocks + metals)
- [x] OHLCV data structure
- [x] 8-point data quality validation
- [x] CSV/PNG export functionality
- [x] Data import capability

### 2. Visualization
- [x] Line charts
- [x] Candlestick charts with wicks/bodies
- [x] Area charts
- [x] Volume bars
- [x] Fullscreen mode (600px height)
- [x] Zoom & pan controls
- [x] Hover tooltips
- [x] Responsive design

### 3. Technical Analysis (14 Indicators)

**Moving Averages:**
- [x] SMA 20, 50, 200
- [x] EMA 20

**Momentum Oscillators:**
- [x] RSI (14-period)
- [x] MACD (signal & histogram)
- [x] Stochastic Oscillator
- [x] CCI

**Trend & Volatility:**
- [x] Bollinger Bands
- [x] ATR
- [x] ADX (+DI/-DI)
- [x] Parabolic SAR
- [x] Supertrend

**Volume & Price:**
- [x] OBV
- [x] VWAP

**Transformations:**
- [x] Heikin Ashi

### 4. Pattern Detection
- [x] Bullish/Bearish Engulfing
- [x] Hammer
- [x] Shooting Star
- [x] Doji
- [x] Fair Value Gap
- [x] Order blocks
- [x] Divergence detection

### 5. User Features
- [x] Multi-symbol analysis
- [x] Time period selector (1M, 3M, 6M, 1Y, 2Y)
- [x] Chart type switcher
- [x] Indicator toggles
- [x] 10 chart templates
- [x] Price alerts system
- [x] Portfolio management
- [x] Correlation matrix
- [x] Sector rotation tracking
- [x] AI market analysis (Perplexity)
- [x] Dark mode support

### 6. Data Quality System (8 Validations)
1. Required fields validation
2. OHLC relationship checks
3. Price anomaly detection (>3σ)
4. Volume anomaly detection
5. Date gap identification (>5 days)
6. Duplicate date detection
7. Negative value prevention
8. Data freshness monitoring (>7 days)

## API Endpoints

### 1. Health Check
```
GET /api/health
Response: {"status": "healthy"}
```

### 2. Stock List
```
GET /api/stocks
Response: ["AAPL", "GOOGL", ...]
```

### 3. Stock Data
```
GET /api/stocks/{ticker}?days=30|90|180|365|730
Response: {
  "ticker": "AAPL",
  "data": [...],
  "quality_report": {...},
  "metadata": {...}
}
```

### 4. Latest Price
```
GET /api/stocks/{ticker}/latest
Response: {
  "ticker": "AAPL",
  "price": 150.25,
  "date": "2024-01-13"
}
```

## Component Architecture

### Major Components (20+)
- PriceChart.tsx - Main chart component
- CandlestickChart.tsx - OHLC visualization
- StockChartsAdvanced.tsx - Trading platform UI
- AIMarketAnalysis.tsx - AI analysis panel
- PortfolioPanel.tsx - Portfolio management
- AlertsPanel.tsx - Price alerts
- DataQualityPanel.tsx - Quality reporting
- CorrelationMatrix.tsx - Asset correlation
- SectorRotation.tsx - Sector tracking
- EconomicCalendar.tsx - Events calendar

### Custom Hooks (9)
- useMarketData.ts - Market data fetching
- useAlerts.ts - Alert management
- usePortfolio.ts - Portfolio tracking
- useWatchlist.ts - Watchlist management
- useNotifications.ts - Toast notifications
- useGoogleDrive.ts - Cloud sync

## Performance Metrics

- Backend startup: ~2 seconds
- Frontend startup: ~3 seconds
- Data fetch: 200-500ms
- Chart render: <100ms
- Indicator calculation: <50ms
- Zoom/brush: <30ms

## Documentation

31 markdown files covering:
- Setup & installation (README.md, START_HERE.md)
- Feature documentation (COMPLETE_FEATURES_SUMMARY.md)
- Technical guides (CHART_GUIDE.md, INDICATORS_QUICK_GUIDE.md)
- Implementation details (VISUALIZATION_SUMMARY.md)
- Data quality (DATA_QUALITY_GUIDE.md)

## Future Enhancements

### High Priority
- [ ] Real-time WebSocket data feeds
- [ ] Expand asset coverage beyond 5 stocks
- [ ] Strategy backtesting engine
- [ ] Enhanced mobile experience

### Medium Priority
- [ ] News integration
- [ ] Social sentiment analysis
- [ ] Multi-user authentication
- [ ] Cloud deployment (Docker/Kubernetes)
- [ ] Machine learning price predictions

### Low Priority
- [ ] Email/SMS notifications
- [ ] Saved layouts
- [ ] Collaboration features
- [ ] Plugin system for custom indicators

## Success Metrics

1. **Performance:** All API responses <500ms
2. **Data Quality:** 100% validation coverage
3. **User Experience:** Chart interactions <100ms
4. **Reliability:** 99.9% uptime
5. **Coverage:** Support 100+ assets

## Setup Instructions

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
# Runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Conclusion

DEPO is a production-ready financial analysis platform with professional-grade features, comprehensive documentation, and solid architecture. The project successfully rivals commercial trading platforms while maintaining clean, maintainable code.
