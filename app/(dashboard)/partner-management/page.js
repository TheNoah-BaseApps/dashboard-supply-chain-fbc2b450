'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Calendar,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function PartnerManagementPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    activeThisMonth: 0,
    totalTransactions: 0,
    avgTransactions: 0
  });

  const [formData, setFormData] = useState({
    partner_name: '',
    partner_email: '',
    contact_person: '',
    partnership_start: '',
    total_transactions: 0
  });

  useEffect(() => {
    fetchPartners();
  }, [searchTerm]);

  async function fetchPartners() {
    try {
      setLoading(true);
      const url = searchTerm 
        ? `/api/partners?search=${encodeURIComponent(searchTerm)}`
        : '/api/partners';
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setPartners(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to load partners');
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Error loading partners');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const total = data.length;
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const activeThisMonth = data.filter(p => {
      const startDate = new Date(p.partnership_start);
      return startDate >= firstOfMonth;
    }).length;
    
    const totalTransactions = data.reduce((sum, p) => sum + (p.total_transactions || 0), 0);
    const avgTransactions = total > 0 ? Math.round(totalTransactions / total) : 0;
    
    setStats({ total, activeThisMonth, totalTransactions, avgTransactions });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Partner created successfully');
        setShowAddModal(false);
        resetForm();
        fetchPartners();
      } else {
        toast.error(data.error || 'Failed to create partner');
      }
    } catch (error) {
      console.error('Error creating partner:', error);
      toast.error('Error creating partner');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/partners/${selectedPartner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Partner updated successfully');
        setShowEditModal(false);
        setSelectedPartner(null);
        resetForm();
        fetchPartners();
      } else {
        toast.error(data.error || 'Failed to update partner');
      }
    } catch (error) {
      console.error('Error updating partner:', error);
      toast.error('Error updating partner');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this partner?')) return;

    try {
      const res = await fetch(`/api/partners/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Partner deleted successfully');
        fetchPartners();
      } else {
        toast.error(data.error || 'Failed to delete partner');
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Error deleting partner');
    }
  }

  function resetForm() {
    setFormData({
      partner_name: '',
      partner_email: '',
      contact_person: '',
      partnership_start: '',
      total_transactions: 0
    });
  }

  function openEditModal(partner) {
    setSelectedPartner(partner);
    setFormData({
      partner_name: partner.partner_name || '',
      partner_email: partner.partner_email || '',
      contact_person: partner.contact_person || '',
      partnership_start: partner.partnership_start ? partner.partnership_start.split('T')[0] : '',
      total_transactions: partner.total_transactions || 0
    });
    setShowEditModal(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partner Management</h1>
          <p className="text-gray-600 mt-1">Manage business partnerships and relationships</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Partner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Partners</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New This Month</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeThisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgTransactions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Records</CardTitle>
        </CardHeader>
        <CardContent>
          {partners.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No partners yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first partner</p>
              <Button onClick={() => setShowAddModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Partner
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Partnership Start</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.partner_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {partner.partner_email}
                        </div>
                      </TableCell>
                      <TableCell>{partner.contact_person || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {partner.partnership_start ? new Date(partner.partnership_start).toLocaleDateString() : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{partner.total_transactions || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(partner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(partner.id)}
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

      {/* Add Partner Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Partner</DialogTitle>
            <DialogDescription>Create a new partner record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partner_name">Partner Name *</Label>
              <Input
                id="partner_name"
                value={formData.partner_name}
                onChange={(e) => setFormData({...formData, partner_name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partner_email">Email *</Label>
              <Input
                id="partner_email"
                type="email"
                value={formData.partner_email}
                onChange={(e) => setFormData({...formData, partner_email: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnership_start">Partnership Start Date</Label>
              <Input
                id="partnership_start"
                type="date"
                value={formData.partnership_start}
                onChange={(e) => setFormData({...formData, partnership_start: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_transactions">Total Transactions</Label>
              <Input
                id="total_transactions"
                type="number"
                value={formData.total_transactions}
                onChange={(e) => setFormData({...formData, total_transactions: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Partner</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Partner Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
            <DialogDescription>Update partner information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_partner_name">Partner Name *</Label>
              <Input
                id="edit_partner_name"
                value={formData.partner_name}
                onChange={(e) => setFormData({...formData, partner_name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_partner_email">Email *</Label>
              <Input
                id="edit_partner_email"
                type="email"
                value={formData.partner_email}
                onChange={(e) => setFormData({...formData, partner_email: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_contact_person">Contact Person</Label>
              <Input
                id="edit_contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_partnership_start">Partnership Start Date</Label>
              <Input
                id="edit_partnership_start"
                type="date"
                value={formData.partnership_start}
                onChange={(e) => setFormData({...formData, partnership_start: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_total_transactions">Total Transactions</Label>
              <Input
                id="edit_total_transactions"
                type="number"
                value={formData.total_transactions}
                onChange={(e) => setFormData({...formData, total_transactions: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedPartner(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Partner</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}