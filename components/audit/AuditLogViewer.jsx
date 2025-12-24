import AuditLogTable from './AuditLogTable';

export default function AuditLogViewer({ logs }) {
  return (
    <div className="space-y-4">
      <AuditLogTable logs={logs} />
    </div>
  );
}