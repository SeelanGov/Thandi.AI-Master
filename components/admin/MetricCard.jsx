'use client';

export default function MetricCard({ 
  label, 
  value, 
  trend, 
  status, 
  icon, 
  loading = false, 
  error = null,
  unit = '',
  subtitle = null
}) {
  // Status colors
  const statusColors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    critical: 'text-red-600 bg-red-50 border-red-200',
    stable: 'text-blue-600 bg-blue-50 border-blue-200',
    unknown: 'text-gray-600 bg-gray-50 border-gray-200',
  };

  const statusColor = statusColors[status] || statusColors.unknown;

  // Trend indicator
  const getTrendIndicator = () => {
    if (trend === null || trend === undefined || trend === 0) {
      return <span className="text-gray-400">→ 0%</span>;
    }
    
    const isPositive = trend > 0;
    const arrow = isPositive ? '↑' : '↓';
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <span className={color}>
        {arrow} {Math.abs(trend)}%
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center space-x-2 text-red-600 mb-2">
          <span className="text-2xl">⚠️</span>
          <h3 className="text-sm font-medium">{label}</h3>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${statusColor} p-6 transition-all hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">
          {value}
          {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Trend */}
      <div className="flex items-center space-x-2 text-sm">
        {getTrendIndicator()}
        <span className="text-gray-500">vs 24h ago</span>
      </div>
    </div>
  );
}
