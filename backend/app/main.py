from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from contextlib import asynccontextmanager
import logging
import asyncio
import json
from app.database import init_db, get_all_stocks, get_stock_data
# Import PostgreSQL functions when DATABASE_URL is set
import os
if os.getenv("DATABASE_URL"):
    from app.database_pg import search_assets, get_asset_by_symbol, get_assets_by_category
from app.services.data_quality import validate_data
from app.services.broadcaster import broadcaster
from app.services.market_updater import market_updater

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    logger.info("Starting up DEPO backend...")
    init_db()

    # Start market updater in background
    tickers = get_all_stocks()
    market_updater.set_tickers(tickers)
    asyncio.create_task(market_updater.start())

    yield

    # Shutdown
    logger.info("Shutting down DEPO backend...")
    await market_updater.stop()

app = FastAPI(lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "message": "Backend ready",
        "version": "1.0.0"
    }

# Get all available stocks
@app.get("/api/stocks")
async def list_stocks():
    tickers = get_all_stocks()
    return {
        "status": "ok",
        "tickers": tickers,
        "count": len(tickers)
    }

# Get stock data for a specific ticker
@app.get("/api/stocks/{ticker}")
async def get_ticker_data(ticker: str, days: int = 30):
    data = get_stock_data(ticker.upper(), days)

    # Run data quality validation
    is_valid, issues = validate_data(data, ticker.upper())

    # Build metadata
    metadata = {
        "total_records": len(data),
        "period": f"{days}d",
        "interval": "1d",
        "fetched_at": datetime.now().isoformat(),
        "start_date": data[0]["date"] if data else None,
        "end_date": data[-1]["date"] if data else None
    }

    # Build data quality summary
    data_quality = {
        "is_valid": is_valid,
        "total_issues": len(issues),
        "errors": len([i for i in issues if i['severity'] == 'error']),
        "warnings": len([i for i in issues if i['severity'] == 'warning']),
        "info": len([i for i in issues if i['severity'] == 'info']),
        "issues": issues
    }

    return {
        "status": "ok",
        "ticker": ticker.upper(),
        "data": data,
        "count": len(data),
        "data_quality": data_quality,
        "metadata": metadata
    }

# Get latest price for a ticker
@app.get("/api/stocks/{ticker}/latest")
async def get_latest_price(ticker: str):
    data = get_stock_data(ticker.upper(), 1)
    if data:
        latest = data[0]
        return {
            "status": "ok",
            "ticker": ticker.upper(),
            "date": latest["date"],
            "price": latest["close"],
            "open": latest["open"],
            "high": latest["high"],
            "low": latest["low"],
            "volume": latest["volume"]
        }
    return {
        "status": "error",
        "message": "No data found for ticker"
    }

# Asset search endpoint (requires PostgreSQL)
@app.get("/api/assets/search")
async def search_assets_endpoint(q: str, category: str = None, limit: int = 50):
    """
    Search for assets by symbol or name with fuzzy matching

    Query params:
        q: Search query (symbol or name)
        category: Optional filter (stock, crypto, forex, commodity, etf, index)
        limit: Max results (default 50)

    Example: GET /api/assets/search?q=apple&category=stock
    """
    if not os.getenv("DATABASE_URL"):
        return {
            "status": "error",
            "message": "Asset search requires PostgreSQL. Set DATABASE_URL environment variable.",
            "results": []
        }

    if not q or len(q) < 1:
        return {
            "status": "error",
            "message": "Query parameter 'q' is required",
            "results": []
        }

    try:
        start_time = datetime.now()
        results = search_assets(q, category, min(limit, 100))
        duration_ms = (datetime.now() - start_time).total_seconds() * 1000

        return {
            "status": "ok",
            "query": q,
            "category": category,
            "results": results,
            "count": len(results),
            "duration_ms": round(duration_ms, 2),
            "metadata": {
                "search_type": "fuzzy",
                "max_results": limit,
                "response_time_ms": round(duration_ms, 2)
            }
        }
    except Exception as e:
        logger.error(f"Asset search error: {e}")
        return {
            "status": "error",
            "message": str(e),
            "results": []
        }

