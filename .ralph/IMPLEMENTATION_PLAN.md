# Implementation Plan

## Summary

The DEPO Financial Dashboard has successfully completed Phases 1 & 2, delivering a production-ready trading platform with advanced technical analysis tools. The next phase focuses on expanding real-time capabilities, backtesting infrastructure, and enterprise features to compete with institutional-grade platforms.

**Priority Focus:**
1. Real-time data infrastructure (WebSocket feeds)
2. Strategy backtesting engine with performance analytics
3. Enhanced asset coverage and data sources
4. Mobile-first PWA experience
5. ML-powered predictions and news sentiment

**Architecture Considerations:**
- Backend scaling: Migrate from SQLite to PostgreSQL for multi-user support
- Real-time layer: Add WebSocket server with Redis for pub/sub
- Caching: Implement Redis for indicator calculations and API responses
- ML Pipeline: Add Python ML service with model serving infrastructure
- Authentication: Integrate Supabase Auth across frontend/backend

---

## Tasks

### US-001: Real-time WebSocket Data Feeds

**Priority:** Critical (Foundational for all real-time features)

**Scope:**
Implement WebSocket infrastructure to replace polling with push-based real-time price updates, enabling sub-second chart updates and live indicator recalculation.

**Technical Approach:**
- Backend: Add `fastapi-websockets` and `python-socketio` to requirements
- Create `/ws/market-data` endpoint with authentication
- Implement Redis pub/sub for message broadcasting
- Frontend: Add WebSocket hook with reconnection logic
- Update chart components to consume live data streams

**Tasks:**
- [ ] Add WebSocket dependencies to backend (`fastapi-websockets`, `redis-py`)
  - Scope: Update `backend/requirements.txt`
  - Acceptance: Dependencies installed successfully
  - Verification: `pip install -r requirements.txt`

- [ ] Create WebSocket endpoint `/ws/stocks/{ticker}` with JWT auth
  - Scope: Add to `backend/app/main.py`
  - Acceptance: WebSocket connection established, authenticated users only
  - Verification: `wscat -c ws://localhost:8000/ws/stocks/AAPL`

- [ ] Implement Redis pub/sub broadcaster for price updates
  - Scope: Create `backend/app/services/broadcaster.py`
  - Acceptance: Price updates broadcast to all connected clients
  - Verification: `redis-cli SUBSCRIBE market:AAPL`

- [ ] Add price update scheduler (yfinance polling every 15s → Redis → WebSocket clients)
  - Scope: Create `backend/app/services/market_updater.py`
  - Acceptance: Prices update every 15 seconds, logged to Redis
  - Verification: Monitor Redis pub/sub channel, verify timestamps

- [ ] Create `useWebSocket.ts` hook with auto-reconnect and heartbeat
  - Scope: Add to `frontend/src/hooks/useWebSocket.ts`
  - Acceptance: Hook connects, reconnects on disconnect (3 retries), sends heartbeat every 30s
  - Verification: `npm run test -- useWebSocket.test.ts`

- [ ] Update `useMarketData.ts` to use WebSocket for real-time mode
  - Scope: Modify `frontend/src/hooks/useMarketData.ts`
  - Acceptance: Real-time toggle switches between polling and WebSocket
  - Verification: Toggle real-time mode in UI, verify network tab shows WS connection

- [ ] Add real-time toggle in ChartToolbar component
  - Scope: Update `frontend/src/components/ChartToolbar.tsx`
  - Acceptance: Toggle button visible, state persists across page loads
  - Verification: Click toggle, refresh page, verify state retained

- [ ] Update PriceChart to stream live candle updates
  - Scope: Modify `frontend/src/components/PriceChart.tsx`
  - Acceptance: Chart updates smoothly without full re-render
  - Verification: Enable real-time mode, watch chart update every 15s

- [ ] Add connection status indicator (green/yellow/red dot)
  - Scope: Add to `frontend/src/components/dashboard/DashboardHeader.tsx`
  - Acceptance: Dot color reflects connection state (green=connected, yellow=reconnecting, red=disconnected)
  - Verification: Disconnect backend, verify red dot; reconnect, verify green dot

- [ ] Implement graceful degradation (fallback to polling if WS fails)
  - Scope: Update `frontend/src/hooks/useMarketData.ts`
  - Acceptance: After 3 failed reconnects, fall back to polling automatically
  - Verification: Stop backend, wait 90s, verify polling starts

- [ ] Add WebSocket metrics (latency, reconnect count) to dashboard
  - Scope: Create `frontend/src/components/panels/WebSocketMetrics.tsx`
  - Acceptance: Metrics panel shows connection latency, reconnect count, message rate
  - Verification: Visual inspection of metrics panel

**Acceptance Criteria:**
- WebSocket connection establishes within 1 second
- Price updates pushed to clients within 500ms of market data change
- Automatic reconnection on disconnect (max 3 retries with exponential backoff)
- Charts update smoothly without flickering or full re-renders
- Support 100+ concurrent WebSocket connections without degradation
- Connection status visible to users at all times

**Verification:**
```bash
# Start backend with WebSocket support
python backend/run.py

# Test WebSocket endpoint
wscat -c ws://localhost:8000/ws/stocks/AAPL

# Verify Redis pub/sub
redis-cli SUBSCRIBE market:AAPL

# Load test WebSocket connections
artillery run tests/websocket-load.yml
```

**Dependencies:** None

**Estimated Effort:** 5-7 days

---

### US-002: Enhanced Asset Coverage

**Priority:** High (User-requested feature, low complexity)

**Scope:**
Expand from 5 stocks + 5 metals to 100+ assets including cryptocurrencies, forex pairs, commodities, and international equities. Implement asset search, custom watchlists, and automatic data ingestion.

**Technical Approach:**
- Add asset categories table to database schema
- Create asset search API with fuzzy matching
- Implement background job for daily data updates
- Add multi-source data fetching (yfinance + Alpha Vantage + CoinGecko)
- Frontend: Asset search modal with category filters

**Tasks:**
- [ ] Design database schema for asset categories and metadata
  - Scope: Create `backend/migrations/003_asset_categories.sql`
  - Acceptance: Schema includes assets table (symbol, name, category, sector, logo_url, metadata)
  - Verification: `psql -d depo -f backend/migrations/003_asset_categories.sql`

