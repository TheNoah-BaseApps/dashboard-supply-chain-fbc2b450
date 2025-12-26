import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/production-management/{id}:
 *   get:
 *     summary: Get production management record by ID
 *     description: Retrieves a single production management record by its unique identifier
 *     tags: [Production Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the production management record
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Production management record retrieved successfully
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
 *                       type: string
 *                       format: uuid
 *                     formula_id:
 *                       type: string
 *                       format: uuid
 *                     batch_number:
 *                       type: string
 *                     production_date:
 *                       type: string
 *                       format: date
 *                     quantity_produced:
 *                       type: number
 *                     production_status:
 *                       type: string
 *                       enum: [planned, in_progress, completed, on_hold, cancelled]
 *                     notes:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Production management record not found
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
 *                   example: Production management record not found
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
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      console.error('GET /api/production-management/[id]: Missing ID parameter');
      return NextResponse.json(
        { success: false, error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    console.log(`GET /api/production-management/${id}: Fetching record`);
    const result = await query('SELECT * FROM production_management WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      console.error(`GET /api/production-management/${id}: Record not found`);
      return NextResponse.json(
        { success: false, error: 'Production management record not found' },
        { status: 404 }
      );
    }

    console.log(`GET /api/production-management/${id}: Record retrieved successfully`);
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('GET /api/production-management/[id]: Error fetching record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/production-management/{id}:
 *   put:
 *     summary: Update production management record
 *     description: Updates an existing production management record with validation for production_date and production_status
 *     tags: [Production Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the production management record to update
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formula_id:
 *                 type: string
 *                 format: uuid
 *                 description: Reference to the formula used
 *               batch_number:
 *                 type: string
 *                 description: Unique batch identifier
 *               production_date:
 *                 type: string
 *                 format: date
 *                 description: Date of production (YYYY-MM-DD)
 *               quantity_produced:
 *                 type: number
 *                 minimum: 0
 *                 description: Quantity produced in this batch
 *               production_status:
 *                 type: string
 *                 enum: [planned, in_progress, completed, on_hold, cancelled]
 *                 description: Current status of production
 *               notes:
 *                 type: string
 *                 description: Additional notes or comments
 *     responses:
 *       200:
 *         description: Production management record updated successfully
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
 *       400:
 *         description: Invalid request data or validation error
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
 *       404:
 *         description: Production management record not found
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
 *                   example: Production management record not found
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
export async function PUT(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      console.error('PUT /api/production-management/[id]: Missing ID parameter');
      return NextResponse.json(
        { success: false, error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    console.log(`PUT /api/production-management/${id}: Parsing request body`);
    const body = await request.json();

    // Validate production_status if provided
    const validStatuses = ['planned', 'in_progress', 'completed', 'on_hold', 'cancelled'];
    if (body.production_status && !validStatuses.includes(body.production_status)) {
      console.error(`PUT /api/production-management/${id}: Invalid production_status - ${body.production_status}`);
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid production_status. Must be one of: ${validStatuses.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate production_date if provided
    if (body.production_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(body.production_date)) {
        console.error(`PUT /api/production-management/${id}: Invalid production_date format - ${body.production_date}`);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid production_date format. Must be YYYY-MM-DD' 
          },
          { status: 400 }
        );
      }

      const date = new Date(body.production_date);
      if (isNaN(date.getTime())) {
        console.error(`PUT /api/production-management/${id}: Invalid production_date value - ${body.production_date}`);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid production_date value' 
          },
          { status: 400 }
        );
      }
    }

    // Validate quantity_produced if provided
    if (body.quantity_produced !== undefined && body.quantity_produced !== null) {
      const quantity = Number(body.quantity_produced);
      if (isNaN(quantity) || quantity < 0) {
        console.error(`PUT /api/production-management/${id}: Invalid quantity_produced - ${body.quantity_produced}`);
        return NextResponse.json(
          { 
            success: false, 
            error: 'quantity_produced must be a non-negative number' 
          },
          { status: 400 }
        );
      }
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(body).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      console.error(`PUT /api/production-management/${id}: No fields to update`);
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    fields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;

    values.push(id);

    console.log(`PUT /api/production-management/${id}: Updating record with fields: ${fields.join(', ')}`);
    const result = await query(
      `UPDATE production_management SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      console.error(`PUT /api/production-management/${id}: Record not found for update`);
      return NextResponse.json(
        { success: false, error: 'Production management record not found' },
        { status: 404 }
      );
    }

    console.log(`PUT /api/production-management/${id}: Record updated successfully`);
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('PUT /api/production-management/[id]: Error updating record:', error);
    
    // Handle specific database errors
    if (error.code === '23503') {
      return NextResponse.json(
        { success: false, error: 'Invalid foreign key reference' },
        { status: 400 }
      );
    }
    
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Duplicate record found' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/production-management/{id}:
 *   delete:
 *     summary: Delete production management record
 *     description: Permanently deletes a production management record by its unique identifier
 *     tags: [Production Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the production management record to delete
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Production management record deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Production management record deleted successfully
 *                 data:
 *                   type: object
 *                   description: The deleted record
 *       400:
 *         description: Invalid request - missing ID parameter
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
 *       404:
 *         description: Production management record not found
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
 *                   example: Production management record not found
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
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      console.error('DELETE /api/production-management/[id]: Missing ID parameter');
      return NextResponse.json(
        { success: false, error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    console.log(`DELETE /api/production-management/${id}: Attempting to delete record`);
    const result = await query('DELETE FROM production_management WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      console.error(`DELETE /api/production-management/${id}: Record not found for deletion`);
      return NextResponse.json(
        { success: false, error: 'Production management record not found' },
        { status: 404 }
      );
    }

    console.log(`DELETE /api/production-management/${id}: Record deleted successfully`);
    return NextResponse.json({ 
      success: true, 
      message: 'Production management record deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('DELETE /api/production-management/[id]: Error deleting record:', error);
    
    // Handle foreign key constraint violations
    if (error.code === '23503') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete record: it is referenced by other records' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}