import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/catalogues:
 *   get:
 *     summary: Get all catalogues
 *     description: Retrieve all catalogues from the catalogue_management table
 *     tags: [Catalogue Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of catalogues
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

    let queryText = 'SELECT * FROM catalogue_management';
    let countQuery = 'SELECT COUNT(*) FROM catalogue_management';
    const params = [];
    
    if (search) {
      queryText += ' WHERE catalogue_name ILIKE $1';
      countQuery += ' WHERE catalogue_name ILIKE $1';
      params.push(`%${search}%`);
    }
    
    queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [catalogues, countResult] = await Promise.all([
      query(queryText, params),
      query(countQuery, search ? [`%${search}%`] : [])
    ]);

    return NextResponse.json({
      success: true,
      data: catalogues.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching catalogues:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/catalogues:
 *   post:
 *     summary: Create a new catalogue
 *     tags: [Catalogue Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - catalogue_name
 *     responses:
 *       201:
 *         description: Catalogue created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      catalogue_name,
      product_count,
      creation_date,
      last_updated,
      is_active,
      description
    } = body;

    if (!catalogue_name) {
      return NextResponse.json(
        { success: false, error: 'Catalogue name is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO catalogue_management (
        catalogue_name, product_count, creation_date, last_updated,
        is_active, description, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [catalogue_name, product_count, creation_date, last_updated, is_active, description]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating catalogue:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}