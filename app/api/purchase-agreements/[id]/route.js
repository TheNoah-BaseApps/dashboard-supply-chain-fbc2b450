import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/purchase-agreements/{id}:
 *   get:
 *     summary: Get purchase agreement by ID
 *     description: Retrieve a specific purchase agreement by its ID
 *     tags: [Purchase Agreements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase agreement ID
 *     responses:
 *       200:
 *         description: Successfully retrieved purchase agreement
 *       404:
 *         description: Purchase agreement not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM purchase_agreements WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Purchase agreement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching purchase agreement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/purchase-agreements/{id}:
 *   put:
 *     summary: Update purchase agreement
 *     description: Update an existing purchase agreement
 *     tags: [Purchase Agreements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase agreement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Purchase agreement updated successfully
 *       404:
 *         description: Purchase agreement not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'agreement_id', 'supplier_name', 'agreement_start_date', 'agreement_end_date',
      'total_agreement_value', 'payment_schedule', 'products_covered', 'terms_of_service',
      'governing_law', 'penalties_for_breach', 'status'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(body[field]);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE purchase_agreements 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Purchase agreement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating purchase agreement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/purchase-agreements/{id}:
 *   delete:
 *     summary: Delete purchase agreement
 *     description: Delete a purchase agreement by ID
 *     tags: [Purchase Agreements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase agreement ID
 *     responses:
 *       200:
 *         description: Purchase agreement deleted successfully
 *       404:
 *         description: Purchase agreement not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM purchase_agreements WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Purchase agreement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Purchase agreement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting purchase agreement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}