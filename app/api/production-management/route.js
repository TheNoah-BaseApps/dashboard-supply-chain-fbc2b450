import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/production-management:
 *   get:
 *     summary: Get all production management records
 *     description: Retrieve all production planning and tracking records with advanced filtering, pagination, and sorting capabilities
 *     tags: [Production Management]
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
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of items to skip (alternative to page)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planned, in_progress, completed, on_hold, cancelled]
 *         description: Filter by production status
 *       - in: query
 *         name: production_status
 *         schema:
 *           type: string
 *         description: Filter by production status (alias for status)
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
 *         description: Filter by production date range start (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by production date range end (YYYY-MM-DD)
 *       - in: query
 *         name: production_priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by production priority
 *       - in: query
 *         name: production_supervisor
 *         schema:
 *           type: string
 *         description: Filter by production supervisor
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: created_at
 *           enum: [created_at, production_date, production_id, production_status, total_units_produced, production_cost]
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           default: desc
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: List of production management records retrieved successfully
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
 *                       production_id:
 *                         type: string
 *                       production_date:
 *                         type: string
 *                         format: date-time
 *                       total_units_produced:
 *                         type: integer
 *                       production_cost:
 *                         type: number
 *                       materials_used:
 *                         type: string
 *                       labor_cost:
 *                         type: number
 *                       production_line:
 *                         type: string
 *                       production_status:
 *                         type: string
 *                       production_supervisor:
 *                         type: string
 *                       safety_compliance:
 *                         type: string
 *                       quality_control:
 *                         type: string
 *                       equipment_used:
 *                         type: string
 *                       defective_units:
 *                         type: integer
 *                       overhead_costs:
 *                         type: number
 *                       production_priority:
 *                         type: string
 *                       contact_person:
 *                         type: string
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
 *                     offset:
 *                       type: integer
 *                       example: 0
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                 filters:
 *                   type: object
 *                   description: Applied filters
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
 *                   example: Invalid date format
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
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = searchParams.get('offset') 
      ? parseInt(searchParams.get('offset')) 
      : (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || offset < 0) {
      console.error('Invalid pagination parameters:', { page, limit, offset });
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Filter parameters
    const status = searchParams.get('status') || searchParams.get('production_status');
    const productionLine = searchParams.get('production_line');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const productionPriority = searchParams.get('production_priority');
    const productionSupervisor = searchParams.get('production_supervisor');

    // Sorting parameters
    const allowedSortFields = [
      'created_at', 
      'production_date', 
      'production_id', 
      'production_status', 
      'total_units_produced', 
      'production_cost'
    ];
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order')?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Validate sort field
    if (!allowedSortFields.includes(sortBy)) {
      console.error('Invalid sort field:', sortBy);
      return NextResponse.json(
        { success: false, error: 'Invalid sort field' },
        { status: 400 }
      );
    }

    // Validate date formats
    if (startDate && isNaN(Date.parse(startDate))) {
      console.error('Invalid start_date format:', startDate);
      return NextResponse.json(
        { success: false, error: 'Invalid start_date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      console.error('Invalid end_date format:', endDate);
      return NextResponse.json(
        { success: false, error: 'Invalid end_date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Build dynamic query
    let queryText = 'SELECT * FROM production_management';
    let queryParams = [];
    let paramIndex = 1;
    const conditions = [];

    if (status) {
      conditions.push(`production_status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (productionLine) {
      conditions.push(`production_line = $${paramIndex}`);
      queryParams.push(productionLine);
      paramIndex++;
    }

    if (startDate) {
      conditions.push(`production_date >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`production_date <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }

    if (productionPriority) {
      conditions.push(`production_priority = $${paramIndex}`);
      queryParams.push(productionPriority);
      paramIndex++;
    }

    if (productionSupervisor) {
      conditions.push(`production_supervisor = $${paramIndex}`);
      queryParams.push(productionSupervisor);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Build count query with same conditions
    let countQuery = 'SELECT COUNT(*) FROM production_management';
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
        offset,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        status,
        production_line: productionLine,
        start_date: startDate,
        end_date: endDate,
        production_priority: productionPriority,
        production_supervisor: productionSupervisor,
        sort_by: sortBy,
        sort_order: sortOrder
      }
    });
  } catch (error) {
    console.error('Error fetching production management records:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch production management records' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/production-management:
 *   post:
 *     summary: Create new production management record
 *     description: Create a new production planning and tracking record with comprehensive validation
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
 *                 description: Unique production identifier
 *                 example: PROD-2024-001
 *               production_date:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of production
 *                 example: 2024-01-15T08:00:00Z
 *               total_units_produced:
 *                 type: integer
 *                 minimum: 0
 *                 description: Total number of units produced
 *                 example: 1000
 *               production_cost:
 *                 type: number
 *                 minimum: 0
 *                 description: Total production cost
 *                 example: 50000.00
 *               materials_used:
 *                 type: string
 *                 description: Description of materials used
 *                 example: Steel, Plastic, Rubber
 *               labor_cost:
 *                 type: number
 *                 minimum: 0
 *                 description: Labor cost for production
 *                 example: 15000.00
 *               production_line:
 *                 type: string
 *                 description: Production line identifier
 *                 example: Line A
 *               production_status:
 *                 type: string
 *                 enum: [planned, in_progress, completed, on_hold, cancelled]
 *                 description: Current production status
 *                 example: in_progress
 *               production_supervisor:
 *                 type: string
 *                 description: Name of production supervisor
 *                 example: John Smith
 *               safety_compliance:
 *                 type: string
 *                 description: Safety compliance status
 *                 example: Compliant
 *               quality_control:
 *                 type: string
 *                 description: Quality control status
 *                 example: Passed
 *               equipment_used:
 *                 type: string
 *                 description: Equipment used in production
 *                 example: CNC Machine, Assembly Robot
 *               defective_units:
 *                 type: integer
 *                 minimum: 0
 *                 description: Number of defective units
 *                 example: 5
 *               overhead_costs:
 *                 type: number
 *                 minimum: 0
 *                 description: Overhead costs
 *                 example: 8000.00
 *               production_priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 description: Production priority level
 *                 example: high
 *               contact_person:
 *                 type: string
 *                 description: Contact person for production
 *                 example: Jane Doe
 *     responses:
 *       201:
 *         description: Production management record created successfully
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
 *                   description: Created production management record
 *       400:
 *         description: Bad request - Invalid input or validation error
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
 *                   example: Production ID, production date, and production status are required
 *       409:
 *         description: Conflict - Production ID already exists
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
 *                   example: Production ID already exists
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

    // Validate required fields
    if (!production_id || !production_date || !production_status) {
      console.error('Missing required fields:', { production_id, production_date, production_status });
      return NextResponse.json(
        { success: false, error: 'Production ID, production date, and production status are required' },
        { status: 400 }
      );
    }

    // Validate production_id format
    if (typeof production_id !== 'string' || production_id.trim().length === 0) {
      console.error('Invalid production_id:', production_id);
      return NextResponse.json(
        { success: false, error: 'Production ID must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate production_date format
    if (isNaN(Date.parse(production_date))) {
      console.error('Invalid production_date format:', production_date);
      return NextResponse.json(
        { success: false, error: 'Invalid production date format' },
        { status: 400 }
      );
    }

    // Validate production_status enum
    const validStatuses = ['planned', 'in_progress', 'completed', 'on_hold', 'cancelled'];
    if (!validStatuses.includes(production_status)) {
      console.error('Invalid production_status:', production_status);
      return NextResponse.json(
        { success: false, error: `Production status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (total_units_produced !== undefined && total_units_produced !== null) {
      if (!Number.isInteger(total_units_produced) || total_units_produced < 0) {
        console.error('Invalid total_units_produced:', total_units_produced);
        return NextResponse.json(
          { success: false, error: 'Total units produced must be a non-negative integer' },
          { status: 400 }
        );
      }
    }

    if (production_cost !== undefined && production_cost !== null) {
      if (typeof production_cost !== 'number' || production_cost < 0) {
        console.error('Invalid production_cost:', production_cost);
        return NextResponse.json(
          { success: false, error: 'Production cost must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    if (labor_cost !== undefined && labor_cost !== null) {
      if (typeof labor_cost !== 'number' || labor_cost < 0) {
        console.error('Invalid labor_cost:', labor_cost);
        return NextResponse.json(
          { success: false, error: 'Labor cost must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    if (defective_units !== undefined && defective_units !== null) {
      if (!Number.isInteger(defective_units) || defective_units < 0) {
        console.error('Invalid defective_units:', defective_units);
        return NextResponse.json(
          { success: false, error: 'Defective units must be a non-negative integer' },
          { status: 400 }
        );
      }
    }

    if (overhead_costs !== undefined && overhead_costs !== null) {
      if (typeof overhead_costs !== 'number' || overhead_costs < 0) {
        console.error('Invalid overhead_costs:', overhead_costs);
        return NextResponse.json(
          { success: false, error: 'Overhead costs must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    // Validate production_priority enum
    if (production_priority) {
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      if (!validPriorities.includes(production_priority)) {
        console.error('Invalid production_priority:', production_priority);
        return NextResponse.json(
          { success: false, error: `Production priority must be one of: ${validPriorities.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Check if production_id already exists
    const existingRecord = await query(
      'SELECT id FROM production_management WHERE production_id = $1',
      [production_id]
    );

    if (existingRecord.rows.length > 0) {
      console.error('Duplicate production_id:', production_id);
      return NextResponse.json(
        { success: false, error: 'Production ID already exists' },
        { status: 409 }
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

    console.log('Production management record created successfully:', result.rows[0].id);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating production management record:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create production management record' },
      { status: 500 }
    );
  }
}