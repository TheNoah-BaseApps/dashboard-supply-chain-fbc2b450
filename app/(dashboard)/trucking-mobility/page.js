'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { TruckIcon, DollarSign, BarChart3, Package, Loader2, Search, Plus } from 'lucide-react';

export default function TruckingMobilityPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    domestic_freight_volume: '',
    international_imports_freight_volume: '',
    international_exports_freight_volume: '',
    total_freight_volume: '',
    freight_by_road: '',
    freight_by_rail: '',
    freight_by_air: '',
    freight_by_sea: '',
    freight_by_pipeline: '',
    domestic_avg_shipment_value: '',
    international_imports_avg_shipment_value: '',
    international_exports_avg_shipment_value: '',
    domestic_transportation_costs: '',
    international_imports_transportation_costs: '',
    international_exports_transportation_costs: '',
    total_transportation_costs: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/trucking-mobility');
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      }
    } catch (error) {
      console.error('Error fetching trucking mobility records:', error);
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = selectedRecord 
        ? `/api/trucking-mobility/${selectedRecord.id}`
        : '/api/trucking-mobility';
      
      const method = selectedRecord ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(selectedRecord ? 'Record updated successfully' : 'Record added successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchRecords();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      year: record.year || new Date().getFullYear(),
      domestic_freight_volume: record.domestic_freight_volume || '',
      international_imports_freight_volume: record.international_imports_freight_volume || '',
      international_exports_freight_volume: record.international_exports_freight_volume || '',
      total_freight_volume: record.total_freight_volume || '',
      freight_by_road: record.freight_by_road || '',
      freight_by_rail: record.freight_by_rail || '',
      freight_by_air: record.freight_by_air || '',
      freight_by_sea: record.freight_by_sea || '',
      freight_by_pipeline: record.freight_by_pipeline || '',
      domestic_avg_shipment_value: record.domestic_avg_shipment_value || '',
      international_imports_avg_shipment_value: record.international_imports_avg_shipment_value || '',
      international_exports_avg_shipment_value: record.international_exports_avg_shipment_value || '',
      domestic_transportation_costs: record.domestic_transportation_costs || '',
      international_imports_transportation_costs: record.international_imports_transportation_costs || '',
      international_exports_transportation_costs: record.international_exports_transportation_costs || '',
      total_transportation_costs: record.total_transportation_costs || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const res = await fetch(`/api/trucking-mobility/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Record deleted successfully');
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
    }
  };

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear(),
      domestic_freight_volume: '',
      international_imports_freight_volume: '',
      international_exports_freight_volume: '',
      total_freight_volume: '',
      freight_by_road: '',
      freight_by_rail: '',
      freight_by_air: '',
      freight_by_sea: '',
      freight_by_pipeline: '',
      domestic_avg_shipment_value: '',
      international_imports_avg_shipment_value: '',
      international_exports_avg_shipment_value: '',
      domestic_transportation_costs: '',
      international_imports_transportation_costs: '',
      international_exports_transportation_costs: '',
      total_transportation_costs: ''
    });
    setSelectedRecord(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredRecords = records.filter(r =>
    r.year?.toString().includes(searchTerm)
  );

  const stats = {
    totalRecords: records.length,
    avgTransportCost: records.length > 0 
      ? (records.reduce((sum, r) => sum + (parseFloat(r.total_transportation_costs) || 0), 0) / records.length).toFixed(2)
      : 0,
    totalFreight: records.length > 0
      ? records.reduce((sum, r) => sum + (parseFloat(r.total_freight_volume) || 0), 0).toFixed(2)
      : 0,
    latestYear: records.length > 0 ? Math.max(...records.map(r => r.year)) : new Date().getFullYear()
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trucking and Mobility Management</h1>
          <p className="text-muted-foreground">Track freight volumes, costs, and transportation metrics</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transport Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgTransportCost}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Freight</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFreight}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Year</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.latestYear}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trucking and Mobility Records</CardTitle>
          <CardDescription>Annual freight and transportation data</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No records found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new record.</p>
              <div className="mt-6">
                <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Record
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Total Freight Volume</TableHead>
                    <TableHead>Freight by Road</TableHead>
                    <TableHead>Freight by Rail</TableHead>
                    <TableHead>Total Transport Costs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.year}</TableCell>
                      <TableCell>{record.total_freight_volume || '-'}</TableCell>
                      <TableCell>{record.freight_by_road || '-'}</TableCell>
                      <TableCell>{record.freight_by_rail || '-'}</TableCell>
                      <TableCell>${parseFloat(record.total_transportation_costs || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(record)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRecord ? 'Edit Record' : 'Add New Record'}</DialogTitle>
            <DialogDescription>
              {selectedRecord ? 'Update trucking and mobility data' : 'Enter annual trucking and mobility metrics'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Freight Volumes</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="domestic_freight_volume">Domestic Freight Volume</Label>
                  <Input
                    id="domestic_freight_volume"
                    name="domestic_freight_volume"
                    type="number"
                    step="0.01"
                    value={formData.domestic_freight_volume}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="international_imports_freight_volume">International Imports Volume</Label>
                  <Input
                    id="international_imports_freight_volume"
                    name="international_imports_freight_volume"
                    type="number"
                    step="0.01"
                    value={formData.international_imports_freight_volume}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="international_exports_freight_volume">International Exports Volume</Label>
                  <Input
                    id="international_exports_freight_volume"
                    name="international_exports_freight_volume"
                    type="number"
                    step="0.01"
                    value={formData.international_exports_freight_volume}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_freight_volume">Total Freight Volume</Label>
                  <Input
                    id="total_freight_volume"
                    name="total_freight_volume"
                    type="number"
                    step="0.01"
                    value={formData.total_freight_volume}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Freight by Mode</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="freight_by_road">Freight By Road</Label>
                  <Input
                    id="freight_by_road"
                    name="freight_by_road"
                    type="number"
                    step="0.01"
                    value={formData.freight_by_road}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freight_by_rail">Freight By Rail</Label>
                  <Input
                    id="freight_by_rail"
                    name="freight_by_rail"
                    type="number"
                    step="0.01"
                    value={formData.freight_by_rail}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freight_by_air">Freight By Air</Label>
                  <Input
                    id="freight_by_air"
                    name="freight_by_air"
                    type="number"
                    step="0.01"
                    value={formData.freight_by_air}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freight_by_sea">Freight By Sea</Label>
                  <Input
                    id="freight_by_sea"
                    name="freight_by_sea"
                    type="number"
                    step="0.01"
                    value={formData.freight_by_sea}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freight_by_pipeline">Freight By Pipeline</Label>
                  <Input
                    id="freight_by_pipeline"
                    name="freight_by_pipeline"
                    type="number"
                    step="0.01"
                    value={formData.freight_by_pipeline}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Average Shipment Values</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="domestic_avg_shipment_value">Domestic Avg Shipment Value</Label>
                  <Input
                    id="domestic_avg_shipment_value"
                    name="domestic_avg_shipment_value"
                    type="number"
                    step="0.01"
                    value={formData.domestic_avg_shipment_value}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="international_imports_avg_shipment_value">Intl Imports Avg Shipment Value</Label>
                  <Input
                    id="international_imports_avg_shipment_value"
                    name="international_imports_avg_shipment_value"
                    type="number"
                    step="0.01"
                    value={formData.international_imports_avg_shipment_value}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="international_exports_avg_shipment_value">Intl Exports Avg Shipment Value</Label>
                  <Input
                    id="international_exports_avg_shipment_value"
                    name="international_exports_avg_shipment_value"
                    type="number"
                    step="0.01"
                    value={formData.international_exports_avg_shipment_value}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Transportation Costs</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="domestic_transportation_costs">Domestic Transportation Costs</Label>
                  <Input
                    id="domestic_transportation_costs"
                    name="domestic_transportation_costs"
                    type="number"
                    step="0.01"
                    value={formData.domestic_transportation_costs}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="international_imports_transportation_costs">Intl Imports Transportation Costs</Label>
                  <Input
                    id="international_imports_transportation_costs"
                    name="international_imports_transportation_costs"
                    type="number"
                    step="0.01"
                    value={formData.international_imports_transportation_costs}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="international_exports_transportation_costs">Intl Exports Transportation Costs</Label>
                  <Input
                    id="international_exports_transportation_costs"
                    name="international_exports_transportation_costs"
                    type="number"
                    step="0.01"
                    value={formData.international_exports_transportation_costs}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_transportation_costs">Total Transportation Costs</Label>
                  <Input
                    id="total_transportation_costs"
                    name="total_transportation_costs"
                    type="number"
                    step="0.01"
                    value={formData.total_transportation_costs}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  selectedRecord ? 'Update Record' : 'Add Record'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}