- [ ] Migrate SQLite to PostgreSQL (support concurrent writes)
  - Scope: Create migration script `scripts/migrate_to_postgres.py`
  - Acceptance: All existing data migrated, zero data loss
  - Verification: `python scripts/migrate_to_postgres.py && python scripts/verify_migration.py`

- [ ] Create `GET /api/assets/search?q=...&category=...` endpoint
  - Scope: Add to `backend/app/main.py`
  - Acceptance: Fuzzy search works, returns results in <300ms
  - Verification: `curl "http://localhost:8000/api/assets/search?q=apple"`

- [ ] Add 50 top stocks (S&P 500 components)
  - Scope: Create `scripts/seed_assets.py`
  - Acceptance: 50 stocks added with metadata (sector, market cap, logo)
  - Verification: `psql -d depo -c "SELECT COUNT(*) FROM assets WHERE category='stock';"`

- [ ] Add 20 cryptocurrencies (BTC, ETH, etc. via CoinGecko API)
  - Scope: Update `scripts/seed_assets.py`
  - Acceptance: 20 cryptos added with real-time prices
  - Verification: `curl http://localhost:8000/api/stocks/BTC-USD`

- [ ] Add 10 forex pairs (EUR/USD, GBP/USD, etc.)
  - Scope: Update `scripts/seed_assets.py`
  - Acceptance: 10 forex pairs added
  - Verification: `curl http://localhost:8000/api/stocks/EURUSD=X`

- [ ] Add 15 commodities (Oil, Gold, Silver, Wheat, etc.)
  - Scope: Update `scripts/seed_assets.py`
  - Acceptance: 15 commodities added (already have 5 metals, add 10 more)
  - Verification: Database count check

- [ ] Create asset management admin panel
  - Scope: Create `frontend/src/pages/AdminPanel.tsx` (admin only)
  - Acceptance: CRUD operations for assets (add, edit, delete)
  - Verification: Log in as admin, add new asset, verify in database

- [ ] Implement daily data update job (Celery + Redis)
  - Scope: Create `backend/app/tasks/data_updater.py`, configure Celery
  - Acceptance: Job runs daily at 6 AM UTC, updates all assets
  - Verification: `celery -A backend.tasks beat --loglevel=info`

- [ ] Add asset metadata (sector, market cap, description, logo)
  - Scope: Fetch from yfinance `.info` endpoint
  - Acceptance: Metadata displayed on asset detail page
  - Verification: View asset page, verify logo and description visible

- [ ] Create SearchModal component with category filters
  - Scope: Create `frontend/src/components/SearchModal.tsx`
  - Acceptance: Modal opens on Cmd+K, filters by category, fuzzy search works
  - Verification: Press Cmd+K, search "apple", verify results

- [ ] Update SymbolSidebar to show asset categories
  - Scope: Modify `frontend/src/components/SymbolSidebar.tsx`
  - Acceptance: Categories shown (Stocks, Crypto, Forex, Commodities)
  - Verification: Visual inspection

- [ ] Add "Add to Watchlist" feature for discovered assets
  - Scope: Update `frontend/src/hooks/useWatchlist.ts`
  - Acceptance: Assets can be added to watchlist from search results
  - Verification: Search asset, click "Add to Watchlist", verify in sidebar

- [ ] Implement lazy loading for large asset lists
  - Scope: Update `frontend/src/components/SymbolSidebar.tsx` with virtual scrolling
  - Acceptance: Sidebar scrolls smoothly with 100+ assets
  - Verification: Add 100 assets to watchlist, verify smooth scrolling

**Acceptance Criteria:**
- Users can search 100+ assets by symbol, name, or category
- Search results appear within 300ms
- Data for new assets auto-downloads on first request
- Asset metadata (logo, description, sector) displayed correctly
- Daily data updates run successfully for all assets
- No performance degradation with 100+ assets in database

**Verification:**
```bash
# Test asset search
curl http://localhost:8000/api/assets/search?q=apple

# Verify data update job
celery -A backend.tasks worker --loglevel=info

# Check database asset count
psql -d depo -c "SELECT category, COUNT(*) FROM assets GROUP BY category;"

# Test frontend search
npm run test -- SearchModal.test.tsx
```

**Dependencies:** PostgreSQL migration

**Estimated Effort:** 4-6 days

---

### US-003: Strategy Backtesting Engine

**Priority:** High (Core trading feature)

**Scope:**
Build a backtesting framework that allows users to define trading strategies using indicators, test them against historical data, and analyze performance metrics (Sharpe ratio, max drawdown, win rate).

**Technical Approach:**
- Backend: Create strategy execution engine with pandas vectorization
- Define strategy DSL (domain-specific language) for rules
- Calculate performance metrics (returns, drawdown, Sharpe, Sortino)
- Frontend: Strategy builder UI with visual rule configuration
- Results visualization with equity curve and trade markers

**Tasks:**
- [ ] Design strategy schema (JSON format for buy/sell rules)
  - Scope: Create `backend/app/schemas/strategy.py` with Pydantic models
  - Acceptance: Schema validates buy/sell conditions, stop-loss, take-profit
  - Verification: `pytest backend/tests/test_strategy_schema.py`

- [ ] Create `POST /api/backtest` endpoint accepting strategy config
  - Scope: Add to `backend/app/main.py`
  - Acceptance: Endpoint accepts strategy JSON, returns results
  - Verification: `curl -X POST http://localhost:8000/api/backtest -d @tests/strategies/sma-crossover.json`

- [ ] Implement backtesting engine (`backtest.py`) with pandas
  - Scope: Create `backend/app/services/backtest.py`
  - Acceptance: Engine executes strategy on historical data, tracks positions
  - Verification: `pytest backend/tests/test_backtest_engine.py`

- [ ] Add strategy templates (SMA crossover, RSI reversal, Bollinger bounce)
  - Scope: Create `backend/app/templates/strategies/`
  - Acceptance: 3 pre-built strategies available
  - Verification: Load template, run backtest, verify results

- [ ] Calculate metrics: Total return, CAGR, Sharpe, Sortino, max drawdown, win rate
  - Scope: Add to `backend/app/services/metrics.py`
  - Acceptance: All metrics calculated correctly per industry standards
  - Verification: Compare results with Excel/QuantStats library

