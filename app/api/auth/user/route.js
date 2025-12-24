/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *       401:
 *         description: Unauthorized
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/database/aurora';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const result = await query(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1',
      [user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error in GET /api/auth/user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}