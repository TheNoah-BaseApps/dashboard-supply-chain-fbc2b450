/**
 * @swagger
 * /api/inventory/export:
 *   get:
 *     summary: Export inventory to CSV
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/database/aurora';
import { convertToCSV, INVENTORY_EXPORT_HEADERS } from '@/lib/utils/export';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query('SELECT * FROM inventory_items ORDER BY item_name');
    const csv = convertToCSV(result.rows, INVENTORY_EXPORT_HEADERS);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=inventory_${new Date().toISOString().split('T')[0]}.csv`
      }
    });
  } catch (error) {
    console.error('Error in GET /api/inventory/export:', error);
    return NextResponse.json({ success: false, error: 'Failed to export inventory' }, { status: 500 });
  }
}