import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/production-management:
 *   get:
 *     summary: Get all production management records
 *     description: Retrieve all production planning and tracking records with pagination
 *     tags: [Production Management]
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
 *         description: List of production management records
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

    let queryText = 'SELECT * FROM production_management';
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
      ? 'SELECT COUNT(*) FROM production_management WHERE production_status = $1'
      : 'SELECT COUNT(*) FROM production_management';
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
    console.error('Error fetching production management records:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/production-management:
 *   post:
 *     summary: Create new production management record
 *     description: Create a new production planning and tracking record
 *     tags: [Production Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - production_id
 *               - production_date
 *               - production_status
 *             properties:
 *               production_id:
 *                 type: string
 *               production_date:
 *                 type: string
 *                 format: date-time
 *               total_units_produced:
 *                 type: integer
 *               production_cost:
 *                 type: number
 *               materials_used:
 *                 type: string
 *               labor_cost:
 *                 type: number
 *               production_line:
 *                 type: string
 *               production_status:
 *                 type: string
 *               production_supervisor:
 *                 type: string
 *               safety_compliance:
 *                 type: string
 *               quality_control:
 *                 type: string
 *               equipment_used:
 *                 type: string
 *               defective_units:
 *                 type: integer
 *               overhead_costs:
 *                 type: number
 *               production_priority:
 *                 type: string
 *               contact_person:
 *                 type: string
 *     responses:
 *       201:
 *         description: Production management record created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      production_id,
      production_date,
      total_units_produced,
      production_cost,
      materials_used,
      labor_cost,
      production_line,
      production_status,
      production_supervisor,
      safety_compliance,
      quality_control,
      equipment_used,
      defective_units,
      overhead_costs,
      production_priority,
      contact_person
    } = body;

    if (!production_id || !production_date || !production_status) {
      return NextResponse.json(
        { success: false, error: 'Production ID, production date, and production status are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO production_management (
        production_id, production_date, total_units_produced, production_cost,
        materials_used, labor_cost, production_line, production_status,
        production_supervisor, safety_compliance, quality_control, equipment_used,
        defective_units, overhead_costs, production_priority, contact_person
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        production_id, production_date, total_units_produced, production_cost,
        materials_used, labor_cost, production_line, production_status,
        production_supervisor, safety_compliance, quality_control, equipment_used,
        defective_units, overhead_costs, production_priority, contact_person
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating production management record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}