- [ ] Generate trade log (entry/exit dates, prices, P&L)
  - Scope: Return from backtest endpoint
  - Acceptance: Trade log includes all trades with timestamps, prices, P&L
  - Verification: Inspect API response, verify all trades logged

- [ ] Create StrategyBuilder component (drag-drop rule builder)
  - Scope: Create `frontend/src/components/StrategyBuilder.tsx`
  - Acceptance: Users can add conditions (e.g., "RSI < 30"), combine with AND/OR
  - Verification: Build strategy in UI, verify JSON output

- [ ] Add strategy template selector
  - Scope: Update `frontend/src/components/StrategyBuilder.tsx`
  - Acceptance: Dropdown shows 3 templates, loading populates form
  - Verification: Select template, verify form fields populated

- [ ] Build BacktestResults component with equity curve chart
  - Scope: Create `frontend/src/components/BacktestResults.tsx`
  - Acceptance: Equity curve shows portfolio value over time
  - Verification: Run backtest, verify chart displays

- [ ] Show trade markers on price chart
  - Scope: Update `frontend/src/components/PriceChart.tsx`
  - Acceptance: Green arrow (buy), red arrow (sell) on chart at trade dates
  - Verification: Run backtest, verify trade markers visible

- [ ] Add performance metrics table
  - Scope: Add to `frontend/src/components/BacktestResults.tsx`
  - Acceptance: Table shows Sharpe, Sortino, max drawdown, win rate, total return
  - Verification: Visual inspection of metrics table

- [ ] Implement strategy save/load functionality
  - Scope: Add to `backend/app/main.py` (POST/GET /api/strategies)
  - Acceptance: Strategies saved to database, loaded by ID
  - Verification: Save strategy, reload page, load strategy by ID

- [ ] Add comparison mode (compare 2-3 strategies side-by-side)
  - Scope: Create `frontend/src/components/StrategyComparison.tsx`
  - Acceptance: Side-by-side equity curves, metrics comparison table
  - Verification: Select 2 strategies, click "Compare", verify visualization

- [ ] Create strategy leaderboard (best performing strategies)
  - Scope: Create `frontend/src/pages/StrategyLeaderboard.tsx`
  - Acceptance: Leaderboard shows top 10 strategies by Sharpe ratio
  - Verification: Navigate to /leaderboard, verify sorted by Sharpe

**Acceptance Criteria:**
- Users can create strategies using 14 indicators without coding
- Backtests run in <5 seconds for 2 years of daily data
- Equity curve accurately reflects strategy performance
- All trades visible on chart with entry/exit markers
- Metrics match industry standards (Sharpe verified vs. Excel)
- Strategies can be saved and shared via URL

**Verification:**
```bash
# Test backtest API
curl -X POST http://localhost:8000/api/backtest \
  -H "Content-Type: application/json" \
  -d @tests/strategies/sma-crossover.json

# Verify metrics calculation
pytest backend/tests/test_backtest.py

# Compare with known benchmarks
python scripts/verify_backtest_accuracy.py
```

**Dependencies:** None (uses existing indicator calculations)

**Estimated Effort:** 8-10 days

---

### US-004: Enhanced Mobile Experience (PWA)

**Priority:** High (30% of users are mobile)

**Scope:**
Transform the web app into a Progressive Web App (PWA) with offline support, mobile-optimized layouts, touch gestures, and installability. Ensure charts render properly on small screens.

**Technical Approach:**
- Add service worker for offline caching
- Create mobile-specific chart layouts (simplified)
- Implement touch gestures (pinch-to-zoom, swipe navigation)
- Add PWA manifest for installability
- Optimize bundle size for mobile networks

**Tasks:**
- [ ] Generate PWA manifest.json with icons (192px, 512px)
  - Scope: Create `frontend/public/manifest.json` and icon assets
  - Acceptance: Manifest includes name, icons, theme_color, display mode
  - Verification: Lighthouse PWA audit shows "Installable"

- [ ] Create service worker with cache-first strategy
  - Scope: Create `frontend/public/sw.js`
  - Acceptance: Service worker caches static assets, API responses
  - Verification: Chrome DevTools → Application → Service Workers

- [ ] Add offline fallback page
  - Scope: Create `frontend/public/offline.html`
  - Acceptance: Offline page shown when no network available
  - Verification: Disable network in DevTools, navigate to new page

- [ ] Implement mobile-responsive chart layouts (single column)
  - Scope: Update `frontend/src/components/StockChartsAdvanced.tsx`
  - Acceptance: Charts stack vertically on mobile (<768px width)
  - Verification: Chrome DevTools → Device Toolbar → iPhone 13

- [ ] Add touch gesture support to CandlestickChartSimple
  - Scope: Update `frontend/src/components/CandlestickChartSimple.tsx`
  - Acceptance: Pinch-to-zoom, swipe to pan, double-tap to reset
  - Verification: Test on real mobile device

- [ ] Optimize chart rendering for mobile (reduce data points for small screens)
  - Scope: Update `frontend/src/lib/api.ts` data fetching logic
  - Acceptance: Mobile devices fetch max 200 data points instead of 500+
  - Verification: Inspect network tab on mobile, verify smaller payload

- [ ] Create bottom navigation bar for mobile
  - Scope: Create `frontend/src/components/MobileNav.tsx`
  - Acceptance: Nav bar shown on mobile, links to Charts, Watchlist, Alerts, Profile
  - Verification: View on mobile, verify nav bar visible

- [ ] Add pull-to-refresh functionality
  - Scope: Add to `frontend/src/pages/Dashboard.tsx`
  - Acceptance: Pull down refreshes chart data
  - Verification: Pull down on mobile, verify data refreshes

- [ ] Implement lazy loading for off-screen components
  - Scope: Update `frontend/src/App.tsx` with React.lazy()
  - Acceptance: Components load on-demand, initial bundle size reduced
  - Verification: `npm run build -- --analyze`, verify code splitting

- [ ] Reduce bundle size (code splitting, tree shaking)
  - Scope: Update `frontend/vite.config.ts`
  - Acceptance: Bundle size <500KB gzipped
  - Verification: `npm run build && ls -lh dist/assets/*.js`

