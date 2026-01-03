import { useState, useEffect } from 'react';
import { api, StockResponse, StocksListResponse } from '@/lib/api';

export function useStocks() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const data = await api.getStocks();
        setTickers(data.tickers);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stocks');
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  return { tickers, loading, error };
}

export function useStockData(ticker: string, days: number = 90) {
  const [data, setData] = useState<StockResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.getStockData(ticker, days);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, days]);

  return { data, loading, error };
}
