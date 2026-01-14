#!/usr/bin/env python3
"""
PostgreSQL Migration Verification Script
Purpose: Verify data integrity after migration from SQLite
Usage: python scripts/verify_migration.py
"""

import sqlite3
import psycopg2
import os
import sys
from typing import Dict, List
from collections import defaultdict


SQLITE_DB = "stock_data.db"
POSTGRES_URL = os.getenv("DATABASE_URL", "postgresql://depo:depo_dev@localhost:5432/depo")


class MigrationVerifier:
    """Verifies data integrity after SQLite to PostgreSQL migration"""

    def __init__(self, sqlite_path: str, postgres_url: str):
        self.sqlite_path = sqlite_path
        self.postgres_url = postgres_url
        self.issues = []
        self.checks_passed = 0
        self.checks_failed = 0

    def connect(self):
        """Connect to both databases"""
        print("[INFO] Connecting to databases...")

        if not os.path.exists(self.sqlite_path):
            print(f"[ERROR] SQLite database not found: {self.sqlite_path}")
            sys.exit(1)

        self.sqlite_conn = sqlite3.connect(self.sqlite_path)
        self.sqlite_conn.row_factory = sqlite3.Row

        try:
            self.postgres_conn = psycopg2.connect(self.postgres_url)
            print("[OK] Connected to both databases\n")
        except psycopg2.OperationalError as e:
            print(f"[ERROR] Failed to connect to PostgreSQL: {e}")
            sys.exit(1)

    def check_record_counts(self) -> bool:
        """Verify total record counts match"""
        print("[CHECK 1] Verifying total record counts...")

        sqlite_cursor = self.sqlite_conn.cursor()
        postgres_cursor = self.postgres_conn.cursor()

        # SQLite count
        sqlite_cursor.execute("SELECT COUNT(*) FROM stock_prices")
        sqlite_count = sqlite_cursor.fetchone()[0]

        # PostgreSQL count
        postgres_cursor.execute("SELECT COUNT(*) FROM stock_prices")
        postgres_count = postgres_cursor.fetchone()[0]

        print(f"  SQLite records:     {sqlite_count}")
        print(f"  PostgreSQL records: {postgres_count}")

        if postgres_count >= sqlite_count:
            print("  ✅ PASS: Record counts match or exceed\n")
            self.checks_passed += 1
            return True
        else:
            missing = sqlite_count - postgres_count
            print(f"  ❌ FAIL: Missing {missing} records in PostgreSQL\n")
            self.issues.append(f"Missing {missing} price records")
            self.checks_failed += 1
            return False

    def check_ticker_coverage(self) -> bool:
        """Verify all tickers were migrated"""
        print("[CHECK 2] Verifying ticker coverage...")

        sqlite_cursor = self.sqlite_conn.cursor()
        postgres_cursor = self.postgres_conn.cursor()

        # Get SQLite tickers
        sqlite_cursor.execute("SELECT DISTINCT ticker FROM stock_prices ORDER BY ticker")
        sqlite_tickers = set(row[0] for row in sqlite_cursor.fetchall())

        # Get PostgreSQL symbols from assets
        postgres_cursor.execute("SELECT DISTINCT symbol FROM assets ORDER BY symbol")
        postgres_symbols = set(row[0] for row in postgres_cursor.fetchall())

        print(f"  SQLite tickers:   {len(sqlite_tickers)}")
        print(f"  PostgreSQL assets: {len(postgres_symbols)}")

        # Check for missing tickers
        missing_tickers = sqlite_tickers - postgres_symbols

        if not missing_tickers:
            print("  ✅ PASS: All tickers migrated\n")
            self.checks_passed += 1
            return True
        else:
            print(f"  ❌ FAIL: Missing {len(missing_tickers)} tickers: {', '.join(missing_tickers)}\n")
            self.issues.append(f"Missing tickers: {', '.join(missing_tickers)}")
            self.checks_failed += 1
            return False

    def check_date_ranges(self) -> bool:
        """Verify date ranges match for each ticker"""
        print("[CHECK 3] Verifying date ranges per ticker...")

        sqlite_cursor = self.sqlite_conn.cursor()
        postgres_cursor = self.postgres_conn.cursor()

        # Get tickers
        sqlite_cursor.execute("SELECT DISTINCT ticker FROM stock_prices")
        tickers = [row[0] for row in sqlite_cursor.fetchall()]

        mismatches = []

        for ticker in tickers:
            # SQLite date range
            sqlite_cursor.execute("""
                SELECT MIN(date), MAX(date), COUNT(*)
                FROM stock_prices
                WHERE ticker = ?
            """, (ticker,))
            sqlite_data = sqlite_cursor.fetchone()

            # PostgreSQL date range
            postgres_cursor.execute("""
                SELECT MIN(date)::text, MAX(date)::text, COUNT(*)
                FROM stock_prices
                WHERE ticker = %s
            """, (ticker.upper(),))
            postgres_data = postgres_cursor.fetchone()

            if sqlite_data != postgres_data:
                mismatches.append({
                    'ticker': ticker,
                    'sqlite': sqlite_data,
                    'postgres': postgres_data
                })

        if not mismatches:
            print(f"  ✅ PASS: Date ranges match for all {len(tickers)} tickers\n")
            self.checks_passed += 1
            return True
        else:
            print(f"  ❌ FAIL: Date range mismatches for {len(mismatches)} tickers:")
            for mismatch in mismatches[:5]:  # Show first 5
                print(f"    {mismatch['ticker']}: SQLite={mismatch['sqlite']}, PostgreSQL={mismatch['postgres']}")
            print()
            self.issues.append(f"Date range mismatches for {len(mismatches)} tickers")
            self.checks_failed += 1
            return False

    def check_data_integrity(self) -> bool:
        """Verify data values match for sample records"""
        print("[CHECK 4] Verifying data integrity (sampling)...")

        sqlite_cursor = self.sqlite_conn.cursor()
        postgres_cursor = self.postgres_conn.cursor()

        # Get sample records from SQLite
        sqlite_cursor.execute("""
            SELECT ticker, date, open, high, low, close, volume
            FROM stock_prices
            ORDER BY RANDOM()
            LIMIT 100
        """)
        sample_records = sqlite_cursor.fetchall()

        errors = 0
        for record in sample_records:
            ticker, date, s_open, s_high, s_low, s_close, s_volume = record

            # Get same record from PostgreSQL
            postgres_cursor.execute("""
                SELECT open, high, low, close, volume
                FROM stock_prices
                WHERE ticker = %s AND date = %s
            """, (ticker.upper(), date))

            pg_record = postgres_cursor.fetchone()

            if not pg_record:
                errors += 1
                continue

            p_open, p_high, p_low, p_close, p_volume = pg_record

            # Compare values (with tolerance for floating point)
            def close_enough(a, b, tolerance=0.0001):
                if a is None or b is None:
                    return a == b
                return abs(float(a) - float(b)) < tolerance

            if not (close_enough(s_open, p_open) and
                    close_enough(s_high, p_high) and
                    close_enough(s_low, p_low) and
                    close_enough(s_close, p_close) and
                    s_volume == p_volume):
                errors += 1

        if errors == 0:
            print(f"  ✅ PASS: All {len(sample_records)} sample records match\n")
            self.checks_passed += 1
            return True
        else:
            print(f"  ❌ FAIL: {errors}/{len(sample_records)} sample records have discrepancies\n")
            self.issues.append(f"{errors} data integrity errors in sample")
            self.checks_failed += 1
            return False

    def check_schema_existence(self) -> bool:
        """Verify all required tables exist in PostgreSQL"""
        print("[CHECK 5] Verifying PostgreSQL schema...")

        postgres_cursor = self.postgres_conn.cursor()

        required_tables = [
            'assets',
            'stock_prices',
            'watchlists',
            'watchlist_items',
            'data_sources',
            'asset_data_sources'
        ]

        postgres_cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
        """)

        existing_tables = set(row[0] for row in postgres_cursor.fetchall())

        missing_tables = set(required_tables) - existing_tables

        if not missing_tables:
            print(f"  ✅ PASS: All {len(required_tables)} required tables exist\n")
            self.checks_passed += 1
            return True
        else:
            print(f"  ❌ FAIL: Missing tables: {', '.join(missing_tables)}\n")
            self.issues.append(f"Missing tables: {', '.join(missing_tables)}")
            self.checks_failed += 1
            return False

    def check_asset_categories(self) -> bool:
        """Verify assets have proper categories assigned"""
        print("[CHECK 6] Verifying asset categories...")

        postgres_cursor = self.postgres_conn.cursor()

        postgres_cursor.execute("""
            SELECT category, COUNT(*)
            FROM assets
            GROUP BY category
            ORDER BY category
        """)

        categories = postgres_cursor.fetchall()

        if categories:
            print("  Category breakdown:")
            for category, count in categories:
                print(f"    {category}: {count} assets")
            print("  ✅ PASS: Assets have categories assigned\n")
            self.checks_passed += 1
            return True
        else:
            print("  ❌ FAIL: No asset categories found\n")
            self.issues.append("No asset categories assigned")
            self.checks_failed += 1
            return False

    def run(self):
        """Run all verification checks"""
        print("\n" + "="*60)
        print("PostgreSQL Migration Verification")
        print("="*60 + "\n")

        try:
            self.connect()

            # Run all checks
            self.check_schema_existence()
            self.check_record_counts()
            self.check_ticker_coverage()
            self.check_date_ranges()
            self.check_data_integrity()
            self.check_asset_categories()

            # Summary
            print("="*60)
            print("Verification Summary")
            print("="*60)
            print(f"Checks passed: {self.checks_passed}")
            print(f"Checks failed: {self.checks_failed}")

            if self.issues:
                print("\nIssues found:")
                for i, issue in enumerate(self.issues, 1):
                    print(f"  {i}. {issue}")

            print("="*60 + "\n")

            if self.checks_failed == 0:
                print("[SUCCESS] ✅ All verification checks passed!")
                print("\nYour migration is complete and verified.")
                print("You can safely update your application to use PostgreSQL.")
                return True
            else:
                print(f"[WARN] ⚠️  {self.checks_failed} verification check(s) failed")
                print("\nPlease review the issues above and re-run the migration if needed.")
                return False

        except Exception as e:
            print(f"\n[ERROR] Verification failed: {e}")
            raise

        finally:
            if hasattr(self, 'sqlite_conn'):
                self.sqlite_conn.close()
            if hasattr(self, 'postgres_conn'):
                self.postgres_conn.close()
            print("[INFO] Database connections closed\n")


def main():
    """Main entry point"""
    verifier = MigrationVerifier(SQLITE_DB, POSTGRES_URL)
    success = verifier.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
