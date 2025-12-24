'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { BookOpen, Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

export default function CataloguesPage() {
  const [catalogues, setCatalogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCatalogue, setSelectedCatalogue] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [stats, setStats] = useState({
    totalCatalogues: 0,
    activeCatalogues: 0,
    totalProducts: 0
  });

  useEffect(() => {
    fetchCatalogues();
  }, [searchTerm]);

  async function fetchCatalogues() {
    try {
      setLoading(true);
      const res = await fetch(`/api/catalogues?search=${searchTerm}`);
      const data = await res.json();
      if (data.success) {
        setCatalogues(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching catalogues:', error);
      toast.error('Failed to load catalogues');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const activeCatalogues = data.filter(c => c.is_active).length;
    const totalProducts = data.reduce((sum, c) => sum + (c.product_count || 0), 0);

    setStats({
      totalCatalogues: data.length,
      activeCatalogues,
      totalProducts
    });
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`/api/catalogues/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Catalogue deleted successfully');
        fetchCatalogues();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error deleting catalogue:', error);
      toast.error('Failed to delete catalogue');
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
            <h1 className="text-3xl font-bold text-gray-900">Catalogue Management</h1>
            <p className="text-gray-500 mt-1">Manage product catalogues and collections</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Catalogue
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Catalogues</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCatalogues}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Catalogues</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCatalogues}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search catalogues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Catalogues Table */}
        <Card>
          <CardHeader>
            <CardTitle>Catalogues</CardTitle>
            <CardDescription>A list of all product catalogues</CardDescription>
          </CardHeader>
          <CardContent>
            {catalogues.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No catalogues found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first catalogue.</p>
                <div className="mt-6">
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Catalogue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Product Count</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Created</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Last Updated</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogues.map((catalogue) => (
                      <tr key={catalogue.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{catalogue.catalogue_name}</td>
                        <td className="py-3 px-4 text-sm">{catalogue.product_count || 0}</td>
                        <td className="py-3 px-4 text-sm">
                          {catalogue.creation_date ? new Date(catalogue.creation_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {catalogue.last_updated ? new Date(catalogue.last_updated).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant={catalogue.is_active ? 'default' : 'secondary'}>
                            {catalogue.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCatalogue(catalogue);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(catalogue.id)}
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
          setSelectedCatalogue(null);
        }
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedCatalogue ? 'Edit Catalogue' : 'Add New Catalogue'}</DialogTitle>
            <DialogDescription>
              {selectedCatalogue ? 'Update catalogue information' : 'Enter catalogue details'}
            </DialogDescription>
          </DialogHeader>
          <CatalogueForm
            catalogue={selectedCatalogue}
            onSuccess={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setSelectedCatalogue(null);
              fetchCatalogues();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Catalogue"
        description="Are you sure you want to delete this catalogue? This action cannot be undone."
      />
    </>
  );
}

function CatalogueForm({ catalogue, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    catalogue_name: catalogue?.catalogue_name || '',
    product_count: catalogue?.product_count || '',
    description: catalogue?.description || '',
    is_active: catalogue?.is_active ?? true
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = catalogue ? `/api/catalogues/${catalogue.id}` : '/api/catalogues';
      const method = catalogue ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        creation_date: catalogue?.creation_date || new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(catalogue ? 'Catalogue updated successfully' : 'Catalogue created successfully');
        onSuccess();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error saving catalogue:', error);
      toast.error('Failed to save catalogue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="catalogue_name">Catalogue Name *</Label>
        <Input
          id="catalogue_name"
          value={formData.catalogue_name}
          onChange={(e) => setFormData({ ...formData, catalogue_name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="product_count">Product Count</Label>
        <Input
          id="product_count"
          type="number"
          value={formData.product_count}
          onChange={(e) => setFormData({ ...formData, product_count: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : catalogue ? 'Update Catalogue' : 'Add Catalogue'}
        </Button>
      </div>
    </form>
  );
}