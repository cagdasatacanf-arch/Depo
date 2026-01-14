#!/usr/bin/env python3
"""
Asset Seeding Script for DEPO Backend
Purpose: Populate PostgreSQL database with stocks, crypto, forex, and commodities
Usage: python scripts/seed_assets.py
"""

import sys
import os
from typing import Dict, List
import logging

# Setup path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.database_pg import create_asset, get_asset_by_symbol, db
import yfinance as yf
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Top 50 S&P 500 stocks (by market cap as of 2026)
TOP_STOCKS = [
    # Technology
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'ORCL', 'ADBE',
    'CRM', 'CSCO', 'ACN', 'INTC', 'AMD', 'IBM', 'QCOM', 'TXN', 'INTU', 'NOW',
    # Finance
    'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'SCHW', 'AXP', 'BLK',
    # Healthcare
    'UNH', 'JNJ', 'LLY', 'ABBV', 'MRK', 'PFE', 'TMO', 'ABT', 'DHR', 'BMY',
    # Consumer
    'WMT', 'HD', 'PG', 'KO', 'PEP', 'COST', 'MCD', 'NKE', 'DIS', 'SBUX'
]

# Top 20 cryptocurrencies
CRYPTOCURRENCIES = [
    'BTC-USD',   # Bitcoin
    'ETH-USD',   # Ethereum
    'BNB-USD',   # Binance Coin
    'XRP-USD',   # Ripple
    'ADA-USD',   # Cardano
    'SOL-USD',   # Solana
    'DOT-USD',   # Polkadot
    'DOGE-USD',  # Dogecoin
    'MATIC-USD', # Polygon
    'AVAX-USD',  # Avalanche
    'LINK-USD',  # Chainlink
    'UNI-USD',   # Uniswap
    'LTC-USD',   # Litecoin
    'ATOM-USD',  # Cosmos
    'XLM-USD',   # Stellar
    'ALGO-USD',  # Algorand
    'VET-USD',   # VeChain
    'ICP-USD',   # Internet Computer
    'FIL-USD',   # Filecoin
    'AAVE-USD',  # Aave
]

# Top 10 forex pairs
FOREX_PAIRS = [
    'EURUSD=X',  # Euro / US Dollar
    'GBPUSD=X',  # British Pound / US Dollar
    'USDJPY=X',  # US Dollar / Japanese Yen
    'AUDUSD=X',  # Australian Dollar / US Dollar
    'USDCAD=X',  # US Dollar / Canadian Dollar
    'USDCHF=X',  # US Dollar / Swiss Franc
    'NZDUSD=X',  # New Zealand Dollar / US Dollar
    'EURGBP=X',  # Euro / British Pound
    'EURJPY=X',  # Euro / Japanese Yen
    'GBPJPY=X',  # British Pound / Japanese Yen
]

# Top 15 commodities
COMMODITIES = [
    'GC=F',  # Gold
    'SI=F',  # Silver
    'PL=F',  # Platinum
    'PA=F',  # Palladium
    'HG=F',  # Copper
    'CL=F',  # Crude Oil WTI
    'BZ=F',  # Brent Crude Oil
    'NG=F',  # Natural Gas
    'RB=F',  # RBOB Gasoline
    'HO=F',  # Heating Oil
    'ZC=F',  # Corn
    'ZW=F',  # Wheat
    'ZS=F',  # Soybeans
    'KC=F',  # Coffee
    'SB=F',  # Sugar
]


