'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { TruckIcon, Plus, Search, Edit, Trash2, MapPin, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

export default function AssetMovementsPage() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [stats, setStats] = useState({
    totalMovements: 0,
    pendingMovements: 0,
    completedMovements: 0,
    totalCost: 0
  });

  useEffect(() => {
    fetchMovements();
  }, [searchTerm]);

  async function fetchMovements() {
    try {
      setLoading(true);
      const res = await fetch(`/api/asset-movements?asset_id=${searchTerm}`);
      const data = await res.json();
      if (data.success) {
        setMovements(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast.error('Failed to load asset movements');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const totalCost = data.reduce((sum, m) => sum + (parseFloat(m.movement_cost) || 0), 0);
    const today = new Date();
    const pendingMovements = data.filter(m => new Date(m.movement_date) > today).length;
    const completedMovements = data.filter(m => new Date(m.movement_date) <= today).length;

    setStats({
      totalMovements: data.length,
      pendingMovements,
      completedMovements,
      totalCost
    });
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`/api/asset-movements/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Asset movement deleted successfully');
        fetchMovements();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error deleting movement:', error);
      toast.error('Failed to delete movement');
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
            <h1 className="text-3xl font-bold text-gray-900">Asset Movement Management</h1>
            <p className="text-gray-500 mt-1">Track and manage asset transfers and movements</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Movement
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
              <TruckIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMovements}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingMovements}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedMovements}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <TruckIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalCost.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by asset ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Movements Table */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Movements</CardTitle>
            <CardDescription>A list of all asset movement records</CardDescription>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <div className="text-center py-12">
                <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No movements found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by recording your first asset movement.</p>
                <div className="mt-6">
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Movement
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Asset ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">From</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">To</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Quantity</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((movement) => (
                      <tr key={movement.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{movement.asset_id}</td>
                        <td className="py-3 px-4 text-sm">{movement.from_location}</td>
                        <td className="py-3 px-4 text-sm">{movement.to_location}</td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(movement.movement_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge>{movement.movement_type || 'Transfer'}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{movement.quantity_moved || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMovement(movement);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(movement.id)}
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
          setSelectedMovement(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMovement ? 'Edit Movement' : 'Add New Movement'}</DialogTitle>
            <DialogDescription>
              {selectedMovement ? 'Update movement information' : 'Enter movement details'}
            </DialogDescription>
          </DialogHeader>
          <MovementForm
            movement={selectedMovement}
            onSuccess={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setSelectedMovement(null);
              fetchMovements();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Movement"
        description="Are you sure you want to delete this movement record? This action cannot be undone."
      />
    </>
  );
}

function MovementForm({ movement, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asset_id: movement?.asset_id || '',
    from_location: movement?.from_location || '',
    to_location: movement?.to_location || '',
    movement_date: movement?.movement_date ? new Date(movement.movement_date).toISOString().split('T')[0] : '',
    movement_type: movement?.movement_type || '',
    authorized_by: movement?.authorized_by || '',
    quantity_moved: movement?.quantity_moved || '',
    transporter: movement?.transporter || '',
    vehicle_details: movement?.vehicle_details || '',
    movement_cost: movement?.movement_cost || '',
    remarks: movement?.remarks || ''
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = movement ? `/api/asset-movements/${movement.id}` : '/api/asset-movements';
      const method = movement ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(movement ? 'Movement updated successfully' : 'Movement created successfully');
        onSuccess();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error saving movement:', error);
      toast.error('Failed to save movement');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="asset_id">Asset ID *</Label>
          <Input
            id="asset_id"
            value={formData.asset_id}
            onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="movement_date">Movement Date *</Label>
          <Input
            id="movement_date"
            type="date"
            value={formData.movement_date}
            onChange={(e) => setFormData({ ...formData, movement_date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="from_location">From Location *</Label>
          <Input
            id="from_location"
            value={formData.from_location}
            onChange={(e) => setFormData({ ...formData, from_location: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="to_location">To Location *</Label>
          <Input
            id="to_location"
            value={formData.to_location}
            onChange={(e) => setFormData({ ...formData, to_location: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="movement_type">Movement Type</Label>
          <Input
            id="movement_type"
            value={formData.movement_type}
            onChange={(e) => setFormData({ ...formData, movement_type: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="quantity_moved">Quantity Moved</Label>
          <Input
            id="quantity_moved"
            type="number"
            value={formData.quantity_moved}
            onChange={(e) => setFormData({ ...formData, quantity_moved: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="authorized_by">Authorized By</Label>
          <Input
            id="authorized_by"
            value={formData.authorized_by}
            onChange={(e) => setFormData({ ...formData, authorized_by: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="transporter">Transporter</Label>
          <Input
            id="transporter"
            value={formData.transporter}
            onChange={(e) => setFormData({ ...formData, transporter: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="vehicle_details">Vehicle Details</Label>
          <Input
            id="vehicle_details"
            value={formData.vehicle_details}
            onChange={(e) => setFormData({ ...formData, vehicle_details: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="movement_cost">Movement Cost</Label>
          <Input
            id="movement_cost"
            type="number"
            step="0.01"
            value={formData.movement_cost}
            onChange={(e) => setFormData({ ...formData, movement_cost: e.target.value })}
          />
        </div>
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
          {loading ? 'Saving...' : movement ? 'Update Movement' : 'Add Movement'}
        </Button>
      </div>
    </form>
  );
}