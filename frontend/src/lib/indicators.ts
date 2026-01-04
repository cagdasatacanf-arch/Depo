import { StockData } from './api';

/**
 * Technical Indicators Calculation Library
 * Provides functions to calculate common stock market indicators
 */

// Simple Moving Average (SMA)
export function calculateSMA(data: StockData[], period: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      result.push(sum / period);
    }
  }

  return result;
}

// Exponential Moving Average (EMA)
export function calculateEMA(data: StockData[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
    result.push(NaN);
  }
  result[period - 1] = sum / period;

  // Calculate EMA for remaining points
  for (let i = period; i < data.length; i++) {
    const ema = (data[i].close - result[i - 1]) * multiplier + result[i - 1];
    result.push(ema);
  }

  return result;
}

// Relative Strength Index (RSI)
export function calculateRSI(data: StockData[], period: number = 14): number[] {
  const result: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      gains.push(0);
      losses.push(0);
      result.push(NaN);
    } else {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);

      if (i < period) {
        result.push(NaN);
      } else if (i === period) {
        // First RSI calculation
        const avgGain = gains.slice(1, period + 1).reduce((a, b) => a + b) / period;
        const avgLoss = losses.slice(1, period + 1).reduce((a, b) => a + b) / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      } else {
        // Smoothed RSI
        const prevAvgGain = ((result[i - 1] * (period - 1)) + gains[i]) / period;
        const prevAvgLoss = (((100 - result[i - 1]) * (period - 1)) + losses[i]) / period;
        const rs = prevAvgLoss === 0 ? 100 : prevAvgGain / prevAvgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    }
  }

  return result;
}

// MACD (Moving Average Convergence Divergence)
export interface MACDResult {
  macd: number[];
  signal: number[];
  histogram: number[];
}

export function calculateMACD(
  data: StockData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  // Calculate MACD line
  const macdLine = fastEMA.map((fast, i) => {
    if (isNaN(fast) || isNaN(slowEMA[i])) return NaN;
    return fast - slowEMA[i];
  });

  // Calculate Signal line (EMA of MACD)
  const signal: number[] = [];
  const multiplier = 2 / (signalPeriod + 1);

  let firstValidIndex = macdLine.findIndex(val => !isNaN(val));
  let sum = 0;
  let count = 0;

  for (let i = 0; i < macdLine.length; i++) {
    if (i < firstValidIndex + signalPeriod - 1) {
      if (!isNaN(macdLine[i])) {
        sum += macdLine[i];
        count++;
      }
      signal.push(NaN);
    } else if (i === firstValidIndex + signalPeriod - 1) {
      signal.push(sum / count);
    } else {
      const sig = (macdLine[i] - signal[i - 1]) * multiplier + signal[i - 1];
      signal.push(sig);
    }
  }

  // Calculate Histogram
  const histogram = macdLine.map((macd, i) => {
    if (isNaN(macd) || isNaN(signal[i])) return NaN;
    return macd - signal[i];
  });

  return { macd: macdLine, signal, histogram };
}

// Bollinger Bands
export interface BollingerBandsResult {
  upper: number[];
  middle: number[];
  lower: number[];
}

export function calculateBollingerBands(
  data: StockData[],
  period: number = 20,
  stdDev: number = 2
): BollingerBandsResult {
  const middle = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      // Calculate standard deviation
      const prices = data.slice(i - period + 1, i + 1).map(d => d.close);
      const mean = middle[i];
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const sd = Math.sqrt(variance);

      upper.push(mean + (stdDev * sd));
      lower.push(mean - (stdDev * sd));
    }
  }

  return { upper, middle, lower };
}

