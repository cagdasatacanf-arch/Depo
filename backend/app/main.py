from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.database import init_db, get_all_stocks, get_stock_data
from app.services.data_quality import validate_data

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

    # Run data quality validation
    is_valid, issues = validate_data(data, ticker.upper())

    # Build metadata
    metadata = {
        "total_records": len(data),
        "period": f"{days}d",
        "interval": "1d",
        "fetched_at": datetime.now().isoformat(),
        "start_date": data[0]["date"] if data else None,
        "end_date": data[-1]["date"] if data else None
    }

    # Build data quality summary
    data_quality = {
        "is_valid": is_valid,
        "total_issues": len(issues),
        "errors": len([i for i in issues if i['severity'] == 'error']),
        "warnings": len([i for i in issues if i['severity'] == 'warning']),
        "info": len([i for i in issues if i['severity'] == 'info']),
        "issues": issues
    }

    return {
        "status": "ok",
        "ticker": ticker.upper(),
        "data": data,
        "count": len(data),
        "data_quality": data_quality,
        "metadata": metadata
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
