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
import { FileText, Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function PurchaseAgreementsPage() {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [formData, setFormData] = useState({
    agreement_id: '',
    supplier_name: '',
    agreement_start_date: '',
    agreement_end_date: '',
    total_agreement_value: '',
    payment_schedule: '',
    products_covered: '',
    terms_of_service: '',
    governing_law: '',
    penalties_for_breach: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/purchase-agreements');
      const data = await res.json();
      if (data.success) {
        setAgreements(data.data);
      } else {
        toast.error('Failed to fetch purchase agreements');
      }
    } catch (error) {
      console.error('Error fetching agreements:', error);
      toast.error('Error loading purchase agreements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedAgreement 
        ? `/api/purchase-agreements/${selectedAgreement.id}`
        : '/api/purchase-agreements';
      
      const method = selectedAgreement ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(selectedAgreement ? 'Agreement updated successfully' : 'Agreement created successfully');
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
        fetchAgreements();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving agreement:', error);
      toast.error('Error saving agreement');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this agreement?')) return;

    try {
      const res = await fetch(`/api/purchase-agreements/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Agreement deleted successfully');
        fetchAgreements();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting agreement:', error);
      toast.error('Error deleting agreement');
    }
  };

  const handleEdit = (agreement) => {
    setSelectedAgreement(agreement);
    setFormData({
      agreement_id: agreement.agreement_id,
      supplier_name: agreement.supplier_name,
      agreement_start_date: agreement.agreement_start_date?.split('T')[0] || '',
      agreement_end_date: agreement.agreement_end_date?.split('T')[0] || '',
      total_agreement_value: agreement.total_agreement_value || '',
      payment_schedule: agreement.payment_schedule || '',
      products_covered: agreement.products_covered || '',
      terms_of_service: agreement.terms_of_service || '',
      governing_law: agreement.governing_law || '',
      penalties_for_breach: agreement.penalties_for_breach || '',
      status: agreement.status
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      agreement_id: '',
      supplier_name: '',
      agreement_start_date: '',
      agreement_end_date: '',
      total_agreement_value: '',
      payment_schedule: '',
      products_covered: '',
      terms_of_service: '',
      governing_law: '',
      penalties_for_breach: '',
      status: 'Active'
    });
    setSelectedAgreement(null);
  };

  const filteredAgreements = agreements.filter(agreement =>
    agreement.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agreement.agreement_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Agreements', value: agreements.length, icon: FileText },
    { label: 'Active', value: agreements.filter(a => a.status === 'Active').length, icon: FileText },
    { label: 'Expired', value: agreements.filter(a => a.status === 'Expired').length, icon: FileText },
    { label: 'Total Value', value: `$${agreements.reduce((sum, a) => sum + (parseFloat(a.total_agreement_value) || 0), 0).toLocaleString()}`, icon: FileText }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading purchase agreements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Agreements</h1>
          <p className="mt-2 text-gray-600">Manage supplier purchase agreements and contracts</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Agreement
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
            <CardTitle>Purchase Agreements</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search agreements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAgreements.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No purchase agreements found</p>
              <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Agreement
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agreement ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgreements.map((agreement) => (
                  <TableRow key={agreement.id}>
                    <TableCell className="font-medium">{agreement.agreement_id}</TableCell>
                    <TableCell>{agreement.supplier_name}</TableCell>
                    <TableCell>{new Date(agreement.agreement_start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(agreement.agreement_end_date).toLocaleDateString()}</TableCell>
                    <TableCell>${parseFloat(agreement.total_agreement_value || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agreement.status === 'Active' ? 'bg-green-100 text-green-800' :
                        agreement.status === 'Expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {agreement.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(agreement)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(agreement.id)}>
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
            <DialogTitle>Add Purchase Agreement</DialogTitle>
            <DialogDescription>Create a new purchase agreement record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agreement_id">Agreement ID*</Label>
                <Input
                  id="agreement_id"
                  value={formData.agreement_id}
                  onChange={(e) => setFormData({...formData, agreement_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="supplier_name">Supplier Name*</Label>
                <Input
                  id="supplier_name"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="agreement_start_date">Start Date*</Label>
                <Input
                  id="agreement_start_date"
                  type="date"
                  value={formData.agreement_start_date}
                  onChange={(e) => setFormData({...formData, agreement_start_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="agreement_end_date">End Date*</Label>
                <Input
                  id="agreement_end_date"
                  type="date"
                  value={formData.agreement_end_date}
                  onChange={(e) => setFormData({...formData, agreement_end_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="total_agreement_value">Total Value</Label>
                <Input
                  id="total_agreement_value"
                  type="number"
                  step="0.01"
                  value={formData.total_agreement_value}
                  onChange={(e) => setFormData({...formData, total_agreement_value: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="status">Status*</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="payment_schedule">Payment Schedule</Label>
              <Input
                id="payment_schedule"
                value={formData.payment_schedule}
                onChange={(e) => setFormData({...formData, payment_schedule: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="products_covered">Products Covered</Label>
              <Textarea
                id="products_covered"
                value={formData.products_covered}
                onChange={(e) => setFormData({...formData, products_covered: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="terms_of_service">Terms of Service</Label>
              <Textarea
                id="terms_of_service"
                value={formData.terms_of_service}
                onChange={(e) => setFormData({...formData, terms_of_service: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="governing_law">Governing Law</Label>
              <Input
                id="governing_law"
                value={formData.governing_law}
                onChange={(e) => setFormData({...formData, governing_law: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="penalties_for_breach">Penalties for Breach</Label>
              <Textarea
                id="penalties_for_breach"
                value={formData.penalties_for_breach}
                onChange={(e) => setFormData({...formData, penalties_for_breach: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Agreement</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Purchase Agreement</DialogTitle>
            <DialogDescription>Update purchase agreement details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_agreement_id">Agreement ID*</Label>
                <Input
                  id="edit_agreement_id"
                  value={formData.agreement_id}
                  onChange={(e) => setFormData({...formData, agreement_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_supplier_name">Supplier Name*</Label>
                <Input
                  id="edit_supplier_name"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_agreement_start_date">Start Date*</Label>
                <Input
                  id="edit_agreement_start_date"
                  type="date"
                  value={formData.agreement_start_date}
                  onChange={(e) => setFormData({...formData, agreement_start_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_agreement_end_date">End Date*</Label>
                <Input
                  id="edit_agreement_end_date"
                  type="date"
                  value={formData.agreement_end_date}
                  onChange={(e) => setFormData({...formData, agreement_end_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_total_agreement_value">Total Value</Label>
                <Input
                  id="edit_total_agreement_value"
                  type="number"
                  step="0.01"
                  value={formData.total_agreement_value}
                  onChange={(e) => setFormData({...formData, total_agreement_value: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status*</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit_payment_schedule">Payment Schedule</Label>
              <Input
                id="edit_payment_schedule"
                value={formData.payment_schedule}
                onChange={(e) => setFormData({...formData, payment_schedule: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_products_covered">Products Covered</Label>
              <Textarea
                id="edit_products_covered"
                value={formData.products_covered}
                onChange={(e) => setFormData({...formData, products_covered: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_terms_of_service">Terms of Service</Label>
              <Textarea
                id="edit_terms_of_service"
                value={formData.terms_of_service}
                onChange={(e) => setFormData({...formData, terms_of_service: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_governing_law">Governing Law</Label>
              <Input
                id="edit_governing_law"
                value={formData.governing_law}
                onChange={(e) => setFormData({...formData, governing_law: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_penalties_for_breach">Penalties for Breach</Label>
              <Textarea
                id="edit_penalties_for_breach"
                value={formData.penalties_for_breach}
                onChange={(e) => setFormData({...formData, penalties_for_breach: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Agreement</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}