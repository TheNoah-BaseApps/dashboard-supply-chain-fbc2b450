import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/manufacturing:
 *   get:
 *     summary: Get all manufacturing records
 *     description: Retrieve all manufacturing operations and factory management records with advanced filtering and pagination
 *     tags: [Manufacturing]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed, delayed, cancelled]
 *         description: Filter by production status
 *       - in: query
 *         name: factory_name
 *         schema:
 *           type: string
 *         description: Filter by factory name
 *       - in: query
 *         name: supervisor
 *         schema:
 *           type: string
 *         description: Filter by supervisor name
 *       - in: query
 *         name: production_line
 *         schema:
 *           type: string
 *         description: Filter by production line
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records starting from this date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records up to this date
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, production_start_date, production_cost, total_units_produced]
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of manufacturing records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       manufacturing_id:
 *                         type: string
 *                         example: "MFG-2024-001"
 *                       factory_name:
 *                         type: string
 *                         example: "Factory A"
 *                       production_start_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T08:00:00Z"
 *                       production_end_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-20T18:00:00Z"
 *                       total_units_produced:
 *                         type: integer
 *                         example: 1000
 *                       defective_units:
 *                         type: integer
 *                         example: 10
 *                       production_cost:
 *                         type: number
 *                         example: 50000.00
 *                       materials_used:
 *                         type: string
 *                         example: "Steel, Plastic, Electronics"
 *                       labor_cost:
 *                         type: number
 *                         example: 15000.00
 *                       overhead_costs:
 *                         type: number
 *                         example: 5000.00
 *                       production_line:
 *                         type: string
 *                         example: "Line A"
 *                       equipment_used:
 *                         type: string
 *                         example: "CNC Machine, Assembly Robot"
 *                       production_status:
 *                         type: string
 *                         example: "completed"
 *                       quality_control:
 *                         type: string
 *                         example: "Passed"
 *                       safety_compliance:
 *                         type: string
 *                         example: "Compliant"
 *                       supervisor:
 *                         type: string
 *                         example: "John Doe"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Bad request - Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid pagination parameters"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const factory_name = searchParams.get('factory_name');
    const supervisor = searchParams.get('supervisor');
    const production_line = searchParams.get('production_line');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Validate sort parameters
    const validSortFields = ['created_at', 'production_start_date', 'production_cost', 'total_units_produced'];
    const validSortOrders = ['asc', 'desc'];
    if (!validSortFields.includes(sort_by) || !validSortOrders.includes(sort_order.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid sort parameters' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM manufacturing';
    let queryParams = [];
    let paramIndex = 1;
    const conditions = [];

    if (status) {
      conditions.push(`production_status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (factory_name) {
      conditions.push(`factory_name ILIKE $${paramIndex}`);
      queryParams.push(`%${factory_name}%`);
      paramIndex++;
    }

    if (supervisor) {
      conditions.push(`supervisor ILIKE $${paramIndex}`);
      queryParams.push(`%${supervisor}%`);
      paramIndex++;
    }

    if (production_line) {
      conditions.push(`production_line = $${paramIndex}`);
      queryParams.push(production_line);
      paramIndex++;
    }

    if (start_date) {
      conditions.push(`production_start_date >= $${paramIndex}`);
      queryParams.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      conditions.push(`production_start_date <= $${paramIndex}`);
      queryParams.push(end_date);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY ${sort_by} ${sort_order.toUpperCase()} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Build count query with same conditions
    let countQuery = 'SELECT COUNT(*) FROM manufacturing';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countParams = queryParams.slice(0, -2); // Remove limit and offset
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
      { success: false, error: error.message || 'Failed to fetch manufacturing records' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/manufacturing:
 *   post:
 *     summary: Create new manufacturing record
 *     description: Create a new manufacturing operation record with comprehensive validation
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
 *                 description: Unique identifier for the manufacturing operation
 *                 example: "MFG-2024-001"
 *               factory_name:
 *                 type: string
 *                 description: Name of the factory
 *                 example: "Factory A"
 *               production_start_date:
 *                 type: string
 *                 format: date-time
 *                 description: Start date and time of production
 *                 example: "2024-01-15T08:00:00Z"
 *               production_end_date:
 *                 type: string
 *                 format: date-time
 *                 description: End date and time of production
 *                 example: "2024-01-20T18:00:00Z"
 *               total_units_produced:
 *                 type: integer
 *                 minimum: 0
 *                 description: Total number of units produced
 *                 example: 1000
 *               defective_units:
 *                 type: integer
 *                 minimum: 0
 *                 description: Number of defective units
 *                 example: 10
 *               production_cost:
 *                 type: number
 *                 minimum: 0
 *                 description: Total production cost
 *                 example: 50000.00
 *               materials_used:
 *                 type: string
 *                 description: Materials used in production
 *                 example: "Steel, Plastic, Electronics"
 *               labor_cost:
 *                 type: number
 *                 minimum: 0
 *                 description: Labor cost
 *                 example: 15000.00
 *               overhead_costs:
 *                 type: number
 *                 minimum: 0
 *                 description: Overhead costs
 *                 example: 5000.00
 *               production_line:
 *                 type: string
 *                 description: Production line identifier
 *                 example: "Line A"
 *               equipment_used:
 *                 type: string
 *                 description: Equipment used in production
 *                 example: "CNC Machine, Assembly Robot"
 *               production_status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, delayed, cancelled]
 *                 description: Current status of production
 *                 example: "in-progress"
 *               quality_control:
 *                 type: string
 *                 description: Quality control status
 *                 example: "Passed"
 *               safety_compliance:
 *                 type: string
 *                 description: Safety compliance status
 *                 example: "Compliant"
 *               supervisor:
 *                 type: string
 *                 description: Name of the supervisor
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: Manufacturing record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     manufacturing_id:
 *                       type: string
 *                       example: "MFG-2024-001"
 *                     factory_name:
 *                       type: string
 *                       example: "Factory A"
 *                     production_status:
 *                       type: string
 *                       example: "in-progress"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Missing required fields or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Manufacturing ID, factory name, and production status are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to create manufacturing record"
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

    // Validate required fields
    if (!manufacturing_id || !factory_name || !production_status) {
      return NextResponse.json(
        { success: false, error: 'Manufacturing ID, factory name, and production status are required' },
        { status: 400 }
      );
    }

    // Validate manufacturing_id format
    if (typeof manufacturing_id !== 'string' || manufacturing_id.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Manufacturing ID must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate factory_name
    if (typeof factory_name !== 'string' || factory_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Factory name must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate production_status
    const validStatuses = ['pending', 'in-progress', 'completed', 'delayed', 'cancelled'];
    if (!validStatuses.includes(production_status)) {
      return NextResponse.json(
        { success: false, error: `Production status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (total_units_produced !== undefined && total_units_produced !== null) {
      if (typeof total_units_produced !== 'number' || total_units_produced < 0) {
        return NextResponse.json(
          { success: false, error: 'Total units produced must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    if (defective_units !== undefined && defective_units !== null) {
      if (typeof defective_units !== 'number' || defective_units < 0) {
        return NextResponse.json(
          { success: false, error: 'Defective units must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    if (production_cost !== undefined && production_cost !== null) {
      if (typeof production_cost !== 'number' || production_cost < 0) {
        return NextResponse.json(
          { success: false, error: 'Production cost must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    if (labor_cost !== undefined && labor_cost !== null) {
      if (typeof labor_cost !== 'number' || labor_cost < 0) {
        return NextResponse.json(
          { success: false, error: 'Labor cost must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    if (overhead_costs !== undefined && overhead_costs !== null) {
      if (typeof overhead_costs !== 'number' || overhead_costs < 0) {
        return NextResponse.json(
          { success: false, error: 'Overhead costs must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    // Validate date fields
    if (production_start_date && production_end_date) {
      const startDate = new Date(production_start_date);
      const endDate = new Date(production_end_date);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format' },
          { status: 400 }
        );
      }
      if (endDate < startDate) {
        return NextResponse.json(
          { success: false, error: 'Production end date cannot be before start date' },
          { status: 400 }
        );
      }
    }

    // Validate defective units don't exceed total units
    if (total_units_produced !== undefined && defective_units !== undefined) {
      if (defective_units > total_units_produced) {
        return NextResponse.json(
          { success: false, error: 'Defective units cannot exceed total units produced' },
          { status: 400 }
        );
      }
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
    
    // Handle duplicate key error
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Manufacturing ID already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create manufacturing record' },
      { status: 500 }
    );
  }
}