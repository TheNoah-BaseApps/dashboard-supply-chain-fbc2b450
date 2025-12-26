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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Boxes, Plus, Edit, Trash2, AlertTriangle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductionManagementPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completedThisMonth: 0,
    averageCost: 0
  });
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
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/production-management');
      const data = await res.json();
      
      if (data.success) {
        setRecords(data.data);
        calculateStats(data.data);
      } else {
        setError(data.error || 'Failed to load productions');
        toast.error(data.error || 'Failed to load productions');
      }
    } catch (error) {
      console.error('Error fetching production records:', error);
      setError('Failed to load production records');
      toast.error('Failed to load production records');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const total = data.length;
    const inProgress = data.filter(r => r.production_status === 'In Progress').length;
    const completedThisMonth = data.filter(r => {
      if (r.production_status !== 'Completed') return false;
      const prodDate = new Date(r.production_date);
      return prodDate >= firstDayOfMonth;
    }).length;
    
    const totalCost = data.reduce((sum, r) => sum + (parseFloat(r.production_cost) || 0), 0);
    const averageCost = total > 0 ? totalCost / total : 0;

    setStats({
      total,
      inProgress,
      completedThisMonth,
      averageCost
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
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
        fetchProductions();
      } else {
        toast.error(data.error || 'Failed to create production record');
      }
    } catch (error) {
      console.error('Error creating production record:', error);
      toast.error('Failed to create production record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
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
        fetchProductions();
      } else {
        toast.error(data.error || 'Failed to update production record');
      }
    } catch (error) {
      console.error('Error updating production record:', error);
      toast.error('Failed to update production record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this production record? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/production-management/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success('Production record deleted successfully');
        fetchProductions();
      } else {
        toast.error(data.error || 'Failed to delete production record');
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

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
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
      'Delayed': 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      'Critical': 'destructive',
      'High': 'destructive',
      'Medium': 'secondary',
      'Low': 'outline'
    };
    return <Badge variant={variants[priority] || 'secondary'}>{priority}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading production records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Error Loading Data</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchProductions}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Management</h1>
          <p className="text-gray-600 mt-1">Track and manage production planning and operations</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Production Record
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productions</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Boxes className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All production records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Production Cost</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per production</p>
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
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Boxes className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No production records found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first production record</p>
              <Button onClick={openAddModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Production Record
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Production ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Units Produced</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Defective Units</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.production_id}</TableCell>
                      <TableCell>
                        {record.production_date 
                          ? new Date(record.production_date).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>{record.total_units_produced?.toLocaleString() || 0}</TableCell>
                      <TableCell>${parseFloat(record.production_cost || 0).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(record.production_status)}</TableCell>
                      <TableCell>{record.defective_units || 0}</TableCell>
                      <TableCell>{getPriorityBadge(record.production_priority)}</TableCell>
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
                  placeholder="PROD-001"
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
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defective_units">Defective Units</Label>
                <Input
                  id="defective_units"
                  type="number"
                  value={formData.defective_units}
                  onChange={(e) => setFormData({ ...formData, defective_units: e.target.value })}
                  placeholder="10"
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
                  placeholder="5000.00"
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
                  placeholder="2000.00"
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
                  placeholder="500.00"
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
                <Label htmlFor="production_status">Status *</Label>
                <Select
                  value={formData.production_status}
                  onValueChange={(value) => setFormData({ ...formData, production_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_priority">Priority</Label>
                <Select
                  value={formData.production_priority}
                  onValueChange={(value) => setFormData({ ...formData, production_priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_supervisor">Supervisor</Label>
                <Input
                  id="production_supervisor"
                  value={formData.production_supervisor}
                  onChange={(e) => setFormData({ ...formData, production_supervisor: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="Jane Doe"
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment_used">Equipment Used</Label>
              <Textarea
                id="equipment_used"
                value={formData.equipment_used}
                onChange={(e) => setFormData({ ...formData, equipment_used: e.target.value })}
                placeholder="Equipment and machinery used..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality_control">Quality Control</Label>
              <Textarea
                id="quality_control"
                value={formData.quality_control}
                onChange={(e) => setFormData({ ...formData, quality_control: e.target.value })}
                placeholder="Quality control measures and results..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="safety_compliance">Safety Compliance</Label>
              <Textarea
                id="safety_compliance"
                value={formData.safety_compliance}
                onChange={(e) => setFormData({ ...formData, safety_compliance: e.target.value })}
                placeholder="Safety compliance notes..."
              />
            </div>
            <div className="flex justify-end gap-2">
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
                <Select
                  value={formData.production_status}
                  onValueChange={(value) => setFormData({ ...formData, production_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_production_priority">Priority</Label>
                <Select
                  value={formData.production_priority}
                  onValueChange={(value) => setFormData({ ...formData, production_priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}