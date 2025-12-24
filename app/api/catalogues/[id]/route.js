import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/catalogues/{id}:
 *   get:
 *     summary: Get catalogue by ID
 *     tags: [Catalogue Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Catalogue details
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM catalogue_management WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Catalogue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching catalogue:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/catalogues/{id}:
 *   put:
 *     summary: Update catalogue
 *     tags: [Catalogue Management]
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
      catalogue_name,
      product_count,
      creation_date,
      last_updated,
      is_active,
      description
    } = body;

    const result = await query(
      `UPDATE catalogue_management SET
        catalogue_name = $1, product_count = $2, creation_date = $3,
        last_updated = $4, is_active = $5, description = $6, updated_at = NOW()
      WHERE id = $7 RETURNING *`,
      [catalogue_name, product_count, creation_date, last_updated, is_active, description, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Catalogue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating catalogue:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/catalogues/{id}:
 *   delete:
 *     summary: Delete catalogue
 *     tags: [Catalogue Management]
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
    const result = await query('DELETE FROM catalogue_management WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Catalogue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Catalogue deleted successfully' });
  } catch (error) {
    console.error('Error deleting catalogue:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}