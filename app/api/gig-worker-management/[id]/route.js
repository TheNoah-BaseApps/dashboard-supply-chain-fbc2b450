import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/gig-worker-management/{id}:
 *   get:
 *     summary: Get gig worker by ID
 *     description: Retrieve a single gig worker by their ID
 *     tags: [Gig Worker Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gig worker ID
 *     responses:
 *       200:
 *         description: Gig worker details
 *       404:
 *         description: Gig worker not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM gig_worker_management WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Gig worker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching gig worker:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/gig-worker-management/{id}:
 *   put:
 *     summary: Update gig worker
 *     description: Update an existing gig worker's information
 *     tags: [Gig Worker Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gig worker ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Gig worker updated successfully
 *       404:
 *         description: Gig worker not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE gig_worker_management SET
        worker_id = COALESCE($1, worker_id),
        worker_name = COALESCE($2, worker_name),
        job_role = COALESCE($3, job_role),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        hourly_rate = COALESCE($6, hourly_rate),
        total_hours_worked = COALESCE($7, total_hours_worked),
        total_payment = COALESCE($8, total_payment),
        contact_number = COALESCE($9, contact_number),
        supervisor = COALESCE($10, supervisor),
        status = COALESCE($11, status),
        updated_at = NOW()
      WHERE id = $12
      RETURNING *`,
      [
        worker_id, worker_name, job_role, start_date, end_date,
        hourly_rate, total_hours_worked, total_payment, contact_number,
        supervisor, status, id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Gig worker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating gig worker:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/gig-worker-management/{id}:
 *   delete:
 *     summary: Delete gig worker
 *     description: Remove a gig worker from the system
 *     tags: [Gig Worker Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gig worker ID
 *     responses:
 *       200:
 *         description: Gig worker deleted successfully
 *       404:
 *         description: Gig worker not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'DELETE FROM gig_worker_management WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Gig worker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Gig worker deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting gig worker:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}