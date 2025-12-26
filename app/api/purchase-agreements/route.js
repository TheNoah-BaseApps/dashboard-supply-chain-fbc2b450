import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/purchase-agreements:
 *   get:
 *     summary: Get all purchase agreements
 *     description: Retrieve a list of all purchase agreements with optional filtering and pagination
 *     tags: [Purchase Agreements]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by agreement status
 *       - in: query
 *         name: supplier_name
 *         schema:
 *           type: string
 *         description: Filter by supplier name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Successfully retrieved purchase agreements
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
    const status = searchParams.get('status');
    const supplier_name = searchParams.get('supplier_name');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM purchase_agreements WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      sql += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (supplier_name) {
      sql += ` AND supplier_name ILIKE $${paramCount}`;
      params.push(`%${supplier_name}%`);
      paramCount++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching purchase agreements:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/purchase-agreements:
 *   post:
 *     summary: Create a new purchase agreement
 *     description: Create a new purchase agreement record
 *     tags: [Purchase Agreements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agreement_id
 *               - supplier_name
 *               - agreement_start_date
 *               - agreement_end_date
 *               - status
 *             properties:
 *               agreement_id:
 *                 type: string
 *               supplier_name:
 *                 type: string
 *               agreement_start_date:
 *                 type: string
 *                 format: date-time
 *               agreement_end_date:
 *                 type: string
 *                 format: date-time
 *               total_agreement_value:
 *                 type: number
 *               payment_schedule:
 *                 type: string
 *               products_covered:
 *                 type: string
 *               terms_of_service:
 *                 type: string
 *               governing_law:
 *                 type: string
 *               penalties_for_breach:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Purchase agreement created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      agreement_id,
      supplier_name,
      agreement_start_date,
      agreement_end_date,
      total_agreement_value,
      payment_schedule,
      products_covered,
      terms_of_service,
      governing_law,
      penalties_for_breach,
      status
    } = body;

    if (!agreement_id || !supplier_name || !agreement_start_date || !agreement_end_date || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO purchase_agreements (
        agreement_id, supplier_name, agreement_start_date, agreement_end_date,
        total_agreement_value, payment_schedule, products_covered, terms_of_service,
        governing_law, penalties_for_breach, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      agreement_id,
      supplier_name,
      agreement_start_date,
      agreement_end_date,
      total_agreement_value,
      payment_schedule,
      products_covered,
      terms_of_service,
      governing_law,
      penalties_for_breach,
      status
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating purchase agreement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}