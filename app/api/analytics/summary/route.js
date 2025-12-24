/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Get dashboard summary metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/database/aurora';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [suppliersResult, inventoryResult, lowStockResult, valueResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM suppliers'),
      query('SELECT COUNT(*) as count FROM inventory_items'),
      query('SELECT COUNT(*) as count FROM inventory_items WHERE quantity <= reorder_level'),
      query('SELECT SUM(total_inventory_value) as total FROM inventory_items')
    ]);

    const summary = {
      total_suppliers: parseInt(suppliersResult.rows[0].count) || 0,
      total_items: parseInt(inventoryResult.rows[0].count) || 0,
      low_stock_count: parseInt(lowStockResult.rows[0].count) || 0,
      total_inventory_value: parseFloat(valueResult.rows[0].total) || 0
    };

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error in GET /api/analytics/summary:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch summary' }, { status: 500 });
  }
}