import sqlite3
import os
from datetime import datetime

DB_FILE = "stock_data.db"

def init_db():
    """Initialize database with stock_prices table"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stock_prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT NOT NULL,
            date TEXT NOT NULL,
            open REAL,
            high REAL,
            low REAL,
            close REAL,
            volume INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(ticker, date)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("[OK] Database initialized")

def get_all_stocks():
    """Get all unique tickers in database"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT ticker FROM stock_prices ORDER BY ticker")
    tickers = [row[0] for row in cursor.fetchall()]
    conn.close()
    return tickers

def get_stock_data(ticker: str, days: int = 30):
    """Get recent stock data for a ticker"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT date, open, high, low, close, volume 
        FROM stock_prices 
        WHERE ticker = ? 
        ORDER BY date DESC 
        LIMIT ?
    ''', (ticker, days))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {
            "date": row[0],
            "open": row[1],
            "high": row[2],
            "low": row[3],
            "close": row[4],
            "volume": row[5]
        }
        for row in rows
    ]

def insert_stock_data(ticker: str, df):
    """Insert stock data from pandas DataFrame"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    for date, row in df.iterrows():
        try:
            cursor.execute('''
                INSERT INTO stock_prices
                (ticker, date, open, high, low, close, volume)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                ticker,
                str(date.date()),
                float(row['Open'].iloc[0]) if hasattr(row['Open'], 'iloc') else float(row['Open']),
                float(row['High'].iloc[0]) if hasattr(row['High'], 'iloc') else float(row['High']),
                float(row['Low'].iloc[0]) if hasattr(row['Low'], 'iloc') else float(row['Low']),
                float(row['Close'].iloc[0]) if hasattr(row['Close'], 'iloc') else float(row['Close']),
                int(row['Volume'].iloc[0]) if hasattr(row['Volume'], 'iloc') else int(row['Volume'])
            ))
        except sqlite3.IntegrityError:
            # Skip duplicates
            pass
    
    conn.commit()
    conn.close()
    print(f"[OK] Inserted {len(df)} records for {ticker}")