class AssetSeeder:
    """Seeds database with assets from various categories"""

    def __init__(self):
        self.stats = {
            'stocks': 0,
            'crypto': 0,
            'forex': 0,
            'commodities': 0,
            'errors': 0,
            'skipped': 0,
        }

    def fetch_asset_metadata(self, symbol: str) -> Dict:
        """Fetch metadata from yfinance"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info

            # Extract relevant fields (handle missing data gracefully)
            metadata = {
                'description': info.get('longBusinessSummary', info.get('description', '')),
                'sector': info.get('sector'),
                'industry': info.get('industry'),
                'market_cap': info.get('marketCap'),
                'logo_url': info.get('logo_url'),
                'website': info.get('website'),
                'exchange': info.get('exchange'),
                'currency': info.get('currency', 'USD'),
                'extra': {
                    'full_time_employees': info.get('fullTimeEmployees'),
                    'country': info.get('country'),
                    'city': info.get('city'),
                    'address': info.get('address1'),
                    'phone': info.get('phone'),
                }
            }

            return metadata

        except Exception as e:
            logger.warning(f"Failed to fetch metadata for {symbol}: {e}")
            return {}

    def get_friendly_name(self, symbol: str, category: str) -> str:
        """Get friendly display name for symbol"""

        # For stocks, try to get from yfinance
        if category == 'stock':
            try:
                ticker = yf.Ticker(symbol)
                name = ticker.info.get('longName') or ticker.info.get('shortName') or symbol
                return name
            except:
                return symbol

        # For crypto, strip -USD suffix
        if category == 'crypto':
            crypto_names = {
                'BTC-USD': 'Bitcoin',
                'ETH-USD': 'Ethereum',
                'BNB-USD': 'Binance Coin',
                'XRP-USD': 'Ripple',
                'ADA-USD': 'Cardano',
                'SOL-USD': 'Solana',
                'DOT-USD': 'Polkadot',
                'DOGE-USD': 'Dogecoin',
                'MATIC-USD': 'Polygon',
                'AVAX-USD': 'Avalanche',
                'LINK-USD': 'Chainlink',
                'UNI-USD': 'Uniswap',
                'LTC-USD': 'Litecoin',
                'ATOM-USD': 'Cosmos',
                'XLM-USD': 'Stellar',
                'ALGO-USD': 'Algorand',
                'VET-USD': 'VeChain',
                'ICP-USD': 'Internet Computer',
                'FIL-USD': 'Filecoin',
                'AAVE-USD': 'Aave',
            }
            return crypto_names.get(symbol, symbol.replace('-USD', ''))

        # For forex, convert to readable format
        if category == 'forex':
            forex_names = {
                'EURUSD=X': 'EUR/USD',
                'GBPUSD=X': 'GBP/USD',
                'USDJPY=X': 'USD/JPY',
                'AUDUSD=X': 'AUD/USD',
                'USDCAD=X': 'USD/CAD',
                'USDCHF=X': 'USD/CHF',
                'NZDUSD=X': 'NZD/USD',
                'EURGBP=X': 'EUR/GBP',
                'EURJPY=X': 'EUR/JPY',
                'GBPJPY=X': 'GBP/JPY',
            }
            return forex_names.get(symbol, symbol.replace('=X', ''))

        # For commodities
        if category == 'commodity':
            commodity_names = {
                'GC=F': 'Gold Futures',
                'SI=F': 'Silver Futures',
                'PL=F': 'Platinum Futures',
                'PA=F': 'Palladium Futures',
                'HG=F': 'Copper Futures',
                'CL=F': 'Crude Oil WTI Futures',
                'BZ=F': 'Brent Crude Oil Futures',
                'NG=F': 'Natural Gas Futures',
                'RB=F': 'RBOB Gasoline Futures',
                'HO=F': 'Heating Oil Futures',
                'ZC=F': 'Corn Futures',
                'ZW=F': 'Wheat Futures',
                'ZS=F': 'Soybeans Futures',
                'KC=F': 'Coffee Futures',
                'SB=F': 'Sugar Futures',
            }
            return commodity_names.get(symbol, symbol.replace('=F', ''))

        return symbol

    def seed_asset(self, symbol: str, category: str, fetch_metadata: bool = True) -> bool:
        """Seed a single asset"""
        try:
            # Check if already exists
            existing = get_asset_by_symbol(symbol)
            if existing:
                logger.info(f"[SKIP] {symbol} already exists")
                self.stats['skipped'] += 1
                return False

            # Get friendly name
            name = self.get_friendly_name(symbol, category)

            # Fetch metadata if requested (slower but more complete)
            metadata = {}
            if fetch_metadata and category == 'stock':
                logger.info(f"Fetching metadata for {symbol}...")
                metadata = self.fetch_asset_metadata(symbol)

            # Create asset
            asset_id = create_asset(
                symbol=symbol,
                name=name,
                category=category,
                **metadata
            )

            logger.info(f"[OK] Created {category}: {symbol} ({name}) - ID {asset_id}")
            self.stats[category if category != 'commodity' else 'commodities'] += 1
            return True

        except Exception as e:
            logger.error(f"[ERROR] Failed to seed {symbol}: {e}")
            self.stats['errors'] += 1
            return False

    def seed_stocks(self, fetch_metadata: bool = True):
        """Seed top 50 stocks"""
        logger.info(f"\n{'='*60}")
        logger.info("Seeding Top 50 Stocks")
        logger.info('='*60 + '\n')

        for i, symbol in enumerate(TOP_STOCKS, 1):
            logger.info(f"[{i}/{len(TOP_STOCKS)}] Processing {symbol}...")
            self.seed_asset(symbol, 'stock', fetch_metadata)

    def seed_crypto(self):
        """Seed top 20 cryptocurrencies"""
        logger.info(f"\n{'='*60}")
        logger.info("Seeding Top 20 Cryptocurrencies")
        logger.info('='*60 + '\n')

        for i, symbol in enumerate(CRYPTOCURRENCIES, 1):
            logger.info(f"[{i}/{len(CRYPTOCURRENCIES)}] Processing {symbol}...")
            self.seed_asset(symbol, 'crypto', fetch_metadata=False)

    def seed_forex(self):
        """Seed top 10 forex pairs"""
        logger.info(f"\n{'='*60}")
        logger.info("Seeding Top 10 Forex Pairs")
        logger.info('='*60 + '\n')

        for i, symbol in enumerate(FOREX_PAIRS, 1):
            logger.info(f"[{i}/{len(FOREX_PAIRS)}] Processing {symbol}...")
            self.seed_asset(symbol, 'forex', fetch_metadata=False)

    def seed_commodities(self):
        """Seed top 15 commodities"""
        logger.info(f"\n{'='*60}")
        logger.info("Seeding Top 15 Commodities")
        logger.info('='*60 + '\n')

        for i, symbol in enumerate(COMMODITIES, 1):
            logger.info(f"[{i}/{len(COMMODITIES)}] Processing {symbol}...")
            self.seed_asset(symbol, 'commodity', fetch_metadata=False)

    def print_stats(self):
        """Print seeding statistics"""
        total_added = (
            self.stats['stocks'] +
            self.stats['crypto'] +
            self.stats['forex'] +
            self.stats['commodities']
        )

        logger.info("\n" + "="*60)
        logger.info("Seeding Statistics")
        logger.info("="*60)
        logger.info(f"Stocks added:        {self.stats['stocks']}")
        logger.info(f"Crypto added:        {self.stats['crypto']}")
        logger.info(f"Forex pairs added:   {self.stats['forex']}")
        logger.info(f"Commodities added:   {self.stats['commodities']}")
        logger.info("-"*60)
        logger.info(f"Total added:         {total_added}")
        logger.info(f"Skipped (existing):  {self.stats['skipped']}")
        logger.info(f"Errors:              {self.stats['errors']}")
        logger.info("="*60 + "\n")

        if self.stats['errors'] == 0 and total_added > 0:
            logger.info("[SUCCESS] ✅ All assets seeded successfully!")
        elif total_added > 0:
            logger.info(f"[PARTIAL] ⚠️  {total_added} assets seeded with {self.stats['errors']} errors")
        else:
            logger.info("[INFO] No new assets added (all already exist)")

    def run(self, fetch_metadata: bool = False):
        """Run full seeding process"""
        logger.info("\n" + "="*60)
        logger.info("DEPO Asset Seeding Script")
        logger.info("="*60)
        logger.info(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Metadata fetching: {'enabled' if fetch_metadata else 'disabled (faster)'}")
        logger.info("="*60 + "\n")

        start_time = datetime.now()

        # Seed each category
        self.seed_stocks(fetch_metadata)
        self.seed_crypto()
        self.seed_forex()
        self.seed_commodities()

        # Print statistics
        duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"\nDuration: {duration:.2f} seconds")
        self.print_stats()


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Seed DEPO database with assets')
    parser.add_argument(
        '--fetch-metadata',
        action='store_true',
        help='Fetch detailed metadata from yfinance (slower but more complete)'
    )
    parser.add_argument(
        '--stocks-only',
        action='store_true',
        help='Only seed stocks'
    )
    parser.add_argument(
        '--crypto-only',
        action='store_true',
        help='Only seed cryptocurrencies'
    )
    parser.add_argument(
        '--forex-only',
        action='store_true',
        help='Only seed forex pairs'
    )
    parser.add_argument(
        '--commodities-only',
        action='store_true',
        help='Only seed commodities'
    )

    args = parser.parse_args()

    # Check DATABASE_URL
    if not os.getenv('DATABASE_URL'):
        logger.error("[ERROR] DATABASE_URL environment variable not set")
        logger.error("[HINT] export DATABASE_URL='postgresql://depo:depo_dev@localhost:5432/depo'")
        sys.exit(1)

    seeder = AssetSeeder()

    # Run selective seeding if flags provided
    if args.stocks_only:
        seeder.seed_stocks(args.fetch_metadata)
        seeder.print_stats()
    elif args.crypto_only:
        seeder.seed_crypto()
        seeder.print_stats()
    elif args.forex_only:
        seeder.seed_forex()
        seeder.print_stats()
    elif args.commodities_only:
        seeder.seed_commodities()
        seeder.print_stats()
    else:
        # Run full seeding
        seeder.run(args.fetch_metadata)


if __name__ == "__main__":
    main()
