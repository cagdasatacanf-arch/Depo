import yfinance as yf
from app.database import init_db, insert_stock_data
from datetime import datetime, timedelta

# Initialize database
init_db()

# List of stocks to download (including Metals)
STOCKS = [
    # Tech Stocks
    "GOOGL", "MSFT", "AAPL", "TSLA", "AMZN", 
    # Metals (Spot Prices)
    "XAU-USD", # Gold Spot
    "XAG-USD", # Silver Spot
    "XPT-USD", # Platinum Spot
    "XPD-USD", # Palladium Spot
    "HG=F"     # Copper (Futures - standard for Yahoo)
]

# Download 15 years of data
end_date = datetime.now()
start_date = end_date - timedelta(days=365*15)

print(f"[DOWNLOAD] Downloading stock data from {start_date.date()} to {end_date.date()}")

for ticker in STOCKS:
    print(f"\n[DOWNLOAD] Downloading {ticker}...")
    try:
        df = yf.download(ticker, start=start_date, end=end_date, progress=False)
        insert_stock_data(ticker, df)
        print(f"[OK] {ticker} completed")
    except Exception as e:
        print(f"[ERROR] Error downloading {ticker}: {e}")

print("\n[OK] All stocks downloaded!")
