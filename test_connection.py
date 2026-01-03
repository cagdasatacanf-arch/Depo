"""
Quick test script to verify backend database connection
"""
import sys
sys.path.insert(0, 'backend')

from app.database import get_all_stocks, get_stock_data

print("Testing database connection...")
print("-" * 50)

# Test 1: Get all stocks
print("\n1. Testing get_all_stocks():")
tickers = get_all_stocks()
print(f"   Found {len(tickers)} stocks: {tickers}")

# Test 2: Get stock data for first ticker
if tickers:
    test_ticker = tickers[0]
    print(f"\n2. Testing get_stock_data('{test_ticker}', 5):")
    data = get_stock_data(test_ticker, 5)
    print(f"   Retrieved {len(data)} records")
    if data:
        print(f"   Latest: {data[0]}")

print("\n" + "-" * 50)
print("✅ Database connection successful!")
print("\nYou can now start the backend server with:")
print("   cd backend")
print("   python run.py")
