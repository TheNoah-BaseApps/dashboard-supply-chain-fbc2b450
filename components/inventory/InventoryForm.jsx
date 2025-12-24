'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function InventoryForm({ item, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    item_id: '',
    item_name: '',
    date: new Date().toISOString().split('T')[0],
    quantity: 0,
    reorder_level: 0,
    suggested_reorder_quantity: 0,
    order_quantity: 0,
    order_status: false,
    current_cost_per_unit: 0,
    unit_cost_paid: 0
  });

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : formData.date
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="item_id">Item ID *</Label>
          <Input
            id="item_id"
            required
            value={formData.item_id}
            onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="item_name">Item Name *</Label>
          <Input
            id="item_name"
            required
            value={formData.item_name}
            onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            required
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reorder_level">Reorder Level *</Label>
          <Input
            id="reorder_level"
            type="number"
            required
            min="0"
            value={formData.reorder_level}
            onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order_quantity">Order Quantity</Label>
          <Input
            id="order_quantity"
            type="number"
            min="0"
            value={formData.order_quantity}
            onChange={(e) => setFormData({ ...formData, order_quantity: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_cost_per_unit">Current Cost per Unit *</Label>
          <Input
            id="current_cost_per_unit"
            type="number"
            step="0.01"
            required
            min="0"
            value={formData.current_cost_per_unit}
            onChange={(e) => setFormData({ ...formData, current_cost_per_unit: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_cost_paid">Unit Cost Paid</Label>
          <Input
            id="unit_cost_paid"
            type="number"
            step="0.01"
            min="0"
            value={formData.unit_cost_paid}
            onChange={(e) => setFormData({ ...formData, unit_cost_paid: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="order_status"
              checked={formData.order_status}
              onCheckedChange={(checked) => setFormData({ ...formData, order_status: checked })}
            />
            <Label htmlFor="order_status" className="cursor-pointer">
              Item is currently on order
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
}