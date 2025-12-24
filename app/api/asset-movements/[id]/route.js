import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/asset-movements/{id}:
 *   get:
 *     summary: Get asset movement by ID
 *     tags: [Asset Movement Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asset movement details
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM asset_movement_management WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Asset movement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching asset movement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/asset-movements/{id}:
 *   put:
 *     summary: Update asset movement
 *     tags: [Asset Movement Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      asset_id,
      from_location,
      to_location,
      movement_date,
      movement_type,
      authorized_by,
      quantity_moved,
      transporter,
      vehicle_details,
      movement_cost,
      remarks
    } = body;

    const result = await query(
      `UPDATE asset_movement_management SET
        asset_id = $1, from_location = $2, to_location = $3, movement_date = $4,
        movement_type = $5, authorized_by = $6, quantity_moved = $7,
        transporter = $8, vehicle_details = $9, movement_cost = $10,
        remarks = $11, updated_at = NOW()
      WHERE id = $12 RETURNING *`,
      [
        asset_id, from_location, to_location, movement_date, movement_type,
        authorized_by, quantity_moved, transporter, vehicle_details,
        movement_cost, remarks, id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Asset movement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating asset movement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/asset-movements/{id}:
 *   delete:
 *     summary: Delete asset movement
 *     tags: [Asset Movement Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM asset_movement_management WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Asset movement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Asset movement deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset movement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}