// Add indicators to data
export function addIndicatorsToData(data: StockData[], indicators: {
  sma20?: boolean;
  sma50?: boolean;
  sma200?: boolean;
  ema20?: boolean;
  rsi?: boolean;
  macd?: boolean;
  bollinger?: boolean;
  stochastic?: boolean;
  atr?: boolean;
  adx?: boolean;
  cci?: boolean;
  obv?: boolean;
  vwap?: boolean;
  sar?: boolean;
  supertrend?: boolean;
}) {
  const enrichedData = data.map((item, index) => ({ ...item })) as any[];

  // Moving Averages
  if (indicators.sma20) {
    const sma20 = calculateSMA(data, 20);
    enrichedData.forEach((item, i) => item.sma20 = sma20[i]);
  }

  if (indicators.sma50) {
    const sma50 = calculateSMA(data, 50);
    enrichedData.forEach((item, i) => item.sma50 = sma50[i]);
  }

  if (indicators.sma200) {
    const sma200 = calculateSMA(data, 200);
    enrichedData.forEach((item, i) => item.sma200 = sma200[i]);
  }

  if (indicators.ema20) {
    const ema20 = calculateEMA(data, 20);
    enrichedData.forEach((item, i) => item.ema20 = ema20[i]);
  }

  // Momentum Oscillators
  if (indicators.rsi) {
    const rsi = calculateRSI(data, 14);
    enrichedData.forEach((item, i) => item.rsi = rsi[i]);
  }

  if (indicators.macd) {
    const macd = calculateMACD(data);
    enrichedData.forEach((item, i) => {
      item.macd = macd.macd[i];
      item.macdSignal = macd.signal[i];
      item.macdHistogram = macd.histogram[i];
    });
  }

  if (indicators.stochastic) {
    const stochastic = calculateStochastic(data);
    enrichedData.forEach((item, i) => {
      item.stochK = stochastic.k[i];
      item.stochD = stochastic.d[i];
    });
  }

  if (indicators.cci) {
    const cci = calculateCCI(data);
    enrichedData.forEach((item, i) => item.cci = cci[i]);
  }

  // Trend & Volatility
  if (indicators.bollinger) {
    const bollinger = calculateBollingerBands(data);
    enrichedData.forEach((item, i) => {
      item.bbUpper = bollinger.upper[i];
      item.bbMiddle = bollinger.middle[i];
      item.bbLower = bollinger.lower[i];
    });
  }

  if (indicators.atr) {
    const atr = calculateATR(data);
    enrichedData.forEach((item, i) => item.atr = atr[i]);
  }

  if (indicators.adx) {
    const adx = calculateADX(data);
    enrichedData.forEach((item, i) => {
      item.adx = adx.adx[i];
      item.plusDI = adx.plusDI[i];
      item.minusDI = adx.minusDI[i];
    });
  }

  if (indicators.sar) {
    const sar = calculateParabolicSAR(data);
    enrichedData.forEach((item, i) => item.sar = sar[i]);
  }

  // Volume & Price Action
  if (indicators.obv) {
    const obv = calculateOBV(data);
    enrichedData.forEach((item, i) => item.obv = obv[i]);
  }

  if (indicators.vwap) {
    const vwap = calculateVWAP(data);
    enrichedData.forEach((item, i) => item.vwap = vwap[i]);
  }

  if (indicators.supertrend) {
    const st = calculateSupertrend(data);
    enrichedData.forEach((item, i) => {
      item.supertrend = st.supertrend[i];
      item.supertrendBullish = st.trend[i];
    });
  }

  return enrichedData;
}

// Stochastic Oscillator
export interface StochasticResult {
  k: number[];
  d: number[];
}

export function calculateStochastic(
  data: StockData[],
  kPeriod: number = 14,
  dPeriod: number = 3
): StochasticResult {
  const k: number[] = [];
  const d: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < kPeriod - 1) {
      k.push(NaN);
      d.push(NaN);
    } else {
      const slice = data.slice(i - kPeriod + 1, i + 1);
      const highest = Math.max(...slice.map(item => item.high));
      const lowest = Math.min(...slice.map(item => item.low));
      const current = data[i].close;

      const kValue = lowest === highest ? 50 : ((current - lowest) / (highest - lowest)) * 100;
      k.push(kValue);

      // Calculate %D (SMA of %K)
      if (i < kPeriod + dPeriod - 2) {
        d.push(NaN);
      } else {
        const kSlice = k.slice(i - dPeriod + 1, i + 1).filter(val => !isNaN(val));
        const dValue = kSlice.reduce((sum, val) => sum + val, 0) / kSlice.length;
        d.push(dValue);
      }
    }
  }

  return { k, d };
}

// Average True Range (ATR)
export function calculateATR(data: StockData[], period: number = 14): number[] {
  const tr: number[] = [];
  const atr: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      tr.push(data[i].high - data[i].low);
      atr.push(NaN);
    } else {
      const trValue = Math.max(
        data[i].high - data[i].low,
        Math.abs(data[i].high - data[i - 1].close),
        Math.abs(data[i].low - data[i - 1].close)
      );
      tr.push(trValue);

      if (i < period) {
        atr.push(NaN);
      } else if (i === period) {
        const sum = tr.slice(1, period + 1).reduce((a, b) => a + b, 0);
        atr.push(sum / period);
      } else {
        const prevATR = atr[i - 1];
        const currentATR = (prevATR * (period - 1) + tr[i]) / period;
        atr.push(currentATR);
      }
    }
  }

  return atr;
}