- [ ] Add install prompt (A2HS - Add to Home Screen)
  - Scope: Create `frontend/src/components/InstallPrompt.tsx`
  - Acceptance: Prompt shown on mobile after 30 seconds
  - Verification: View on mobile Chrome, verify install banner

- [ ] Test on iOS Safari and Android Chrome
  - Scope: Manual testing on real devices
  - Acceptance: App works on both platforms, installable, charts render correctly
  - Verification: iPhone 13 (iOS Safari), Samsung Galaxy S22 (Chrome)

- [ ] Add mobile-specific settings (chart height, data density)
  - Scope: Update `frontend/src/components/panels/SettingsPanel.tsx`
  - Acceptance: Mobile users can adjust chart height (300px, 400px, 500px)
  - Verification: Change setting, verify chart resizes

- [ ] Implement haptic feedback for interactions
  - Scope: Add `navigator.vibrate()` calls in `frontend/src/components/`
  - Acceptance: Button clicks trigger 10ms vibration
  - Verification: Tap buttons on mobile, feel vibration

**Acceptance Criteria:**
- Lighthouse PWA score ≥90
- App installable on iOS and Android
- Charts render smoothly on mobile (60 FPS)
- Offline mode works (view cached data)
- Bundle size <500KB (gzipped)
- Touch gestures feel native (no lag)
- All features accessible on mobile (no desktop-only components)

**Verification:**
```bash
# Audit PWA compliance
lighthouse http://localhost:5173 --view

# Test service worker
npm run build && npx serve dist

# Check bundle size
npm run build -- --analyze

# Mobile testing
# Test on real devices: iPhone 13, Samsung Galaxy S22
```

**Dependencies:** None

**Estimated Effort:** 5-7 days

---

### US-005: News Integration & Sentiment Analysis

**Priority:** Medium (Enhances decision-making)

**Scope:**
Integrate financial news feeds (News API, Finnhub) with sentiment analysis to display relevant articles for each asset and provide sentiment scores (bullish/bearish/neutral).

**Technical Approach:**
- Add News API and Finnhub API integrations
- Backend: Fetch news articles and cache with TTL
- Sentiment analysis using pre-trained models (FinBERT or TextBlob)
- Frontend: News panel with sentiment indicators
- Link news events to price chart (annotations)

**Tasks:**
- [ ] Add News API and Finnhub credentials to `.env`
  - Scope: Update `backend/.env.example`
  - Acceptance: Environment variables for NEWS_API_KEY, FINNHUB_API_KEY
  - Verification: Source .env, echo $NEWS_API_KEY

- [ ] Create `GET /api/news/{ticker}` endpoint
  - Scope: Add to `backend/app/main.py`
  - Acceptance: Returns news articles for ticker
  - Verification: `curl http://localhost:8000/api/news/AAPL`

- [ ] Integrate Finnhub News API for company-specific news
  - Scope: Create `backend/app/services/news.py`
  - Acceptance: Fetches 20+ articles per ticker
  - Verification: Check API response, verify 20+ articles returned

- [ ] Add sentiment analysis (FinBERT model via HuggingFace)
  - Scope: Add to `backend/app/services/sentiment.py`
  - Acceptance: Each article tagged with sentiment score (-1 to +1)
  - Verification: `python -c "from backend.services.sentiment import analyze; print(analyze('Apple stock surges'))"`

- [ ] Cache news articles (Redis, 15-minute TTL)
  - Scope: Update `backend/app/services/news.py` with Redis caching
  - Acceptance: News fetched from cache if available, API called only if cache miss
  - Verification: `redis-cli GET news:AAPL`

- [ ] Create NewsPanel component
  - Scope: Create `frontend/src/components/panels/NewsPanel.tsx`
  - Acceptance: Panel displays news articles in card layout
  - Verification: Visual inspection

- [ ] Display news cards with headline, snippet, source, timestamp
  - Scope: Update `frontend/src/components/panels/NewsPanel.tsx`
  - Acceptance: Each card shows headline, 2-line snippet, source logo, relative timestamp
  - Verification: Visual inspection of news cards

- [ ] Add sentiment badge (🟢 Bullish / 🔴 Bearish / ⚪ Neutral)
  - Scope: Create `frontend/src/components/SentimentBadge.tsx`
  - Acceptance: Badge color based on sentiment score (>0.3=green, <-0.3=red, else white)
  - Verification: Check badge colors match sentiment scores

- [ ] Implement news filtering (by date range, sentiment, source)
  - Scope: Add filters to `frontend/src/components/panels/NewsPanel.tsx`
  - Acceptance: Users can filter by date (7d, 30d, 90d), sentiment, source
  - Verification: Apply filters, verify news list updates

- [ ] Add news annotations on price chart (marker for high-impact news)
  - Scope: Update `frontend/src/components/PriceChart.tsx`
  - Acceptance: News markers (📰 icon) on chart at news publication date
  - Verification: Hover marker, verify news headline tooltip

- [ ] Create news alert system (notify on breaking news)
  - Scope: Add to `frontend/src/hooks/useNotifications.ts`
  - Acceptance: Toast notification when breaking news detected (sentiment >0.7 or <-0.7)
  - Verification: Simulate breaking news, verify toast appears

- [ ] Add sentiment trend chart (7-day moving average of sentiment)
  - Scope: Create `frontend/src/components/SentimentTrendChart.tsx`
  - Acceptance: Line chart showing 7-day MA of sentiment
  - Verification: Visual inspection of sentiment trend

- [ ] Implement social media integration (Twitter/X API for $TICKER mentions)
  - Scope: Add to `backend/app/services/social.py` (optional, requires Twitter API access)
  - Acceptance: Fetch tweets mentioning $TICKER, analyze sentiment
  - Verification: `curl http://localhost:8000/api/social/AAPL`

**Acceptance Criteria:**
- News updates every 15 minutes
- Sentiment accuracy ≥70% (manual validation sample)
- News panel shows 20+ articles per asset
- High-impact news (>80% sentiment shift) annotated on chart
- News loads in <2 seconds
- No rate limit errors from news APIs

