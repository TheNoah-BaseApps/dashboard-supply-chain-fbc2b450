'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SupplierForm({ supplier, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    supplier_key: '',
    supplier_name: '',
    contact_name: '',
    contact_title: '',
    address: '',
    city: '',
    region: '',
    postal_code: '',
    country: '',
    phone: '',
    email: '',
    website: ''
  });

  useEffect(() => {
    if (supplier) {
      setFormData(supplier);
    }
  }, [supplier]);

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
          <Label htmlFor="supplier_key">Supplier Key *</Label>
          <Input
            id="supplier_key"
            required
            value={formData.supplier_key}
            onChange={(e) => setFormData({ ...formData, supplier_key: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier_name">Supplier Name *</Label>
          <Input
            id="supplier_name"
            required
            value={formData.supplier_name}
            onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_name">Contact Name</Label>
          <Input
            id="contact_name"
            value={formData.contact_name}
            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_title">Contact Title</Label>
          <Input
            id="contact_title"
            value={formData.contact_title}
            onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Region/State</Label>
          <Input
            id="region"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : supplier ? 'Update Supplier' : 'Add Supplier'}
        </Button>
      </div>
    </form>
  );
}