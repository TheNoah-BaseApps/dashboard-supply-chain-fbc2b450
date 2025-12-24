/**
 * @swagger
 * /api/validations:
 *   get:
 *     summary: Get data validation issues
 *     tags: [Validations]
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
      `SELECT * FROM data_validations 
       ORDER BY 
         CASE severity 
           WHEN 'error' THEN 1 
           WHEN 'warning' THEN 2 
           ELSE 3 
         END,
         created_at DESC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error in GET /api/validations:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch validations' }, { status: 500 });
  }
}