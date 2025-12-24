import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/order-purchases/{id}:
 *   get:
 *     summary: Get an order/purchase by ID
 *     tags: [Order Purchases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM order_purchases WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order purchase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching order purchase:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/order-purchases/{id}:
 *   put:
 *     summary: Update an order/purchase
 *     tags: [Order Purchases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.keys(body).forEach(key => {
      if (key !== 'id' && key !== 'created_at') {
        updates.push(`${key} = $${paramCount}`);
        values.push(body[key]);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE order_purchases SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order purchase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating order purchase:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/order-purchases/{id}:
 *   delete:
 *     summary: Delete an order/purchase
 *     tags: [Order Purchases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM order_purchases WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order purchase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Order purchase deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting order purchase:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}