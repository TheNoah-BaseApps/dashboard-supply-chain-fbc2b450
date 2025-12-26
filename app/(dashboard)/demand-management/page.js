'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

export default function DemandManagementPage() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDemand, setEditingDemand] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    demand_id: '',
    product_name: '',
    product_category: '',
    quantity_requested: '',
    requested_by: '',
    request_date: '',
    expected_delivery_date: '',
    status: 'pending',
    priority_level: 'medium'
  });

  useEffect(() => {
    fetchDemands();
  }, []);

  async function fetchDemands() {
    try {
      setLoading(true);
      const res = await fetch('/api/demand-management');
      const data = await res.json();
      if (data.success) {
        setDemands(data.data);
      } else {
        toast.error('Failed to fetch demands');
      }
    } catch (error) {
      console.error('Error fetching demands:', error);
      toast.error('Error loading demands');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editingDemand 
        ? `/api/demand-management/${editingDemand.id}`
        : '/api/demand-management';
      
      const res = await fetch(url, {
        method: editingDemand ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(editingDemand ? 'Demand updated successfully' : 'Demand created successfully');
        setShowAddDialog(false);
        setShowEditDialog(false);
        setEditingDemand(null);
        setFormData({
          demand_id: '',
          product_name: '',
          product_category: '',
          quantity_requested: '',
          requested_by: '',
          request_date: '',
          expected_delivery_date: '',
          status: 'pending',
          priority_level: 'medium'
        });
        fetchDemands();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this demand?')) return;

    try {
      const res = await fetch(`/api/demand-management/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success('Demand deleted successfully');
        fetchDemands();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  }

  function handleEdit(demand) {
    setEditingDemand(demand);
    setFormData({
      demand_id: demand.demand_id || '',
      product_name: demand.product_name || '',
      product_category: demand.product_category || '',
      quantity_requested: demand.quantity_requested || '',
      requested_by: demand.requested_by || '',
      request_date: demand.request_date ? demand.request_date.split('T')[0] : '',
      expected_delivery_date: demand.expected_delivery_date ? demand.expected_delivery_date.split('T')[0] : '',
      status: demand.status || 'pending',
      priority_level: demand.priority_level || 'medium'
    });
    setShowEditDialog(true);
  }

  const stats = {
    total: demands.length,
    pending: demands.filter(d => d.status === 'pending').length,
    approved: demands.filter(d => d.status === 'approved').length,
    completed: demands.filter(d => d.status === 'completed').length
  };

  const filteredDemands = demands.filter(demand =>
    demand.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demand.demand_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demand.requested_by?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      completed: 'outline',
      rejected: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading demands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demand Management</h1>
          <p className="text-gray-500 mt-1">Manage product demand requests and fulfillment</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Demand
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Demands</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Demand Requests</CardTitle>
              <CardDescription>View and manage all demand requests</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search demands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDemands.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">No demands found</h3>
              <p className="text-gray-500 mt-2">Get started by creating a new demand request</p>
              <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Demand
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demand ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDemands.map((demand) => (
                  <TableRow key={demand.id}>
                    <TableCell className="font-medium">{demand.demand_id}</TableCell>
                    <TableCell>{demand.product_name}</TableCell>
                    <TableCell>{demand.product_category || 'N/A'}</TableCell>
                    <TableCell>{demand.quantity_requested}</TableCell>
                    <TableCell>{demand.requested_by || 'N/A'}</TableCell>
                    <TableCell>{demand.request_date ? new Date(demand.request_date).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{getPriorityBadge(demand.priority_level)}</TableCell>
                    <TableCell>{getStatusBadge(demand.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(demand)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(demand.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setEditingDemand(null);
          setFormData({
            demand_id: '',
            product_name: '',
            product_category: '',
            quantity_requested: '',
            requested_by: '',
            request_date: '',
            expected_delivery_date: '',
            status: 'pending',
            priority_level: 'medium'
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDemand ? 'Edit Demand' : 'Add New Demand'}</DialogTitle>
            <DialogDescription>
              {editingDemand ? 'Update demand request details' : 'Create a new demand request'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="demand_id">Demand ID *</Label>
                  <Input
                    id="demand_id"
                    value={formData.demand_id}
                    onChange={(e) => setFormData({ ...formData, demand_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_name">Product Name *</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_category">Product Category</Label>
                  <Input
                    id="product_category"
                    value={formData.product_category}
                    onChange={(e) => setFormData({ ...formData, product_category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity_requested">Quantity Requested *</Label>
                  <Input
                    id="quantity_requested"
                    type="number"
                    value={formData.quantity_requested}
                    onChange={(e) => setFormData({ ...formData, quantity_requested: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requested_by">Requested By</Label>
                  <Input
                    id="requested_by"
                    value={formData.requested_by}
                    onChange={(e) => setFormData({ ...formData, requested_by: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request_date">Request Date *</Label>
                  <Input
                    id="request_date"
                    type="date"
                    value={formData.request_date}
                    onChange={(e) => setFormData({ ...formData, request_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                  <Input
                    id="expected_delivery_date"
                    type="date"
                    value={formData.expected_delivery_date}
                    onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority_level">Priority Level</Label>
                  <select
                    id="priority_level"
                    value={formData.priority_level}
                    onChange={(e) => setFormData({ ...formData, priority_level: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingDemand ? 'Update Demand' : 'Create Demand'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}