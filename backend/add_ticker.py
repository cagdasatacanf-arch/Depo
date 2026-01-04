"""
Quick Ticker Addition Utility
Usage: python add_ticker.py TICKER [TICKER2 TICKER3 ...]
Example: python add_ticker.py BTC-USD ETH-USD DOGE-USD
"""

import sys
import yfinance as yf
from app.database import init_db, insert_stock_data
from datetime import datetime, timedelta

if len(sys.argv) < 2:
    print("[ERROR] No ticker provided")
    print("\nUsage: python add_ticker.py TICKER [TICKER2 TICKER3 ...]")
    print("\nExamples:")
    print("   python add_ticker.py BTC-USD")
    print("   python add_ticker.py AAPL GOOGL MSFT")
    print("   python add_ticker.py GC=F SI=F (Gold and Silver futures)")
    sys.exit(1)

# Initialize database
init_db()

# Get tickers from command line
tickers = sys.argv[1:]

# Download configuration
YEARS_OF_DATA = 15
end_date = datetime.now()
start_date = end_date - timedelta(days=365 * YEARS_OF_DATA)

print("=" * 60)
print(f"Adding {len(tickers)} ticker(s) to database")
print(f"Date Range: {start_date.date()} to {end_date.date()}")
print("=" * 60)

success = []
failed = []

for ticker in tickers:
    ticker = ticker.upper()
    print(f"\n[DOWNLOAD] {ticker}...", end=" ")

    try:
        df = yf.download(ticker, start=start_date, end=end_date, progress=False)

        if df.empty:
            print(f"[FAIL] No data available")
            failed.append((ticker, "No data available"))
        else:
            insert_stock_data(ticker, df)
            print(f"[OK] Added {len(df)} records")
            success.append(ticker)

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        failed.append((ticker, str(e)))

# Summary
print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print(f"[OK] Successfully added: {len(success)}")
if success:
    print("   " + ", ".join(success))

print(f"\n[FAIL] Failed: {len(failed)}")
if failed:
    for ticker, error in failed:
        print(f"   - {ticker}: {error}")

print("=" * 60)
