# Database Migrations

This directory contains SQL migration files for the DEPO backend database.

## Migration History

| Migration | Description | Date |
|-----------|-------------|------|
| 003_asset_categories.sql | Add asset categories, watchlists, and enhanced schema for PostgreSQL | 2026-01-14 |

## Running Migrations

### Prerequisites

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15

   # Ubuntu/Debian
   sudo apt-get install postgresql-15

   # Docker
   docker run -d \
     --name depo-postgres \
     -e POSTGRES_USER=depo \
     -e POSTGRES_PASSWORD=depo_dev \
     -e POSTGRES_DB=depo \
     -p 5432:5432 \
     postgres:15-alpine
   ```

2. **Create Database**
   ```bash
   # If using local PostgreSQL
   createdb depo

   # Or via psql
   psql -c "CREATE DATABASE depo;"
   ```

### Apply Migration

```bash
# Apply the asset categories migration
psql -d depo -f backend/migrations/003_asset_categories.sql

# Verify tables were created
psql -d depo -c "\dt"

# Expected output:
#  Schema |       Name           | Type  | Owner
# --------+----------------------+-------+-------
#  public | assets               | table | ...
#  public | stock_prices         | table | ...
#  public | watchlists           | table | ...
#  public | watchlist_items      | table | ...
#  public | data_sources         | table | ...
#  public | asset_data_sources   | table | ...
```

### Rollback (if needed)

```bash
# Drop all tables created by migration 003
psql -d depo <<EOF
DROP TABLE IF EXISTS asset_data_sources CASCADE;
DROP TABLE IF EXISTS data_sources CASCADE;
DROP TABLE IF EXISTS watchlist_items CASCADE;
DROP TABLE IF EXISTS watchlists CASCADE;
DROP TABLE IF EXISTS stock_prices CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TYPE IF EXISTS asset_category CASCADE;
DROP TYPE IF EXISTS asset_status CASCADE;
DROP FUNCTION IF EXISTS search_assets;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
EOF
```

## Schema Overview

### Core Tables

#### `assets`
Central registry of all tradable assets.

**Columns:**
- `id`: Primary key
- `symbol`: Unique ticker symbol (e.g., AAPL, BTC-USD, EURUSD=X)
- `name`: Full asset name
- `category`: Asset type (stock, crypto, forex, commodity, etf, index)
- `status`: Active status
- `description`, `sector`, `industry`: Metadata
- `market_cap`, `logo_url`, `website`: Additional info
- `metadata`: JSONB for flexible additional fields

**Indexes:**
- `idx_assets_category`: Fast category filtering
- `idx_assets_search_name`: Full-text search on name
- `idx_assets_search_symbol`: Full-text search on symbol
- `idx_assets_metadata`: JSONB queries

#### `stock_prices`
Historical OHLCV data for all assets.

**Columns:**
- `asset_id`: Foreign key to assets table
- `ticker`: Symbol (kept for backward compatibility)
- `date`: Trading date
- `open`, `high`, `low`, `close`, `volume`: OHLCV data
- `bid`, `ask`, `spread`: For forex/crypto

**Indexes:**
- `idx_stock_prices_asset_date`: Fast time-series queries
- `uq_asset_date`: Prevent duplicate data

#### `watchlists` & `watchlist_items`
User-customizable watchlists.

**Features:**
- Multiple watchlists per user
- Custom ordering via `position` field
- Notes per watchlist item

### Utility Tables

- **`data_sources`**: Configuration for external data providers
- **`asset_data_sources`**: Maps assets to their data sources

### Functions

#### `search_assets(query, category, limit)`
Fuzzy search for assets using trigram similarity.

**Example:**
```sql
-- Search for "apple" in all categories
SELECT * FROM search_assets('apple', NULL, 10);

-- Search for "bitcoin" in crypto only
SELECT * FROM search_assets('bitcoin', 'crypto', 10);
```

## Testing

```bash
# Test asset search function
psql -d depo <<EOF
-- Insert test asset
INSERT INTO assets (symbol, name, category, sector, market_cap)
VALUES ('AAPL', 'Apple Inc.', 'stock', 'Technology', 3000000000000);

-- Search for it
SELECT * FROM search_assets('apple', NULL, 5);
EOF
```

## Environment Variables

Set these in your `.env` file:

```env
# PostgreSQL connection
DATABASE_URL=postgresql://depo:depo_dev@localhost:5432/depo

# Or individual vars
POSTGRES_USER=depo
POSTGRES_PASSWORD=depo_dev
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=depo
```

## Migration Workflow

1. **Backup current SQLite data** (before migrating)
2. **Apply migration** to PostgreSQL
3. **Run migration script** to copy SQLite data to PostgreSQL
4. **Verify data integrity**
5. **Update application config** to use PostgreSQL
6. **Test thoroughly**
7. **Keep SQLite as backup** for rollback if needed

## Next Steps

After applying this migration:

1. Run `scripts/migrate_to_postgres.py` to migrate existing SQLite data
2. Update `backend/app/database.py` to use PostgreSQL connection
3. Seed assets using `scripts/seed_assets.py`
4. Start using the new API endpoints

## Troubleshooting

### "pg_trgm extension not found"
```bash
# Install contrib package
sudo apt-get install postgresql-contrib-15

# Enable in database
psql -d depo -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
```

### "Permission denied"
```bash
# Grant permissions to your user
psql -d depo -c "GRANT ALL PRIVILEGES ON DATABASE depo TO your_username;"
```

### Connection refused
```bash
# Check PostgreSQL is running
pg_isready

# Check port is listening
lsof -i :5432
```
