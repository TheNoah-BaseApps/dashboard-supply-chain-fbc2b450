import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/manufacturing/{id}:
 *   get:
 *     summary: Get manufacturing record by ID
 *     description: Retrieves a single manufacturing record by its unique identifier
 *     tags: [Manufacturing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the manufacturing record
 *     responses:
 *       200:
 *         description: Manufacturing record retrieved successfully
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
 *                     product_id:
 *                       type: string
 *                     batch_number:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     status:
 *                       type: string
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Manufacturing record not found
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
 *                   example: Manufacturing record not found
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
      console.error('GET /api/manufacturing/[id]: Missing ID parameter');
      return NextResponse.json(
        { success: false, error: 'Manufacturing record ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching manufacturing record with ID: ${id}`);
    const result = await query('SELECT * FROM manufacturing WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      console.error(`Manufacturing record not found with ID: ${id}`);
      return NextResponse.json(
        { success: false, error: 'Manufacturing record not found' },
        { status: 404 }
      );
    }

    console.log(`Successfully retrieved manufacturing record: ${id}`);
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching manufacturing record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/manufacturing/{id}:
 *   put:
 *     summary: Update manufacturing record
 *     description: Updates an existing manufacturing record with provided data. Only specified fields will be updated.
 *     tags: [Manufacturing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the manufacturing record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *                 description: Product identifier
 *               batch_number:
 *                 type: string
 *                 description: Batch number for the manufacturing run
 *               quantity:
 *                 type: number
 *                 description: Quantity produced
 *                 minimum: 0
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *                 description: Current status of manufacturing
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: Manufacturing start date
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 description: Manufacturing end date
 *             example:
 *               status: completed
 *               quantity: 1000
 *               end_date: "2024-01-15T10:00:00Z"
 *     responses:
 *       200:
 *         description: Manufacturing record updated successfully
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
 *         description: Bad request - validation error or no fields to update
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
 *                   example: No fields to update
 *       404:
 *         description: Manufacturing record not found
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
 *                   example: Manufacturing record not found
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
      console.error('PUT /api/manufacturing/[id]: Missing ID parameter');
      return NextResponse.json(
        { success: false, error: 'Manufacturing record ID is required' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('PUT /api/manufacturing/[id]: Invalid JSON in request body', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request body
    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
      console.error('PUT /api/manufacturing/[id]: Empty or invalid request body');
      return NextResponse.json(
        { success: false, error: 'Request body cannot be empty' },
        { status: 400 }
      );
    }

    // Validate quantity if provided
    if (body.quantity !== undefined) {
      const quantity = Number(body.quantity);
      if (isNaN(quantity) || quantity < 0) {
        console.error('PUT /api/manufacturing/[id]: Invalid quantity value');
        return NextResponse.json(
          { success: false, error: 'Quantity must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (body.status !== undefined && !validStatuses.includes(body.status)) {
      console.error(`PUT /api/manufacturing/[id]: Invalid status value: ${body.status}`);
      return NextResponse.json(
        { success: false, error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate dates if provided
    if (body.start_date !== undefined && body.start_date !== null) {
      const startDate = new Date(body.start_date);
      if (isNaN(startDate.getTime())) {
        console.error('PUT /api/manufacturing/[id]: Invalid start_date format');
        return NextResponse.json(
          { success: false, error: 'Invalid start_date format' },
          { status: 400 }
        );
      }
    }

    if (body.end_date !== undefined && body.end_date !== null) {
      const endDate = new Date(body.end_date);
      if (isNaN(endDate.getTime())) {
        console.error('PUT /api/manufacturing/[id]: Invalid end_date format');
        return NextResponse.json(
          { success: false, error: 'Invalid end_date format' },
          { status: 400 }
        );
      }
    }

    // Check if record exists
    console.log(`Checking if manufacturing record exists with ID: ${id}`);
    const existsResult = await query('SELECT id FROM manufacturing WHERE id = $1', [id]);
    if (existsResult.rows.length === 0) {
      console.error(`Manufacturing record not found for update with ID: ${id}`);
      return NextResponse.json(
        { success: false, error: 'Manufacturing record not found' },
        { status: 404 }
      );
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(body).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      console.error('PUT /api/manufacturing/[id]: No valid fields to update');
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    fields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;

    // Add ID for WHERE clause
    values.push(id);

    console.log(`Updating manufacturing record: ${id} with fields: ${fields.join(', ')}`);
    const result = await query(
      `UPDATE manufacturing SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      console.error(`Manufacturing record not found after update attempt with ID: ${id}`);
      return NextResponse.json(
        { success: false, error: 'Manufacturing record not found' },
        { status: 404 }
      );
    }

    console.log(`Successfully updated manufacturing record: ${id}`);
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating manufacturing record:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/manufacturing/{id}:
 *   delete:
 *     summary: Delete manufacturing record
 *     description: Permanently deletes a manufacturing record from the system. This action cannot be undone.
 *     tags: [Manufacturing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the manufacturing record to delete
 *     responses:
 *       200:
 *         description: Manufacturing record deleted successfully
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
 *                   example: Manufacturing record deleted successfully
 *       400:
 *         description: Bad request - missing or invalid ID
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
 *                   example: Manufacturing record ID is required
 *       404:
 *         description: Manufacturing record not found
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
 *                   example: Manufacturing record not found
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
      console.error('DELETE /api/manufacturing/[id]: Missing ID parameter');
      return NextResponse.json(
        { success: false, error: 'Manufacturing record ID is required' },
        { status: 400 }
      );
    }

    // Check if record exists before attempting deletion
    console.log(`Checking if manufacturing record exists before deletion with ID: ${id}`);
    const existsResult = await query('SELECT id FROM manufacturing WHERE id = $1', [id]);
    if (existsResult.rows.length === 0) {
      console.error(`Manufacturing record not found for deletion with ID: ${id}`);
      return NextResponse.json(
        { success: false, error: 'Manufacturing record not found' },
        { status: 404 }
      );
    }

    console.log(`Deleting manufacturing record with ID: ${id}`);
    const result = await query('DELETE FROM manufacturing WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      console.error(`Manufacturing record not found after delete attempt with ID: ${id}`);
      return NextResponse.json(
        { success: false, error: 'Manufacturing record not found' },
        { status: 404 }
      );
    }

    console.log(`Successfully deleted manufacturing record: ${id}`);
    return NextResponse.json({ 
      success: true, 
      message: 'Manufacturing record deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting manufacturing record:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}