import { StockData } from './api';

/**
 * Pattern Detection Library
 * Detects candlestick patterns, divergences, fair value gaps, and order blocks
 */

// ============================================================================
// CANDLESTICK PATTERNS
// ============================================================================

export interface CandlestickPattern {
    index: number;
    date: string;
    type: 'bullish_engulfing' | 'bearish_engulfing' | 'hammer' | 'shooting_star' | 'doji';
    price: number;
    confidence: 'high' | 'medium' | 'low';
}

export function detectEngulfing(data: StockData[]): CandlestickPattern[] {
    const patterns: CandlestickPattern[] = [];

    for (let i = 1; i < data.length; i++) {
        const prev = data[i - 1];
        const curr = data[i];

        const prevBody = Math.abs(prev.close - prev.open);
        const currBody = Math.abs(curr.close - curr.open);

        const prevIsRed = prev.close < prev.open;
        const prevIsGreen = prev.close > prev.open;
        const currIsRed = curr.close < curr.open;
        const currIsGreen = curr.close > curr.open;

        // Bullish Engulfing: Red candle followed by larger green candle that engulfs it
        if (prevIsRed && currIsGreen &&
            curr.open <= prev.close &&
            curr.close >= prev.open &&
            currBody > prevBody) {
            patterns.push({
                index: i,
                date: curr.date,
                type: 'bullish_engulfing',
                price: curr.close,
                confidence: currBody > prevBody * 1.5 ? 'high' : 'medium'
            });
        }

        // Bearish Engulfing: Green candle followed by larger red candle that engulfs it
        if (prevIsGreen && currIsRed &&
            curr.open >= prev.close &&
            curr.close <= prev.open &&
            currBody > prevBody) {
            patterns.push({
                index: i,
                date: curr.date,
                type: 'bearish_engulfing',
                price: curr.close,
                confidence: currBody > prevBody * 1.5 ? 'high' : 'medium'
            });
        }
    }

    return patterns;
}

export function detectHammer(data: StockData[]): CandlestickPattern[] {
    const patterns: CandlestickPattern[] = [];

    for (let i = 0; i < data.length; i++) {
        const candle = data[i];

        const body = Math.abs(candle.close - candle.open);
        const upperWick = candle.high - Math.max(candle.open, candle.close);
        const lowerWick = Math.min(candle.open, candle.close) - candle.low;
        const totalRange = candle.high - candle.low;

        // Hammer: Small body at top, long lower wick (at least 2x body), small upper wick
        if (body > 0 && totalRange > 0) {
            const bodyRatio = body / totalRange;
            const lowerWickRatio = lowerWick / totalRange;

            if (lowerWick >= body * 2 &&
                bodyRatio < 0.3 &&
                lowerWickRatio > 0.6 &&
                upperWick < body) {
                patterns.push({
                    index: i,
                    date: candle.date,
                    type: 'hammer',
                    price: candle.close,
                    confidence: lowerWick >= body * 3 ? 'high' : 'medium'
                });
            }
        }
    }

    return patterns;
}

export function detectShootingStar(data: StockData[]): CandlestickPattern[] {
    const patterns: CandlestickPattern[] = [];

    for (let i = 0; i < data.length; i++) {
        const candle = data[i];

        const body = Math.abs(candle.close - candle.open);
        const upperWick = candle.high - Math.max(candle.open, candle.close);
        const lowerWick = Math.min(candle.open, candle.close) - candle.low;
        const totalRange = candle.high - candle.low;

        // Shooting Star: Small body at bottom, long upper wick, small lower wick
        if (body > 0 && totalRange > 0) {
            const bodyRatio = body / totalRange;
            const upperWickRatio = upperWick / totalRange;

            if (upperWick >= body * 2 &&
                bodyRatio < 0.3 &&
                upperWickRatio > 0.6 &&
                lowerWick < body) {
                patterns.push({
                    index: i,
                    date: candle.date,
                    type: 'shooting_star',
                    price: candle.close,
                    confidence: upperWick >= body * 3 ? 'high' : 'medium'
                });
            }
        }
    }

    return patterns;
}

