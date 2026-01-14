"""
Market data updater service.
Fetches price updates from yfinance and broadcasts via Redis.
"""
import asyncio
import logging
from datetime import datetime
from typing import List
import yfinance as yf
from app.services.broadcaster import broadcaster

logger = logging.getLogger(__name__)

class MarketUpdater:
    """
    Background service to fetch market data and broadcast updates
    """

    def __init__(self, update_interval: int = 15):
        """
        Initialize market updater

        Args:
            update_interval: Update interval in seconds (default 15)
        """
        self.update_interval = update_interval
        self.is_running = False
        self.tickers = []

    def set_tickers(self, tickers: List[str]):
        """
        Set list of tickers to monitor

        Args:
            tickers: List of ticker symbols
        """
        self.tickers = [ticker.upper() for ticker in tickers]
        logger.info(f"Monitoring {len(self.tickers)} tickers: {self.tickers}")

    async def fetch_latest_price(self, ticker: str):
        """
        Fetch latest price data for a ticker

        Args:
            ticker: Stock ticker symbol

        Returns:
            Dict with price data or None if failed
        """
        try:
            stock = yf.Ticker(ticker)
            # Get latest data (1 day)
            hist = stock.history(period="1d", interval="1m")

            if hist.empty:
                logger.warning(f"No data returned for {ticker}")
                return None

            # Get the most recent data point
            latest = hist.iloc[-1]

            price_data = {
                "ticker": ticker,
                "open": float(latest["Open"]),
                "high": float(latest["High"]),
                "low": float(latest["Low"]),
                "close": float(latest["Close"]),
                "volume": int(latest["Volume"]),
                "timestamp": datetime.now().isoformat()
            }

            logger.debug(f"Fetched {ticker}: ${price_data['close']:.2f}")
            return price_data

        except Exception as e:
            logger.error(f"Failed to fetch price for {ticker}: {e}")
            return None

    async def update_all_tickers(self):
        """
        Update all monitored tickers and broadcast updates
        """
        if not self.tickers:
            logger.warning("No tickers to update")
            return

        logger.info(f"Updating {len(self.tickers)} tickers...")

        for ticker in self.tickers:
            try:
                # Fetch latest price
                price_data = await self.fetch_latest_price(ticker)

                if price_data:
                    # Broadcast update via Redis
                    await broadcaster.publish_price_update(ticker, price_data)

                    # Also cache the latest price
                    cache_key = f"latest:{ticker}"
                    await broadcaster.cache_set(cache_key, price_data, ttl=60)

            except Exception as e:
                logger.error(f"Error updating {ticker}: {e}")

    async def start(self):
        """
        Start the market updater background task
        """
        if self.is_running:
            logger.warning("Market updater is already running")
            return

        self.is_running = True
        logger.info(f"Starting market updater (interval: {self.update_interval}s)")

        # Connect broadcaster to Redis
        await broadcaster.connect()

        while self.is_running:
            try:
                await self.update_all_tickers()
                await asyncio.sleep(self.update_interval)
            except Exception as e:
                logger.error(f"Error in market updater loop: {e}")
                await asyncio.sleep(self.update_interval)

    async def stop(self):
        """
        Stop the market updater
        """
        logger.info("Stopping market updater")
        self.is_running = False
        await broadcaster.disconnect()

    def is_market_open(self) -> bool:
        """
        Check if US market is currently open

        Returns:
            True if market is open
        """
        now = datetime.now()
        weekday = now.weekday()  # 0 = Monday, 6 = Sunday

        # Market closed on weekends
        if weekday >= 5:
            return False

        # Market hours: 9:30 AM - 4:00 PM ET (simplified check)
        hour = now.hour
        return 9 <= hour < 16


# Global updater instance
market_updater = MarketUpdater()
