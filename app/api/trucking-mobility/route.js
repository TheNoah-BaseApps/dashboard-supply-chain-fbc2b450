import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/trucking-mobility:
 *   get:
 *     summary: Get all trucking and mobility records
 *     description: Retrieve a list of all trucking and mobility management records
 *     tags: [Trucking and Mobility Management]
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
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *     responses:
 *       200:
 *         description: Successfully retrieved trucking and mobility records
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
    const year = searchParams.get('year');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM trucking_mobility';
    let params = [];
    
    if (year) {
      queryText += ' WHERE year = $1';
      params.push(year);
      queryText += ' ORDER BY year DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      queryText += ' ORDER BY year DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await query(queryText, params);
    
    const countQuery = year 
      ? 'SELECT COUNT(*) FROM trucking_mobility WHERE year = $1'
      : 'SELECT COUNT(*) FROM trucking_mobility';
    const countParams = year ? [year] : [];
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
    console.error('Error fetching trucking mobility:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/trucking-mobility:
 *   post:
 *     summary: Create a new trucking and mobility record
 *     description: Add a new trucking and mobility management record
 *     tags: [Trucking and Mobility Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *             properties:
 *               year:
 *                 type: integer
 *               domestic_freight_volume:
 *                 type: number
 *               international_imports_freight_volume:
 *                 type: number
 *               international_exports_freight_volume:
 *                 type: number
 *               total_freight_volume:
 *                 type: number
 *               freight_by_road:
 *                 type: number
 *               freight_by_rail:
 *                 type: number
 *               freight_by_air:
 *                 type: number
 *               freight_by_sea:
 *                 type: number
 *               freight_by_pipeline:
 *                 type: number
 *               domestic_avg_shipment_value:
 *                 type: number
 *               international_imports_avg_shipment_value:
 *                 type: number
 *               international_exports_avg_shipment_value:
 *                 type: number
 *               domestic_transportation_costs:
 *                 type: number
 *               international_imports_transportation_costs:
 *                 type: number
 *               international_exports_transportation_costs:
 *                 type: number
 *               total_transportation_costs:
 *                 type: number
 *     responses:
 *       201:
 *         description: Trucking and mobility record created successfully
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      year,
      domestic_freight_volume,
      international_imports_freight_volume,
      international_exports_freight_volume,
      total_freight_volume,
      freight_by_road,
      freight_by_rail,
      freight_by_air,
      freight_by_sea,
      freight_by_pipeline,
      domestic_avg_shipment_value,
      international_imports_avg_shipment_value,
      international_exports_avg_shipment_value,
      domestic_transportation_costs,
      international_imports_transportation_costs,
      international_exports_transportation_costs,
      total_transportation_costs
    } = body;

    if (!year) {
      return NextResponse.json(
        { success: false, error: 'Year is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO trucking_mobility (
        year, domestic_freight_volume, international_imports_freight_volume,
        international_exports_freight_volume, total_freight_volume,
        freight_by_road, freight_by_rail, freight_by_air, freight_by_sea,
        freight_by_pipeline, domestic_avg_shipment_value,
        international_imports_avg_shipment_value,
        international_exports_avg_shipment_value,
        domestic_transportation_costs,
        international_imports_transportation_costs,
        international_exports_transportation_costs,
        total_transportation_costs,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
      RETURNING *`,
      [
        year, domestic_freight_volume, international_imports_freight_volume,
        international_exports_freight_volume, total_freight_volume,
        freight_by_road, freight_by_rail, freight_by_air, freight_by_sea,
        freight_by_pipeline, domestic_avg_shipment_value,
        international_imports_avg_shipment_value,
        international_exports_avg_shipment_value,
        domestic_transportation_costs,
        international_imports_transportation_costs,
        international_exports_transportation_costs,
        total_transportation_costs
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating trucking mobility:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}