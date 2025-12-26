'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Edit, Trash2, Clock, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffingManagementPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    department: '',
    role: '',
    hire_date: '',
    contract_type: 'Full-Time',
    shift_type: 'Day',
    salary: '',
    performance_rating: '',
    training_status: 'Completed',
    shift_hours: '',
    overtime_hours: '',
    total_hours: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staffing-management');
      const data = await res.json();
      if (data.success) {
        setStaff(data.data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staffing-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Staff member added successfully');
        setShowAddModal(false);
        resetForm();
        fetchStaff();
      } else {
        toast.error(data.error || 'Failed to add staff member');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Failed to add staff member');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/staffing-management/${selectedStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Staff member updated successfully');
        setShowEditModal(false);
        setSelectedStaff(null);
        resetForm();
        fetchStaff();
      } else {
        toast.error(data.error || 'Failed to update staff member');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error('Failed to update staff member');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const res = await fetch(`/api/staffing-management/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Staff member deleted successfully');
        fetchStaff();
      } else {
        toast.error(data.error || 'Failed to delete staff member');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to delete staff member');
    }
  };

  const openEditModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      employee_id: staffMember.employee_id || '',
      name: staffMember.name || '',
      department: staffMember.department || '',
      role: staffMember.role || '',
      hire_date: staffMember.hire_date ? staffMember.hire_date.split('T')[0] : '',
      contract_type: staffMember.contract_type || 'Full-Time',
      shift_type: staffMember.shift_type || 'Day',
      salary: staffMember.salary || '',
      performance_rating: staffMember.performance_rating || '',
      training_status: staffMember.training_status || 'Completed',
      shift_hours: staffMember.shift_hours || '',
      overtime_hours: staffMember.overtime_hours || '',
      total_hours: staffMember.total_hours || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      name: '',
      department: '',
      role: '',
      hire_date: '',
      contract_type: 'Full-Time',
      shift_type: 'Day',
      salary: '',
      performance_rating: '',
      training_status: 'Completed',
      shift_hours: '',
      overtime_hours: '',
      total_hours: ''
    });
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Calculate stats
  const totalStaff = staff.length;
  const avgPerformance = staff.length > 0 
    ? (staff.reduce((sum, s) => sum + (parseFloat(s.performance_rating) || 0), 0) / staff.filter(s => s.performance_rating).length).toFixed(1)
    : '0';
  const totalHours = staff.reduce((sum, s) => sum + (parseFloat(s.total_hours) || 0), 0).toFixed(0);
  const fullTimeStaff = staff.filter(s => s.contract_type === 'Full-Time').length;

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
          <h1 className="text-3xl font-bold text-gray-900">Staffing Management</h1>
          <p className="text-gray-500 mt-1">Manage employees, contracts, and performance</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Enter employee details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID *</Label>
                  <Input id="employee_id" name="employee_id" value={formData.employee_id} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" name="department" value={formData.department} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input id="role" name="role" value={formData.role} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input id="hire_date" name="hire_date" type="date" value={formData.hire_date} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_type">Contract Type</Label>
                  <select id="contract_type" name="contract_type" value={formData.contract_type} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift_type">Shift Type</Label>
                  <select id="shift_type" name="shift_type" value={formData.shift_type} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                    <option value="Day">Day</option>
                    <option value="Night">Night</option>
                    <option value="Rotating">Rotating</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input id="salary" name="salary" type="number" step="0.01" value={formData.salary} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="performance_rating">Performance Rating</Label>
                  <Input id="performance_rating" name="performance_rating" type="number" step="0.1" min="0" max="5" value={formData.performance_rating} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="training_status">Training Status</Label>
                  <select id="training_status" name="training_status" value={formData.training_status} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Not Started">Not Started</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift_hours">Shift Hours</Label>
                  <Input id="shift_hours" name="shift_hours" type="number" step="0.1" value={formData.shift_hours} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overtime_hours">Overtime Hours</Label>
                  <Input id="overtime_hours" name="overtime_hours" type="number" step="0.1" value={formData.overtime_hours} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_hours">Total Hours</Label>
                  <Input id="total_hours" name="total_hours" type="number" step="0.1" value={formData.total_hours} onChange={handleChange} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</Button>
                <Button type="submit">Add Employee</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Full-Time Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fullTimeStaff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerformance}/5.0</div>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>Manage your workforce and track performance</CardDescription>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No employees</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new employee.</p>
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.employee_id}</TableCell>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.department || '-'}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                      <Badge variant={member.contract_type === 'Full-Time' ? 'default' : 'secondary'}>
                        {member.contract_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.performance_rating ? `${member.performance_rating}/5.0` : '-'}</TableCell>
                    <TableCell>{member.total_hours || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(member)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)}>
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
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_employee_id">Employee ID *</Label>
                <Input id="edit_employee_id" name="employee_id" value={formData.employee_id} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_name">Name *</Label>
                <Input id="edit_name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_department">Department</Label>
                <Input id="edit_department" name="department" value={formData.department} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_role">Role *</Label>
                <Input id="edit_role" name="role" value={formData.role} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_hire_date">Hire Date</Label>
                <Input id="edit_hire_date" name="hire_date" type="date" value={formData.hire_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_contract_type">Contract Type</Label>
                <select id="edit_contract_type" name="contract_type" value={formData.contract_type} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_shift_type">Shift Type</Label>
                <select id="edit_shift_type" name="shift_type" value={formData.shift_type} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                  <option value="Day">Day</option>
                  <option value="Night">Night</option>
                  <option value="Rotating">Rotating</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_salary">Salary</Label>
                <Input id="edit_salary" name="salary" type="number" step="0.01" value={formData.salary} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_performance_rating">Performance Rating</Label>
                <Input id="edit_performance_rating" name="performance_rating" type="number" step="0.1" min="0" max="5" value={formData.performance_rating} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_training_status">Training Status</Label>
                <select id="edit_training_status" name="training_status" value={formData.training_status} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Not Started">Not Started</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_shift_hours">Shift Hours</Label>
                <Input id="edit_shift_hours" name="shift_hours" type="number" step="0.1" value={formData.shift_hours} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_overtime_hours">Overtime Hours</Label>
                <Input id="edit_overtime_hours" name="overtime_hours" type="number" step="0.1" value={formData.overtime_hours} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_total_hours">Total Hours</Label>
                <Input id="edit_total_hours" name="total_hours" type="number" step="0.1" value={formData.total_hours} onChange={handleChange} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedStaff(null); resetForm(); }}>Cancel</Button>
              <Button type="submit">Update Employee</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}