import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/staffing-management:
 *   get:
 *     summary: Get all staff members
 *     description: Retrieve a list of all employees with pagination and filtering
 *     tags: [Staffing Management]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: List of staff members
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
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const department = searchParams.get('department');

    let sql = 'SELECT * FROM staffing_management';
    const params = [];
    
    if (department) {
      sql += ' WHERE department = $1';
      params.push(department);
      sql += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      sql += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows 
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/staffing-management:
 *   post:
 *     summary: Create a new staff member
 *     description: Add a new employee to the staffing system
 *     tags: [Staffing Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - name
 *               - role
 *             properties:
 *               employee_id:
 *                 type: string
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *               role:
 *                 type: string
 *               hire_date:
 *                 type: string
 *                 format: date
 *               contract_type:
 *                 type: string
 *               shift_type:
 *                 type: string
 *               salary:
 *                 type: number
 *               performance_rating:
 *                 type: number
 *               training_status:
 *                 type: string
 *               shift_hours:
 *                 type: number
 *               overtime_hours:
 *                 type: number
 *               total_hours:
 *                 type: number
 *     responses:
 *       201:
 *         description: Staff member created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      employee_id,
      name,
      department,
      role,
      hire_date,
      contract_type,
      shift_type,
      salary,
      performance_rating,
      training_status,
      shift_hours,
      overtime_hours,
      total_hours
    } = body;

    if (!employee_id || !name || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: employee_id, name, role' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO staffing_management (
        employee_id, name, department, role, hire_date, contract_type,
        shift_type, salary, performance_rating, training_status,
        shift_hours, overtime_hours, total_hours, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        employee_id, name, department, role, hire_date, contract_type,
        shift_type, salary, performance_rating, training_status,
        shift_hours, overtime_hours, total_hours
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}