**Verification:**
```bash
# Test news API
curl http://localhost:8000/api/news/AAPL

# Verify sentiment analysis
python -c "from backend.services.sentiment import analyze; print(analyze('Apple stock surges on strong earnings'))"

# Check news cache
redis-cli GET news:AAPL

# Test frontend
npm run test -- NewsPanel.test.tsx
```

**Dependencies:** News API, Finnhub API, HuggingFace account

**Estimated Effort:** 6-8 days

---

### US-006: Machine Learning Price Predictions

**Priority:** Medium (Experimental, user interest high)

**Scope:**
Implement ML models (LSTM, Prophet) to predict next-day and 7-day price movements. Display predictions on charts with confidence intervals. Track prediction accuracy over time.

**Technical Approach:**
- Train LSTM model on historical OHLCV data
- Use Prophet for trend-based forecasting
- Backend: Model serving with FastAPI
- Store predictions and evaluate accuracy daily
- Frontend: Prediction overlay on charts

**Tasks:**
- [ ] Research ML libraries (TensorFlow/PyTorch for LSTM, Prophet)
  - Scope: Create proof-of-concept notebook `notebooks/ml_research.ipynb`
  - Acceptance: Compare LSTM vs. Prophet accuracy on historical data
  - Verification: Jupyter notebook with results, recommend best model

- [ ] Create training dataset (5+ years historical data)
  - Scope: Export data from database to `backend/ml/data/training_data.csv`
  - Acceptance: CSV contains OHLCV + indicators for 5 stocks, 5 years
  - Verification: `wc -l backend/ml/data/training_data.csv` (>6000 rows)

- [ ] Train LSTM model for price prediction (next-day)
  - Scope: Create `backend/ml/train_lstm.py`
  - Acceptance: Model trained, saved to `backend/ml/models/lstm_price_predictor.h5`
  - Verification: `python backend/ml/train_lstm.py && ls backend/ml/models/`

- [ ] Train Prophet model for trend forecasting (7-day)
  - Scope: Create `backend/ml/train_prophet.py`
  - Acceptance: Model trained, saved to `backend/ml/models/prophet_model.pkl`
  - Verification: `python backend/ml/train_prophet.py`

- [ ] Add model persistence (save to `models/` directory)
  - Scope: Already covered in previous tasks
  - Acceptance: Models saved and loadable
  - Verification: Load model in Python REPL

- [ ] Create `POST /api/predict/{ticker}` endpoint
  - Scope: Add to `backend/app/main.py`
  - Acceptance: Endpoint loads model, generates prediction
  - Verification: `curl -X POST http://localhost:8000/api/predict/AAPL`

- [ ] Implement model serving (load model on startup)
  - Scope: Update `backend/app/main.py` with lifespan event
  - Acceptance: Models loaded into memory on server start
  - Verification: Check server logs for "Models loaded successfully"

- [ ] Calculate confidence intervals (±1 std dev)
  - Scope: Add to `backend/ml/predict.py`
  - Acceptance: Prediction includes upper/lower bounds
  - Verification: API response includes `prediction`, `upper_bound`, `lower_bound`

- [ ] Create PredictionPanel component
  - Scope: Create `frontend/src/components/panels/PredictionPanel.tsx`
  - Acceptance: Panel shows next-day and 7-day predictions
  - Verification: Visual inspection

- [ ] Display prediction chart with confidence bands
  - Scope: Add to `frontend/src/components/PriceChart.tsx`
  - Acceptance: Dashed line for prediction, shaded area for confidence interval
  - Verification: Enable predictions, verify visual appearance

- [ ] Add "Show Predictions" toggle in chart toolbar
  - Scope: Update `frontend/src/components/ChartToolbar.tsx`
  - Acceptance: Toggle button enables/disables prediction overlay
  - Verification: Click toggle, verify predictions appear/disappear

- [ ] Track prediction accuracy (MAPE, RMSE) over time
  - Scope: Create `backend/app/services/prediction_tracker.py`, store in database
  - Acceptance: Daily job compares predictions vs. actual prices, calculates MAPE
  - Verification: `psql -d depo -c "SELECT AVG(mape) FROM prediction_accuracy;"`

- [ ] Create prediction leaderboard (which model performs best)
  - Scope: Create `frontend/src/pages/PredictionLeaderboard.tsx`
  - Acceptance: Shows LSTM vs. Prophet accuracy by ticker
  - Verification: Navigate to /predictions/leaderboard

- [ ] Add disclaimer ("Not financial advice")
  - Scope: Update `frontend/src/components/panels/PredictionPanel.tsx`
  - Acceptance: Disclaimer visible at top of panel
  - Verification: Visual inspection

- [ ] Implement A/B testing (compare LSTM vs. Prophet)
  - Scope: Create `backend/ml/ab_test.py`
  - Acceptance: Track which model users prefer, accuracy comparison
  - Verification: Run for 30 days, analyze results

**Acceptance Criteria:**
- Predictions generated in <3 seconds
- Confidence intervals visualized on chart
- Prediction accuracy tracked and displayed (MAPE < 10% = good)
- Models retrained weekly with new data
- Predictions available for all assets with sufficient history (≥2 years)
- Clear disclaimer about predictive model limitations

**Verification:**
```bash
# Train models
python backend/ml/train_models.py

# Test prediction API
curl -X POST http://localhost:8000/api/predict/AAPL

# Evaluate model accuracy
python backend/ml/evaluate.py --days=30

# Check prediction accuracy
psql -d depo -c "SELECT AVG(ABS(predicted - actual) / actual) FROM predictions;"
```

**Dependencies:** TensorFlow/PyTorch, Prophet, scikit-learn

**Estimated Effort:** 10-14 days (includes model training and tuning)

---

### US-007: Multi-User Authentication & Cloud Deployment

**Priority:** Medium (Required for production SaaS)

**Scope:**
Implement Supabase Auth for multi-user support with user profiles, saved preferences, and personalized watchlists. Deploy to AWS/GCP with Docker and Kubernetes for scalability.

**Technical Approach:**
- Integrate Supabase Auth (email/password + OAuth)
- Migrate user-specific data to PostgreSQL with RLS
- Create Dockerfiles for backend and frontend
- Set up Kubernetes deployment with Helm charts
- Add CI/CD pipeline (GitHub Actions)

