import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/staffing-management/{id}:
 *   get:
 *     summary: Get staff member by ID
 *     description: Retrieve a single staff member by their ID
 *     tags: [Staffing Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff member ID
 *     responses:
 *       200:
 *         description: Staff member details
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM staffing_management WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching staff member:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/staffing-management/{id}:
 *   put:
 *     summary: Update staff member
 *     description: Update an existing staff member's information
 *     tags: [Staffing Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Staff member updated successfully
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE staffing_management SET
        employee_id = COALESCE($1, employee_id),
        name = COALESCE($2, name),
        department = COALESCE($3, department),
        role = COALESCE($4, role),
        hire_date = COALESCE($5, hire_date),
        contract_type = COALESCE($6, contract_type),
        shift_type = COALESCE($7, shift_type),
        salary = COALESCE($8, salary),
        performance_rating = COALESCE($9, performance_rating),
        training_status = COALESCE($10, training_status),
        shift_hours = COALESCE($11, shift_hours),
        overtime_hours = COALESCE($12, overtime_hours),
        total_hours = COALESCE($13, total_hours),
        updated_at = NOW()
      WHERE id = $14
      RETURNING *`,
      [
        employee_id, name, department, role, hire_date, contract_type,
        shift_type, salary, performance_rating, training_status,
        shift_hours, overtime_hours, total_hours, id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/staffing-management/{id}:
 *   delete:
 *     summary: Delete staff member
 *     description: Remove a staff member from the system
 *     tags: [Staffing Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff member ID
 *     responses:
 *       200:
 *         description: Staff member deleted successfully
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'DELETE FROM staffing_management WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Staff member deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}