/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/database/aurora';
import { validateSupplierData, checkSupplierDuplicates } from '@/lib/validators/supplier';
import { createAuditLog } from '@/lib/audit';

export async function GET(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const result = await query('SELECT * FROM suppliers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error in GET /api/suppliers/[id]:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch supplier' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Get old values
    const oldResult = await query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }
    const oldValues = oldResult.rows[0];

    // Validate data
    const validation = validateSupplierData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Check for duplicates (excluding current record)
    const duplicates = await checkSupplierDuplicates(query, body, id);
    if (duplicates.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Duplicate supplier found', duplicates },
        { status: 400 }
      );
    }

    // Update supplier
    const result = await query(
      `UPDATE suppliers SET
        supplier_key = $1, supplier_name = $2, contact_name = $3, contact_title = $4,
        address = $5, city = $6, region = $7, postal_code = $8, country = $9,
        phone = $10, email = $11, website = $12, last_updated = NOW()
       WHERE id = $13
       RETURNING *`,
      [
        body.supplier_key, body.supplier_name, body.contact_name, body.contact_title,
        body.address, body.city, body.region, body.postal_code, body.country,
        body.phone, body.email, body.website, id
      ]
    );

    const supplier = result.rows[0];

    // Create audit log
    await createAuditLog({
      user_id: user.userId,
      workflow: 'suppliers',
      record_id: id,
      action: 'update',
      old_values: oldValues,
      new_values: supplier
    });

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error('Error in PUT /api/suppliers/[id]:', error);
    return NextResponse.json({ success: false, error: 'Failed to update supplier' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get supplier data before deletion
    const oldResult = await query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }

    // Delete supplier
    await query('DELETE FROM suppliers WHERE id = $1', [id]);

    // Create audit log
    await createAuditLog({
      user_id: user.userId,
      workflow: 'suppliers',
      record_id: id,
      action: 'delete',
      old_values: oldResult.rows[0]
    });

    return NextResponse.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/suppliers/[id]:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete supplier' }, { status: 500 });
  }
}