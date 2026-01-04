const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DataQualityIssue {
  severity: string;
  category: string;
  message: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface DataQuality {
  is_valid: boolean;
  total_issues: number;
  errors: number;
  warnings: number;
  info: number;
  issues: DataQualityIssue[];
}

export interface StockMetadata {
  total_records: number;
  period: string;
  interval: string;
  fetched_at: string;
  start_date: string;
  end_date: string;
}

export interface StockResponse {
  status: string;
  ticker: string;
  data: StockData[];
  count: number;
  data_quality?: DataQuality;
  metadata?: StockMetadata;
}

export interface StocksListResponse {
  status: string;
  tickers: string[];
  count: number;
}

export const api = {
  // Get all available stocks
  async getStocks(): Promise<StocksListResponse> {
    try {
      const res = await fetch(`${API_URL}/api/stocks`);
      if (!res.ok) throw new Error('Failed to fetch stocks');
      return res.json();
    } catch (error) {
      console.error('Error fetching stocks:', error);
      throw error;
    }
  },

  // Get historical data for a stock (default 90 days)
  async getStockData(ticker: string, days: number = 90): Promise<StockResponse> {
    try {
      const res = await fetch(`${API_URL}/api/stocks/${ticker}?days=${days}`);
      if (!res.ok) throw new Error(`Failed to fetch data for ${ticker}`);
      return res.json();
    } catch (error) {
      console.error(`Error fetching ${ticker}:`, error);
      throw error;
    }
  },

  // Get latest price for a stock
  async getLatestPrice(ticker: string) {
    try {
      const res = await fetch(`${API_URL}/api/stocks/${ticker}/latest`);
      if (!res.ok) throw new Error(`Failed to fetch latest price for ${ticker}`);
      return res.json();
    } catch (error) {
      console.error(`Error fetching latest price for ${ticker}:`, error);
      throw error;
    }
  },

  // Health check
  async health() {
    try {
      const res = await fetch(`${API_URL}/api/health`);
      return res.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};