**Tasks:**

**Authentication:**
- [ ] Enable Supabase Auth in project settings
  - Scope: Create Supabase project, enable Auth providers
  - Acceptance: Email/password, Google, GitHub OAuth enabled
  - Verification: Supabase dashboard shows Auth enabled

- [ ] Create user profiles table with preferences schema
  - Scope: Create `backend/migrations/004_user_profiles.sql`
  - Acceptance: Table includes user_id, theme, default_ticker, chart_preferences (JSON)
  - Verification: `psql -d depo -c "\d user_profiles;"`

- [ ] Add login/signup pages (email + Google/GitHub OAuth)
  - Scope: Create `frontend/src/pages/Login.tsx`, `Signup.tsx`
  - Acceptance: Users can sign up with email or OAuth
  - Verification: Sign up with email, verify account created in Supabase

- [ ] Implement JWT validation in FastAPI backend
  - Scope: Create `backend/app/auth.py` with JWT middleware
  - Acceptance: Protected endpoints require valid JWT
  - Verification: `curl -H "Authorization: Bearer invalid" http://localhost:8000/api/protected` (should return 401)

- [ ] Add protected routes (redirect to login if not authenticated)
  - Scope: Update `frontend/src/App.tsx` with PrivateRoute component
  - Acceptance: Unauthenticated users redirected to /login
  - Verification: Log out, navigate to /dashboard, verify redirect to /login

- [ ] Create user settings page (theme, default ticker, chart preferences)
  - Scope: Create `frontend/src/pages/Settings.tsx`
  - Acceptance: Users can update preferences, saved to database
  - Verification: Change theme to dark, refresh page, verify dark mode persists

- [ ] Migrate watchlists, alerts, portfolios to user-scoped tables
  - Scope: Create `backend/migrations/005_user_scoped_data.sql`
  - Acceptance: Tables include user_id column, foreign key to users table
  - Verification: `psql -d depo -c "\d watchlists;"`

