'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InventoryTable from '@/components/inventory/InventoryTable';
import InventoryDialog from '@/components/inventory/InventoryDialog';
import ReorderAlert from '@/components/inventory/ReorderAlert';
import ExportButton from '@/components/shared/ExportButton';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [reorderItems, setReorderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchInventory();
    fetchReorderRecommendations();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch inventory');

      const data = await res.json();
      setItems(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.message);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchReorderRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/inventory/reorder-recommendations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setReorderItems(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching reorder recommendations:', err);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowAddDialog(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete item');

      toast.success('Item deleted successfully');
      fetchInventory();
      fetchReorderRecommendations();
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Failed to delete item');
    }
  };

  const handleDialogClose = (success) => {
    setShowAddDialog(false);
    setSelectedItem(null);
    if (success) {
      fetchInventory();
      fetchReorderRecommendations();
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/inventory/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Inventory exported successfully');
    } catch (err) {
      console.error('Error exporting inventory:', err);
      toast.error('Failed to export inventory');
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
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-2">Manage inventory items and stock levels</p>
        </div>
        <div className="flex gap-2">
          <ExportButton onClick={handleExport} />
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {reorderItems.length > 0 && (
        <ReorderAlert items={reorderItems} />
      )}

      <InventoryTable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <InventoryDialog
        open={showAddDialog}
        onClose={handleDialogClose}
        item={selectedItem}
      />
    </div>
  );
}