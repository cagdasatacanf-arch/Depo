import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [stocks, setStocks] = useState([])
  const [selectedTicker, setSelectedTicker] = useState('GOOGL')
  const [stockData, setStockData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch available stocks on mount
  useEffect(() => {
    fetch('/api/stocks')
      .then(res => res.json())
      .then(data => {
        setStocks(data.tickers)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Fetch data for selected ticker
  useEffect(() => {
    if (selectedTicker) {
      fetch(`/api/stocks/${selectedTicker}?days=90`)
        .then(res => res.json())
        .then(data => {
          setStockData(data.data || [])
        })
        .catch(err => console.error(err))
    }
  }, [selectedTicker])

  return (
    <div className="container">
      <header className="header">
        <h1>📊 DEPO - Financial Dashboard</h1>
        <p className="subtitle">Real-time stock price tracking</p>
      </header>

      {error && <div className="error">❌ Error: {error}</div>}

      <div className="controls">
        <label>Select Stock:</label>
        <select 
          value={selectedTicker} 
          onChange={(e) => setSelectedTicker(e.target.value)}
          className="select"
        >
          {stocks.map(ticker => (
            <option key={ticker} value={ticker}>{ticker}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="loading">⏳ Loading stock data...</p>
      ) : (
        <div className="data-section">
          <h2>{selectedTicker} - Last 90 Days</h2>
          <div className="table-wrapper">
            <table className="stock-table">
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
                {stockData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date}</td>
                    <td className="number">${row.open.toFixed(2)}</td>
                    <td className="number">${row.high.toFixed(2)}</td>
                    <td className="number">${row.low.toFixed(2)}</td>
                    <td className="number bold">${row.close.toFixed(2)}</td>
                    <td className="number">{(row.volume / 1000000).toFixed(1)}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="data-count">📈 Showing {stockData.length} trading days</p>
        </div>
      )}
    </div>
  )
}

export default App
