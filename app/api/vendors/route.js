import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get all vendors
 *     description: Retrieve all vendors with pagination
 *     tags: [Vendor Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by vendor name or email
 *     responses:
 *       200:
 *         description: Vendors retrieved successfully
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [limit, offset];
    
    if (search) {
      whereClause = 'WHERE vendor_name ILIKE $3 OR vendor_email ILIKE $3';
      queryParams = [limit, offset, `%${search}%`];
    }

    const result = await query(
      `SELECT * FROM vendor_management ${whereClause} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      queryParams
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM vendor_management ${whereClause}`,
      search ? [`%${search}%`] : []
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/vendors:
 *   post:
 *     summary: Create vendor
 *     description: Add a new vendor
 *     tags: [Vendor Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendor_name
 *               - vendor_email
 *             properties:
 *               vendor_name:
 *                 type: string
 *               vendor_email:
 *                 type: string
 *               contact_person:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               vendor_rating:
 *                 type: number
 *               payment_terms:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vendor created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      vendor_name, vendor_email, contact_person, phone, address,
      vendor_rating, total_orders, last_order_date, contract_start_date,
      contract_end_date, payment_terms
    } = body;

    if (!vendor_name || !vendor_email) {
      return NextResponse.json(
        { success: false, error: 'Vendor name and email are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO vendor_management (
        vendor_name, vendor_email, contact_person, phone, address,
        vendor_rating, total_orders, last_order_date, contract_start_date,
        contract_end_date, payment_terms, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING *`,
      [
        vendor_name, vendor_email, contact_person, phone, address,
        vendor_rating, total_orders, last_order_date, contract_start_date,
        contract_end_date, payment_terms
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}