import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/gig-worker-management:
 *   get:
 *     summary: Get all gig workers
 *     description: Retrieve a list of all gig workers with pagination and filtering
 *     tags: [Gig Worker Management]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of gig workers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM gig_worker_management';
    const params = [];
    
    if (status) {
      sql += ' WHERE status = $1';
      params.push(status);
      sql += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      sql += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows 
    });
  } catch (error) {
    console.error('Error fetching gig workers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/gig-worker-management:
 *   post:
 *     summary: Create a new gig worker
 *     description: Add a new gig worker to the system
 *     tags: [Gig Worker Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - worker_id
 *               - worker_name
 *               - job_role
 *               - status
 *             properties:
 *               worker_id:
 *                 type: string
 *               worker_name:
 *                 type: string
 *               job_role:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               hourly_rate:
 *                 type: number
 *               total_hours_worked:
 *                 type: number
 *               total_payment:
 *                 type: number
 *               contact_number:
 *                 type: string
 *               supervisor:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gig worker created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      worker_id,
      worker_name,
      job_role,
      start_date,
      end_date,
      hourly_rate,
      total_hours_worked,
      total_payment,
      contact_number,
      supervisor,
      status
    } = body;

    if (!worker_id || !worker_name || !job_role || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: worker_id, worker_name, job_role, status' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO gig_worker_management (
        worker_id, worker_name, job_role, start_date, end_date,
        hourly_rate, total_hours_worked, total_payment, contact_number,
        supervisor, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *`,
      [
        worker_id, worker_name, job_role, start_date, end_date,
        hourly_rate, total_hours_worked, total_payment, contact_number,
        supervisor, status
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating gig worker:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}