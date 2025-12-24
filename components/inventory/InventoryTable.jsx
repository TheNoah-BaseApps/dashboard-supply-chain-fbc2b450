'use client';

import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';

export default function InventoryTable({ items, onEdit, onDelete }) {
  const columns = [
    {
      key: 'item_id',
      label: 'Item ID',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'item_name',
      label: 'Item Name',
      sortable: true,
    },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      render: (value, row) => {
        const qty = parseInt(value) || 0;
        const reorderLevel = parseInt(row.reorder_level) || 0;
        const isLow = qty <= reorderLevel;
        
        return (
          <div className="flex items-center gap-2">
            {isLow && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
            <span className={isLow ? 'text-yellow-600 font-medium' : ''}>
              {qty}
            </span>
          </div>
        );
      }
    },
    {
      key: 'reorder_level',
      label: 'Reorder Level',
      sortable: true,
    },
    {
      key: 'current_cost_per_unit',
      label: 'Cost/Unit',
      sortable: true,
      render: (value) => `$${parseFloat(value || 0).toFixed(2)}`
    },
    {
      key: 'total_inventory_value',
      label: 'Total Value',
      sortable: true,
      render: (value) => `$${parseFloat(value || 0).toFixed(2)}`
    },
    {
      key: 'order_status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Ordered' : 'In Stock'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(row.id)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      data={items}
      columns={columns}
      searchPlaceholder="Search inventory..."
      emptyMessage="No inventory items found. Add your first item to get started."
    />
  );
}