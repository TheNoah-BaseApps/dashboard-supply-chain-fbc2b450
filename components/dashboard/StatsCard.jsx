import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, variant = 'default' }) {
  const isPositive = trend && parseFloat(trend) > 0;
  const isNegative = trend && parseFloat(trend) < 0;

  const variantColors = {
    default: 'text-blue-600 bg-blue-100',
    warning: 'text-yellow-600 bg-yellow-100',
    danger: 'text-red-600 bg-red-100',
    success: 'text-green-600 bg-green-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            {trend !== undefined && trend !== null && (
              <div className="flex items-center gap-1 mt-2">
                {isPositive && <TrendingUp className="h-4 w-4 text-green-600" />}
                {isNegative && <TrendingDown className="h-4 w-4 text-red-600" />}
                <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                  {Math.abs(parseFloat(trend) || 0).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${variantColors[variant]}`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}