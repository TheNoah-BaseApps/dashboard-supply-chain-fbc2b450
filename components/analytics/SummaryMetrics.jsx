import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, TrendingUp, AlertTriangle } from 'lucide-react';

export default function SummaryMetrics({ summary }) {
  const metrics = [
    {
      title: 'Total Suppliers',
      value: summary?.total_suppliers || 0,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Total Items',
      value: summary?.total_items || 0,
      icon: Package,
      color: 'text-green-600'
    },
    {
      title: 'Inventory Value',
      value: `$${(summary?.total_inventory_value || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      title: 'Low Stock Items',
      value: summary?.low_stock_count || 0,
      icon: AlertTriangle,
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}