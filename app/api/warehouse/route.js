import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/warehouse:
 *   get:
 *     summary: Get all warehouse items
 *     description: Retrieve all warehouse inventory items with pagination
 *     tags: [Warehouse Management]
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
 *           default: 50
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by SKU or product name
 *     responses:
 *       200:
 *         description: Warehouse items retrieved successfully
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
 *                 pagination:
 *                   type: object
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
      whereClause = 'WHERE sku ILIKE $3 OR product_name ILIKE $3';
      queryParams = [limit, offset, `%${search}%`];
    }

    const result = await query(
      `SELECT * FROM warehouse_management ${whereClause} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      queryParams
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM warehouse_management ${whereClause}`,
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
    console.error('Error fetching warehouse items:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/warehouse:
 *   post:
 *     summary: Create warehouse item
 *     description: Add a new item to warehouse inventory
 *     tags: [Warehouse Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - product_name
 *             properties:
 *               sku:
 *                 type: string
 *               product_name:
 *                 type: string
 *               brand:
 *                 type: string
 *               unit_price:
 *                 type: number
 *               units_in_stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Warehouse item created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      sku, product_name, brand, category_key, category_name, description,
      unit_price, units_in_stock, units_on_order, reorder_level,
      quantity_per_unit, discontinued, supplier_key, supplier_name,
      address, city, region, postal_code, country, contact_name,
      contact_title, phone, email, website, color, size, weight,
      dimensions, image_url, date_added, last_updated
    } = body;

    if (!sku || !product_name) {
      return NextResponse.json(
        { success: false, error: 'SKU and product name are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO warehouse_management (
        sku, product_name, brand, category_key, category_name, description,
        unit_price, units_in_stock, units_on_order, reorder_level,
        quantity_per_unit, discontinued, supplier_key, supplier_name,
        address, city, region, postal_code, country, contact_name,
        contact_title, phone, email, website, color, size, weight,
        dimensions, image_url, date_added, last_updated,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27,
        $28, $29, $30, $31, NOW(), NOW()
      ) RETURNING *`,
      [
        sku, product_name, brand, category_key, category_name, description,
        unit_price, units_in_stock, units_on_order, reorder_level,
        quantity_per_unit, discontinued, supplier_key, supplier_name,
        address, city, region, postal_code, country, contact_name,
        contact_title, phone, email, website, color, size, weight,
        dimensions, image_url, date_added, last_updated
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating warehouse item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}