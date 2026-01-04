"""
Data Quality Validation Service

Validates stock market data for quality issues including:
- Missing required fields
- Invalid OHLC relationships
- Price/volume anomalies
- Date gaps and duplicates
- Negative values
- Data freshness
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import statistics


def validate_data(data: List[Dict[str, Any]], ticker: str) -> Tuple[bool, List[Dict[str, Any]]]:
    """
    Validate stock data for quality issues

    Args:
        data: List of stock data points with date, open, high, low, close, volume
        ticker: Stock ticker symbol

    Returns:
        Tuple of (is_valid: bool, issues: List[Dict])
    """
    issues = []

    if not data:
        issues.append({
            "severity": "error",
            "category": "missing_data",
            "message": f"No data available for {ticker}",
            "details": {},
            "timestamp": datetime.now().isoformat()
        })
        return False, issues

    # 1. Check required fields
    required_fields = ["date", "open", "high", "low", "close", "volume"]
    for idx, record in enumerate(data):
        missing = [field for field in required_fields if field not in record or record[field] is None]
        if missing:
            issues.append({
                "severity": "error",
                "category": "missing_fields",
                "message": f"Missing required fields at index {idx}",
                "details": {"missing_fields": missing, "record_index": idx},
                "timestamp": datetime.now().isoformat()
            })

    # 2. Check OHLC relationships
    for idx, record in enumerate(data):
        try:
            o, h, l, c = record["open"], record["high"], record["low"], record["close"]

            if h < l:
                issues.append({
                    "severity": "error",
                    "category": "invalid_ohlc",
                    "message": f"High ({h}) < Low ({l}) at index {idx}",
                    "details": {"record_index": idx, "high": h, "low": l},
                    "timestamp": datetime.now().isoformat()
                })

            if h < o or h < c:
                issues.append({
                    "severity": "error",
                    "category": "invalid_ohlc",
                    "message": f"High price not highest at index {idx}",
                    "details": {"record_index": idx, "open": o, "high": h, "low": l, "close": c},
                    "timestamp": datetime.now().isoformat()
                })

            if l > o or l > c:
                issues.append({
                    "severity": "error",
                    "category": "invalid_ohlc",
                    "message": f"Low price not lowest at index {idx}",
                    "details": {"record_index": idx, "open": o, "high": h, "low": l, "close": c},
                    "timestamp": datetime.now().isoformat()
                })
        except (KeyError, TypeError):
            pass  # Already caught by missing fields check

    # 3. Check for price anomalies (values > 3 standard deviations)
    try:
        close_prices = [r["close"] for r in data if "close" in r and r["close"] is not None]
        if len(close_prices) > 2:
            mean_price = statistics.mean(close_prices)
            std_price = statistics.stdev(close_prices)
            threshold = 3 * std_price

            for idx, record in enumerate(data):
                if "close" in record and record["close"] is not None:
                    if abs(record["close"] - mean_price) > threshold:
                        issues.append({
                            "severity": "warning",
                            "category": "price_anomaly",
                            "message": f"Price anomaly detected at index {idx}",
                            "details": {
                                "record_index": idx,
                                "close": record["close"],
                                "mean": round(mean_price, 2),
                                "std_dev": round(std_price, 2),
                                "deviation": round(abs(record["close"] - mean_price) / std_price, 2)
                            },
                            "timestamp": datetime.now().isoformat()
                        })
    except (KeyError, ValueError, statistics.StatisticsError):
        pass

    # 4. Check for volume anomalies
    try:
        volumes = [r["volume"] for r in data if "volume" in r and r["volume"] is not None and r["volume"] > 0]
        if len(volumes) > 2:
            mean_volume = statistics.mean(volumes)
            std_volume = statistics.stdev(volumes)
            threshold = 3 * std_volume

            for idx, record in enumerate(data):
                if "volume" in record and record["volume"] is not None:
                    if abs(record["volume"] - mean_volume) > threshold:
                        issues.append({
                            "severity": "info",
                            "category": "volume_anomaly",
                            "message": f"Unusual volume at index {idx}",
                            "details": {
                                "record_index": idx,
                                "volume": record["volume"],
                                "mean": round(mean_volume, 2),
                                "deviation": round(abs(record["volume"] - mean_volume) / std_volume, 2)
                            },
                            "timestamp": datetime.now().isoformat()
                        })
    except (KeyError, ValueError, statistics.StatisticsError):
        pass

    # 5. Check for date gaps (missing trading days)
    try:
        dates = sorted([datetime.strptime(r["date"], "%Y-%m-%d") for r in data if "date" in r])
        gaps = []
        for i in range(1, len(dates)):
            days_diff = (dates[i] - dates[i-1]).days
            # Trading days should be 1-3 days apart (accounting for weekends)
            if days_diff > 5:
                gaps.append({
                    "from": dates[i-1].strftime("%Y-%m-%d"),
                    "to": dates[i].strftime("%Y-%m-%d"),
                    "days": days_diff
                })

        if gaps:
            issues.append({
                "severity": "warning",
                "category": "date_gaps",
                "message": f"Found {len(gaps)} date gaps in data",
                "details": {"gaps": gaps[:5]},  # Limit to first 5 gaps
                "timestamp": datetime.now().isoformat()
            })
    except (KeyError, ValueError):
        pass

    # 6. Check for duplicate dates
    try:
        dates_list = [r["date"] for r in data if "date" in r]
        duplicates = [date for date in set(dates_list) if dates_list.count(date) > 1]
        if duplicates:
            issues.append({
                "severity": "error",
                "category": "duplicate_dates",
                "message": f"Found {len(duplicates)} duplicate dates",
                "details": {"duplicate_dates": duplicates[:10]},  # Limit to first 10
                "timestamp": datetime.now().isoformat()
            })
    except KeyError:
        pass

    # 7. Check for negative values
    for idx, record in enumerate(data):
        negative_fields = []
        for field in ["open", "high", "low", "close"]:
            if field in record and record[field] is not None and record[field] < 0:
                negative_fields.append(field)

        if negative_fields:
            issues.append({
                "severity": "error",
                "category": "negative_values",
                "message": f"Negative price values at index {idx}",
                "details": {"record_index": idx, "fields": negative_fields},
                "timestamp": datetime.now().isoformat()
            })

    # 8. Check data freshness
    try:
        if data:
            latest_date = max([datetime.strptime(r["date"], "%Y-%m-%d") for r in data if "date" in r])
            days_old = (datetime.now() - latest_date).days

            if days_old > 7:
                issues.append({
                    "severity": "warning",
                    "category": "stale_data",
                    "message": f"Data is {days_old} days old",
                    "details": {"latest_date": latest_date.strftime("%Y-%m-%d"), "days_old": days_old},
                    "timestamp": datetime.now().isoformat()
                })
            elif days_old > 2:
                issues.append({
                    "severity": "info",
                    "category": "stale_data",
                    "message": f"Data is {days_old} days old",
                    "details": {"latest_date": latest_date.strftime("%Y-%m-%d"), "days_old": days_old},
                    "timestamp": datetime.now().isoformat()
                })
    except (KeyError, ValueError):
        pass

    # Determine overall validity (no errors)
    has_errors = any(issue["severity"] == "error" for issue in issues)
    is_valid = not has_errors

    return is_valid, issues
