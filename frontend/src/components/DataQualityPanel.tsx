import { DataQuality, DataQualityIssue } from '@/lib/api';
import { useState } from 'react';

interface DataQualityPanelProps {
  quality: DataQuality;
  ticker: string;
  onClose: () => void;
}

export function DataQualityPanel({ quality, ticker, onClose }: DataQualityPanelProps) {
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);

  // Group issues by severity
  const errors = quality.issues.filter(i => i.severity === 'error');
  const warnings = quality.issues.filter(i => i.severity === 'warning');
  const info = quality.issues.filter(i => i.severity === 'info');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  const renderIssueGroup = (issues: DataQualityIssue[], title: string, severity: string) => {
    if (issues.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          {getSeverityIcon(severity)}
          {title} ({issues.length})
        </h3>
        <div className="space-y-2">
          {issues.map((issue, idx) => (
            <div
              key={idx}
              className={`border-2 rounded-lg overflow-hidden ${getSeverityColor(severity)}`}
            >
              <div
                className="p-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setExpandedIssue(expandedIssue === idx ? null : idx)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{issue.category.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-sm mt-1">{issue.message}</p>
                  </div>
                  <button className="ml-2 text-xs px-2 py-1 rounded bg-white bg-opacity-50">
                    {expandedIssue === idx ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {expandedIssue === idx && (
                <div className="px-3 pb-3 pt-2 bg-white bg-opacity-30 border-t border-current border-opacity-20">
                  <p className="text-xs font-semibold mb-2">Details:</p>
                  <pre className="text-xs bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(issue.details, null, 2)}
                  </pre>
                  <p className="text-xs mt-2 opacity-75">
                    Detected at: {new Date(issue.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Data Quality Report</h2>
              <p className="text-blue-100 mt-1">{ticker}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-white bg-opacity-20 rounded p-3">
              <p className="text-xs text-blue-100">Total Issues</p>
              <p className="text-2xl font-bold">{quality.total_issues}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded p-3">
              <p className="text-xs text-blue-100">Errors</p>
              <p className="text-2xl font-bold text-red-300">{quality.errors}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded p-3">
              <p className="text-xs text-blue-100">Warnings</p>
              <p className="text-2xl font-bold text-yellow-300">{quality.warnings}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded p-3">
              <p className="text-xs text-blue-100">Info</p>
              <p className="text-2xl font-bold text-blue-300">{quality.info}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {quality.total_issues === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✓</div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">All Good!</h3>
              <p className="text-gray-600">No data quality issues detected for {ticker}</p>
            </div>
          ) : (
            <>
              {renderIssueGroup(errors, 'Errors', 'error')}
              {renderIssueGroup(warnings, 'Warnings', 'warning')}
              {renderIssueGroup(info, 'Information', 'info')}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Click on any issue to see details
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