# Get assets by category (requires PostgreSQL)
@app.get("/api/assets/category/{category}")
async def get_assets_by_category_endpoint(category: str, limit: int = 100):
    """
    Get all assets in a specific category

    Path params:
        category: Asset category (stock, crypto, forex, commodity, etf, index)

    Query params:
        limit: Max results (default 100)

    Example: GET /api/assets/category/crypto?limit=20
    """
    if not os.getenv("DATABASE_URL"):
        return {
            "status": "error",
            "message": "Asset categories require PostgreSQL. Set DATABASE_URL environment variable.",
            "assets": []
        }

    try:
        assets = get_assets_by_category(category.lower(), limit)

        return {
            "status": "ok",
            "category": category.lower(),
            "assets": assets,
            "count": len(assets)
        }
    except Exception as e:
        logger.error(f"Get assets by category error: {e}")
        return {
            "status": "error",
            "message": str(e),
            "assets": []
        }

# Get asset details by symbol (requires PostgreSQL)
@app.get("/api/assets/{symbol}")
async def get_asset_endpoint(symbol: str):
    """
    Get detailed information about a specific asset

    Path params:
        symbol: Asset symbol (e.g., AAPL, BTC-USD, EURUSD=X)

    Example: GET /api/assets/AAPL
    """
    if not os.getenv("DATABASE_URL"):
        return {
            "status": "error",
            "message": "Asset details require PostgreSQL. Set DATABASE_URL environment variable."
        }

    try:
        asset = get_asset_by_symbol(symbol)

        if not asset:
            return {
                "status": "error",
                "message": f"Asset not found: {symbol.upper()}"
            }

        return {
            "status": "ok",
            "asset": dict(asset)
        }
    except Exception as e:
        logger.error(f"Get asset error: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

# WebSocket endpoint for real-time price updates
@app.websocket("/ws/stocks/{ticker}")
async def websocket_endpoint(websocket: WebSocket, ticker: str):
    """
    WebSocket endpoint for real-time stock price updates

    Args:
        websocket: WebSocket connection
        ticker: Stock ticker symbol to subscribe to
    """
    ticker = ticker.upper()
    await websocket.accept()
    logger.info(f"WebSocket client connected for {ticker}")

    # Subscribe to Redis channel for this ticker
    channel = f"market:{ticker}"
    pubsub = None

    try:
        # Connect to Redis and subscribe
        await broadcaster.connect()
        pubsub = await broadcaster.subscribe(channel)

        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "ticker": ticker,
            "channel": channel,
            "timestamp": datetime.now().isoformat()
        })

        # Listen for messages from Redis and forward to WebSocket client
        # We'll run this in a separate task
        async def listen_redis():
            """Listen to Redis pub/sub and forward messages"""
            try:
                # Note: redis-py's listen() is blocking, so we need to handle this carefully
                # For now, we'll poll the pubsub for messages
                while True:
                    message = pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                    if message and message['type'] == 'message':
                        try:
                            data = json.loads(message['data'])
                            await websocket.send_json(data)
                            logger.debug(f"Sent update to client: {data}")
                        except json.JSONDecodeError as e:
                            logger.error(f"Failed to decode Redis message: {e}")
                    await asyncio.sleep(0.1)  # Small delay to prevent busy-waiting
            except Exception as e:
                logger.error(f"Error in Redis listener: {e}")

        # Start Redis listener task
        redis_task = asyncio.create_task(listen_redis())

        # Keep connection open and handle heartbeat
        while True:
            try:
                # Wait for messages from client (for heartbeat/ping)
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                message = json.loads(data)

                # Handle heartbeat/ping
                if message.get("type") == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    })
            except asyncio.TimeoutError:
                # Send heartbeat from server side if no client message
                await websocket.send_json({
                    "type": "heartbeat",
                    "timestamp": datetime.now().isoformat()
                })
            except WebSocketDisconnect:
                logger.info(f"Client disconnected from {ticker}")
                break
            except json.JSONDecodeError:
                logger.warning("Received invalid JSON from client")
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break

    except Exception as e:
        logger.error(f"WebSocket error for {ticker}: {e}")
    finally:
        # Cleanup
        if pubsub:
            await broadcaster.unsubscribe(channel)
        if 'redis_task' in locals():
            redis_task.cancel()
        logger.info(f"WebSocket connection closed for {ticker}")


# WebSocket health check endpoint
@app.get("/api/ws/health")
async def websocket_health():
    """Check if WebSocket and Redis are available"""
    try:
        await broadcaster.connect()
        redis_status = "connected"
    except Exception as e:
        redis_status = f"error: {str(e)}"

    return {
        "status": "ok",
        "websocket": "available",
        "redis": redis_status,
        "market_updater": "running" if market_updater.is_running else "stopped"
    }
