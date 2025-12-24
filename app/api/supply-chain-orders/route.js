import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/supply-chain-orders:
 *   get:
 *     summary: Get all supply chain orders
 *     description: Retrieve a list of all supply chain orders with pagination
 *     tags: [Supply Chain Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List retrieved successfully
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

    let queryText = 'SELECT * FROM supply_chain_orders';
    let params = [];
    
    if (status) {
      queryText += ' WHERE order_status = $1';
      params.push(status);
      queryText += ' ORDER BY order_date DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      queryText += ' ORDER BY order_date DESC LIMIT $1 OFFSET $2';
      params = [limit, offset];
    }

    const result = await query(queryText, params);
    
    const countResult = await query('SELECT COUNT(*) FROM supply_chain_orders');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching supply chain orders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/supply-chain-orders:
 *   post:
 *     summary: Create a new supply chain order
 *     tags: [Supply Chain Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_number
 *               - customer_name
 *               - order_date
 *               - order_status
 *               - total_amount
 *     responses:
 *       201:
 *         description: Created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      order_number, customer_name, order_date, delivery_date,
      order_status, total_amount
    } = body;

    if (!order_number || !customer_name || !order_date || !order_status || !total_amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO supply_chain_orders (
        order_number, customer_name, order_date, delivery_date,
        order_status, total_amount, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [order_number, customer_name, order_date, delivery_date, order_status, total_amount]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating supply chain order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}