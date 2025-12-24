'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import StatsCard from '@/components/dashboard/StatsCard';
import ChartWidget from '@/components/dashboard/ChartWidget';
import RecentChanges from '@/components/dashboard/RecentChanges';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Package, DollarSign, AlertTriangle, TrendingUp, Warehouse, Truck, Users, BookOpen, BarChart3, CheckSquare, Database, ShoppingBag, PackageCheck } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recentChanges, setRecentChanges] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [summaryRes, auditRes] = await Promise.all([
        fetch('/api/analytics/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/audit-logs?limit=10', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!summaryRes.ok || !auditRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const summaryData = await summaryRes.json();
      const auditData = await auditRes.json();

      setSummary(summaryData.data);
      setRecentChanges(auditData.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Supply chain management overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Suppliers"
          value={summary?.total_suppliers || 0}
          icon={Package}
          trend={summary?.suppliers_trend}
        />
        <StatsCard
          title="Total Inventory Value"
          value={`$${(summary?.total_inventory_value || 0).toLocaleString()}`}
          icon={DollarSign}
          trend={summary?.value_trend}
        />
        <StatsCard
          title="Low Stock Items"
          value={summary?.low_stock_count || 0}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatsCard
          title="Items in Stock"
          value={summary?.total_items || 0}
          icon={TrendingUp}
          trend={summary?.items_trend}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/warehouse">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Warehouse className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Warehouse Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Manage warehouse inventory, stock levels, and product information
                </p>
                {summary?.total_items !== undefined && (
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {summary.total_items} items in stock
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/logistics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Logistics Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Track shipments and manage delivery logistics
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vendors">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Vendor Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Manage vendor relationships and contracts
                </p>
                {summary?.total_suppliers !== undefined && (
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {summary.total_suppliers} active vendors
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/suppliers">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">Supplier Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Manage supplier information and relationships
                </p>
                {summary?.total_suppliers !== undefined && (
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {summary.total_suppliers} suppliers
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/inventory">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Database className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">Inventory Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Track and manage inventory levels and stock movements
                </p>
                {summary?.total_items !== undefined && (
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {summary.total_items} items tracked
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/assets">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Package className="h-6 w-6 text-cyan-600" />
                  </div>
                  <CardTitle className="text-lg">Asset Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Manage and track organizational assets
                </p>
                {summary?.total_assets !== undefined && (
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {summary.total_assets} assets
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/asset-movements">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Truck className="h-6 w-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-lg">Asset Movement Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Track asset transfers and movements
                </p>
                {summary?.recent_movements !== undefined && (
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {summary.recent_movements} recent movements
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/catalogues">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-pink-600" />
                  </div>
                  <CardTitle className="text-lg">Catalogue Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Manage product catalogues and collections
                </p>
                {summary?.total_catalogues !== undefined && (
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {summary.total_catalogues} catalogues
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg">Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  View analytics and insights for supply chain operations
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/validations">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <CheckSquare className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">Validations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Validate data integrity and compliance across workflows
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/sales">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg">Sales</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Manage sales transactions and customer orders
                </p>
                {summary?.total_sales !== undefined && (
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {summary.total_sales} total sales
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/order-purchases">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-violet-600" />
                  </div>
                  <CardTitle className="text-lg">Order & Purchases</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Manage purchase orders and supplier transactions
                </p>
                {summary?.active_orders !== undefined && (
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {summary.active_orders} active orders
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/supply-chain-orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-lime-100 rounded-lg">
                    <PackageCheck className="h-6 w-6 text-lime-600" />
                  </div>
                  <CardTitle className="text-lg">Supply Chain Orders</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Manage supply chain order processing and fulfillment
                </p>
                {summary?.supply_chain_orders !== undefined && (
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {summary.supply_chain_orders} orders
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget />
        <RecentChanges changes={recentChanges} />
      </div>
    </div>
  );
}