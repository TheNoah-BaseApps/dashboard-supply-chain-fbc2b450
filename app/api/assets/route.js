import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Get all assets
 *     description: Retrieve all assets from the asset_management table
 *     tags: [Asset Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or item number
 *     responses:
 *       200:
 *         description: List of assets
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
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM asset_management';
    let countQuery = 'SELECT COUNT(*) FROM asset_management';
    const params = [];
    
    if (search) {
      queryText += ' WHERE name ILIKE $1 OR item_number ILIKE $1';
      countQuery += ' WHERE name ILIKE $1 OR item_number ILIKE $1';
      params.push(`%${search}%`);
    }
    
    queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [assets, countResult] = await Promise.all([
      query(queryText, params),
      query(countQuery, search ? [`%${search}%`] : [])
    ]);

    return NextResponse.json({
      success: true,
      data: assets.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Create a new asset
 *     description: Add a new asset to the asset_management table
 *     tags: [Asset Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_number
 *               - name
 *             properties:
 *               item_number:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               vendor:
 *                 type: string
 *               purchase_price_per_item:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               condition:
 *                 type: string
 *     responses:
 *       201:
 *         description: Asset created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      item_number,
      name,
      description,
      type,
      date_of_last_order,
      vendor,
      purchase_price_per_item,
      warranty_expiry_date,
      condition,
      quantity,
      value,
      asset_value,
      total_value,
      model,
      vendor_number,
      remarks,
      photograph_link
    } = body;

    if (!item_number || !name) {
      return NextResponse.json(
        { success: false, error: 'Item number and name are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO asset_management (
        item_number, name, description, type, date_of_last_order, vendor,
        purchase_price_per_item, warranty_expiry_date, condition, quantity,
        value, asset_value, total_value, model, vendor_number, remarks,
        photograph_link, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
      RETURNING *`,
      [
        item_number, name, description, type, date_of_last_order, vendor,
        purchase_price_per_item, warranty_expiry_date, condition, quantity,
        value, asset_value, total_value, model, vendor_number, remarks,
        photograph_link
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}