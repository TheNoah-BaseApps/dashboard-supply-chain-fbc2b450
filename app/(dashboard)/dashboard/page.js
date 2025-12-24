'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StatsCard from '@/components/dashboard/StatsCard';
import ChartWidget from '@/components/dashboard/ChartWidget';
import RecentChanges from '@/components/dashboard/RecentChanges';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Package, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget />
        <RecentChanges changes={recentChanges} />
      </div>
    </div>
  );
}