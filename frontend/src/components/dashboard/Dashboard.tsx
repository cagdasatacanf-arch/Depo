import { useStocks, useStockData } from '@/hooks/useStocks';

export function Dashboard() {
  const [selectedTicker, setSelectedTicker] = useState('GOOGL');
  const { tickers, loading: loadingTickers } = useStocks();
  const { data: stockData, loading: loadingData } = useStockData(selectedTicker);

  if (loadingTickers) return <div>Loading stocks...</div>;

  return (
    <div>
      <select value={selectedTicker} onChange={(e) => setSelectedTicker(e.target.value)}>
        {tickers.map(ticker => (
          <option key={ticker} value={ticker}>{ticker}</option>
        ))}
      </select>

      {loadingData ? (
        <div>Loading data...</div>
      ) : stockData ? (
        <div>
          <h2>{selectedTicker}</h2>
          <p>Latest Price: ${stockData.data[0]?.close.toFixed(2)}</p>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Open</th>
                <th>High</th>
                <th>Low</th>
                <th>Close</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {stockData.data.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.date}</td>
                  <td>${row.open.toFixed(2)}</td>
                  <td>${row.high.toFixed(2)}</td>
                  <td>${row.low.toFixed(2)}</td>
                  <td className="font-bold">${row.close.toFixed(2)}</td>
                  <td>{(row.volume / 1000000).toFixed(1)}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
