/**
 * @swagger
 * /api/validations/{id}/resolve:
 *   put:
 *     summary: Mark validation issue as resolved
 *     tags: [Validations]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/database/aurora';

export async function PUT(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const result = await query(
      'UPDATE data_validations SET resolved = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Validation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error in PUT /api/validations/[id]/resolve:', error);
    return NextResponse.json({ success: false, error: 'Failed to resolve validation' }, { status: 500 });
  }
}