'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Factory, Plus, Edit, Trash2, TrendingUp, AlertCircle, DollarSign, PackageX, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function ManufacturingPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    manufacturing_id: '',
    factory_name: '',
    production_start_date: '',
    production_end_date: '',
    total_units_produced: '',
    defective_units: '',
    production_cost: '',
    materials_used: '',
    labor_cost: '',
    overhead_costs: '',
    production_line: '',
    equipment_used: '',
    production_status: 'In Progress',
    quality_control: '',
    safety_compliance: '',
    supervisor: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/manufacturing');
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      } else {
        setError(data.error || 'Failed to load manufacturing records');
        toast.error(data.error || 'Failed to load manufacturing records');
      }
    } catch (error) {
      console.error('Error fetching manufacturing records:', error);
      setError('Failed to load manufacturing records');
      toast.error('Failed to load manufacturing records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.manufacturing_id || !formData.factory_name || !formData.production_status) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/manufacturing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Manufacturing record created successfully');
        setShowAddModal(false);
        resetForm();
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to create record');
      }
    } catch (error) {
      console.error('Error creating manufacturing record:', error);
      toast.error('Failed to create manufacturing record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.manufacturing_id || !formData.factory_name || !formData.production_status) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/manufacturing/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Manufacturing record updated successfully');
        setShowEditModal(false);
        setSelectedRecord(null);
        resetForm();
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to update record');
      }
    } catch (error) {
      console.error('Error updating manufacturing record:', error);
      toast.error('Failed to update manufacturing record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this manufacturing record? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/manufacturing/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Manufacturing record deleted successfully');
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting manufacturing record:', error);
      toast.error('Failed to delete manufacturing record');
    }
  };

  const resetForm = () => {
    setFormData({
      manufacturing_id: '',
      factory_name: '',
      production_start_date: '',
      production_end_date: '',
      total_units_produced: '',
      defective_units: '',
      production_cost: '',
      materials_used: '',
      labor_cost: '',
      overhead_costs: '',
      production_line: '',
      equipment_used: '',
      production_status: 'In Progress',
      quality_control: '',
      safety_compliance: '',
      supervisor: ''
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setFormData({
      manufacturing_id: record.manufacturing_id || '',
      factory_name: record.factory_name || '',
      production_start_date: record.production_start_date ? record.production_start_date.split('T')[0] : '',
      production_end_date: record.production_end_date ? record.production_end_date.split('T')[0] : '',
      total_units_produced: record.total_units_produced || '',
      defective_units: record.defective_units || '',
      production_cost: record.production_cost || '',
      materials_used: record.materials_used || '',
      labor_cost: record.labor_cost || '',
      overhead_costs: record.overhead_costs || '',
      production_line: record.production_line || '',
      equipment_used: record.equipment_used || '',
      production_status: record.production_status || 'In Progress',
      quality_control: record.quality_control || '',
      safety_compliance: record.safety_compliance || '',
      supervisor: record.supervisor || ''
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Completed': 'default',
      'In Progress': 'secondary',
      'Pending': 'outline',
      'On Hold': 'destructive'
    };
    const colors = {
      'Completed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'On Hold': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const calculateDefectivePercentage = () => {
    const totalProduced = records.reduce((sum, r) => sum + (parseInt(r.total_units_produced) || 0), 0);
    const totalDefective = records.reduce((sum, r) => sum + (parseInt(r.defective_units) || 0), 0);
    if (totalProduced === 0) return 0;
    return ((totalDefective / totalProduced) * 100).toFixed(2);
  };

  const calculateAverageCost = () => {
    if (records.length === 0) return 0;
    const totalCost = records.reduce((sum, r) => sum + (parseFloat(r.production_cost) || 0), 0);
    return (totalCost / records.length).toFixed(2);
  };

  const stats = {
    total: records.length,
    active: records.filter(r => r.production_status === 'In Progress').length,
    defectivePercentage: calculateDefectivePercentage(),
    averageCost: calculateAverageCost()
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading manufacturing records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={fetchRecords}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manufacturing Operations</h1>
          <p className="text-gray-600 mt-1">Manage and track all manufacturing production activities and factory operations</p>
        </div>
        <Button onClick={openAddModal} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Manufacturing Record
        </Button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productions</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Factory className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All production records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Productions</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Defective Units %</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <PackageX className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.defectivePercentage}%</div>
            <p className="text-xs text-muted-foreground">Quality control metric</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Production Cost</CardTitle>
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${parseFloat(stats.averageCost).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per production run</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manufacturing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Factory className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Manufacturing Records</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first manufacturing production record</p>
              <Button onClick={openAddModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Record
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manufacturing ID</TableHead>
                    <TableHead>Factory Name</TableHead>
                    <TableHead>Production Dates</TableHead>
                    <TableHead>Units Produced</TableHead>
                    <TableHead>Defective Units</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.manufacturing_id}</TableCell>
                      <TableCell>{record.factory_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {record.production_start_date && (
                            <div>Start: {new Date(record.production_start_date).toLocaleDateString()}</div>
                          )}
                          {record.production_end_date && (
                            <div>End: {new Date(record.production_end_date).toLocaleDateString()}</div>
                          )}
                          {!record.production_start_date && !record.production_end_date && '-'}
                        </div>
                      </TableCell>
                      <TableCell>{parseInt(record.total_units_produced || 0).toLocaleString()}</TableCell>
                      <TableCell>{parseInt(record.defective_units || 0).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(record.production_status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailsModal(record)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(record)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Manufacturing Record</DialogTitle>
            <DialogDescription>Create a new manufacturing production record with all necessary details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturing_id">Manufacturing ID <span className="text-red-500">*</span></Label>
                <Input
                  id="manufacturing_id"
                  value={formData.manufacturing_id}
                  onChange={(e) => setFormData({ ...formData, manufacturing_id: e.target.value })}
                  placeholder="MFG-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="factory_name">Factory Name <span className="text-red-500">*</span></Label>
                <Input
                  id="factory_name"
                  value={formData.factory_name}
                  onChange={(e) => setFormData({ ...formData, factory_name: e.target.value })}
                  placeholder="Factory A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_start_date">Production Start Date</Label>
                <Input
                  id="production_start_date"
                  type="date"
                  value={formData.production_start_date}
                  onChange={(e) => setFormData({ ...formData, production_start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_end_date">Production End Date</Label>
                <Input
                  id="production_end_date"
                  type="date"
                  value={formData.production_end_date}
                  onChange={(e) => setFormData({ ...formData, production_end_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_units_produced">Total Units Produced</Label>
                <Input
                  id="total_units_produced"
                  type="number"
                  min="0"
                  value={formData.total_units_produced}
                  onChange={(e) => setFormData({ ...formData, total_units_produced: e.target.value })}
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defective_units">Defective Units</Label>
                <Input
                  id="defective_units"
                  type="number"
                  min="0"
                  value={formData.defective_units}
                  onChange={(e) => setFormData({ ...formData, defective_units: e.target.value })}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_cost">Production Cost ($)</Label>
                <Input
                  id="production_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.production_cost}
                  onChange={(e) => setFormData({ ...formData, production_cost: e.target.value })}
                  placeholder="50000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labor_cost">Labor Cost ($)</Label>
                <Input
                  id="labor_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.labor_cost}
                  onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
                  placeholder="15000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overhead_costs">Overhead Costs ($)</Label>
                <Input
                  id="overhead_costs"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.overhead_costs}
                  onChange={(e) => setFormData({ ...formData, overhead_costs: e.target.value })}
                  placeholder="10000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_line">Production Line</Label>
                <Input
                  id="production_line"
                  value={formData.production_line}
                  onChange={(e) => setFormData({ ...formData, production_line: e.target.value })}
                  placeholder="Line A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_status">Production Status <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.production_status}
                  onValueChange={(value) => setFormData({ ...formData, production_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor</Label>
                <Input
                  id="supervisor"
                  value={formData.supervisor}
                  onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="materials_used">Materials Used</Label>
              <Textarea
                id="materials_used"
                value={formData.materials_used}
                onChange={(e) => setFormData({ ...formData, materials_used: e.target.value })}
                placeholder="List of materials used in production..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment_used">Equipment Used</Label>
              <Textarea
                id="equipment_used"
                value={formData.equipment_used}
                onChange={(e) => setFormData({ ...formData, equipment_used: e.target.value })}
                placeholder="List of equipment used..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality_control">Quality Control Notes</Label>
              <Textarea
                id="quality_control"
                value={formData.quality_control}
                onChange={(e) => setFormData({ ...formData, quality_control: e.target.value })}
                placeholder="Quality control observations and results..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="safety_compliance">Safety Compliance</Label>
              <Textarea
                id="safety_compliance"
                value={formData.safety_compliance}
                onChange={(e) => setFormData({ ...formData, safety_compliance: e.target.value })}
                placeholder="Safety compliance notes..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { 
                  setShowAddModal(false); 
                  resetForm(); 
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Record'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Manufacturing Record</DialogTitle>
            <DialogDescription>Update the manufacturing production record details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_manufacturing_id">Manufacturing ID <span className="text-red-500">*</span></Label>
                <Input
                  id="edit_manufacturing_id"
                  value={formData.manufacturing_id}
                  onChange={(e) => setFormData({ ...formData, manufacturing_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_factory_name">Factory Name <span className="text-red-500">*</span></Label>
                <Input
                  id="edit_factory_name"
                  value={formData.factory_name}
                  onChange={(e) => setFormData({ ...formData, factory_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_production_start_date">Production Start Date</Label>
                <Input
                  id="edit_production_start_date"
                  type="date"
                  value={formData.production_start_date}
                  onChange={(e) => setFormData({ ...formData, production_start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_production_end_date">Production End Date</Label>
                <Input
                  id="edit_production_end_date"
                  type="date"
                  value={formData.production_end_date}
                  onChange={(e) => setFormData({ ...formData, production_end_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_total_units_produced">Total Units Produced</Label>
                <Input
                  id="edit_total_units_produced"
                  type="number"
                  min="0"
                  value={formData.total_units_produced}
                  onChange={(e) => setFormData({ ...formData, total_units_produced: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_defective_units">Defective Units</Label>
                <Input
                  id="edit_defective_units"
                  type="number"
                  min="0"
                  value={formData.defective_units}
                  onChange={(e) => setFormData({ ...formData, defective_units: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_production_cost">Production Cost ($)</Label>
                <Input
                  id="edit_production_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.production_cost}
                  onChange={(e) => setFormData({ ...formData, production_cost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_labor_cost">Labor Cost ($)</Label>
                <Input
                  id="edit_labor_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.labor_cost}
                  onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_overhead_costs">Overhead Costs ($)</Label>
                <Input
                  id="edit_overhead_costs"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.overhead_costs}
                  onChange={(e) => setFormData({ ...formData, overhead_costs: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_production_line">Production Line</Label>
                <Input
                  id="edit_production_line"
                  value={formData.production_line}
                  onChange={(e) => setFormData({ ...formData, production_line: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_production_status">Production Status <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.production_status}
                  onValueChange={(value) => setFormData({ ...formData, production_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_supervisor">Supervisor</Label>
                <Input
                  id="edit_supervisor"
                  value={formData.supervisor}
                  onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_materials_used">Materials Used</Label>
              <Textarea
                id="edit_materials_used"
                value={formData.materials_used}
                onChange={(e) => setFormData({ ...formData, materials_used: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_equipment_used">Equipment Used</Label>
              <Textarea
                id="edit_equipment_used"
                value={formData.equipment_used}
                onChange={(e) => setFormData({ ...formData, equipment_used: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_quality_control">Quality Control Notes</Label>
              <Textarea
                id="edit_quality_control"
                value={formData.quality_control}
                onChange={(e) => setFormData({ ...formData, quality_control: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_safety_compliance">Safety Compliance</Label>
              <Textarea
                id="edit_safety_compliance"
                value={formData.safety_compliance}
                onChange={(e) => setFormData({ ...formData, safety_compliance: e.target.value })}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { 
                  setShowEditModal(false); 
                  setSelectedRecord(null); 
                  resetForm(); 
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Record'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manufacturing Record Details</DialogTitle>
            <DialogDescription>Complete information about this manufacturing record</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Manufacturing ID</Label>
                  <p className="font-medium">{selectedRecord.manufacturing_id}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Factory Name</Label>
                  <p className="font-medium">{selectedRecord.factory_name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Production Start Date</Label>
                  <p className="font-medium">
                    {selectedRecord.production_start_date 
                      ? new Date(selectedRecord.production_start_date).toLocaleDateString() 
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Production End Date</Label>
                  <p className="font-medium">
                    {selectedRecord.production_end_date 
                      ? new Date(selectedRecord.production_end_date).toLocaleDateString() 
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Total Units Produced</Label>
                  <p className="font-medium">{parseInt(selectedRecord.total_units_produced || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Defective Units</Label>
                  <p className="font-medium">{parseInt(selectedRecord.defective_units || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Production Cost</Label>
                  <p className="font-medium">${parseFloat(selectedRecord.production_cost || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Labor Cost</Label>
                  <p className="font-medium">${parseFloat(selectedRecord.labor_cost || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Overhead Costs</Label>
                  <p className="font-medium">${parseFloat(selectedRecord.overhead_costs || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Production Line</Label>
                  <p className="font-medium">{selectedRecord.production_line || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Production Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRecord.production_status)}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Supervisor</Label>
                  <p className="font-medium">{selectedRecord.supervisor || '-'}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Materials Used</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedRecord.materials_used || '-'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Equipment Used</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedRecord.equipment_used || '-'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Quality Control</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedRecord.quality_control || '-'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Safety Compliance</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedRecord.safety_compliance || '-'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}