"""
Redis broadcaster for WebSocket pub/sub functionality.
Handles broadcasting price updates to all connected WebSocket clients.
"""
import redis
import json
import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class RedisBroadcaster:
    """Redis pub/sub broadcaster for real-time price updates"""

    def __init__(self, redis_url: str = "redis://localhost:6379"):
        """
        Initialize Redis broadcaster

        Args:
            redis_url: Redis connection URL
        """
        self.redis_url = redis_url
        self.redis_client = None
        self.pubsub = None

    async def connect(self):
        """Connect to Redis"""
        try:
            self.redis_client = redis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            # Test connection
            self.redis_client.ping()
            logger.info(f"Connected to Redis at {self.redis_url}")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise

    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            self.redis_client.close()
            logger.info("Disconnected from Redis")

    async def publish(self, channel: str, message: Dict[str, Any]):
        """
        Publish a message to a Redis channel

        Args:
            channel: Redis channel name (e.g., "market:AAPL")
            message: Message dict to publish
        """
        try:
            if not self.redis_client:
                await self.connect()

            # Add timestamp if not present
            if "timestamp" not in message:
                message["timestamp"] = datetime.now().isoformat()

            # Serialize to JSON
            json_message = json.dumps(message)

            # Publish to channel
            subscribers = self.redis_client.publish(channel, json_message)
            logger.debug(f"Published to {channel}: {json_message} ({subscribers} subscribers)")

            return subscribers
        except Exception as e:
            logger.error(f"Failed to publish message to {channel}: {e}")
            raise

    async def subscribe(self, channel: str):
        """
        Subscribe to a Redis channel

        Args:
            channel: Redis channel name

        Returns:
            PubSub object
        """
        try:
            if not self.redis_client:
                await self.connect()

            self.pubsub = self.redis_client.pubsub()
            self.pubsub.subscribe(channel)
            logger.info(f"Subscribed to {channel}")

            return self.pubsub
        except Exception as e:
            logger.error(f"Failed to subscribe to {channel}: {e}")
            raise

    async def unsubscribe(self, channel: str = None):
        """
        Unsubscribe from Redis channel(s)

        Args:
            channel: Channel to unsubscribe from (None = all)
        """
        if self.pubsub:
            if channel:
                self.pubsub.unsubscribe(channel)
                logger.info(f"Unsubscribed from {channel}")
            else:
                self.pubsub.unsubscribe()
                logger.info("Unsubscribed from all channels")

    def listen(self):
        """
        Listen for messages on subscribed channels

        Yields:
            Dict: Message data
        """
        if not self.pubsub:
            raise RuntimeError("Not subscribed to any channel")

        for message in self.pubsub.listen():
            if message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    yield data
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to decode message: {e}")

    async def publish_price_update(self, ticker: str, price_data: Dict[str, Any]):
        """
        Publish a price update for a specific ticker

        Args:
            ticker: Stock ticker symbol
            price_data: Price data dict (open, high, low, close, volume)
        """
        channel = f"market:{ticker}"
        message = {
            "type": "price_update",
            "ticker": ticker,
            "data": price_data,
            "timestamp": datetime.now().isoformat()
        }
        return await self.publish(channel, message)

    async def cache_set(self, key: str, value: Any, ttl: int = 3600):
        """
        Cache a value in Redis

        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time to live in seconds (default 1 hour)
        """
        try:
            if not self.redis_client:
                await self.connect()

            json_value = json.dumps(value)
            self.redis_client.setex(key, ttl, json_value)
            logger.debug(f"Cached {key} with TTL {ttl}s")
        except Exception as e:
            logger.error(f"Failed to cache {key}: {e}")

    async def cache_get(self, key: str) -> Any:
        """
        Get a cached value from Redis

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found
        """
        try:
            if not self.redis_client:
                await self.connect()

            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Failed to get cache {key}: {e}")
            return None


# Global broadcaster instance
broadcaster = RedisBroadcaster()
