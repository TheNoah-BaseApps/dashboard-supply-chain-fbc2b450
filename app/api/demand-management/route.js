import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/demand-management:
 *   get:
 *     summary: Get all demand requests
 *     description: Retrieve a paginated list of all demand requests with filtering options
 *     tags: [Demand Management]
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
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Successful response
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
 *                 pagination:
 *                   type: object
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

    let queryText = 'SELECT * FROM demands WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      queryText += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    queryText += ` ORDER BY request_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    const countResult = await query('SELECT COUNT(*) FROM demands WHERE 1=1' + (status ? ' AND status = $1' : ''), status ? [status] : []);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching demand requests:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/demand-management:
 *   post:
 *     summary: Create a new demand request
 *     description: Add a new demand request to the system
 *     tags: [Demand Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - demand_id
 *               - product_name
 *               - quantity_requested
 *               - request_date
 *               - status
 *             properties:
 *               demand_id:
 *                 type: string
 *               product_name:
 *                 type: string
 *               product_category:
 *                 type: string
 *               quantity_requested:
 *                 type: integer
 *               requested_by:
 *                 type: string
 *               request_date:
 *                 type: string
 *                 format: date-time
 *               expected_delivery_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               priority_level:
 *                 type: string
 *     responses:
 *       201:
 *         description: Demand request created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      demand_id,
      product_name,
      product_category,
      quantity_requested,
      requested_by,
      request_date,
      expected_delivery_date,
      status,
      priority_level
    } = body;

    if (!demand_id || !product_name || !quantity_requested || !request_date || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: demand_id, product_name, quantity_requested, request_date, status' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO demands (
        demand_id, product_name, product_category, quantity_requested,
        requested_by, request_date, expected_delivery_date, status, priority_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [demand_id, product_name, product_category, quantity_requested, requested_by, request_date, expected_delivery_date, status, priority_level]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating demand request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}