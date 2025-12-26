import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/partners:
 *   get:
 *     summary: Get all partners
 *     description: Retrieve all partner records with pagination and filtering
 *     tags: [Partner Management]
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
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by partner name or email
 *     responses:
 *       200:
 *         description: List of partners
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
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM partners';
    let params = [];
    
    if (search) {
      queryText += ' WHERE partner_name ILIKE $1 OR partner_email ILIKE $1';
      params.push(`%${search}%`);
      queryText += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      queryText += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
      params = [limit, offset];
    }

    const result = await query(queryText, params);
    
    // Get total count
    const countQuery = search 
      ? 'SELECT COUNT(*) FROM partners WHERE partner_name ILIKE $1 OR partner_email ILIKE $1'
      : 'SELECT COUNT(*) FROM partners';
    const countParams = search ? [`%${search}%`] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/partners:
 *   post:
 *     summary: Create a new partner
 *     description: Create a new partner record
 *     tags: [Partner Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partner_name
 *               - partner_email
 *             properties:
 *               partner_name:
 *                 type: string
 *               partner_email:
 *                 type: string
 *               contact_person:
 *                 type: string
 *               partnership_start:
 *                 type: string
 *                 format: date-time
 *               total_transactions:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Partner created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      partner_name,
      partner_email,
      contact_person,
      partnership_start,
      total_transactions
    } = body;

    if (!partner_name || !partner_email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: partner_name, partner_email' },
        { status: 400 }
      );
    }

    // Check if partner email already exists
    const existingPartner = await query(
      'SELECT id FROM partners WHERE partner_email = $1',
      [partner_email]
    );

    if (existingPartner.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Partner with this email already exists' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO partners (
        partner_name, partner_email, contact_person, partnership_start, total_transactions
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [partner_name, partner_email, contact_person, partnership_start, total_transactions || 0]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}