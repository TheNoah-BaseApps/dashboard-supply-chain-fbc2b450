import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     description: Retrieve a list of all customers with pagination and filtering
 *     tags: [Customers]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by customer name or email
 *     responses:
 *       200:
 *         description: List of customers retrieved successfully
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
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      queryText += ` AND (customer_name ILIKE $${paramCount} OR customer_email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    const countResult = await query('SELECT COUNT(*) FROM customers WHERE 1=1' + 
      (search ? ` AND (customer_name ILIKE '%${search}%' OR customer_email ILIKE '%${search}%')` : ''));

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     description: Add a new customer to the system
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_name
 *               - customer_email
 *             properties:
 *               customer_name:
 *                 type: string
 *               customer_email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               orders_placed:
 *                 type: integer
 *               total_spent:
 *                 type: number
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_email,
      phone,
      address,
      orders_placed,
      total_spent
    } = body;

    if (!customer_name || !customer_email) {
      return NextResponse.json(
        { success: false, error: 'Customer name and email are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO customers (
        customer_name, customer_email, phone, address, orders_placed, total_spent
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [customer_name, customer_email, phone, address, orders_placed || 0, total_spent || 0]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}