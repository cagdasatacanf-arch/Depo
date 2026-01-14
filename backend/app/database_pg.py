"""
PostgreSQL Database Layer for DEPO Backend
Replaces SQLite with PostgreSQL for concurrent writes and enhanced features
"""

import psycopg2
from psycopg2.extras import RealDictCursor, execute_values
from contextlib import contextmanager
import os
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Database connection from environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://depo:depo_dev@localhost:5432/depo"
)


class DatabaseConnection:
    """PostgreSQL connection manager with connection pooling"""

    _instance = None
    _connection_params = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initialize connection parameters from DATABASE_URL"""
        self._connection_params = DATABASE_URL

    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = None
        try:
            conn = psycopg2.connect(
                self._connection_params,
                cursor_factory=RealDictCursor
            )
            yield conn
            conn.commit()
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            if conn:
                conn.close()

    def execute_query(self, query: str, params: tuple = None) -> List[Dict]:
        """Execute a SELECT query and return results"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()

    def execute_update(self, query: str, params: tuple = None) -> int:
        """Execute an INSERT/UPDATE/DELETE query and return affected rows"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.rowcount


# Global database instance
db = DatabaseConnection()


def init_db():
    """
    Initialize database (check connection and verify schema)
    Note: Schema should be created via migrations/003_asset_categories.sql
    """
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                # Verify required tables exist
                cursor.execute("""
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name IN ('assets', 'stock_prices', 'watchlists')
                """)
                tables = [row['table_name'] for row in cursor.fetchall()]

                if len(tables) < 3:
                    logger.warning(
                        f"[WARN] Missing required tables. Found: {tables}\n"
                        "[HINT] Run: psql -d depo -f backend/migrations/003_asset_categories.sql"
                    )
                else:
                    logger.info(f"[OK] Database initialized - found {len(tables)} tables")

    except psycopg2.OperationalError as e:
        logger.error(f"[ERROR] Failed to connect to PostgreSQL: {e}")
        logger.error("[HINT] Make sure PostgreSQL is running and DATABASE_URL is correct")
        raise


def get_all_stocks() -> List[str]:
    """Get all active asset symbols"""
    query = """
        SELECT symbol
        FROM assets
        WHERE status = 'active'
        ORDER BY symbol
    """
    results = db.execute_query(query)
    return [row['symbol'] for row in results]


def get_stock_data(ticker: str, days: int = 30) -> List[Dict]:
    """Get recent stock data for a ticker"""
    query = """
        SELECT
            date::text as date,
            open,
            high,
            low,
            close,
            volume
        FROM stock_prices
        WHERE ticker = %s
        ORDER BY date DESC
        LIMIT %s
    """
    results = db.execute_query(query, (ticker.upper(), days))
    return list(results)


def insert_stock_data(ticker: str, df):
    """Insert stock data from pandas DataFrame"""
    with db.get_connection() as conn:
        with conn.cursor() as cursor:
            # Get or create asset
            cursor.execute("""
                INSERT INTO assets (symbol, name, category, status)
                VALUES (%s, %s, 'stock', 'active')
                ON CONFLICT (symbol) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                RETURNING id
            """, (ticker.upper(), ticker.upper()))

            asset_id = cursor.fetchone()['id']

            # Prepare bulk insert data
            values = []
            for date, row in df.iterrows():
                try:
                    values.append((
                        asset_id,
                        ticker.upper(),
                        str(date.date()),
                        float(row['Open'].iloc[0] if hasattr(row['Open'], 'iloc') else row['Open']),
                        float(row['High'].iloc[0] if hasattr(row['High'], 'iloc') else row['High']),
                        float(row['Low'].iloc[0] if hasattr(row['Low'], 'iloc') else row['Low']),
                        float(row['Close'].iloc[0] if hasattr(row['Close'], 'iloc') else row['Close']),
                        int(row['Volume'].iloc[0] if hasattr(row['Volume'], 'iloc') else row['Volume'])
                    ))
                except (ValueError, TypeError) as e:
                    logger.warning(f"Skipping invalid row for {ticker}: {e}")
                    continue

            if values:
                execute_values(
                    cursor,
                    """
                    INSERT INTO stock_prices (asset_id, ticker, date, open, high, low, close, volume)
                    VALUES %s
                    ON CONFLICT (asset_id, date) DO NOTHING
                    """,
                    values,
                    page_size=1000
                )

                logger.info(f"[OK] Inserted {len(values)} records for {ticker}")


def search_assets(
    query: str,
    category: Optional[str] = None,
    limit: int = 50
) -> List[Dict]:
    """
    Search for assets using fuzzy matching on symbol and name
    Uses the PostgreSQL search_assets() function defined in migrations
    """
    with db.get_connection() as conn:
        with conn.cursor() as cursor:
            # Use the database function for fuzzy search
            if category:
                cursor.execute(
                    "SELECT * FROM search_assets(%s, %s::asset_category, %s)",
                    (query, category, limit)
                )
            else:
                cursor.execute(
                    "SELECT * FROM search_assets(%s, NULL, %s)",
                    (query, limit)
                )

            results = cursor.fetchall()

            # Convert to dict format
            return [
                {
                    "id": row['id'],
                    "symbol": row['symbol'],
                    "name": row['name'],
                    "category": row['category'],
                    "sector": row['sector'],
                    "market_cap": row['market_cap'],
                    "logo_url": row['logo_url'],
                    "similarity": float(row['similarity']) if row['similarity'] else 0.0
                }
                for row in results
            ]


def get_asset_by_symbol(symbol: str) -> Optional[Dict]:
    """Get asset details by symbol"""
    query = """
        SELECT
            id,
            symbol,
            name,
            category,
            status,
            description,
            sector,
            industry,
            market_cap,
            logo_url,
            website,
            exchange,
            currency,
            metadata,
            created_at,
            updated_at
        FROM assets
        WHERE symbol = %s
    """
    results = db.execute_query(query, (symbol.upper(),))
    return results[0] if results else None


def get_assets_by_category(category: str, limit: int = 100) -> List[Dict]:
    """Get all assets in a specific category"""
    query = """
        SELECT
            id,
            symbol,
            name,
            category,
            sector,
            market_cap,
            logo_url
        FROM assets
        WHERE category = %s
        AND status = 'active'
        ORDER BY market_cap DESC NULLS LAST, symbol
        LIMIT %s
    """
    results = db.execute_query(query, (category, limit))
    return list(results)


def create_asset(
    symbol: str,
    name: str,
    category: str,
    **metadata
) -> int:
    """Create a new asset and return its ID"""
    query = """
        INSERT INTO assets (
            symbol, name, category, status,
            description, sector, industry, market_cap,
            logo_url, website, exchange, currency, metadata
        )
        VALUES (
            %s, %s, %s, 'active',
            %s, %s, %s, %s,
            %s, %s, %s, %s, %s::jsonb
        )
        ON CONFLICT (symbol) DO UPDATE
        SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            description = EXCLUDED.description,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            market_cap = EXCLUDED.market_cap,
            logo_url = EXCLUDED.logo_url,
            website = EXCLUDED.website,
            exchange = EXCLUDED.exchange,
            currency = EXCLUDED.currency,
            metadata = EXCLUDED.metadata,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
    """

    import json

    with db.get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, (
                symbol.upper(),
                name,
                category,
                metadata.get('description'),
                metadata.get('sector'),
                metadata.get('industry'),
                metadata.get('market_cap'),
                metadata.get('logo_url'),
                metadata.get('website'),
                metadata.get('exchange'),
                metadata.get('currency', 'USD'),
                json.dumps(metadata.get('extra', {}))
            ))

            result = cursor.fetchone()
            return result['id']


def get_watchlist(watchlist_id: int = 1) -> List[Dict]:
    """Get assets in a watchlist with current prices"""
    query = """
        SELECT
            a.id,
            a.symbol,
            a.name,
            a.category,
            a.sector,
            a.logo_url,
            wi.position,
            wi.notes,
            wi.added_at,
            (
                SELECT close
                FROM stock_prices sp
                WHERE sp.asset_id = a.id
                ORDER BY sp.date DESC
                LIMIT 1
            ) as last_price,
            (
                SELECT date
                FROM stock_prices sp
                WHERE sp.asset_id = a.id
                ORDER BY sp.date DESC
                LIMIT 1
            )::text as last_price_date
        FROM watchlist_items wi
        JOIN assets a ON wi.asset_id = a.id
        WHERE wi.watchlist_id = %s
        ORDER BY wi.position, a.symbol
    """
    results = db.execute_query(query, (watchlist_id,))
    return list(results)


def add_to_watchlist(
    asset_id: int,
    watchlist_id: int = 1,
    notes: str = None
) -> bool:
    """Add an asset to a watchlist"""
    query = """
        INSERT INTO watchlist_items (watchlist_id, asset_id, notes)
        VALUES (%s, %s, %s)
        ON CONFLICT (watchlist_id, asset_id) DO NOTHING
        RETURNING id
    """
    with db.get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, (watchlist_id, asset_id, notes))
            return cursor.rowcount > 0


def remove_from_watchlist(asset_id: int, watchlist_id: int = 1) -> bool:
    """Remove an asset from a watchlist"""
    query = """
        DELETE FROM watchlist_items
        WHERE watchlist_id = %s AND asset_id = %s
    """
    rowcount = db.execute_update(query, (watchlist_id, asset_id))
    return rowcount > 0
