'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserCog, UserPlus, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function GigWorkerManagementPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [formData, setFormData] = useState({
    worker_id: '',
    worker_name: '',
    job_role: '',
    start_date: '',
    end_date: '',
    hourly_rate: '',
    total_hours_worked: '',
    total_payment: '',
    contact_number: '',
    supervisor: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await fetch('/api/gig-worker-management');
      const data = await res.json();
      if (data.success) {
        setWorkers(data.data);
      }
    } catch (error) {
      console.error('Error fetching gig workers:', error);
      toast.error('Failed to load gig workers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gig-worker-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Gig worker added successfully');
        setShowAddModal(false);
        resetForm();
        fetchWorkers();
      } else {
        toast.error(data.error || 'Failed to add gig worker');
      }
    } catch (error) {
      console.error('Error adding gig worker:', error);
      toast.error('Failed to add gig worker');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/gig-worker-management/${selectedWorker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Gig worker updated successfully');
        setShowEditModal(false);
        setSelectedWorker(null);
        resetForm();
        fetchWorkers();
      } else {
        toast.error(data.error || 'Failed to update gig worker');
      }
    } catch (error) {
      console.error('Error updating gig worker:', error);
      toast.error('Failed to update gig worker');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this gig worker?')) return;
    try {
      const res = await fetch(`/api/gig-worker-management/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Gig worker deleted successfully');
        fetchWorkers();
      } else {
        toast.error(data.error || 'Failed to delete gig worker');
      }
    } catch (error) {
      console.error('Error deleting gig worker:', error);
      toast.error('Failed to delete gig worker');
    }
  };

  const openEditModal = (worker) => {
    setSelectedWorker(worker);
    setFormData({
      worker_id: worker.worker_id || '',
      worker_name: worker.worker_name || '',
      job_role: worker.job_role || '',
      start_date: worker.start_date ? worker.start_date.split('T')[0] : '',
      end_date: worker.end_date ? worker.end_date.split('T')[0] : '',
      hourly_rate: worker.hourly_rate || '',
      total_hours_worked: worker.total_hours_worked || '',
      total_payment: worker.total_payment || '',
      contact_number: worker.contact_number || '',
      supervisor: worker.supervisor || '',
      status: worker.status || 'Active'
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      worker_id: '',
      worker_name: '',
      job_role: '',
      start_date: '',
      end_date: '',
      hourly_rate: '',
      total_hours_worked: '',
      total_payment: '',
      contact_number: '',
      supervisor: '',
      status: 'Active'
    });
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Calculate stats
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.status === 'Active').length;
  const totalHours = workers.reduce((sum, w) => sum + (parseFloat(w.total_hours_worked) || 0), 0).toFixed(0);
  const totalPayment = workers.reduce((sum, w) => sum + (parseFloat(w.total_payment) || 0), 0).toFixed(2);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gig Worker Management</h1>
          <p className="text-gray-500 mt-1">Manage contractors and freelance workers</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Gig Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Gig Worker</DialogTitle>
              <DialogDescription>Enter gig worker details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="worker_id">Worker ID *</Label>
                  <Input id="worker_id" name="worker_id" value={formData.worker_id} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="worker_name">Worker Name *</Label>
                  <Input id="worker_name" name="worker_name" value={formData.worker_name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_role">Job Role *</Label>
                  <Input id="job_role" name="job_role" value={formData.job_role} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input id="contact_number" name="contact_number" value={formData.contact_number} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate</Label>
                  <Input id="hourly_rate" name="hourly_rate" type="number" step="0.01" value={formData.hourly_rate} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_hours_worked">Total Hours Worked</Label>
                  <Input id="total_hours_worked" name="total_hours_worked" type="number" step="0.1" value={formData.total_hours_worked} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_payment">Total Payment</Label>
                  <Input id="total_payment" name="total_payment" type="number" step="0.01" value={formData.total_payment} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Input id="supervisor" name="supervisor" value={formData.supervisor} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</Button>
                <Button type="submit">Add Worker</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPayment}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gig Workers</CardTitle>
          <CardDescription>Manage contractors and track payments</CardDescription>
        </CardHeader>
        <CardContent>
          {workers.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No gig workers</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new gig worker.</p>
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Gig Worker
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Job Role</TableHead>
                  <TableHead>Hours Worked</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">{worker.worker_id}</TableCell>
                    <TableCell>{worker.worker_name}</TableCell>
                    <TableCell>{worker.job_role}</TableCell>
                    <TableCell>{worker.total_hours_worked || '-'}</TableCell>
                    <TableCell>${worker.total_payment || '0.00'}</TableCell>
                    <TableCell>
                      <Badge variant={worker.status === 'Active' ? 'default' : worker.status === 'Completed' ? 'secondary' : 'destructive'}>
                        {worker.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(worker)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(worker.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
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

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Gig Worker</DialogTitle>
            <DialogDescription>Update gig worker details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_worker_id">Worker ID *</Label>
                <Input id="edit_worker_id" name="worker_id" value={formData.worker_id} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_worker_name">Worker Name *</Label>
                <Input id="edit_worker_name" name="worker_name" value={formData.worker_name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_job_role">Job Role *</Label>
                <Input id="edit_job_role" name="job_role" value={formData.job_role} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_contact_number">Contact Number</Label>
                <Input id="edit_contact_number" name="contact_number" value={formData.contact_number} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_start_date">Start Date</Label>
                <Input id="edit_start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_end_date">End Date</Label>
                <Input id="edit_end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_hourly_rate">Hourly Rate</Label>
                <Input id="edit_hourly_rate" name="hourly_rate" type="number" step="0.01" value={formData.hourly_rate} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_total_hours_worked">Total Hours Worked</Label>
                <Input id="edit_total_hours_worked" name="total_hours_worked" type="number" step="0.1" value={formData.total_hours_worked} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_total_payment">Total Payment</Label>
                <Input id="edit_total_payment" name="total_payment" type="number" step="0.01" value={formData.total_payment} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_supervisor">Supervisor</Label>
                <Input id="edit_supervisor" name="supervisor" value={formData.supervisor} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status *</Label>
                <select id="edit_status" name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedWorker(null); resetForm(); }}>Cancel</Button>
              <Button type="submit">Update Worker</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}