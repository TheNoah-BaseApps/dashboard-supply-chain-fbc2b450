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
import { Boxes, Plus, Edit, Trash2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductionManagementPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    production_id: '',
    production_date: '',
    total_units_produced: '',
    production_cost: '',
    materials_used: '',
    labor_cost: '',
    production_line: '',
    production_status: 'In Progress',
    production_supervisor: '',
    safety_compliance: '',
    quality_control: '',
    equipment_used: '',
    defective_units: '',
    overhead_costs: '',
    production_priority: 'Medium',
    contact_person: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/production-management');
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      }
    } catch (error) {
      console.error('Error fetching production management records:', error);
      toast.error('Failed to load production management records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/production-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Production record created successfully');
        setShowAddModal(false);
        resetForm();
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to create record');
      }
    } catch (error) {
      console.error('Error creating production record:', error);
      toast.error('Failed to create production record');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/production-management/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Production record updated successfully');
        setShowEditModal(false);
        setSelectedRecord(null);
        resetForm();
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to update record');
      }
    } catch (error) {
      console.error('Error updating production record:', error);
      toast.error('Failed to update production record');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this production record?')) return;

    try {
      const res = await fetch(`/api/production-management/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Production record deleted successfully');
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting production record:', error);
      toast.error('Failed to delete production record');
    }
  };

  const resetForm = () => {
    setFormData({
      production_id: '',
      production_date: '',
      total_units_produced: '',
      production_cost: '',
      materials_used: '',
      labor_cost: '',
      production_line: '',
      production_status: 'In Progress',
      production_supervisor: '',
      safety_compliance: '',
      quality_control: '',
      equipment_used: '',
      defective_units: '',
      overhead_costs: '',
      production_priority: 'Medium',
      contact_person: ''
    });
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setFormData({
      production_id: record.production_id || '',
      production_date: record.production_date ? record.production_date.split('T')[0] : '',
      total_units_produced: record.total_units_produced || '',
      production_cost: record.production_cost || '',
      materials_used: record.materials_used || '',
      labor_cost: record.labor_cost || '',
      production_line: record.production_line || '',
      production_status: record.production_status || 'In Progress',
      production_supervisor: record.production_supervisor || '',
      safety_compliance: record.safety_compliance || '',
      quality_control: record.quality_control || '',
      equipment_used: record.equipment_used || '',
      defective_units: record.defective_units || '',
      overhead_costs: record.overhead_costs || '',
      production_priority: record.production_priority || 'Medium',
      contact_person: record.contact_person || ''
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

  const getPriorityBadge = (priority) => {
    const variants = {
      'High': 'destructive',
      'Medium': 'secondary',
      'Low': 'outline'
    };
    return <Badge variant={variants[priority] || 'secondary'}>{priority}</Badge>;
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
          <h1 className="text-3xl font-bold text-gray-900">Production Management</h1>
          <p className="text-gray-600 mt-1">Track and manage production planning and operations</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Production Record
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
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
          <CardTitle>Production Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <Boxes className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No production records found</p>
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
                    <TableHead>Production ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Units Produced</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.production_id}</TableCell>
                      <TableCell>{record.production_date ? new Date(record.production_date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{getStatusBadge(record.production_status)}</TableCell>
                      <TableCell>{getPriorityBadge(record.production_priority)}</TableCell>
                      <TableCell>{record.total_units_produced?.toLocaleString() || 0}</TableCell>
                      <TableCell>${parseFloat(record.production_cost || 0).toLocaleString()}</TableCell>
                      <TableCell>{record.production_supervisor || '-'}</TableCell>
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
            <DialogTitle>Add Production Record</DialogTitle>
            <DialogDescription>Create a new production planning record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="production_id">Production ID *</Label>
                <Input
                  id="production_id"
                  value={formData.production_id}
                  onChange={(e) => setFormData({ ...formData, production_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_date">Production Date *</Label>
                <Input
                  id="production_date"
                  type="date"
                  value={formData.production_date}
                  onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                  required
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
                <Label htmlFor="production_priority">Priority</Label>
                <select
                  id="production_priority"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.production_priority}
                  onChange={(e) => setFormData({ ...formData, production_priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_supervisor">Supervisor</Label>
                <Input
                  id="production_supervisor"
                  value={formData.production_supervisor}
                  onChange={(e) => setFormData({ ...formData, production_supervisor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
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
            <DialogTitle>Edit Production Record</DialogTitle>
            <DialogDescription>Update production planning details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_production_id">Production ID *</Label>
                <Input
                  id="edit_production_id"
                  value={formData.production_id}
                  onChange={(e) => setFormData({ ...formData, production_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_production_date">Production Date *</Label>
                <Input
                  id="edit_production_date"
                  type="date"
                  value={formData.production_date}
                  onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                  required
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
                <Label htmlFor="edit_production_priority">Priority</Label>
                <select
                  id="edit_production_priority"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.production_priority}
                  onChange={(e) => setFormData({ ...formData, production_priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_production_supervisor">Supervisor</Label>
                <Input
                  id="edit_production_supervisor"
                  value={formData.production_supervisor}
                  onChange={(e) => setFormData({ ...formData, production_supervisor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_contact_person">Contact Person</Label>
                <Input
                  id="edit_contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
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