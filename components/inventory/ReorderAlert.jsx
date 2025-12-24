import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function ReorderAlert({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <Alert variant="warning" className="border-yellow-600 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-900">Low Stock Alert</AlertTitle>
      <AlertDescription className="text-yellow-800">
        {items.length} item{items.length > 1 ? 's are' : ' is'} at or below reorder level. 
        Consider placing orders for: {items.slice(0, 3).map(i => i.item_name).join(', ')}
        {items.length > 3 && ` and ${items.length - 3} more`}
      </AlertDescription>
    </Alert>
  );
}