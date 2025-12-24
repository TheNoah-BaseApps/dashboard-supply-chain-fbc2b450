'use client';

import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Mail, Phone } from 'lucide-react';

export default function SupplierTable({ suppliers, onEdit, onDelete }) {
  const columns = [
    {
      key: 'supplier_key',
      label: 'Supplier Key',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'supplier_name',
      label: 'Supplier Name',
      sortable: true,
    },
    {
      key: 'contact_name',
      label: 'Contact',
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          {row.contact_title && <p className="text-xs text-gray-500">{row.contact_title}</p>}
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => value ? (
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      ) : <span className="text-gray-400">-</span>
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => value ? (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      ) : <span className="text-gray-400">-</span>
    },
    {
      key: 'city',
      label: 'Location',
      render: (value, row) => (
        <div>
          <p>{value || '-'}</p>
          {row.country && <p className="text-xs text-gray-500">{row.country}</p>}
        </div>
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
      data={suppliers}
      columns={columns}
      searchPlaceholder="Search suppliers..."
      emptyMessage="No suppliers found. Add your first supplier to get started."
    />
  );
}