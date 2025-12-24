/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getAuditLogs } from '@/lib/audit';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      workflow: searchParams.get('workflow'),
      action: searchParams.get('action'),
      user_id: searchParams.get('user_id'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date')
    };

    const logs = await getAuditLogs(filters);

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error in GET /api/audit-logs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}