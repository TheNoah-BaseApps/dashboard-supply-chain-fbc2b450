'use client';

import DataTable from '@/components/shared/DataTable';
import ValidationBadge from './ValidationBadge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function ValidationTable({ validations, onResolve }) {
  const columns = [
    {
      key: 'workflow',
      label: 'Workflow',
      sortable: true,
      render: (value) => <span className="capitalize">{value}</span>
    },
    {
      key: 'field',
      label: 'Field',
      sortable: true,
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (value) => <ValidationBadge severity={value} />
    },
    {
      key: 'message',
      label: 'Message',
    },
    {
      key: 'resolved',
      label: 'Status',
      render: (value) => (
        <span className={value ? 'text-green-600' : 'text-yellow-600'}>
          {value ? 'Resolved' : 'Pending'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => !row.resolved && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onResolve(row.id)}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Resolve
        </Button>
      )
    }
  ];

  return (
    <DataTable
      data={validations}
      columns={columns}
      searchPlaceholder="Search validations..."
      emptyMessage="No validation issues found. All data is valid!"
    />
  );
}