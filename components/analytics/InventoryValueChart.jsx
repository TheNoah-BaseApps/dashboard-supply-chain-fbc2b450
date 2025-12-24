import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export default function InventoryValueChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Inventory Value Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Value</span>
                <span className="text-lg font-bold">
                  ${(data.total_value || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Item Value</span>
                <span className="text-lg font-semibold">
                  ${(data.average_value || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Items Tracked</span>
                <span className="text-lg font-semibold">
                  {data.item_count || 0}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}