export function detectDoji(data: StockData[]): CandlestickPattern[] {
    const patterns: CandlestickPattern[] = [];

    for (let i = 0; i < data.length; i++) {
        const candle = data[i];

        const body = Math.abs(candle.close - candle.open);
        const totalRange = candle.high - candle.low;

        // Doji: Open ≈ Close (very small body relative to range)
        if (totalRange > 0) {
            const bodyRatio = body / totalRange;

            if (bodyRatio < 0.1) {
                patterns.push({
                    index: i,
                    date: candle.date,
                    type: 'doji',
                    price: candle.close,
                    confidence: bodyRatio < 0.05 ? 'high' : 'medium'
                });
            }
        }
    }

    return patterns;
}

// ============================================================================
// FAIR VALUE GAPS
// ============================================================================

export interface FairValueGap {
    index: number;
    date: string;
    gapTop: number;
    gapBottom: number;
    type: 'bullish' | 'bearish';
}

export function detectFairValueGaps(data: StockData[], minGapSize: number = 0.5): FairValueGap[] {
    const gaps: FairValueGap[] = [];

    for (let i = 1; i < data.length - 1; i++) {
        const prev = data[i - 1];
        const curr = data[i];
        const next = data[i + 1];

        const currIsGreen = curr.close > curr.open;
        const currIsRed = curr.close < curr.open;

        // Bullish FVG: Large green candle with gap between prev high and next low
        if (currIsGreen && prev.high < next.low) {
            const gapSize = next.low - prev.high;
            const gapPercent = (gapSize / prev.high) * 100;

            if (gapPercent >= minGapSize) {
                gaps.push({
                    index: i,
                    date: curr.date,
                    gapTop: next.low,
                    gapBottom: prev.high,
                    type: 'bullish'
                });
            }
        }

        // Bearish FVG: Large red candle with gap between prev low and next high
        if (currIsRed && prev.low > next.high) {
            const gapSize = prev.low - next.high;
            const gapPercent = (gapSize / prev.low) * 100;

            if (gapPercent >= minGapSize) {
                gaps.push({
                    index: i,
                    date: curr.date,
                    gapTop: prev.low,
                    gapBottom: next.high,
                    type: 'bearish'
                });
            }
        }
    }

    return gaps;
}

// ============================================================================
// SUPPLY & DEMAND ZONES (ORDER BLOCKS)
// ============================================================================

export interface SupplyDemandZone {
    index: number;
    date: string;
    zoneTop: number;
    zoneBottom: number;
    type: 'demand' | 'supply';
    strength: 'strong' | 'moderate' | 'weak';
}

export function detectOrderBlocks(
    data: StockData[],
    minMovePercent: number = 2,
    lookAhead: number = 3
): SupplyDemandZone[] {
    const zones: SupplyDemandZone[] = [];

    for (let i = 0; i < data.length - lookAhead; i++) {
        const curr = data[i];
        let maxUpMove = 0;
        let maxDownMove = 0;

        // Check lookahead candles for significant moves
        for (let j = 1; j <= lookAhead; j++) {
            if (i + j >= data.length) break;

            const future = data[i + j];
            const upMove = ((future.high - curr.close) / curr.close) * 100;
            const downMove = ((curr.close - future.low) / curr.close) * 100;

            maxUpMove = Math.max(maxUpMove, upMove);
            maxDownMove = Math.max(maxDownMove, downMove);
        }

        // Demand zone: Significant upward move originated from this candle
        if (maxUpMove >= minMovePercent) {
            const strength = maxUpMove > 5 ? 'strong' : maxUpMove > 3 ? 'moderate' : 'weak';
            zones.push({
                index: i,
                date: curr.date,
                zoneTop: curr.high,
                zoneBottom: curr.low,
                type: 'demand',
                strength
            });
        }

        // Supply zone: Significant downward move originated from this candle
        if (maxDownMove >= minMovePercent) {
            const strength = maxDownMove > 5 ? 'strong' : maxDownMove > 3 ? 'moderate' : 'weak';
            zones.push({
                index: i,
                date: curr.date,
                zoneTop: curr.high,
                zoneBottom: curr.low,
                type: 'supply',
                strength
            });
        }
    }

    return zones;
}

