import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/logistics:
 *   get:
 *     summary: Get all shipments
 *     description: Retrieve all logistics shipments with pagination
 *     tags: [Logistics Management]
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
 *         description: Filter by delivery status
 *     responses:
 *       200:
 *         description: Shipments retrieved successfully
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [limit, offset];
    
    if (status) {
      whereClause = 'WHERE delivery_status = $3';
      queryParams = [limit, offset, status];
    }

    const result = await query(
      `SELECT * FROM logistics_management ${whereClause} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      queryParams
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM logistics_management ${whereClause}`,
      status ? [status] : []
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/logistics:
 *   post:
 *     summary: Create shipment
 *     description: Add a new shipment to logistics tracking
 *     tags: [Logistics Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipment_id
 *               - carrier_name
 *               - delivery_status
 *             properties:
 *               shipment_id:
 *                 type: string
 *               carrier_name:
 *                 type: string
 *               dispatch_date:
 *                 type: string
 *                 format: date-time
 *               estimated_arrival:
 *                 type: string
 *                 format: date-time
 *               delivery_status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shipment created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      shipment_id, carrier_name, dispatch_date,
      estimated_arrival, delivery_status
    } = body;

    if (!shipment_id || !carrier_name || !delivery_status) {
      return NextResponse.json(
        { success: false, error: 'Shipment ID, carrier name, and delivery status are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO logistics_management (
        shipment_id, carrier_name, dispatch_date, estimated_arrival,
        delivery_status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [shipment_id, carrier_name, dispatch_date, estimated_arrival, delivery_status]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating shipment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}