// Average Directional Index (ADX)
export interface ADXResult {
  adx: number[];
  plusDI: number[];
  minusDI: number[];
}

export function calculateADX(data: StockData[], period: number = 14): ADXResult {
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const tr: number[] = [];
  const plusDI: number[] = [];
  const minusDI: number[] = [];
  const dx: number[] = [];
  const adx: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      plusDM.push(0);
      minusDM.push(0);
      tr.push(data[i].high - data[i].low);
      plusDI.push(NaN);
      minusDI.push(NaN);
      dx.push(NaN);
      adx.push(NaN);
    } else {
      const highDiff = data[i].high - data[i - 1].high;
      const lowDiff = data[i - 1].low - data[i].low;

      plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
      minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);

      const trValue = Math.max(
        data[i].high - data[i].low,
        Math.abs(data[i].high - data[i - 1].close),
        Math.abs(data[i].low - data[i - 1].close)
      );
      tr.push(trValue);

      if (i < period) {
        plusDI.push(NaN);
        minusDI.push(NaN);
        dx.push(NaN);
        adx.push(NaN);
      } else {
        const smoothPlusDM = i === period
          ? plusDM.slice(1, period + 1).reduce((a, b) => a + b, 0)
          : plusDI[i - 1] - (plusDI[i - 1] / period) + plusDM[i];

        const smoothMinusDM = i === period
          ? minusDM.slice(1, period + 1).reduce((a, b) => a + b, 0)
          : minusDI[i - 1] - (minusDI[i - 1] / period) + minusDM[i];

        const smoothTR = i === period
          ? tr.slice(1, period + 1).reduce((a, b) => a + b, 0)
          : (tr[i - 1] * (period - 1) + tr[i]) / period;

        const pdi = (smoothPlusDM / smoothTR) * 100;
        const mdi = (smoothMinusDM / smoothTR) * 100;

        plusDI.push(pdi);
        minusDI.push(mdi);

        const dxValue = Math.abs(pdi - mdi) / (pdi + mdi) * 100;
        dx.push(dxValue);

        if (i < period * 2 - 1) {
          adx.push(NaN);
        } else if (i === period * 2 - 1) {
          const adxValue = dx.slice(period, period * 2).reduce((a, b) => a + b, 0) / period;
          adx.push(adxValue);
        } else {
          const adxValue = (adx[i - 1] * (period - 1) + dx[i]) / period;
          adx.push(adxValue);
        }
      }
    }
  }

  return { adx, plusDI, minusDI };
}

// Commodity Channel Index (CCI)
export function calculateCCI(data: StockData[], period: number = 20): number[] {
  const cci: number[] = [];
  const typicalPrice = data.map(d => (d.high + d.low + d.close) / 3);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      cci.push(NaN);
    } else {
      const slice = typicalPrice.slice(i - period + 1, i + 1);
      const sma = slice.reduce((a, b) => a + b, 0) / period;
      const meanDeviation = slice.reduce((sum, val) => sum + Math.abs(val - sma), 0) / period;
      const cciValue = (typicalPrice[i] - sma) / (0.015 * meanDeviation);
      cci.push(cciValue);
    }
  }

  return cci;
}

// On-Balance Volume (OBV)
export function calculateOBV(data: StockData[]): number[] {
  const obv: number[] = [];
  let cumulative = 0;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      obv.push(data[i].volume);
      cumulative = data[i].volume;
    } else {
      if (data[i].close > data[i - 1].close) {
        cumulative += data[i].volume;
      } else if (data[i].close < data[i - 1].close) {
        cumulative -= data[i].volume;
      }
      obv.push(cumulative);
    }
  }

  return obv;
}

// VWAP (Volume Weighted Average Price)
export function calculateVWAP(data: StockData[]): number[] {
  const vwap: number[] = [];
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;

  for (let i = 0; i < data.length; i++) {
    const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
    const tpv = typicalPrice * data[i].volume;
    cumulativeTPV += tpv;
    cumulativeVolume += data[i].volume;
    vwap.push(cumulativeTPV / cumulativeVolume);
  }

  return vwap;
}

