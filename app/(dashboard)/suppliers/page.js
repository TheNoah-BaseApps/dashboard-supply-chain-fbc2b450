'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SupplierTable from '@/components/suppliers/SupplierTable';
import SupplierDialog from '@/components/suppliers/SupplierDialog';
import BulkImportDialog from '@/components/suppliers/BulkImportDialog';
import ExportButton from '@/components/shared/ExportButton';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/suppliers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch suppliers');

      const data = await res.json();
      setSuppliers(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError(err.message);
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setShowAddDialog(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete supplier');

      toast.success('Supplier deleted successfully');
      fetchSuppliers();
    } catch (err) {
      console.error('Error deleting supplier:', err);
      toast.error('Failed to delete supplier');
    }
  };

  const handleDialogClose = (success) => {
    setShowAddDialog(false);
    setSelectedSupplier(null);
    if (success) {
      fetchSuppliers();
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/suppliers/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suppliers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Suppliers exported successfully');
    } catch (err) {
      console.error('Error exporting suppliers:', err);
      toast.error('Failed to export suppliers');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-2">Manage supplier information and contacts</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowImportDialog(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <ExportButton onClick={handleExport} />
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SupplierTable
        suppliers={suppliers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <SupplierDialog
        open={showAddDialog}
        onClose={handleDialogClose}
        supplier={selectedSupplier}
      />

      <BulkImportDialog
        open={showImportDialog}
        onClose={(success) => {
          setShowImportDialog(false);
          if (success) fetchSuppliers();
        }}
      />
    </div>
  );
}