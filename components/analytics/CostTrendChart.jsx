import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function CostTrendChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Cost Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
          <div className="text-center text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Cost trend analysis</p>
            <p className="text-xs">Historical data visualization</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}