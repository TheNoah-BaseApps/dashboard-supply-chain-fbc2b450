import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales
 *     description: Retrieve a list of all sales transactions with pagination
 *     tags: [Sales]
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
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by sale status
 *     responses:
 *       200:
 *         description: List of sales retrieved successfully
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
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM sales';
    let params = [];
    
    if (status) {
      queryText += ' WHERE sale_status = $1';
      params.push(status);
      queryText += ' ORDER BY sale_date DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      queryText += ' ORDER BY sale_date DESC LIMIT $1 OFFSET $2';
      params = [limit, offset];
    }

    const result = await query(queryText, params);
    
    const countResult = await query('SELECT COUNT(*) FROM sales');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Create a new sale
 *     description: Create a new sales transaction
 *     tags: [Sales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sale_id
 *               - customer_name
 *               - sale_date
 *               - total_sale_value
 *               - payment_status
 *               - sale_status
 *             properties:
 *               sale_id:
 *                 type: string
 *               customer_name:
 *                 type: string
 *               sale_date:
 *                 type: string
 *                 format: date-time
 *               delivery_date:
 *                 type: string
 *                 format: date-time
 *               total_sale_value:
 *                 type: number
 *               payment_status:
 *                 type: string
 *               items_sold:
 *                 type: string
 *               quantity_sold:
 *                 type: integer
 *               sale_status:
 *                 type: string
 *               shipping_details:
 *                 type: string
 *               salesperson:
 *                 type: string
 *               payment_method:
 *                 type: string
 *               sale_reference:
 *                 type: string
 *               discount_applied:
 *                 type: number
 *               tax_details:
 *                 type: string
 *               customer_contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sale created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      sale_id, customer_name, sale_date, delivery_date, total_sale_value,
      payment_status, items_sold, quantity_sold, sale_status, shipping_details,
      salesperson, payment_method, sale_reference, discount_applied, tax_details,
      customer_contact
    } = body;

    if (!sale_id || !customer_name || !sale_date || !total_sale_value || !payment_status || !sale_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO sales (
        sale_id, customer_name, sale_date, delivery_date, total_sale_value,
        payment_status, items_sold, quantity_sold, sale_status, shipping_details,
        salesperson, payment_method, sale_reference, discount_applied, tax_details,
        customer_contact, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
      RETURNING *`,
      [
        sale_id, customer_name, sale_date, delivery_date, total_sale_value,
        payment_status, items_sold, quantity_sold, sale_status, shipping_details,
        salesperson, payment_method, sale_reference, discount_applied, tax_details,
        customer_contact
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}