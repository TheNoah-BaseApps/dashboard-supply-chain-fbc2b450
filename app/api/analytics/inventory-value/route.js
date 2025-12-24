/**
 * @swagger
 * /api/analytics/inventory-value:
 *   get:
 *     summary: Get inventory value calculations
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

    const result = await query(`
      SELECT 
        SUM(total_inventory_value) as total_value,
        AVG(total_inventory_value) as average_value,
        COUNT(*) as item_count
      FROM inventory_items
    `);

    const data = {
      total_value: parseFloat(result.rows[0].total_value) || 0,
      average_value: parseFloat(result.rows[0].average_value) || 0,
      item_count: parseInt(result.rows[0].item_count) || 0
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in GET /api/analytics/inventory-value:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch inventory value' }, { status: 500 });
  }
}