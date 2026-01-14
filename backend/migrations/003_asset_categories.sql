-- Migration 003: Asset Categories and Enhanced Schema
-- Purpose: Add support for multiple asset categories (stocks, crypto, forex, commodities)
-- Date: 2026-01-14

-- Create enum type for asset categories
CREATE TYPE asset_category AS ENUM ('stock', 'crypto', 'forex', 'commodity', 'etf', 'index');

-- Create enum type for asset status
CREATE TYPE asset_status AS ENUM ('active', 'inactive', 'delisted', 'pending');

-- Assets table: Central registry of all tradable assets
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    category asset_category NOT NULL,
    status asset_status DEFAULT 'active',

    -- Metadata fields
    description TEXT,
    sector VARCHAR(100),
    industry VARCHAR(100),
    market_cap BIGINT,
    logo_url VARCHAR(500),
    website VARCHAR(500),
    exchange VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'USD',

    -- Additional metadata stored as JSONB for flexibility
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_data_fetch TIMESTAMP,

    -- Indexes
    CONSTRAINT chk_symbol_format CHECK (symbol ~ '^[A-Z0-9\-\.=]+$')
);

-- Create indexes for performance
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_symbol_category ON assets(symbol, category);
CREATE INDEX idx_assets_search_name ON assets USING gin(to_tsvector('english', name));
CREATE INDEX idx_assets_search_symbol ON assets USING gin(to_tsvector('english', symbol));
CREATE INDEX idx_assets_metadata ON assets USING gin(metadata);

-- Enhanced stock_prices table (migrated from SQLite)
CREATE TABLE IF NOT EXISTS stock_prices (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    ticker VARCHAR(20) NOT NULL,  -- Keep for backward compatibility
    date DATE NOT NULL,
    open DECIMAL(18, 6),
    high DECIMAL(18, 6),
    low DECIMAL(18, 6),
    close DECIMAL(18, 6),
    volume BIGINT,
    adjusted_close DECIMAL(18, 6),

    -- Additional fields for crypto and forex
    bid DECIMAL(18, 6),
    ask DECIMAL(18, 6),
    spread DECIMAL(18, 6),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint
    CONSTRAINT uq_asset_date UNIQUE(asset_id, date),
    CONSTRAINT uq_ticker_date UNIQUE(ticker, date)  -- Keep for backward compatibility
);

-- Create indexes for stock_prices
CREATE INDEX idx_stock_prices_asset_id ON stock_prices(asset_id);
CREATE INDEX idx_stock_prices_ticker ON stock_prices(ticker);
CREATE INDEX idx_stock_prices_date ON stock_prices(date DESC);
CREATE INDEX idx_stock_prices_asset_date ON stock_prices(asset_id, date DESC);

-- User watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,  -- Will connect to auth system later
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist items (many-to-many between watchlists and assets)
CREATE TABLE IF NOT EXISTS watchlist_items (
    id SERIAL PRIMARY KEY,
    watchlist_id INTEGER REFERENCES watchlists(id) ON DELETE CASCADE,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,  -- For custom ordering
    notes TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_watchlist_asset UNIQUE(watchlist_id, asset_id)
);

-- Create indexes for watchlists
CREATE INDEX idx_watchlist_items_watchlist ON watchlist_items(watchlist_id);
CREATE INDEX idx_watchlist_items_asset ON watchlist_items(asset_id);
CREATE INDEX idx_watchlist_items_position ON watchlist_items(watchlist_id, position);

-- Asset data sources tracking (for multi-source data fetching)
CREATE TABLE IF NOT EXISTS data_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    provider VARCHAR(100),
    api_endpoint VARCHAR(500),
    rate_limit_per_hour INTEGER,
    priority INTEGER DEFAULT 0,  -- Higher priority sources tried first
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset-specific data source mappings
CREATE TABLE IF NOT EXISTS asset_data_sources (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    data_source_id INTEGER REFERENCES data_sources(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    last_successful_fetch TIMESTAMP,
    error_count INTEGER DEFAULT 0,

    CONSTRAINT uq_asset_source UNIQUE(asset_id, data_source_id)
);

-- Create indexes for data sources
CREATE INDEX idx_asset_data_sources_asset ON asset_data_sources(asset_id);
CREATE INDEX idx_asset_data_sources_primary ON asset_data_sources(is_primary) WHERE is_primary = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic updated_at
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON watchlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for fuzzy asset search
CREATE OR REPLACE FUNCTION search_assets(
    search_query TEXT,
    filter_category asset_category DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id INTEGER,
    symbol VARCHAR,
    name VARCHAR,
    category asset_category,
    sector VARCHAR,
    market_cap BIGINT,
    logo_url VARCHAR,
    similarity REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.symbol,
        a.name,
        a.category,
        a.sector,
        a.market_cap,
        a.logo_url,
        GREATEST(
            similarity(a.symbol, search_query),
            similarity(a.name, search_query)
        ) as similarity
    FROM assets a
    WHERE
        (filter_category IS NULL OR a.category = filter_category)
        AND a.status = 'active'
        AND (
            a.symbol ILIKE '%' || search_query || '%'
            OR a.name ILIKE '%' || search_query || '%'
            OR to_tsvector('english', a.name) @@ plainto_tsquery('english', search_query)
            OR to_tsvector('english', a.symbol) @@ plainto_tsquery('english', search_query)
        )
    ORDER BY similarity DESC, a.market_cap DESC NULLS LAST
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Insert default data sources
INSERT INTO data_sources (name, provider, api_endpoint, rate_limit_per_hour, priority, is_active) VALUES
    ('yfinance', 'Yahoo Finance', 'https://query1.finance.yahoo.com', 2000, 100, true),
    ('alpha_vantage', 'Alpha Vantage', 'https://www.alphavantage.co/query', 500, 80, true),
    ('coingecko', 'CoinGecko', 'https://api.coingecko.com/api/v3', 10000, 90, true),
    ('twelvedata', 'Twelve Data', 'https://api.twelvedata.com', 800, 70, false)
ON CONFLICT (name) DO NOTHING;

-- Create default watchlist for demo
INSERT INTO watchlists (user_id, name, description, is_default) VALUES
    (1, 'My Watchlist', 'Default watchlist', true)
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE assets IS 'Central registry of all tradable assets across categories';
COMMENT ON TABLE stock_prices IS 'Historical price data for all assets';
COMMENT ON TABLE watchlists IS 'User-defined watchlists';
COMMENT ON TABLE watchlist_items IS 'Assets in watchlists (many-to-many)';
COMMENT ON TABLE data_sources IS 'External data providers configuration';
COMMENT ON TABLE asset_data_sources IS 'Asset-specific data source mappings';
COMMENT ON FUNCTION search_assets IS 'Fuzzy search for assets by symbol or name';
