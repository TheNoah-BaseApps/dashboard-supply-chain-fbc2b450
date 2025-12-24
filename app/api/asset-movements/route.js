import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/asset-movements:
 *   get:
 *     summary: Get all asset movements
 *     description: Retrieve all asset movements from the asset_movement_management table
 *     tags: [Asset Movement Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: asset_id
 *         schema:
 *           type: string
 *         description: Filter by asset ID
 *     responses:
 *       200:
 *         description: List of asset movements
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const asset_id = searchParams.get('asset_id') || '';
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM asset_movement_management';
    let countQuery = 'SELECT COUNT(*) FROM asset_movement_management';
    const params = [];
    
    if (asset_id) {
      queryText += ' WHERE asset_id ILIKE $1';
      countQuery += ' WHERE asset_id ILIKE $1';
      params.push(`%${asset_id}%`);
    }
    
    queryText += ' ORDER BY movement_date DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [movements, countResult] = await Promise.all([
      query(queryText, params),
      query(countQuery, asset_id ? [`%${asset_id}%`] : [])
    ]);

    return NextResponse.json({
      success: true,
      data: movements.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching asset movements:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/asset-movements:
 *   post:
 *     summary: Create a new asset movement
 *     tags: [Asset Movement Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - from_location
 *               - to_location
 *               - movement_date
 *     responses:
 *       201:
 *         description: Asset movement created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      asset_id,
      from_location,
      to_location,
      movement_date,
      movement_type,
      authorized_by,
      quantity_moved,
      transporter,
      vehicle_details,
      movement_cost,
      remarks
    } = body;

    if (!asset_id || !from_location || !to_location || !movement_date) {
      return NextResponse.json(
        { success: false, error: 'Asset ID, from location, to location, and movement date are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO asset_movement_management (
        asset_id, from_location, to_location, movement_date, movement_type,
        authorized_by, quantity_moved, transporter, vehicle_details,
        movement_cost, remarks, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *`,
      [
        asset_id, from_location, to_location, movement_date, movement_type,
        authorized_by, quantity_moved, transporter, vehicle_details,
        movement_cost, remarks
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating asset movement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}