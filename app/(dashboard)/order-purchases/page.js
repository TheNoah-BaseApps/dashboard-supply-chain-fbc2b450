'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, TrendingUp, CheckCircle, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function OrderPurchasesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch('/api/order-purchases');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders data');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(ordersData) {
    const total = ordersData.length;
    const amount = ordersData.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const pending = ordersData.filter(o => o.order_status === 'Pending').length;
    const completed = ordersData.filter(o => o.order_status === 'Completed').length;
    
    setStats({
      totalOrders: total,
      totalAmount: amount,
      pendingOrders: pending,
      completedOrders: completed
    });
  }

  async function handleAddOrder(formData) {
    try {
      const res = await fetch('/api/order-purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Order created successfully');
        setIsAddModalOpen(false);
        fetchOrders();
      } else {
        toast.error(data.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error creating order');
    }
  }

  async function handleEditOrder(formData) {
    try {
      const res = await fetch(`/api/order-purchases/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Order updated successfully');
        setIsEditModalOpen(false);
        setSelectedOrder(null);
        fetchOrders();
      } else {
        toast.error(data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error updating order');
    }
  }

  async function handleDeleteOrder(id) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
      const res = await fetch(`/api/order-purchases/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Order deleted successfully');
        fetchOrders();
      } else {
        toast.error(data.error || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error deleting order');
    }
  }

  const filteredOrders = orders.filter(order =>
    order.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_id?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Order & Purchases</h1>
          <p className="text-gray-500 mt-1">Manage purchase orders and supplier transactions</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Order</DialogTitle>
              <DialogDescription>Create a new purchase order</DialogDescription>
            </DialogHeader>
            <OrderForm onSubmit={handleAddOrder} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">All purchase orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Cumulative spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully received</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Purchase Orders</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by supplier or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new purchase order.</p>
              <div className="mt-6">
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Order
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_id}</TableCell>
                      <TableCell>{order.supplier_name}</TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>${parseFloat(order.total_amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={order.payment_status === 'Paid' ? 'success' : 'warning'}>
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.order_status === 'Completed' ? 'success' : 'default'}>
                          {order.order_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id)}
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
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Update purchase order details</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <OrderForm 
              initialData={selectedOrder} 
              onSubmit={handleEditOrder}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState(initialData || {
    order_id: '',
    purchase_id: '',
    supplier_name: '',
    purchase_date: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    total_amount: '',
    payment_terms: '',
    items_ordered: '',
    quantity_ordered: '',
    quantity_received: '',
    order_status: 'Pending',
    purchase_order_reference: '',
    payment_status: 'Pending',
    shipping_details: '',
    order_priority: 'Normal',
    contact_person: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="order_id">Order ID *</Label>
          <Input
            id="order_id"
            value={formData.order_id}
            onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="purchase_id">Purchase ID</Label>
          <Input
            id="purchase_id"
            value={formData.purchase_id}
            onChange={(e) => setFormData({ ...formData, purchase_id: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="supplier_name">Supplier Name *</Label>
          <Input
            id="supplier_name"
            value={formData.supplier_name}
            onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="order_date">Order Date *</Label>
          <Input
            id="order_date"
            type="date"
            value={formData.order_date}
            onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Input
            id="purchase_date"
            type="date"
            value={formData.purchase_date}
            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
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
          <Label htmlFor="total_amount">Total Amount *</Label>
          <Input
            id="total_amount"
            type="number"
            step="0.01"
            value={formData.total_amount}
            onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
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
          <Label htmlFor="order_status">Order Status *</Label>
          <Select value={formData.order_status} onValueChange={(value) => setFormData({ ...formData, order_status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="order_priority">Order Priority</Label>
          <Select value={formData.order_priority} onValueChange={(value) => setFormData({ ...formData, order_priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="quantity_ordered">Quantity Ordered</Label>
          <Input
            id="quantity_ordered"
            type="number"
            value={formData.quantity_ordered}
            onChange={(e) => setFormData({ ...formData, quantity_ordered: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="quantity_received">Quantity Received</Label>
          <Input
            id="quantity_received"
            type="number"
            value={formData.quantity_received}
            onChange={(e) => setFormData({ ...formData, quantity_received: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="purchase_order_reference">PO Reference</Label>
          <Input
            id="purchase_order_reference"
            value={formData.purchase_order_reference}
            onChange={(e) => setFormData({ ...formData, purchase_order_reference: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="items_ordered">Items Ordered</Label>
        <Textarea
          id="items_ordered"
          value={formData.items_ordered}
          onChange={(e) => setFormData({ ...formData, items_ordered: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="payment_terms">Payment Terms</Label>
        <Textarea
          id="payment_terms"
          value={formData.payment_terms}
          onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
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
      <Button type="submit" className="w-full">
        {initialData ? 'Update Order' : 'Create Order'}
      </Button>
    </form>
  );
}