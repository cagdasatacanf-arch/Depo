#!/usr/bin/env python3
"""
SQLite to PostgreSQL Migration Script
Purpose: Migrate existing stock_prices data from SQLite to PostgreSQL
Usage: python scripts/migrate_to_postgres.py
"""

import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import os
import sys
from datetime import datetime
from typing import List, Dict, Tuple

# Database connection strings
SQLITE_DB = "stock_data.db"
POSTGRES_URL = os.getenv("DATABASE_URL", "postgresql://depo:depo_dev@localhost:5432/depo")


class DatabaseMigrator:
    """Handles migration from SQLite to PostgreSQL"""

    def __init__(self, sqlite_path: str, postgres_url: str):
        self.sqlite_path = sqlite_path
        self.postgres_url = postgres_url
        self.sqlite_conn = None
        self.postgres_conn = None
        self.stats = {
            "assets_created": 0,
            "prices_migrated": 0,
            "errors": 0,
            "start_time": None,
            "end_time": None,
        }

    def connect(self):
        """Establish connections to both databases"""
        print(f"[INFO] Connecting to SQLite database: {self.sqlite_path}")

        if not os.path.exists(self.sqlite_path):
            print(f"[ERROR] SQLite database not found: {self.sqlite_path}")
            sys.exit(1)

        self.sqlite_conn = sqlite3.connect(self.sqlite_path)
        self.sqlite_conn.row_factory = sqlite3.Row

        print(f"[INFO] Connecting to PostgreSQL: {self.postgres_url.split('@')[1] if '@' in self.postgres_url else self.postgres_url}")

        try:
            self.postgres_conn = psycopg2.connect(self.postgres_url)
            self.postgres_conn.autocommit = False
            print("[OK] Connected to both databases")
        except psycopg2.OperationalError as e:
            print(f"[ERROR] Failed to connect to PostgreSQL: {e}")
            print("[HINT] Make sure PostgreSQL is running and DATABASE_URL is correct")
            print("[HINT] Run: docker run -d --name depo-postgres -e POSTGRES_USER=depo -e POSTGRES_PASSWORD=depo_dev -e POSTGRES_DB=depo -p 5432:5432 postgres:15-alpine")
            sys.exit(1)

    def get_unique_tickers(self) -> List[str]:
        """Get all unique tickers from SQLite"""
        cursor = self.sqlite_conn.cursor()
        cursor.execute("SELECT DISTINCT ticker FROM stock_prices ORDER BY ticker")
        tickers = [row[0] for row in cursor.fetchall()]
        print(f"[INFO] Found {len(tickers)} unique tickers: {', '.join(tickers)}")
        return tickers

    def categorize_ticker(self, ticker: str) -> Tuple[str, str]:
        """Determine asset category from ticker symbol"""
        ticker_upper = ticker.upper()

        # Crypto symbols (typically end with -USD or have crypto patterns)
        if ticker_upper.endswith('-USD') and ticker_upper.startswith(('BTC', 'ETH', 'DOGE', 'ADA', 'SOL', 'XRP')):
            return 'crypto', ticker_upper.replace('-USD', '')

        # Forex pairs (contain =X)
        if '=X' in ticker_upper:
            return 'forex', ticker_upper.replace('=X', '')

        # Commodities (common symbols)
        commodity_symbols = ['GC=F', 'SI=F', 'CL=F', 'NG=F', 'HG=F', 'PL=F', 'PA=F']
        if ticker_upper in commodity_symbols:
            commodity_names = {
                'GC=F': 'Gold', 'SI=F': 'Silver', 'CL=F': 'Crude Oil',
                'NG=F': 'Natural Gas', 'HG=F': 'Copper', 'PL=F': 'Platinum',
                'PA=F': 'Palladium'
            }
            return 'commodity', commodity_names.get(ticker_upper, ticker_upper)

        # Default to stock
        return 'stock', ticker_upper

    def create_asset(self, ticker: str) -> int:
        """Create asset entry in PostgreSQL and return asset_id"""
        category, display_name = self.categorize_ticker(ticker)

        cursor = self.postgres_conn.cursor()

        # Check if asset already exists
        cursor.execute("SELECT id FROM assets WHERE symbol = %s", (ticker.upper(),))
        result = cursor.fetchone()

        if result:
            print(f"[SKIP] Asset {ticker} already exists (id={result[0]})")
            return result[0]

        # Insert new asset
        cursor.execute("""
            INSERT INTO assets (symbol, name, category, status)
            VALUES (%s, %s, %s, 'active')
            RETURNING id
        """, (ticker.upper(), display_name, category))

        asset_id = cursor.fetchone()[0]
        self.stats["assets_created"] += 1
        print(f"[OK] Created asset: {ticker} (id={asset_id}, category={category})")

        return asset_id

    def migrate_prices(self, ticker: str, asset_id: int) -> int:
        """Migrate price data for a specific ticker"""
        sqlite_cursor = self.sqlite_conn.cursor()
        postgres_cursor = self.postgres_conn.cursor()

        # Fetch all prices from SQLite
        sqlite_cursor.execute("""
            SELECT date, open, high, low, close, volume
            FROM stock_prices
            WHERE ticker = ?
            ORDER BY date
        """, (ticker,))

        rows = sqlite_cursor.fetchall()

        if not rows:
            print(f"[WARN] No price data found for {ticker}")
            return 0

        # Prepare data for bulk insert
        values = [
            (
                asset_id,
                ticker.upper(),
                row['date'],
                row['open'],
                row['high'],
                row['low'],
                row['close'],
                row['volume']
            )
            for row in rows
        ]

        # Bulk insert using execute_values (much faster than individual inserts)
        try:
            execute_values(
                postgres_cursor,
                """
                INSERT INTO stock_prices (asset_id, ticker, date, open, high, low, close, volume)
                VALUES %s
                ON CONFLICT (asset_id, date) DO NOTHING
                """,
                values,
                page_size=1000
            )

            migrated_count = len(values)
            self.stats["prices_migrated"] += migrated_count
            print(f"[OK] Migrated {migrated_count} price records for {ticker}")
            return migrated_count

        except psycopg2.Error as e:
            print(f"[ERROR] Failed to migrate prices for {ticker}: {e}")
            self.stats["errors"] += 1
            return 0

    def verify_migration(self) -> bool:
        """Verify that all data was migrated correctly"""
        print("\n[INFO] Verifying migration...")

        sqlite_cursor = self.sqlite_conn.cursor()
        postgres_cursor = self.postgres_conn.cursor()

        # Count records in SQLite
        sqlite_cursor.execute("SELECT COUNT(*) FROM stock_prices")
        sqlite_count = sqlite_cursor.fetchone()[0]

        # Count records in PostgreSQL
        postgres_cursor.execute("SELECT COUNT(*) FROM stock_prices")
        postgres_count = postgres_cursor.fetchone()[0]

        print(f"[INFO] SQLite records: {sqlite_count}")
        print(f"[INFO] PostgreSQL records: {postgres_count}")

        if postgres_count >= sqlite_count:
            print("[OK] Migration verified successfully!")
            return True
        else:
            print(f"[ERROR] Record count mismatch! Missing {sqlite_count - postgres_count} records")
            return False

    def run(self):
        """Execute the full migration process"""
        self.stats["start_time"] = datetime.now()
        print("\n" + "="*60)
        print("SQLite to PostgreSQL Migration")
        print("="*60 + "\n")

        try:
            # Step 1: Connect to databases
            self.connect()

            # Step 2: Get unique tickers
            tickers = self.get_unique_tickers()

            if not tickers:
                print("[WARN] No tickers found in SQLite database. Nothing to migrate.")
                return

            print(f"\n[INFO] Starting migration of {len(tickers)} assets...\n")

            # Step 3: Migrate each ticker
            for i, ticker in enumerate(tickers, 1):
                print(f"\n[{i}/{len(tickers)}] Processing {ticker}...")

                # Create asset entry
                asset_id = self.create_asset(ticker)

                # Migrate price data
                self.migrate_prices(ticker, asset_id)

            # Step 4: Commit transaction
            print("\n[INFO] Committing transaction...")
            self.postgres_conn.commit()
            print("[OK] Transaction committed")

            # Step 5: Verify migration
            self.verify_migration()

            # Step 6: Print statistics
            self.stats["end_time"] = datetime.now()
            duration = (self.stats["end_time"] - self.stats["start_time"]).total_seconds()

            print("\n" + "="*60)
            print("Migration Statistics")
            print("="*60)
            print(f"Assets created:      {self.stats['assets_created']}")
            print(f"Price records:       {self.stats['prices_migrated']}")
            print(f"Errors:              {self.stats['errors']}")
            print(f"Duration:            {duration:.2f} seconds")
            print(f"Records/second:      {self.stats['prices_migrated'] / duration if duration > 0 else 0:.0f}")
            print("="*60 + "\n")

            if self.stats["errors"] == 0:
                print("[SUCCESS] Migration completed successfully! 🎉")
                print("\nNext steps:")
                print("1. Update backend/app/database.py to use PostgreSQL")
                print("2. Run: python scripts/verify_migration.py")
                print("3. Test the API: curl http://localhost:8000/api/stocks")
            else:
                print(f"[WARN] Migration completed with {self.stats['errors']} errors")

        except Exception as e:
            print(f"\n[ERROR] Migration failed: {e}")
            if self.postgres_conn:
                print("[INFO] Rolling back transaction...")
                self.postgres_conn.rollback()
                print("[OK] Transaction rolled back")
            raise

        finally:
            # Close connections
            if self.sqlite_conn:
                self.sqlite_conn.close()
            if self.postgres_conn:
                self.postgres_conn.close()
            print("\n[INFO] Database connections closed")


def main():
    """Main entry point"""
    # Check if PostgreSQL migration was already applied
    if not os.path.exists(SQLITE_DB):
        print(f"[ERROR] SQLite database not found: {SQLITE_DB}")
        print("[INFO] Run the backend first to create the SQLite database")
        sys.exit(1)

    print(f"[INFO] SQLite database found: {SQLITE_DB}")

    # Confirm before proceeding
    print("\n[WARN] This will migrate data from SQLite to PostgreSQL")
    print("[WARN] Make sure you have:")
    print("  1. PostgreSQL running (docker or local)")
    print("  2. Applied migration: backend/migrations/003_asset_categories.sql")
    print("  3. Set DATABASE_URL environment variable")

    response = input("\nProceed with migration? [y/N]: ")

    if response.lower() != 'y':
        print("[INFO] Migration cancelled")
        sys.exit(0)

    # Run migration
    migrator = DatabaseMigrator(SQLITE_DB, POSTGRES_URL)
    migrator.run()


if __name__ == "__main__":
    main()
