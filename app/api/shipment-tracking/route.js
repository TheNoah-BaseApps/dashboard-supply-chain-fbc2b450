import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/shipment-tracking:
 *   get:
 *     summary: Get all shipment tracking records
 *     description: Retrieve a list of all shipment tracking records with pagination
 *     tags: [Shipment Tracking]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by shipment status
 *     responses:
 *       200:
 *         description: Successfully retrieved shipment tracking records
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

    let queryText = 'SELECT * FROM shipment_tracking';
    let params = [];
    
    if (status) {
      queryText += ' WHERE status = $1';
      params.push(status);
      queryText += ' ORDER BY shipment_date DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      queryText += ' ORDER BY shipment_date DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await query(queryText, params);
    
    const countQuery = status 
      ? 'SELECT COUNT(*) FROM shipment_tracking WHERE status = $1'
      : 'SELECT COUNT(*) FROM shipment_tracking';
    const countParams = status ? [status] : [];
    const countResult = await query(countQuery, countParams);
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
    console.error('Error fetching shipment tracking:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/shipment-tracking:
 *   post:
 *     summary: Create a new shipment tracking record
 *     description: Add a new shipment to the tracking system
 *     tags: [Shipment Tracking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipment_id
 *               - supplier_name
 *               - product_name
 *               - shipment_date
 *               - status
 *             properties:
 *               shipment_id:
 *                 type: string
 *               supplier_name:
 *                 type: string
 *               product_name:
 *                 type: string
 *               shipment_date:
 *                 type: string
 *                 format: date-time
 *               expected_delivery:
 *                 type: string
 *                 format: date-time
 *               current_location:
 *                 type: string
 *               status:
 *                 type: string
 *               tracking_number:
 *                 type: string
 *               weight:
 *                 type: number
 *               shipment_mode:
 *                 type: string
 *               carrier:
 *                 type: string
 *               signed_by:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shipment tracking record created successfully
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      shipment_id,
      supplier_name,
      product_name,
      shipment_date,
      expected_delivery,
      current_location,
      status,
      tracking_number,
      weight,
      shipment_mode,
      carrier,
      signed_by,
      notes
    } = body;

    if (!shipment_id || !supplier_name || !product_name || !shipment_date || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO shipment_tracking (
        shipment_id, supplier_name, product_name, shipment_date, expected_delivery,
        current_location, status, tracking_number, weight, shipment_mode,
        carrier, signed_by, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        shipment_id, supplier_name, product_name, shipment_date, expected_delivery,
        current_location, status, tracking_number, weight, shipment_mode,
        carrier, signed_by, notes
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating shipment tracking:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}