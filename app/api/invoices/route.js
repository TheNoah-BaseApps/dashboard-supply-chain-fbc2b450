import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     description: Retrieve a list of all invoices with pagination and filtering
 *     tags: [Invoices]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by invoice status
 *       - in: query
 *         name: supplier_name
 *         schema:
 *           type: string
 *         description: Filter by supplier name
 *     responses:
 *       200:
 *         description: List of invoices retrieved successfully
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
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const supplier_name = searchParams.get('supplier_name');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM invoices WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (supplier_name) {
      queryText += ` AND supplier_name ILIKE $${paramCount}`;
      params.push(`%${supplier_name}%`);
      paramCount++;
    }

    queryText += ` ORDER BY invoice_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    const countResult = await query('SELECT COUNT(*) FROM invoices WHERE 1=1' + 
      (status ? ` AND status = '${status}'` : '') +
      (supplier_name ? ` AND supplier_name ILIKE '%${supplier_name}%'` : ''));

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create a new invoice
 *     description: Add a new invoice to the system
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoice_number
 *               - supplier_name
 *               - invoice_date
 *               - due_date
 *               - total_amount
 *               - status
 *             properties:
 *               invoice_number:
 *                 type: string
 *               supplier_name:
 *                 type: string
 *               invoice_date:
 *                 type: string
 *                 format: date-time
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               total_amount:
 *                 type: number
 *               paid_amount:
 *                 type: number
 *               outstanding_amount:
 *                 type: number
 *               status:
 *                 type: string
 *               payment_method:
 *                 type: string
 *               notes:
 *                 type: string
 *               created_by:
 *                 type: string
 *               approved_by:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
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
      created_by,
      approved_by
    } = body;

    if (!invoice_number || !supplier_name || !invoice_date || !due_date || !total_amount || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO invoices (
        invoice_number, supplier_name, invoice_date, due_date, total_amount,
        paid_amount, outstanding_amount, status, payment_method, notes,
        created_by, approved_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        invoice_number, supplier_name, invoice_date, due_date, total_amount,
        paid_amount || 0, outstanding_amount || total_amount, status, payment_method,
        notes, created_by, approved_by
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}