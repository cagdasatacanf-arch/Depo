import { useState } from 'react';
import { useStocks, useStockData } from '@/hooks/useStocks';
import { StockChartsAdvanced } from './StockChartsAdvanced';
import { DataQualityBadge } from './DataQualityBadge';
import { DataQualityPanel } from './DataQualityPanel';

export function Dashboard() {
  const [selectedTicker, setSelectedTicker] = useState('GOOGL');
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');
  const [days, setDays] = useState(90);
  const [showQualityPanel, setShowQualityPanel] = useState(false);
  const { tickers, loading: loadingTickers, error: tickersError } = useStocks();
  const { data: stockData, loading: loadingData, error: dataError } = useStockData(selectedTicker, days);

  if (loadingTickers) {
    return <div className="p-4">Loading stocks...</div>;
  }

  if (tickersError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="text-red-800 font-semibold">Error loading stocks</h3>
        <p className="text-red-600">{tickersError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Panel */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stock Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Stock:
            </label>
            <select
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {tickers.map((ticker) => (
                <option key={ticker} value={ticker}>
                  {ticker}
                </option>
              ))}
            </select>
          </div>

          {/* Time Period Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period:
            </label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
              <option value={180}>6 Months</option>
              <option value={365}>1 Year</option>
              <option value={730}>2 Years</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Mode:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('charts')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'charts'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Charts
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Display */}
      {loadingData ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      ) : stockData ? (
        <>
          {/* Data Quality Badge */}
          {stockData.data_quality && (
            <div className="flex justify-center">
              <DataQualityBadge
                quality={stockData.data_quality}
                onClick={() => setShowQualityPanel(true)}
              />
            </div>
          )}

          {/* Charts View */}
          {viewMode === 'charts' && (
            <StockChartsAdvanced data={stockData.data} ticker={selectedTicker} />
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">{selectedTicker}</h2>
                <p className="text-blue-100">
                  Latest Price: $
                  {stockData.data[0]?.close.toFixed(2) || 'N/A'}
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Open
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        High
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Low
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Close
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Volume
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stockData.data.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          ${row.open.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          ${row.high.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          ${row.low.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${row.close.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {(row.volume / 1000000).toFixed(1)}M
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {stockData.count} trading days
                </p>
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Data Quality Panel Modal */}
      {showQualityPanel && stockData?.data_quality && (
        <DataQualityPanel
          quality={stockData.data_quality}
          ticker={selectedTicker}
          onClose={() => setShowQualityPanel(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
