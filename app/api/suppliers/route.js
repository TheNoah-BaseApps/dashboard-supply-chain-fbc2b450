/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Get all suppliers
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Suppliers retrieved successfully
 *   post:
 *     summary: Create new supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Supplier created successfully
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/database/aurora';
import { validateSupplierData, checkSupplierDuplicates } from '@/lib/validators/supplier';
import { createAuditLog } from '@/lib/audit';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT s.*, u.name as created_by_name 
       FROM suppliers s
       LEFT JOIN users u ON s.created_by = u.id
       ORDER BY s.last_updated DESC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error in GET /api/suppliers:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate data
    const validation = validateSupplierData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Check for duplicates
    const duplicates = await checkSupplierDuplicates(query, body);
    if (duplicates.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Duplicate supplier found', duplicates },
        { status: 400 }
      );
    }

    // Insert supplier
    const result = await query(
      `INSERT INTO suppliers (
        supplier_key, supplier_name, contact_name, contact_title,
        address, city, region, postal_code, country,
        phone, email, website, date_added, last_updated, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), $13)
      RETURNING *`,
      [
        body.supplier_key, body.supplier_name, body.contact_name, body.contact_title,
        body.address, body.city, body.region, body.postal_code, body.country,
        body.phone, body.email, body.website, user.userId
      ]
    );

    const supplier = result.rows[0];

    // Create audit log
    await createAuditLog({
      user_id: user.userId,
      workflow: 'suppliers',
      record_id: supplier.id,
      action: 'create',
      new_values: supplier
    });

    return NextResponse.json({ success: true, data: supplier }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/suppliers:', error);
    return NextResponse.json({ success: false, error: 'Failed to create supplier' }, { status: 500 });
  }
}