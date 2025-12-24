'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SummaryMetrics from '@/components/analytics/SummaryMetrics';
import CostTrendChart from '@/components/analytics/CostTrendChart';
import InventoryValueChart from '@/components/analytics/InventoryValueChart';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [inventoryValue, setInventoryValue] = useState(null);
  const [costTrends, setCostTrends] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [summaryRes, valueRes, trendsRes] = await Promise.all([
        fetch('/api/analytics/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/analytics/inventory-value', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/analytics/cost-trends', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!summaryRes.ok || !valueRes.ok || !trendsRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [summaryData, valueData, trendsData] = await Promise.all([
        summaryRes.json(),
        valueRes.json(),
        trendsRes.json()
      ]);

      setSummary(summaryData.data);
      setInventoryValue(valueData.data);
      setCostTrends(trendsData.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
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
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Supply chain insights and trends</p>
      </div>

      <SummaryMetrics summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryValueChart data={inventoryValue} />
        <CostTrendChart data={costTrends} />
      </div>
    </div>
  );
}