'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Plus, Edit2, Trash2, Package, Clock } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function LogisticsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    inTransit: 0,
    delivered: 0,
    pending: 0
  });

  useEffect(() => {
    fetchShipments();
  }, [statusFilter]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const url = statusFilter 
        ? `/api/logistics?status=${encodeURIComponent(statusFilter)}`
        : '/api/logistics';
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setShipments(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const inTransit = data.filter(s => s.delivery_status === 'In Transit').length;
    const delivered = data.filter(s => s.delivery_status === 'Delivered').length;
    const pending = data.filter(s => s.delivery_status === 'Pending').length;
    
    setStats({ total, inTransit, delivered, pending });
  };

  const handleAdd = async (formData) => {
    try {
      const res = await fetch('/api/logistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Shipment added successfully');
        setShowAddModal(false);
        fetchShipments();
      } else {
        toast.error(data.error || 'Failed to add shipment');
      }
    } catch (error) {
      console.error('Error adding shipment:', error);
      toast.error('Failed to add shipment');
    }
  };

  const handleEdit = async (formData) => {
    try {
      const res = await fetch(`/api/logistics/${selectedShipment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Shipment updated successfully');
        setShowEditModal(false);
        setSelectedShipment(null);
        fetchShipments();
      } else {
        toast.error(data.error || 'Failed to update shipment');
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast.error('Failed to update shipment');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this shipment?')) return;
    
    try {
      const res = await fetch(`/api/logistics/${id}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Shipment deleted successfully');
        fetchShipments();
      } else {
        toast.error(data.error || 'Failed to delete shipment');
      }
    } catch (error) {
      console.error('Error deleting shipment:', error);
      toast.error('Failed to delete shipment');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'secondary',
      'In Transit': 'default',
      'Delivered': 'outline',
      'Delayed': 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logistics Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage shipment deliveries
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Shipment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Shipments
            </CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              In Transit
            </CardTitle>
            <Truck className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Delivered
            </CardTitle>
            <Package className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Transit">In Transit</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Delayed">Delayed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shipment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispatch Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Arrival</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No shipments found
                  </td>
                </tr>
              ) : (
                shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {shipment.shipment_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{shipment.carrier_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {shipment.dispatch_date ? new Date(shipment.dispatch_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {shipment.estimated_arrival ? new Date(shipment.estimated_arrival).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(shipment.delivery_status)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(shipment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shipment</DialogTitle>
          </DialogHeader>
          <LogisticsForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shipment</DialogTitle>
          </DialogHeader>
          <LogisticsForm
            initialData={selectedShipment}
            onSubmit={handleEdit}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedShipment(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LogisticsForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    shipment_id: '',
    carrier_name: '',
    dispatch_date: '',
    estimated_arrival: '',
    delivery_status: 'Pending'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="shipment_id">Shipment ID *</Label>
        <Input
          id="shipment_id"
          value={formData.shipment_id}
          onChange={(e) => setFormData({ ...formData, shipment_id: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="carrier_name">Carrier Name *</Label>
        <Input
          id="carrier_name"
          value={formData.carrier_name}
          onChange={(e) => setFormData({ ...formData, carrier_name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="dispatch_date">Dispatch Date</Label>
        <Input
          id="dispatch_date"
          type="date"
          value={formData.dispatch_date}
          onChange={(e) => setFormData({ ...formData, dispatch_date: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="estimated_arrival">Estimated Arrival</Label>
        <Input
          id="estimated_arrival"
          type="date"
          value={formData.estimated_arrival}
          onChange={(e) => setFormData({ ...formData, estimated_arrival: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="delivery_status">Delivery Status *</Label>
        <Select
          value={formData.delivery_status}
          onValueChange={(value) => setFormData({ ...formData, delivery_status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Transit">In Transit</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Delayed">Delayed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Add'} Shipment
        </Button>
      </div>
    </form>
  );
}