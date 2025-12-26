import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     description: Retrieve a specific invoice by its ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice retrieved successfully
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM invoices WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Update invoice
 *     description: Update an existing invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      invoice_number,
      supplier_name,
      invoice_date,
      due_date,
      total_amount,
      paid_amount,
      outstanding_amount,
      status,
      payment_method,
      notes,
      approved_by
    } = body;

    const result = await query(
      `UPDATE invoices SET
        invoice_number = COALESCE($1, invoice_number),
        supplier_name = COALESCE($2, supplier_name),
        invoice_date = COALESCE($3, invoice_date),
        due_date = COALESCE($4, due_date),
        total_amount = COALESCE($5, total_amount),
        paid_amount = COALESCE($6, paid_amount),
        outstanding_amount = COALESCE($7, outstanding_amount),
        status = COALESCE($8, status),
        payment_method = COALESCE($9, payment_method),
        notes = COALESCE($10, notes),
        approved_by = COALESCE($11, approved_by),
        updated_at = NOW()
      WHERE id = $12
      RETURNING *`,
      [
        invoice_number, supplier_name, invoice_date, due_date, total_amount,
        paid_amount, outstanding_amount, status, payment_method, notes,
        approved_by, id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Delete invoice
 *     description: Delete an invoice from the system
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM invoices WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}