/**
 * @swagger
 * /api/suppliers/bulk-import:
 *   post:
 *     summary: Bulk import suppliers from CSV
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query, getClient } from '@/lib/database/aurora';
import { parseCSV, validateImportData, mapImportToSchema, SUPPLIER_IMPORT_FIELDS } from '@/lib/utils/import';

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const { data } = parseCSV(text);

    // Map CSV fields to database schema
    const mappedData = mapImportToSchema(data, SUPPLIER_IMPORT_FIELDS);

    // Validate required fields
    const errors = validateImportData(mappedData, ['supplier_key', 'supplier_name']);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation errors', errors },
        { status: 400 }
      );
    }

    // Import suppliers
    const client = await getClient();
    let imported = 0;

    try {
      await client.query('BEGIN');

      for (const supplierData of mappedData) {
        await client.query(
          `INSERT INTO suppliers (
            supplier_key, supplier_name, contact_name, contact_title,
            address, city, region, postal_code, country,
            phone, email, website, date_added, last_updated, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), $13)
          ON CONFLICT (supplier_key) DO NOTHING`,
          [
            supplierData.supplier_key, supplierData.supplier_name,
            supplierData.contact_name, supplierData.contact_title,
            supplierData.address, supplierData.city, supplierData.region,
            supplierData.postal_code, supplierData.country,
            supplierData.phone, supplierData.email, supplierData.website,
            user.userId
          ]
        );
        imported++;
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, imported });
  } catch (error) {
    console.error('Error in POST /api/suppliers/bulk-import:', error);
    return NextResponse.json({ success: false, error: 'Failed to import suppliers' }, { status: 500 });
  }
}