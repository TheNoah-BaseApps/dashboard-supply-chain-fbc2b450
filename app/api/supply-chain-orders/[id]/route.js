import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/supply-chain-orders/{id}:
 *   get:
 *     summary: Get a supply chain order by ID
 *     tags: [Supply Chain Orders]
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
    const result = await query('SELECT * FROM supply_chain_orders WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Supply chain order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching supply chain order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/supply-chain-orders/{id}:
 *   put:
 *     summary: Update a supply chain order
 *     tags: [Supply Chain Orders]
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
      `UPDATE supply_chain_orders SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Supply chain order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating supply chain order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/supply-chain-orders/{id}:
 *   delete:
 *     summary: Delete a supply chain order
 *     tags: [Supply Chain Orders]
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
    const result = await query('DELETE FROM supply_chain_orders WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Supply chain order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Supply chain order deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting supply chain order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}