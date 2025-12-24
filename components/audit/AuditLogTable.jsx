'use client';

import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/shared/DataTable';

export default function AuditLogTable({ logs }) {
  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (value) => new Date(value).toLocaleString()
    },
    {
      key: 'user_name',
      label: 'User',
      render: (value, row) => (
        <div>
          <p className="font-medium">{value || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{row.user_email}</p>
        </div>
      )
    },
    {
      key: 'workflow',
      label: 'Workflow',
      sortable: true,
      render: (value) => <span className="capitalize">{value}</span>
    },
    {
      key: 'action',
      label: 'Action',
      render: (value) => (
        <Badge className={getActionColor(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'record_id',
      label: 'Record ID',
      render: (value) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {value.substring(0, 8)}...
        </code>
      )
    }
  ];

  return (
    <DataTable
      data={logs}
      columns={columns}
      searchPlaceholder="Search audit logs..."
      emptyMessage="No audit logs found."
    />
  );
}