// Parabolic SAR
export function calculateParabolicSAR(
  data: StockData[],
  acceleration: number = 0.02,
  maximum: number = 0.2
): number[] {
  const sar: number[] = [];
  let isUptrend = true;
  let af = acceleration;
  let ep = data[0].high;
  let sarValue = data[0].low;

  sar.push(NaN);

  for (let i = 1; i < data.length; i++) {
    sar.push(sarValue);

    if (isUptrend) {
      sarValue = sarValue + af * (ep - sarValue);
      if (data[i].low < sarValue) {
        isUptrend = false;
        sarValue = ep;
        ep = data[i].low;
        af = acceleration;
      } else {
        if (data[i].high > ep) {
          ep = data[i].high;
          af = Math.min(af + acceleration, maximum);
        }
      }
    } else {
      sarValue = sarValue - af * (sarValue - ep);
      if (data[i].high > sarValue) {
        isUptrend = true;
        sarValue = ep;
        ep = data[i].high;
        af = acceleration;
      } else {
        if (data[i].low < ep) {
          ep = data[i].low;
          af = Math.min(af + acceleration, maximum);
        }
      }
    }
  }

  return sar;
}

// Supertrend Indicator
export interface SupertrendResult {
  supertrend: number[];
  trend: boolean[]; // true = bullish, false = bearish
}

export function calculateSupertrend(
  data: StockData[],
  period: number = 10,
  multiplier: number = 3
): SupertrendResult {
  const atr = calculateATR(data, period);
  const supertrend: number[] = [];
  const trend: boolean[] = [];

  let upperBand: number[] = [];
  let lowerBand: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const hl2 = (data[i].high + data[i].low) / 2;

    if (isNaN(atr[i])) {
      supertrend.push(NaN);
      trend.push(true);
      upperBand.push(NaN);
      lowerBand.push(NaN);
      continue;
    }

    // Calculate basic upper and lower bands
    const basicUpperBand = hl2 + (multiplier * atr[i]);
    const basicLowerBand = hl2 - (multiplier * atr[i]);

    // Calculate final bands considering previous values
    let finalUpperBand = basicUpperBand;
    let finalLowerBand = basicLowerBand;

    if (i > 0 && !isNaN(upperBand[i - 1])) {
      finalUpperBand = basicUpperBand < upperBand[i - 1] || data[i - 1].close > upperBand[i - 1]
        ? basicUpperBand
        : upperBand[i - 1];

      finalLowerBand = basicLowerBand > lowerBand[i - 1] || data[i - 1].close < lowerBand[i - 1]
        ? basicLowerBand
        : lowerBand[i - 1];
    }

    upperBand.push(finalUpperBand);
    lowerBand.push(finalLowerBand);

    // Determine trend and Supertrend value
    let currentTrend = true; // bullish by default
    let stValue = finalLowerBand;

    if (i > 0) {
      if (trend[i - 1]) {
        // Was bullish
        if (data[i].close <= finalLowerBand) {
          currentTrend = false;
          stValue = finalUpperBand;
        } else {
          currentTrend = true;
          stValue = finalLowerBand;
        }
      } else {
        // Was bearish
        if (data[i].close >= finalUpperBand) {
          currentTrend = true;
          stValue = finalLowerBand;
        } else {
          currentTrend = false;
          stValue = finalUpperBand;
        }
      }
    }

    supertrend.push(stValue);
    trend.push(currentTrend);
  }

  return { supertrend, trend };
}

// Heikin Ashi Transformation
export function transformToHeikinAshi(data: StockData[]): StockData[] {
  const heikinAshi: StockData[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      // First candle is the same
      heikinAshi.push({ ...data[i] });
    } else {
      const prevHA = heikinAshi[i - 1];

      // HA Close = (Open + High + Low + Close) / 4
      const haClose = (data[i].open + data[i].high + data[i].low + data[i].close) / 4;

      // HA Open = (Previous HA Open + Previous HA Close) / 2
      const haOpen = (prevHA.open + prevHA.close) / 2;

      // HA High = Max(High, HA Open, HA Close)
      const haHigh = Math.max(data[i].high, haOpen, haClose);

      // HA Low = Min(Low, HA Open, HA Close)
      const haLow = Math.min(data[i].low, haOpen, haClose);

      heikinAshi.push({
        ...data[i],
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose,
      });
    }
  }

  return heikinAshi;
}
