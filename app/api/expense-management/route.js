import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/expense-management:
 *   get:
 *     summary: Get all expenses
 *     description: Retrieve a list of all expenses with optional filtering and pagination
 *     tags: [Expense Management]
 *     parameters:
 *       - in: query
 *         name: approval_status
 *         schema:
 *           type: string
 *         description: Filter by approval status
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *       - in: query
 *         name: expense_category
 *         schema:
 *           type: string
 *         description: Filter by expense category
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
 *         description: Successfully retrieved expenses
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
    const approval_status = searchParams.get('approval_status');
    const payment_status = searchParams.get('payment_status');
    const expense_category = searchParams.get('expense_category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM expense_management WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (approval_status) {
      sql += ` AND approval_status = $${paramCount}`;
      params.push(approval_status);
      paramCount++;
    }

    if (payment_status) {
      sql += ` AND payment_status = $${paramCount}`;
      params.push(payment_status);
      paramCount++;
    }

    if (expense_category) {
      sql += ` AND expense_category = $${paramCount}`;
      params.push(expense_category);
      paramCount++;
    }

    sql += ` ORDER BY date_of_expense DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/expense-management:
 *   post:
 *     summary: Create a new expense
 *     description: Create a new expense record
 *     tags: [Expense Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expense_id
 *               - expense_category
 *               - amount_spent
 *               - vendor_name
 *               - date_of_expense
 *               - approval_status
 *               - payment_status
 *             properties:
 *               expense_id:
 *                 type: string
 *               expense_category:
 *                 type: string
 *               amount_spent:
 *                 type: number
 *               vendor_name:
 *                 type: string
 *               date_of_expense:
 *                 type: string
 *                 format: date-time
 *               payment_method:
 *                 type: string
 *               currency:
 *                 type: string
 *               description:
 *                 type: string
 *               approval_status:
 *                 type: string
 *               approved_by:
 *                 type: string
 *               expense_type:
 *                 type: string
 *               recurring_expense:
 *                 type: boolean
 *               payment_due_date:
 *                 type: string
 *                 format: date-time
 *               payment_status:
 *                 type: string
 *               tax_amount:
 *                 type: number
 *               total_expense:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      expense_id,
      expense_category,
      amount_spent,
      vendor_name,
      date_of_expense,
      payment_method,
      currency,
      description,
      approval_status,
      approved_by,
      expense_type,
      recurring_expense,
      payment_due_date,
      payment_status,
      tax_amount,
      total_expense,
      notes
    } = body;

    if (!expense_id || !expense_category || !amount_spent || !vendor_name || !date_of_expense || !approval_status || !payment_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO expense_management (
        expense_id, expense_category, amount_spent, vendor_name, date_of_expense,
        payment_method, currency, description, approval_status, approved_by,
        expense_type, recurring_expense, payment_due_date, payment_status,
        tax_amount, total_expense, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      expense_id,
      expense_category,
      amount_spent,
      vendor_name,
      date_of_expense,
      payment_method,
      currency,
      description,
      approval_status,
      approved_by,
      expense_type,
      recurring_expense,
      payment_due_date,
      payment_status,
      tax_amount,
      total_expense,
      notes
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}