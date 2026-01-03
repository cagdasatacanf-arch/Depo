# DEPO - Quick Start Guide

## Starting the Application

### Step 1: Start the Backend (FastAPI)

Open a terminal and run:

```bash
cd backend
python run.py
```

Backend will start on: **http://localhost:8000**

### Step 2: Start the Frontend (React)

Open a **NEW** terminal and run:

```bash
cd frontend
npm install    # Only needed first time
npm run dev
```

Frontend will start on: **http://localhost:5173**

### Step 3: Open Your Browser

Navigate to: **http://localhost:5173**

You should see the DEPO Dashboard with stock data!

## API Endpoints Available

- `GET http://localhost:8000/api/health` - Health check
- `GET http://localhost:8000/api/stocks` - List all stocks
- `GET http://localhost:8000/api/stocks/GOOGL?days=90` - Get GOOGL data (90 days)
- `GET http://localhost:8000/api/stocks/GOOGL/latest` - Get latest GOOGL price
- `GET http://localhost:8000/docs` - Swagger API documentation

## Troubleshooting

### Backend Issues

**Problem:** "No module named 'app'"
**Solution:** Make sure you're in the `backend/` directory when running `python run.py`

**Problem:** "No such table: stock_prices"
**Solution:** Run `python download_stocks.py` from the backend directory

**Problem:** Port 8000 already in use
**Solution:** Kill the process using port 8000 or change the port in `backend/run.py`

### Frontend Issues

**Problem:** "Cannot connect to backend"
**Solution:**
1. Check backend is running on http://localhost:8000
2. Verify `.env` file has `VITE_API_URL=http://localhost:8000`
3. Restart the frontend dev server

**Problem:** "Module not found" errors
**Solution:** Run `npm install` in the frontend directory

## Available Stocks

- AAPL (Apple)
- AMZN (Amazon)
- GOOGL (Google)
- MSFT (Microsoft)
- TSLA (Tesla)

## Next Steps

1. **Add more stocks**: Edit `backend/download_stocks.py` and run it
2. **Customize dashboard**: Edit `frontend/src/components/Dashboard.tsx`
3. **Add charts**: Use Recharts library (already installed)
4. **Deploy**: See README.md for deployment instructions

---

**Need help?** Check the full README.md for detailed documentation.
