'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, TrendingUp, Users, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedSales: 0
  });

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    try {
      setLoading(true);
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (data.success) {
        setSales(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to fetch sales');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Error loading sales data');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(salesData) {
    const total = salesData.length;
    const revenue = salesData.reduce((sum, sale) => sum + parseFloat(sale.total_sale_value || 0), 0);
    const pending = salesData.filter(s => s.sale_status === 'Pending').length;
    const completed = salesData.filter(s => s.sale_status === 'Completed').length;
    
    setStats({
      totalSales: total,
      totalRevenue: revenue,
      pendingOrders: pending,
      completedSales: completed
    });
  }

  async function handleAddSale(formData) {
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Sale created successfully');
        setIsAddModalOpen(false);
        fetchSales();
      } else {
        toast.error(data.error || 'Failed to create sale');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Error creating sale');
    }
  }

  async function handleEditSale(formData) {
    try {
      const res = await fetch(`/api/sales/${selectedSale.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Sale updated successfully');
        setIsEditModalOpen(false);
        setSelectedSale(null);
        fetchSales();
      } else {
        toast.error(data.error || 'Failed to update sale');
      }
    } catch (error) {
      console.error('Error updating sale:', error);
      toast.error('Error updating sale');
    }
  }

  async function handleDeleteSale(id) {
    if (!confirm('Are you sure you want to delete this sale?')) return;
    
    try {
      const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Sale deleted successfully');
        fetchSales();
      } else {
        toast.error(data.error || 'Failed to delete sale');
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('Error deleting sale');
    }
  }

  const filteredSales = sales.filter(sale =>
    sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sale_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-500 mt-1">Manage sales transactions and customer orders</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Sale</DialogTitle>
              <DialogDescription>Create a new sales transaction</DialogDescription>
            </DialogHeader>
            <SaleForm onSubmit={handleAddSale} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-gray-500 mt-1">All time transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Cumulative earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting fulfillment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Sales</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSales}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sales Transactions</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by customer or sale ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No sales found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new sale.</p>
              <div className="mt-6">
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sale
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sale ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Sale Date</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Sale Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.sale_id}</TableCell>
                      <TableCell>{sale.customer_name}</TableCell>
                      <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                      <TableCell>${parseFloat(sale.total_sale_value).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={sale.payment_status === 'Paid' ? 'success' : 'warning'}>
                          {sale.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sale.sale_status === 'Completed' ? 'success' : 'default'}>
                          {sale.sale_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSale(sale);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSale(sale.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
            <DialogDescription>Update sale transaction details</DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <SaleForm 
              initialData={selectedSale} 
              onSubmit={handleEditSale}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SaleForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState(initialData || {
    sale_id: '',
    customer_name: '',
    sale_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    total_sale_value: '',
    payment_status: 'Pending',
    items_sold: '',
    quantity_sold: '',
    sale_status: 'Pending',
    shipping_details: '',
    salesperson: '',
    payment_method: '',
    sale_reference: '',
    discount_applied: '',
    tax_details: '',
    customer_contact: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sale_id">Sale ID *</Label>
          <Input
            id="sale_id"
            value={formData.sale_id}
            onChange={(e) => setFormData({ ...formData, sale_id: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="customer_name">Customer Name *</Label>
          <Input
            id="customer_name"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="sale_date">Sale Date *</Label>
          <Input
            id="sale_date"
            type="date"
            value={formData.sale_date}
            onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="delivery_date">Delivery Date</Label>
          <Input
            id="delivery_date"
            type="date"
            value={formData.delivery_date}
            onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="total_sale_value">Total Sale Value *</Label>
          <Input
            id="total_sale_value"
            type="number"
            step="0.01"
            value={formData.total_sale_value}
            onChange={(e) => setFormData({ ...formData, total_sale_value: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="payment_status">Payment Status *</Label>
          <Select value={formData.payment_status} onValueChange={(value) => setFormData({ ...formData, payment_status: value })}>
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
          <Label htmlFor="sale_status">Sale Status *</Label>
          <Select value={formData.sale_status} onValueChange={(value) => setFormData({ ...formData, sale_status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="payment_method">Payment Method</Label>
          <Input
            id="payment_method"
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="salesperson">Salesperson</Label>
          <Input
            id="salesperson"
            value={formData.salesperson}
            onChange={(e) => setFormData({ ...formData, salesperson: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="customer_contact">Customer Contact</Label>
          <Input
            id="customer_contact"
            value={formData.customer_contact}
            onChange={(e) => setFormData({ ...formData, customer_contact: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="quantity_sold">Quantity Sold</Label>
          <Input
            id="quantity_sold"
            type="number"
            value={formData.quantity_sold}
            onChange={(e) => setFormData({ ...formData, quantity_sold: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="discount_applied">Discount Applied</Label>
          <Input
            id="discount_applied"
            type="number"
            step="0.01"
            value={formData.discount_applied}
            onChange={(e) => setFormData({ ...formData, discount_applied: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="items_sold">Items Sold</Label>
        <Textarea
          id="items_sold"
          value={formData.items_sold}
          onChange={(e) => setFormData({ ...formData, items_sold: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="shipping_details">Shipping Details</Label>
        <Textarea
          id="shipping_details"
          value={formData.shipping_details}
          onChange={(e) => setFormData({ ...formData, shipping_details: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="tax_details">Tax Details</Label>
        <Textarea
          id="tax_details"
          value={formData.tax_details}
          onChange={(e) => setFormData({ ...formData, tax_details: e.target.value })}
        />
      </div>
      <Button type="submit" className="w-full">
        {initialData ? 'Update Sale' : 'Create Sale'}
      </Button>
    </form>
  );
}