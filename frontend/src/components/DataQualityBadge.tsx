import { DataQuality } from '@/lib/api';

interface DataQualityBadgeProps {
  quality: DataQuality;
  onClick?: () => void;
}

export function DataQualityBadge({ quality, onClick }: DataQualityBadgeProps) {
  // Determine badge color based on severity
  const getBadgeColor = () => {
    if (quality.errors > 0) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    if (quality.warnings > 0) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
    if (quality.info > 0) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getStatusText = () => {
    if (quality.errors > 0) return 'Data Issues Detected';
    if (quality.warnings > 0) return 'Data Warnings';
    if (quality.info > 0) return 'Data Info';
    return 'Data Quality Good';
  };

  const getStatusIcon = () => {
    if (quality.errors > 0) return '⚠️';
    if (quality.warnings > 0) return '⚡';
    if (quality.info > 0) return 'ℹ️';
    return '✓';
  };

  return (
    <div
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2
        ${getBadgeColor()}
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
      `}
    >
      <span className="text-lg">{getStatusIcon()}</span>
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{getStatusText()}</span>
        <div className="flex gap-2 text-xs">
          {quality.errors > 0 && (
            <span>Errors: {quality.errors}</span>
          )}
          {quality.warnings > 0 && (
            <span>Warnings: {quality.warnings}</span>
          )}
          {quality.info > 0 && (
            <span>Info: {quality.info}</span>
          )}
          {quality.total_issues === 0 && (
            <span>No issues found</span>
          )}
        </div>
      </div>
      {onClick && (
        <span className="text-xs ml-2">Click for details</span>
      )}
    </div>
  );
}
