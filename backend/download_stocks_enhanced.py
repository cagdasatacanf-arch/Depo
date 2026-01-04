"""
Enhanced Stock & Metal Data Downloader
Downloads historical data for stocks, metals, commodities, and crypto
"""

import yfinance as yf
from app.database import init_db, insert_stock_data
from datetime import datetime, timedelta

# Initialize database
init_db()

# Comprehensive list of assets
ASSETS = {
    # === TECH STOCKS (FAANG+) ===
    "Tech Giants": [
        "AAPL",    # Apple
        "GOOGL",   # Google/Alphabet
        "MSFT",    # Microsoft
        "AMZN",    # Amazon
        "META",    # Meta/Facebook
        "NVDA",    # NVIDIA
        "TSLA",    # Tesla
        "NFLX",    # Netflix
    ],

    # === FINANCIAL STOCKS ===
    "Financial": [
        "JPM",     # JPMorgan Chase
        "BAC",     # Bank of America
        "WFC",     # Wells Fargo
        "GS",      # Goldman Sachs
        "MS",      # Morgan Stanley
        "V",       # Visa
        "MA",      # Mastercard
    ],

    # === ENERGY STOCKS ===
    "Energy": [
        "XOM",     # Exxon Mobil
        "CVX",     # Chevron
        "COP",     # ConocoPhillips
        "SLB",     # Schlumberger
    ],

    # === PRECIOUS METALS (Spot Prices) ===
    "Precious Metals": [
        "GC=F",    # Gold Futures
        "SI=F",    # Silver Futures
        "PL=F",    # Platinum Futures
        "PA=F",    # Palladium Futures
        "XAU-USD", # Gold Spot (Troy Ounce)
        "XAG-USD", # Silver Spot (Troy Ounce)
        "XPT-USD", # Platinum Spot (Troy Ounce)
        "XPD-USD", # Palladium Spot (Troy Ounce)
    ],

    # === INDUSTRIAL METALS (Futures) ===
    "Industrial Metals": [
        "HG=F",    # Copper
        "ALI=F",   # Aluminum
    ],

    # === COMMODITIES ===
    "Commodities": [
        "CL=F",    # Crude Oil WTI
        "BZ=F",    # Brent Crude Oil
        "NG=F",    # Natural Gas
        "ZC=F",    # Corn
        "ZW=F",    # Wheat
        "ZS=F",    # Soybeans
    ],

    # === CRYPTOCURRENCY ===
    "Cryptocurrency": [
        "BTC-USD", # Bitcoin
        "ETH-USD", # Ethereum
        "BNB-USD", # Binance Coin
        "XRP-USD", # Ripple
        "ADA-USD", # Cardano
        "SOL-USD", # Solana
    ],

    # === INDICES ===
    "Indices": [
        "^GSPC",   # S&P 500
        "^DJI",    # Dow Jones
        "^IXIC",   # NASDAQ
        "^RUT",    # Russell 2000
        "^VIX",    # Volatility Index
    ],

    # === ETFs ===
    "ETFs": [
        "SPY",     # S&P 500 ETF
        "QQQ",     # NASDAQ-100 ETF
        "GLD",     # Gold ETF
        "SLV",     # Silver ETF
        "USO",     # Oil ETF
        "TLT",     # 20+ Year Treasury Bond ETF
    ],
}

# Flatten the assets dictionary into a single list
ALL_TICKERS = []
for category, tickers in ASSETS.items():
    ALL_TICKERS.extend(tickers)

# Download configuration
YEARS_OF_DATA = 15
end_date = datetime.now()
start_date = end_date - timedelta(days=365 * YEARS_OF_DATA)

print("=" * 80)
print("DEPO STOCK & METAL DATABASE BUILDER")
print("=" * 80)
print(f"Date Range: {start_date.date()} to {end_date.date()}")
print(f"Total Assets: {len(ALL_TICKERS)}")
print("=" * 80)

# Download by category for better organization
success_count = 0
error_count = 0
errors = []

for category, tickers in ASSETS.items():
    print(f"\n{'=' * 80}")
    print(f"📁 Category: {category} ({len(tickers)} assets)")
    print('=' * 80)

    for ticker in tickers:
        try:
            print(f"\n⬇️  Downloading {ticker}...", end=" ")
            df = yf.download(ticker, start=start_date, end=end_date, progress=False)

            if df.empty:
                print(f"❌ No data available")
                error_count += 1
                errors.append((ticker, "No data available"))
            else:
                insert_stock_data(ticker, df)
                print(f"✅ {len(df)} records")
                success_count += 1

        except Exception as e:
            print(f"❌ Error: {str(e)}")
            error_count += 1
            errors.append((ticker, str(e)))

# Summary
print("\n" + "=" * 80)
print("📊 DOWNLOAD SUMMARY")
print("=" * 80)
print(f"✅ Successful: {success_count}")
print(f"❌ Failed: {error_count}")
print(f"📈 Total: {len(ALL_TICKERS)}")

if errors:
    print("\n❌ Failed Downloads:")
    for ticker, error in errors:
        print(f"   • {ticker}: {error}")

print("\n" + "=" * 80)
print("✅ Database update complete!")
print("=" * 80)
