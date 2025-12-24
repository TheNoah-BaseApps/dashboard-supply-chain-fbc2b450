'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ValidationTable from '@/components/validations/ValidationTable';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { toast } from 'sonner';

export default function ValidationsPage() {
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchValidations();
  }, []);

  const fetchValidations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/validations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch validations');

      const data = await res.json();
      setValidations(data.data || []);
    } catch (err) {
      console.error('Error fetching validations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/validations/${id}/resolve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to resolve validation');

      toast.success('Validation issue resolved');
      fetchValidations();
    } catch (err) {
      console.error('Error resolving validation:', err);
      toast.error('Failed to resolve validation');
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
        <h1 className="text-3xl font-bold text-gray-900">Data Validations</h1>
        <p className="text-gray-600 mt-2">Review and resolve data inconsistencies</p>
      </div>

      <ValidationTable
        validations={validations}
        onResolve={handleResolve}
      />
    </div>
  );
}