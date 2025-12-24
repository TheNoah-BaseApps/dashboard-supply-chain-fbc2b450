/**
 * @swagger
 * /api/inventory/reorder-recommendations:
 *   get:
 *     summary: Get items that need reordering
 *     tags: [Inventory]
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

    const result = await query(
      `SELECT * FROM inventory_items 
       WHERE quantity <= reorder_level 
       ORDER BY quantity ASC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error in GET /api/inventory/reorder-recommendations:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}