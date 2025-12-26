'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import InventoryForm from './InventoryForm';
import { toast } from 'sonner';

export default function InventoryDialog({ open, onClose, item }) {
  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const url = item
        ? `/api/inventory/${item.id}`
        : '/api/inventory';
      const method = item ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save item');
      }

      toast.success(item ? 'Item updated successfully' : 'Item added successfully');
      onClose(true);
    } catch (err) {
      console.error('Error saving item:', err);
      toast.error(err.message);
      throw err;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Inventory Item' : 'Add New Item'}
          </DialogTitle>
        </DialogHeader>
        <InventoryForm
          item={item}
          onSubmit={handleSubmit}
          onCancel={() => onClose(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
