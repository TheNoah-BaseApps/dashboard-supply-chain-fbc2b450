/**
 * @swagger
 * /api/analytics/cost-trends:
 *   get:
 *     summary: Get cost trend analysis
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
        item_name,
        current_cost_per_unit,
        unit_cost_paid,
        (unit_cost_paid - current_cost_per_unit) as cost_variance,
        CASE 
          WHEN current_cost_per_unit > 0 THEN 
            ((unit_cost_paid - current_cost_per_unit) / current_cost_per_unit * 100)
          ELSE 0
        END as variance_percent
      FROM inventory_items
      WHERE current_cost_per_unit > 0
      ORDER BY ABS(unit_cost_paid - current_cost_per_unit) DESC
      LIMIT 20
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error in GET /api/analytics/cost-trends:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch cost trends' }, { status: 500 });
  }
}