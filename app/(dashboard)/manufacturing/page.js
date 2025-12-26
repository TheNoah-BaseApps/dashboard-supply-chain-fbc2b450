'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Factory, Plus, Edit, Trash2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ManufacturingPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
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
      const res = await fetch('/api/manufacturing');
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      }
    } catch (error) {
      console.error('Error fetching manufacturing records:', error);
      toast.error('Failed to load manufacturing records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
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
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this manufacturing record?')) return;

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

  const getStatusBadge = (status) => {
    const variants = {
      'Completed': 'default',
      'In Progress': 'secondary',
      'Planned': 'outline',
      'On Hold': 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const stats = {
    total: records.length,
    completed: records.filter(r => r.production_status === 'Completed').length,
    inProgress: records.filter(r => r.production_status === 'In Progress').length,
    totalUnits: records.reduce((sum, r) => sum + (parseInt(r.total_units_produced) || 0), 0)
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manufacturing</h1>
          <p className="text-gray-600 mt-1">Manage manufacturing operations and factory production</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Manufacturing Record
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manufacturing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <Factory className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No manufacturing records found</p>
              <Button onClick={() => setShowAddModal(true)}>
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
                    <TableHead>Factory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Units Produced</TableHead>
                    <TableHead>Defective</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.manufacturing_id}</TableCell>
                      <TableCell>{record.factory_name}</TableCell>
                      <TableCell>{getStatusBadge(record.production_status)}</TableCell>
                      <TableCell>{record.total_units_produced?.toLocaleString() || 0}</TableCell>
                      <TableCell>{record.defective_units?.toLocaleString() || 0}</TableCell>
                      <TableCell>${parseFloat(record.production_cost || 0).toLocaleString()}</TableCell>
                      <TableCell>{record.supervisor || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Manufacturing Record</DialogTitle>
            <DialogDescription>Create a new manufacturing operation record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturing_id">Manufacturing ID *</Label>
                <Input
                  id="manufacturing_id"
                  value={formData.manufacturing_id}
                  onChange={(e) => setFormData({ ...formData, manufacturing_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="factory_name">Factory Name *</Label>
                <Input
                  id="factory_name"
                  value={formData.factory_name}
                  onChange={(e) => setFormData({ ...formData, factory_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_start_date">Start Date</Label>
                <Input
                  id="production_start_date"
                  type="date"
                  value={formData.production_start_date}
                  onChange={(e) => setFormData({ ...formData, production_start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_end_date">End Date</Label>
                <Input
                  id="production_end_date"
                  type="date"
                  value={formData.production_end_date}
                  onChange={(e) => setFormData({ ...formData, production_end_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_units_produced">Units Produced</Label>
                <Input
                  id="total_units_produced"
                  type="number"
                  value={formData.total_units_produced}
                  onChange={(e) => setFormData({ ...formData, total_units_produced: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defective_units">Defective Units</Label>
                <Input
                  id="defective_units"
                  type="number"
                  value={formData.defective_units}
                  onChange={(e) => setFormData({ ...formData, defective_units: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_cost">Production Cost</Label>
                <Input
                  id="production_cost"
                  type="number"
                  step="0.01"
                  value={formData.production_cost}
                  onChange={(e) => setFormData({ ...formData, production_cost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labor_cost">Labor Cost</Label>
                <Input
                  id="labor_cost"
                  type="number"
                  step="0.01"
                  value={formData.labor_cost}
                  onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overhead_costs">Overhead Costs</Label>
                <Input
                  id="overhead_costs"
                  type="number"
                  step="0.01"
                  value={formData.overhead_costs}
                  onChange={(e) => setFormData({ ...formData, overhead_costs: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_line">Production Line</Label>
                <Input
                  id="production_line"
                  value={formData.production_line}
                  onChange={(e) => setFormData({ ...formData, production_line: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_status">Status *</Label>
                <select
                  id="production_status"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.production_status}
                  onChange={(e) => setFormData({ ...formData, production_status: e.target.value })}
                  required
                >
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor</Label>
                <Input
                  id="supervisor"
                  value={formData.supervisor}
                  onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="materials_used">Materials Used</Label>
              <Textarea
                id="materials_used"
                value={formData.materials_used}
                onChange={(e) => setFormData({ ...formData, materials_used: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment_used">Equipment Used</Label>
              <Textarea
                id="equipment_used"
                value={formData.equipment_used}
                onChange={(e) => setFormData({ ...formData, equipment_used: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality_control">Quality Control</Label>
              <Textarea
                id="quality_control"
                value={formData.quality_control}
                onChange={(e) => setFormData({ ...formData, quality_control: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="safety_compliance">Safety Compliance</Label>
              <Textarea
                id="safety_compliance"
                value={formData.safety_compliance}
                onChange={(e) => setFormData({ ...formData, safety_compliance: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Record</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Manufacturing Record</DialogTitle>
            <DialogDescription>Update manufacturing operation details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_manufacturing_id">Manufacturing ID *</Label>
                <Input
                  id="edit_manufacturing_id"
                  value={formData.manufacturing_id}
                  onChange={(e) => setFormData({ ...formData, manufacturing_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_factory_name">Factory Name *</Label>
                <Input
                  id="edit_factory_name"
                  value={formData.factory_name}
                  onChange={(e) => setFormData({ ...formData, factory_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_production_start_date">Start Date</Label>
                <Input
                  id="edit_production_start_date"
                  type="date"
                  value={formData.production_start_date}
                  onChange={(e) => setFormData({ ...formData, production_start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_production_end_date">End Date</Label>
                <Input
                  id="edit_production_end_date"
                  type="date"
                  value={formData.production_end_date}
                  onChange={(e) => setFormData({ ...formData, production_end_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_total_units_produced">Units Produced</Label>
                <Input
                  id="edit_total_units_produced"
                  type="number"
                  value={formData.total_units_produced}
                  onChange={(e) => setFormData({ ...formData, total_units_produced: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_defective_units">Defective Units</Label>
                <Input
                  id="edit_defective_units"
                  type="number"
                  value={formData.defective_units}
                  onChange={(e) => setFormData({ ...formData, defective_units: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_production_cost">Production Cost</Label>
                <Input
                  id="edit_production_cost"
                  type="number"
                  step="0.01"
                  value={formData.production_cost}
                  onChange={(e) => setFormData({ ...formData, production_cost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_labor_cost">Labor Cost</Label>
                <Input
                  id="edit_labor_cost"
                  type="number"
                  step="0.01"
                  value={formData.labor_cost}
                  onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_overhead_costs">Overhead Costs</Label>
                <Input
                  id="edit_overhead_costs"
                  type="number"
                  step="0.01"
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
                <Label htmlFor="edit_production_status">Status *</Label>
                <select
                  id="edit_production_status"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.production_status}
                  onChange={(e) => setFormData({ ...formData, production_status: e.target.value })}
                  required
                >
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_equipment_used">Equipment Used</Label>
              <Textarea
                id="edit_equipment_used"
                value={formData.equipment_used}
                onChange={(e) => setFormData({ ...formData, equipment_used: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_quality_control">Quality Control</Label>
              <Textarea
                id="edit_quality_control"
                value={formData.quality_control}
                onChange={(e) => setFormData({ ...formData, quality_control: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_safety_compliance">Safety Compliance</Label>
              <Textarea
                id="edit_safety_compliance"
                value={formData.safety_compliance}
                onChange={(e) => setFormData({ ...formData, safety_compliance: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedRecord(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Record</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}