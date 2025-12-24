'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SupplierForm from './SupplierForm';
import { toast } from 'sonner';

export default function SupplierDialog({ open, onClose, supplier }) {
  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const url = supplier
        ? `/api/suppliers/${supplier.id}`
        : '/api/suppliers';
      const method = supplier ? 'PUT' : 'POST';

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
        throw new Error(data.error || 'Failed to save supplier');
      }

      toast.success(supplier ? 'Supplier updated successfully' : 'Supplier added successfully');
      onClose(true);
    } catch (err) {
      console.error('Error saving supplier:', err);
      toast.error(err.message);
      throw err;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Edit Supplier' : 'Add New Supplier'}
          </DialogTitle>
        </DialogHeader>
        <SupplierForm
          supplier={supplier}
          onSubmit={handleSubmit}
          onCancel={() => onClose(false)}
        />
      </DialogContent>
    </Dialog>
  );
}