import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Get asset by ID
 *     tags: [Asset Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asset details
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM asset_management WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     summary: Update asset
 *     tags: [Asset Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Asset updated
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      item_number,
      name,
      description,
      type,
      date_of_last_order,
      vendor,
      purchase_price_per_item,
      warranty_expiry_date,
      condition,
      quantity,
      value,
      asset_value,
      total_value,
      model,
      vendor_number,
      remarks,
      photograph_link
    } = body;

    const result = await query(
      `UPDATE asset_management SET
        item_number = $1, name = $2, description = $3, type = $4,
        date_of_last_order = $5, vendor = $6, purchase_price_per_item = $7,
        warranty_expiry_date = $8, condition = $9, quantity = $10,
        value = $11, asset_value = $12, total_value = $13, model = $14,
        vendor_number = $15, remarks = $16, photograph_link = $17, updated_at = NOW()
      WHERE id = $18 RETURNING *`,
      [
        item_number, name, description, type, date_of_last_order, vendor,
        purchase_price_per_item, warranty_expiry_date, condition, quantity,
        value, asset_value, total_value, model, vendor_number, remarks,
        photograph_link, id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/assets/{id}:
 *   delete:
 *     summary: Delete asset
 *     tags: [Asset Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asset deleted
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM asset_management WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}