// ============================================================================
// DIVERGENCE DETECTION
// ============================================================================

export interface Divergence {
    startIndex: number;
    endIndex: number;
    type: 'regular_bullish' | 'regular_bearish' | 'hidden_bullish' | 'hidden_bearish';
    indicator: 'rsi' | 'macd';
    priceStart: number;
    priceEnd: number;
    indicatorStart: number;
    indicatorEnd: number;
}

// Find swing highs and lows
function findSwingPoints(data: number[], window: number = 5): { highs: number[], lows: number[] } {
    const highs: number[] = [];
    const lows: number[] = [];

    for (let i = window; i < data.length - window; i++) {
        let isHigh = true;
        let isLow = true;

        for (let j = 1; j <= window; j++) {
            if (data[i] <= data[i - j] || data[i] <= data[i + j]) {
                isHigh = false;
            }
            if (data[i] >= data[i - j] || data[i] >= data[i + j]) {
                isLow = false;
            }
        }

        if (isHigh) highs.push(i);
        if (isLow) lows.push(i);
    }

    return { highs, lows };
}

export function detectDivergence(
    priceData: StockData[],
    indicatorData: number[],
    indicatorName: 'rsi' | 'macd',
    lookback: number = 50
): Divergence[] {
    const divergences: Divergence[] = [];

    // Extract price closes
    const prices = priceData.map(d => d.close);

    // Find swing points
    const priceSwings = findSwingPoints(prices);
    const indicatorSwings = findSwingPoints(indicatorData);

    // Check for regular bullish divergence (price lower lows, indicator higher lows)
    for (let i = 1; i < priceSwings.lows.length; i++) {
        const priceIdx1 = priceSwings.lows[i - 1];
        const priceIdx2 = priceSwings.lows[i];

        if (priceIdx2 - priceIdx1 > lookback) continue;

        // Find corresponding indicator lows
        const indLows = indicatorSwings.lows.filter(idx => idx >= priceIdx1 - 3 && idx <= priceIdx2 + 3);

        if (indLows.length >= 2) {
            const indIdx1 = indLows[0];
            const indIdx2 = indLows[indLows.length - 1];

            // Regular bullish divergence: price LL, indicator HL
            if (prices[priceIdx2] < prices[priceIdx1] &&
                indicatorData[indIdx2] > indicatorData[indIdx1]) {
                divergences.push({
                    startIndex: priceIdx1,
                    endIndex: priceIdx2,
                    type: 'regular_bullish',
                    indicator: indicatorName,
                    priceStart: prices[priceIdx1],
                    priceEnd: prices[priceIdx2],
                    indicatorStart: indicatorData[indIdx1],
                    indicatorEnd: indicatorData[indIdx2]
                });
            }
        }
    }

    // Check for regular bearish divergence (price higher highs, indicator lower highs)
    for (let i = 1; i < priceSwings.highs.length; i++) {
        const priceIdx1 = priceSwings.highs[i - 1];
        const priceIdx2 = priceSwings.highs[i];

        if (priceIdx2 - priceIdx1 > lookback) continue;

        const indHighs = indicatorSwings.highs.filter(idx => idx >= priceIdx1 - 3 && idx <= priceIdx2 + 3);

        if (indHighs.length >= 2) {
            const indIdx1 = indHighs[0];
            const indIdx2 = indHighs[indHighs.length - 1];

            // Regular bearish divergence: price HH, indicator LH
            if (prices[priceIdx2] > prices[priceIdx1] &&
                indicatorData[indIdx2] < indicatorData[indIdx1]) {
                divergences.push({
                    startIndex: priceIdx1,
                    endIndex: priceIdx2,
                    type: 'regular_bearish',
                    indicator: indicatorName,
                    priceStart: prices[priceIdx1],
                    priceEnd: prices[priceIdx2],
                    indicatorStart: indicatorData[indIdx1],
                    indicatorEnd: indicatorData[indIdx2]
                });
            }
        }
    }

    return divergences;
}
