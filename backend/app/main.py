from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, get_all_stocks, get_stock_data

app = FastAPI()

# Initialize database on startup
init_db()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "message": "Backend ready",
        "version": "1.0.0"
    }

# Get all available stocks
@app.get("/api/stocks")
async def list_stocks():
    tickers = get_all_stocks()
    return {
        "status": "ok",
        "tickers": tickers,
        "count": len(tickers)
    }

# Get stock data for a specific ticker
@app.get("/api/stocks/{ticker}")
async def get_ticker_data(ticker: str, days: int = 30):
    data = get_stock_data(ticker.upper(), days)
    return {
        "status": "ok",
        "ticker": ticker.upper(),
        "data": data,
        "count": len(data)
    }

# Get latest price for a ticker
@app.get("/api/stocks/{ticker}/latest")
async def get_latest_price(ticker: str):
    data = get_stock_data(ticker.upper(), 1)
    if data:
        latest = data[0]
        return {
            "status": "ok",
            "ticker": ticker.upper(),
            "date": latest["date"],
            "price": latest["close"],
            "open": latest["open"],
            "high": latest["high"],
            "low": latest["low"],
            "volume": latest["volume"]
        }
    return {
        "status": "error",
        "message": "No data found for ticker"
    }
