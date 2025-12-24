'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Package, Plus, Search, Edit, Trash2, DollarSign, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalValue: 0,
    activeAssets: 0,
    warningCount: 0
  });

  useEffect(() => {
    fetchAssets();
  }, [searchTerm]);

  async function fetchAssets() {
    try {
      setLoading(true);
      const res = await fetch(`/api/assets?search=${searchTerm}`);
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const totalValue = data.reduce((sum, asset) => sum + (parseFloat(asset.total_value) || 0), 0);
    const activeAssets = data.filter(a => a.condition !== 'Retired').length;
    const warningCount = data.filter(a => {
      const warranty = new Date(a.warranty_expiry_date);
      const today = new Date();
      const daysUntilExpiry = (warranty - today) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry < 30 && daysUntilExpiry > 0;
    }).length;

    setStats({
      totalAssets: data.length,
      totalValue,
      activeAssets,
      warningCount
    });
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Asset deleted successfully');
        fetchAssets();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
    }
    setDeleteId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asset Management</h1>
            <p className="text-gray-500 mt-1">Manage and track your organization's assets</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAssets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warranty Warnings</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.warningCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>A list of all assets in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No assets found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first asset.</p>
                <div className="mt-6">
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Item Number</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Condition</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Value</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr key={asset.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{asset.item_number}</td>
                        <td className="py-3 px-4 text-sm font-medium">{asset.name}</td>
                        <td className="py-3 px-4 text-sm">{asset.type || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm">{asset.quantity || 0}</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant={asset.condition === 'Good' ? 'default' : 'secondary'}>
                            {asset.condition || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">${parseFloat(asset.total_value || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAsset(asset);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(asset.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
          setSelectedAsset(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>
              {selectedAsset ? 'Update asset information' : 'Enter asset details'}
            </DialogDescription>
          </DialogHeader>
          <AssetForm
            asset={selectedAsset}
            onSuccess={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setSelectedAsset(null);
              fetchAssets();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Asset"
        description="Are you sure you want to delete this asset? This action cannot be undone."
      />
    </>
  );
}

function AssetForm({ asset, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    item_number: asset?.item_number || '',
    name: asset?.name || '',
    description: asset?.description || '',
    type: asset?.type || '',
    vendor: asset?.vendor || '',
    purchase_price_per_item: asset?.purchase_price_per_item || '',
    quantity: asset?.quantity || '',
    condition: asset?.condition || '',
    model: asset?.model || '',
    vendor_number: asset?.vendor_number || '',
    remarks: asset?.remarks || '',
    photograph_link: asset?.photograph_link || ''
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = asset ? `/api/assets/${asset.id}` : '/api/assets';
      const method = asset ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(asset ? 'Asset updated successfully' : 'Asset created successfully');
        onSuccess();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error saving asset:', error);
      toast.error('Failed to save asset');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="item_number">Item Number *</Label>
          <Input
            id="item_number"
            value={formData.item_number}
            onChange={(e) => setFormData({ ...formData, item_number: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="condition">Condition</Label>
          <Input
            id="condition"
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="purchase_price_per_item">Purchase Price</Label>
          <Input
            id="purchase_price_per_item"
            type="number"
            step="0.01"
            value={formData.purchase_price_per_item}
            onChange={(e) => setFormData({ ...formData, purchase_price_per_item: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="vendor">Vendor</Label>
          <Input
            id="vendor"
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Input
          id="remarks"
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : asset ? 'Update Asset' : 'Add Asset'}
        </Button>
      </div>
    </form>
  );
}