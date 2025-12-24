import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/order-purchases:
 *   get:
 *     summary: Get all order purchases
 *     description: Retrieve a list of all orders and purchases with pagination
 *     tags: [Order Purchases]
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

    let queryText = 'SELECT * FROM order_purchases';
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
    
    const countResult = await query('SELECT COUNT(*) FROM order_purchases');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching order purchases:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/order-purchases:
 *   post:
 *     summary: Create a new order/purchase
 *     tags: [Order Purchases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - supplier_name
 *               - order_date
 *               - total_amount
 *               - order_status
 *               - payment_status
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
      order_id, purchase_id, supplier_name, purchase_date, order_date,
      delivery_date, total_amount, payment_terms, items_ordered, quantity_ordered,
      quantity_received, order_status, purchase_order_reference, payment_status,
      shipping_details, order_priority, contact_person
    } = body;

    if (!order_id || !supplier_name || !order_date || !total_amount || !order_status || !payment_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO order_purchases (
        order_id, purchase_id, supplier_name, purchase_date, order_date,
        delivery_date, total_amount, payment_terms, items_ordered, quantity_ordered,
        quantity_received, order_status, purchase_order_reference, payment_status,
        shipping_details, order_priority, contact_person, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
      RETURNING *`,
      [
        order_id, purchase_id, supplier_name, purchase_date, order_date,
        delivery_date, total_amount, payment_terms, items_ordered, quantity_ordered,
        quantity_received, order_status, purchase_order_reference, payment_status,
        shipping_details, order_priority, contact_person
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order purchase:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}