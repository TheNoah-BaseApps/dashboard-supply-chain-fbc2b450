'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ExpenseManagementPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [formData, setFormData] = useState({
    expense_id: '',
    expense_category: '',
    amount_spent: '',
    vendor_name: '',
    date_of_expense: '',
    payment_method: 'Credit Card',
    currency: 'USD',
    description: '',
    approval_status: 'Pending',
    approved_by: '',
    expense_type: 'One-time',
    recurring_expense: false,
    payment_due_date: '',
    payment_status: 'Pending',
    tax_amount: '',
    total_expense: '',
    notes: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/expense-management');
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data);
      } else {
        toast.error('Failed to fetch expenses');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Error loading expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedExpense 
        ? `/api/expense-management/${selectedExpense.id}`
        : '/api/expense-management';
      
      const method = selectedExpense ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(selectedExpense ? 'Expense updated successfully' : 'Expense created successfully');
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
        fetchExpenses();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Error saving expense');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const res = await fetch(`/api/expense-management/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Expense deleted successfully');
        fetchExpenses();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Error deleting expense');
    }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setFormData({
      expense_id: expense.expense_id,
      expense_category: expense.expense_category,
      amount_spent: expense.amount_spent,
      vendor_name: expense.vendor_name,
      date_of_expense: expense.date_of_expense?.split('T')[0] || '',
      payment_method: expense.payment_method || 'Credit Card',
      currency: expense.currency || 'USD',
      description: expense.description || '',
      approval_status: expense.approval_status,
      approved_by: expense.approved_by || '',
      expense_type: expense.expense_type || 'One-time',
      recurring_expense: expense.recurring_expense || false,
      payment_due_date: expense.payment_due_date?.split('T')[0] || '',
      payment_status: expense.payment_status,
      tax_amount: expense.tax_amount || '',
      total_expense: expense.total_expense || '',
      notes: expense.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      expense_id: '',
      expense_category: '',
      amount_spent: '',
      vendor_name: '',
      date_of_expense: '',
      payment_method: 'Credit Card',
      currency: 'USD',
      description: '',
      approval_status: 'Pending',
      approved_by: '',
      expense_type: 'One-time',
      recurring_expense: false,
      payment_due_date: '',
      payment_status: 'Pending',
      tax_amount: '',
      total_expense: '',
      notes: ''
    });
    setSelectedExpense(null);
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.expense_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.expense_category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount_spent) || 0), 0);
  const approvedExpenses = expenses.filter(e => e.approval_status === 'Approved').length;
  const pendingExpenses = expenses.filter(e => e.approval_status === 'Pending').length;
  const paidExpenses = expenses.filter(e => e.payment_status === 'Paid').length;

  const stats = [
    { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, icon: DollarSign },
    { label: 'Total Records', value: expenses.length, icon: DollarSign },
    { label: 'Approved', value: approvedExpenses, icon: DollarSign },
    { label: 'Paid', value: paidExpenses, icon: DollarSign }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
          <p className="mt-2 text-gray-600">Track and manage company expenses</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expense Records</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No expenses found</p>
              <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Expense
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.expense_id}</TableCell>
                    <TableCell>{expense.expense_category}</TableCell>
                    <TableCell>{expense.vendor_name}</TableCell>
                    <TableCell>{new Date(expense.date_of_expense).toLocaleDateString()}</TableCell>
                    <TableCell>${parseFloat(expense.amount_spent || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        expense.approval_status === 'Approved' ? 'bg-green-100 text-green-800' :
                        expense.approval_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {expense.approval_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        expense.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {expense.payment_status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(expense)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)}>
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

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Create a new expense record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expense_id">Expense ID*</Label>
                <Input
                  id="expense_id"
                  value={formData.expense_id}
                  onChange={(e) => setFormData({...formData, expense_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="expense_category">Category*</Label>
                <Input
                  id="expense_category"
                  value={formData.expense_category}
                  onChange={(e) => setFormData({...formData, expense_category: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="vendor_name">Vendor Name*</Label>
                <Input
                  id="vendor_name"
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({...formData, vendor_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date_of_expense">Date*</Label>
                <Input
                  id="date_of_expense"
                  type="date"
                  value={formData.date_of_expense}
                  onChange={(e) => setFormData({...formData, date_of_expense: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount_spent">Amount*</Label>
                <Input
                  id="amount_spent"
                  type="number"
                  step="0.01"
                  value={formData.amount_spent}
                  onChange={(e) => setFormData({...formData, amount_spent: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="approval_status">Approval Status*</Label>
                <Select value={formData.approval_status} onValueChange={(value) => setFormData({...formData, approval_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment_status">Payment Status*</Label>
                <Select value={formData.payment_status} onValueChange={(value) => setFormData({...formData, payment_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="approved_by">Approved By</Label>
                <Input
                  id="approved_by"
                  value={formData.approved_by}
                  onChange={(e) => setFormData({...formData, approved_by: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="tax_amount">Tax Amount</Label>
                <Input
                  id="tax_amount"
                  type="number"
                  step="0.01"
                  value={formData.tax_amount}
                  onChange={(e) => setFormData({...formData, tax_amount: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="total_expense">Total Expense</Label>
                <Input
                  id="total_expense"
                  type="number"
                  step="0.01"
                  value={formData.total_expense}
                  onChange={(e) => setFormData({...formData, total_expense: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring_expense"
                checked={formData.recurring_expense}
                onCheckedChange={(checked) => setFormData({...formData, recurring_expense: checked})}
              />
              <Label htmlFor="recurring_expense" className="cursor-pointer">Recurring Expense</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Expense</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update expense details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_expense_id">Expense ID*</Label>
                <Input
                  id="edit_expense_id"
                  value={formData.expense_id}
                  onChange={(e) => setFormData({...formData, expense_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_expense_category">Category*</Label>
                <Input
                  id="edit_expense_category"
                  value={formData.expense_category}
                  onChange={(e) => setFormData({...formData, expense_category: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_vendor_name">Vendor Name*</Label>
                <Input
                  id="edit_vendor_name"
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({...formData, vendor_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_date_of_expense">Date*</Label>
                <Input
                  id="edit_date_of_expense"
                  type="date"
                  value={formData.date_of_expense}
                  onChange={(e) => setFormData({...formData, date_of_expense: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_amount_spent">Amount*</Label>
                <Input
                  id="edit_amount_spent"
                  type="number"
                  step="0.01"
                  value={formData.amount_spent}
                  onChange={(e) => setFormData({...formData, amount_spent: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_currency">Currency</Label>
                <Input
                  id="edit_currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_payment_method">Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_approval_status">Approval Status*</Label>
                <Select value={formData.approval_status} onValueChange={(value) => setFormData({...formData, approval_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_payment_status">Payment Status*</Label>
                <Select value={formData.payment_status} onValueChange={(value) => setFormData({...formData, payment_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_approved_by">Approved By</Label>
                <Input
                  id="edit_approved_by"
                  value={formData.approved_by}
                  onChange={(e) => setFormData({...formData, approved_by: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_tax_amount">Tax Amount</Label>
                <Input
                  id="edit_tax_amount"
                  type="number"
                  step="0.01"
                  value={formData.tax_amount}
                  onChange={(e) => setFormData({...formData, tax_amount: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_total_expense">Total Expense</Label>
                <Input
                  id="edit_total_expense"
                  type="number"
                  step="0.01"
                  value={formData.total_expense}
                  onChange={(e) => setFormData({...formData, total_expense: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit_recurring_expense"
                checked={formData.recurring_expense}
                onCheckedChange={(checked) => setFormData({...formData, recurring_expense: checked})}
              />
              <Label htmlFor="edit_recurring_expense" className="cursor-pointer">Recurring Expense</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Expense</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}