- [ ] Add Row Level Security (RLS) policies in PostgreSQL
  - Scope: Add to migration files
  - Acceptance: Users can only access their own data (enforced by database)
  - Verification: `psql -d depo -c "SELECT * FROM watchlists;"` (should only return current user's data)

**Deployment:**
- [ ] Create `backend/Dockerfile` (Python + FastAPI)
  - Scope: Multi-stage build, optimized for production
  - Acceptance: Image builds successfully, size <500MB
  - Verification: `docker build -t depo-backend backend/ && docker images | grep depo-backend`

- [ ] Create `frontend/Dockerfile` (Node + Nginx)
  - Scope: Multi-stage build (build in Node, serve with Nginx)
  - Acceptance: Image builds, Nginx serves static files
  - Verification: `docker build -t depo-frontend frontend/ && docker run -p 80:80 depo-frontend`

- [ ] Create `docker-compose.yml` for local multi-container setup
  - Scope: Define services: backend, frontend, postgres, redis
  - Acceptance: `docker-compose up` starts all services
  - Verification: `docker-compose up && curl http://localhost:8000/api/health`

- [ ] Write Kubernetes manifests (deployments, services, ingress)
  - Scope: Create `k8s/deployment.yaml`, `service.yaml`, `ingress.yaml`
  - Acceptance: Manifests define backend, frontend deployments with health checks
  - Verification: `kubectl apply -f k8s/ && kubectl get pods`

- [ ] Create Helm chart for DEPO application
  - Scope: Create `charts/depo/` with templates
  - Acceptance: Helm chart installs app with configurable values
  - Verification: `helm install depo charts/depo && helm list`

- [ ] Set up GitHub Actions CI/CD (build, test, deploy)
  - Scope: Create `.github/workflows/deploy.yml`
  - Acceptance: On push to main, build Docker images, push to registry, deploy to k8s
  - Verification: Push commit, check GitHub Actions tab

- [ ] Provision AWS EKS cluster (or GCP GKE)
  - Scope: Use Terraform or eksctl to create cluster
  - Acceptance: Cluster created with 3 nodes, kubectl configured
  - Verification: `kubectl cluster-info`

- [ ] Deploy PostgreSQL on AWS RDS (or Cloud SQL)
  - Scope: Create RDS instance, configure security groups
  - Acceptance: Database accessible from EKS cluster
  - Verification: `psql -h <rds-endpoint> -U postgres -d depo`

- [ ] Deploy Redis on AWS ElastiCache
  - Scope: Create ElastiCache cluster
  - Acceptance: Redis accessible from EKS
  - Verification: `redis-cli -h <elasticache-endpoint> ping`

- [ ] Configure Nginx Ingress with SSL (Let's Encrypt)
  - Scope: Install cert-manager, create Issuer, add TLS to Ingress
  - Acceptance: HTTPS enabled, certificate auto-renews
  - Verification: `curl https://depo.example.com/api/health`

- [ ] Add monitoring (Prometheus + Grafana)
  - Scope: Install Prometheus Operator, create dashboards
  - Acceptance: Metrics scraped, dashboards show CPU/memory/requests
  - Verification: Access Grafana at grafana.example.com

- [ ] Set up logging (ELK stack or CloudWatch)
  - Scope: Install Fluentd/Fluent Bit, forward logs to Elasticsearch or CloudWatch
  - Acceptance: Logs searchable and queryable
  - Verification: Search logs for "error" in Kibana or CloudWatch Logs Insights

- [ ] Add health checks and auto-scaling policies
  - Scope: Update Kubernetes deployments with liveness/readiness probes, HPA
  - Acceptance: Pods restart if unhealthy, scale up at 70% CPU
  - Verification: `kubectl describe hpa depo-backend`

**Acceptance Criteria:**
- Users can sign up, log in, and log out
- User data isolated (cannot access other users' watchlists)
- Application deploys to Kubernetes with zero downtime
- Auto-scaling triggers at 70% CPU usage
- SSL certificate auto-renews
- Uptime ≥99.9%

**Verification:**
```bash
# Test authentication
curl -X POST http://localhost:8000/api/auth/login \
  -d '{"email": "test@example.com", "password": "password"}'

# Test Docker build
docker-compose up

# Deploy to Kubernetes
helm install depo ./charts/depo

# Verify deployment
kubectl get pods -n depo
kubectl logs -f deployment/depo-backend

# Load test
k6 run tests/load-test.js
```

**Dependencies:** Supabase Auth, Docker, Kubernetes, Cloud provider account

**Estimated Effort:** 12-15 days

---

### US-008: Saved Layouts & Collaboration

**Priority:** Low (Nice-to-have, not critical)

**Scope:**
Allow users to save custom chart layouts (indicators, time periods, drawing tools) and share them via URL. Add collaboration features (comments on charts, shared watchlists).

**Tasks:**
- [ ] Design layout schema (JSON format)
  - Scope: Create `backend/app/schemas/layout.py`
  - Acceptance: Schema includes indicators[], timeframe, chart_type, drawings[]
  - Verification: Validate sample layout JSON

- [ ] Add layouts table to database (user_id, layout_data, public)
  - Scope: Create `backend/migrations/006_layouts.sql`
  - Acceptance: Table created with columns: id, user_id, name, layout_data (JSON), public, created_at
  - Verification: `psql -d depo -c "\d layouts;"`

- [ ] Create `POST /api/layouts` and `GET /api/layouts/{id}` endpoints
  - Scope: Add to `backend/app/main.py`
  - Acceptance: Users can save and retrieve layouts
  - Verification: `curl -X POST http://localhost:8000/api/layouts -d @layout.json`

- [ ] Implement "Save Layout" button in ChartToolbar
  - Scope: Update `frontend/src/components/ChartToolbar.tsx`
  - Acceptance: Button opens modal, user names layout, saves to database
  - Verification: Click "Save Layout", name it, verify in database

- [ ] Add layout selector dropdown
  - Scope: Update `frontend/src/components/ChartToolbar.tsx`
  - Acceptance: Dropdown lists user's saved layouts
  - Verification: Select layout from dropdown, verify chart updates

- [ ] Generate shareable URL for layouts
  - Scope: Add URL parameter support `?layout=<id>`
  - Acceptance: URL loads layout configuration
  - Verification: Share URL with another user, verify layout loads

- [ ] Create public layout gallery
  - Scope: Create `frontend/src/pages/LayoutGallery.tsx`
  - Acceptance: Gallery shows public layouts, users can "Clone" to their account
  - Verification: Navigate to /layouts, verify public layouts shown

- [ ] Add comments system (Supabase Realtime)
  - Scope: Create comments table, integrate Supabase Realtime subscriptions
  - Acceptance: Users can comment on charts, comments appear in real-time
  - Verification: Add comment, verify other user sees it immediately

- [ ] Implement shared watchlists (invite collaborators)
  - Scope: Add watchlist_shares table with collaborator_email
  - Acceptance: Users can invite others via email, shared watchlist appears in sidebar
  - Verification: Share watchlist, verify collaborator can access

- [ ] Add activity feed (who added what to shared watchlist)
  - Scope: Create `frontend/src/components/ActivityFeed.tsx`
  - Acceptance: Feed shows "User X added AAPL to watchlist at 2:00 PM"
  - Verification: Visual inspection of activity feed

**Acceptance Criteria:**
- Layouts save in <500ms
- Shareable URLs load layout correctly for all users
- Comments appear in real-time (<1s latency)

**Verification:**
```bash
# Test layout save
curl -X POST http://localhost:8000/api/layouts \
  -H "Authorization: Bearer $TOKEN" \
  -d @tests/sample-layout.json
```

**Dependencies:** US-007 (Authentication)

**Estimated Effort:** 6-8 days

---

### US-009: Email & SMS Notifications

**Priority:** Low (Requires external services)

**Scope:**
Send email/SMS alerts when price targets hit or breaking news detected. Use SendGrid for email and Twilio for SMS.

**Tasks:**
- [ ] Add SendGrid and Twilio credentials
  - Scope: Update `backend/.env.example`
  - Acceptance: SENDGRID_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN added
  - Verification: Source .env, verify variables set

- [ ] Create notification service (`notifications.py`)
  - Scope: Create `backend/app/services/notifications.py`
  - Acceptance: Functions to send email and SMS
  - Verification: `python -c "from backend.services.notifications import send_email; send_email('test@example.com', 'Test')"`

- [ ] Implement email templates (price alert, news alert)
  - Scope: Create `backend/app/templates/emails/`
  - Acceptance: HTML email templates with company branding
  - Verification: Render template, verify HTML output

- [ ] Add SMS formatter (160-character limit)
  - Scope: Add to `backend/app/services/notifications.py`
  - Acceptance: SMS messages truncated to 160 chars
  - Verification: Test with long message, verify truncation

- [ ] Create `POST /api/notifications/subscribe` endpoint
  - Scope: Add to `backend/app/main.py`
  - Acceptance: Users can subscribe to email/SMS notifications
  - Verification: `curl -X POST http://localhost:8000/api/notifications/subscribe`

- [ ] Add notification preferences to user settings
  - Scope: Update `frontend/src/pages/Settings.tsx`
  - Acceptance: Checkboxes for email/SMS, notification types (alerts, news)
  - Verification: Toggle preferences, verify saved to database

- [ ] Test email/SMS delivery
  - Scope: Manual testing with real email/phone
  - Acceptance: Emails arrive in <30s, SMS in <10s
  - Verification: Trigger alert, check email/phone

- [ ] Add unsubscribe link
  - Scope: Add to email templates
  - Acceptance: Clicking unsubscribe updates preferences, no more emails sent
  - Verification: Click unsubscribe, verify no further emails

**Acceptance Criteria:**
- Notifications sent within 30 seconds of trigger
- Email deliverability >95%
- SMS delivery <10 seconds

**Verification:**
```bash
# Test email
curl -X POST http://localhost:8000/api/notifications/test-email

# Test SMS
curl -X POST http://localhost:8000/api/notifications/test-sms
```

**Dependencies:** SendGrid, Twilio accounts

**Estimated Effort:** 3-4 days

---

### US-010: Plugin System for Custom Indicators

**Priority:** Low (Advanced feature)

**Scope:**
Allow developers to create custom indicators as plugins (JavaScript modules) that can be loaded dynamically into charts.

**Tasks:**
- [ ] Design plugin API specification
  - Scope: Create `docs/PLUGIN_API.md`
  - Acceptance: Documentation defines plugin structure, lifecycle hooks, security model
  - Verification: Review documentation with dev team

- [ ] Create plugin loader (`pluginLoader.ts`)
  - Scope: Create `frontend/src/lib/pluginLoader.ts`
  - Acceptance: Loader validates and loads plugin modules
  - Verification: `npm run test -- pluginLoader.test.ts`

- [ ] Add plugin marketplace UI
  - Scope: Create `frontend/src/pages/PluginMarketplace.tsx`
  - Acceptance: Users can browse, search, install plugins
  - Verification: Navigate to /plugins, verify marketplace UI

- [ ] Implement sandboxed execution (iframe or Web Workers)
  - Scope: Update plugin loader to execute in isolated context
  - Acceptance: Plugins cannot access localStorage, cookies, or make unauthorized requests
  - Verification: Load malicious plugin, verify it cannot access sensitive data

- [ ] Add plugin validation (security checks)
  - Scope: Backend endpoint `POST /api/plugins/validate`
  - Acceptance: Validate plugin code for XSS, CSRF vulnerabilities
  - Verification: Submit plugin with XSS, verify rejection

- [ ] Create sample plugins (Ichimoku Cloud, Keltner Channels)
  - Scope: Create `frontend/plugins/ichimoku.js`, `keltner.js`
  - Acceptance: Plugins render correctly on chart
  - Verification: Load sample plugin, verify indicator appears

- [ ] Add plugin documentation
  - Scope: Update `docs/PLUGIN_API.md` with examples
  - Acceptance: Developers can create plugin following docs
  - Verification: External dev creates plugin, verify it works

**Acceptance Criteria:**
- Plugins load without breaking main app
- Security: Plugins cannot access localStorage or make unauthorized API calls
- Plugins render on chart correctly

**Verification:**
```bash
# Test plugin loader
npm run test -- pluginLoader.test.ts

# Load sample plugin
npm run dev -- --plugin=ichimoku
```

**Dependencies:** None

**Estimated Effort:** 8-10 days

---

## Notes

### Architectural Risks

1. **SQLite → PostgreSQL Migration:** Current SQLite database will not support concurrent writes needed for WebSocket updates and multi-user access. Migration to PostgreSQL is critical and should be prioritized.

2. **Backend Scaling:** FastAPI server runs single-threaded. For WebSocket support, consider:
   - Adding Gunicorn with multiple workers
   - Using Redis for pub/sub between workers
   - Horizontal scaling with load balancer

3. **ML Model Size:** LSTM models can be 50-100MB. Consider:
   - Model compression (quantization)
   - Lazy loading (load only when prediction requested)
   - Model serving infrastructure (TensorFlow Serving or TorchServe)

4. **Real-time Data Costs:** Streaming market data from premium providers (Polygon, IEX Cloud) can cost $50-500/month. Free alternatives (yfinance) have rate limits.

### Dependencies

- **External APIs:** News API ($450/mo), Finnhub (free tier: 60 calls/min), Alpha Vantage (free: 5 calls/min)
- **Cloud Infrastructure:** AWS EKS (~$73/mo for cluster) + RDS (~$30/mo) + ElastiCache (~$15/mo) = **~$120/mo minimum**
- **ML Training:** Requires GPU for reasonable training times. Consider Google Colab Pro ($10/mo) or AWS EC2 p3.2xlarge ($3.06/hr)

### Security Considerations

1. **API Key Management:** Use environment variables + secret management (AWS Secrets Manager, GCP Secret Manager)
2. **WebSocket Authentication:** Implement JWT validation on WebSocket connections
3. **Rate Limiting:** Add rate limiting (10 req/sec per user) to prevent abuse
4. **Input Validation:** Validate all user inputs (strategy configs, drawing tools) to prevent injection attacks
5. **CORS:** Restrict CORS to production domain only

### Performance Optimizations

1. **Indicator Caching:** Cache calculated indicators in Redis (TTL: 1 hour)
2. **Database Indexing:** Add indexes on `(ticker, date)` for faster queries
3. **Chart Data Sampling:** For large datasets (>1000 points), downsample to 500 points for chart rendering
4. **WebSocket Throttling:** Limit updates to 1 per second per client to avoid overwhelming browsers

### Testing Strategy

1. **Unit Tests:** Maintain 80%+ coverage for backend services
2. **Integration Tests:** Test API endpoints end-to-end
3. **Load Tests:** Use Artillery or k6 for WebSocket and API load testing
4. **E2E Tests:** Playwright or Cypress for critical user flows
5. **Manual Testing:** Test on multiple browsers (Chrome, Firefox, Safari) and devices

### Rollout Strategy

**Phase 3 (Weeks 1-4):**
- US-001: Real-time WebSocket (Week 1-2)
- US-002: Enhanced Asset Coverage (Week 2-3)
- US-004: Mobile PWA (Week 3-4)

**Phase 4 (Weeks 5-8):**
- US-003: Backtesting Engine (Week 5-6)
- US-005: News Integration (Week 6-7)
- US-006: ML Predictions (Week 7-8)

**Phase 5 (Weeks 9-12):**
- US-007: Auth & Cloud Deployment (Week 9-11)
- US-008: Saved Layouts (Week 11)
- US-009: Notifications (Week 12)

**Phase 6 (Future):**
- US-010: Plugin System (as needed)

---

### Critical Files for Implementation

Based on this analysis, here are the 5 most critical files for implementing these enhancements:

1. **backend/app/main.py** - Core API router; add WebSocket endpoint, backtesting endpoint, prediction endpoint, news endpoint

2. **backend/app/database.py** - Database layer; needs migration from SQLite to PostgreSQL, add user tables, layouts table, predictions table

3. **frontend/src/components/StockChartsAdvanced.tsx** - Main chart component; integrate WebSocket live updates, add prediction overlays, news annotations, backtest results visualization

4. **frontend/src/hooks/useMarketData.ts** - Data fetching hook; replace polling with WebSocket subscription, add real-time state management

5. **frontend/src/lib/indicators.ts** - Indicator calculation library; used by backtesting engine, needs optimization for server-side execution, add caching layer
