import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/manufacturing:
 *   get:
 *     summary: Get all manufacturing records
 *     description: Retrieve all manufacturing operations and factory management records with pagination
 *     tags: [Manufacturing]
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
 *         description: Filter by production status
 *     responses:
 *       200:
 *         description: List of manufacturing records
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

    let queryText = 'SELECT * FROM manufacturing';
    let queryParams = [];
    let paramIndex = 1;

    if (status) {
      queryText += ` WHERE production_status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    const countQuery = status 
      ? 'SELECT COUNT(*) FROM manufacturing WHERE production_status = $1'
      : 'SELECT COUNT(*) FROM manufacturing';
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
    console.error('Error fetching manufacturing records:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/manufacturing:
 *   post:
 *     summary: Create new manufacturing record
 *     description: Create a new manufacturing operation record
 *     tags: [Manufacturing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - manufacturing_id
 *               - factory_name
 *               - production_status
 *             properties:
 *               manufacturing_id:
 *                 type: string
 *               factory_name:
 *                 type: string
 *               production_start_date:
 *                 type: string
 *                 format: date-time
 *               production_end_date:
 *                 type: string
 *                 format: date-time
 *               total_units_produced:
 *                 type: integer
 *               defective_units:
 *                 type: integer
 *               production_cost:
 *                 type: number
 *               materials_used:
 *                 type: string
 *               labor_cost:
 *                 type: number
 *               overhead_costs:
 *                 type: number
 *               production_line:
 *                 type: string
 *               equipment_used:
 *                 type: string
 *               production_status:
 *                 type: string
 *               quality_control:
 *                 type: string
 *               safety_compliance:
 *                 type: string
 *               supervisor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Manufacturing record created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      manufacturing_id,
      factory_name,
      production_start_date,
      production_end_date,
      total_units_produced,
      defective_units,
      production_cost,
      materials_used,
      labor_cost,
      overhead_costs,
      production_line,
      equipment_used,
      production_status,
      quality_control,
      safety_compliance,
      supervisor
    } = body;

    if (!manufacturing_id || !factory_name || !production_status) {
      return NextResponse.json(
        { success: false, error: 'Manufacturing ID, factory name, and production status are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO manufacturing (
        manufacturing_id, factory_name, production_start_date, production_end_date,
        total_units_produced, defective_units, production_cost, materials_used,
        labor_cost, overhead_costs, production_line, equipment_used,
        production_status, quality_control, safety_compliance, supervisor
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        manufacturing_id, factory_name, production_start_date, production_end_date,
        total_units_produced, defective_units, production_cost, materials_used,
        labor_cost, overhead_costs, production_line, equipment_used,
        production_status, quality_control, safety_compliance, supervisor
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating manufacturing record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}