/**
 * Chart Templates - Pre-configured indicator sets for different analysis types
 */

export interface ChartTemplate {
  name: string;
  description: string;
  indicators: {
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
  };
  chartTypes: string[];
}

export const chartTemplates: Record<string, ChartTemplate> = {
  clean: {
    name: 'Clean Chart',
    description: 'Price action only, no indicators',
    indicators: {},
    chartTypes: ['price', 'volume'],
  },

  trending: {
    name: 'Trend Analysis',
    description: 'Moving averages and trend indicators',
    indicators: {
      sma20: true,
      sma50: true,
      sma200: true,
      adx: true,
    },
    chartTypes: ['price', 'adx', 'volume'],
  },

  momentum: {
    name: 'Momentum Trading',
    description: 'RSI, MACD, and momentum oscillators',
    indicators: {
      ema20: true,
      rsi: true,
      macd: true,
      stochastic: true,
    },
    chartTypes: ['price', 'rsi', 'macd', 'stochastic'],
  },

  volatility: {
    name: 'Volatility Analysis',
    description: 'Bollinger Bands and ATR for volatility',
    indicators: {
      bollinger: true,
      atr: true,
      cci: true,
    },
    chartTypes: ['price', 'atr', 'cci'],
  },

  dayTrading: {
    name: 'Day Trading',
    description: 'Quick signals for intraday trading',
    indicators: {
      ema20: true,
      vwap: true,
      rsi: true,
      macd: true,
    },
    chartTypes: ['price', 'rsi', 'macd', 'volume'],
  },

  swingTrading: {
    name: 'Swing Trading',
    description: 'Multi-day trend following',
    indicators: {
      sma20: true,
      sma50: true,
      bollinger: true,
      macd: true,
      adx: true,
    },
    chartTypes: ['price', 'macd', 'adx'],
  },

  complete: {
    name: 'Complete Analysis',
    description: 'All major indicators enabled',
    indicators: {
      sma20: true,
      sma50: true,
      ema20: true,
      bollinger: true,
      rsi: true,
      macd: true,
      stochastic: true,
      atr: true,
      adx: true,
      vwap: true,
    },
    chartTypes: ['price', 'rsi', 'macd', 'stochastic', 'atr', 'adx', 'volume'],
  },

  scalping: {
    name: 'Scalping',
    description: 'Very short-term trading signals',
    indicators: {
      ema20: true,
      vwap: true,
      sar: true,
      stochastic: true,
    },
    chartTypes: ['candlestick', 'stochastic', 'volume'],
  },

  breakout: {
    name: 'Breakout Trading',
    description: 'Identify volatility breakouts',
    indicators: {
      bollinger: true,
      atr: true,
      obv: true,
      adx: true,
    },
    chartTypes: ['price', 'atr', 'obv', 'adx'],
  },

  reversal: {
    name: 'Reversal Detection',
    description: 'Spot trend reversals early',
    indicators: {
      rsi: true,
      macd: true,
      stochastic: true,
      cci: true,
    },
    chartTypes: ['price', 'rsi', 'macd', 'stochastic', 'cci'],
  },
};

export function getTemplateNames(): string[] {
  return Object.keys(chartTemplates);
}

export function getTemplate(name: string): ChartTemplate | undefined {
  return chartTemplates[name];
}

export function applyTemplate(templateName: string): ChartTemplate['indicators'] {
  const template = chartTemplates[templateName];
  return template ? template.indicators : {};
}
