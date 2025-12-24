/**
 * @swagger
 * /api/inventory/bulk-import:
 *   post:
 *     summary: Bulk import inventory items from CSV
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getClient } from '@/lib/database/aurora';
import { parseCSV, validateImportData, mapImportToSchema, INVENTORY_IMPORT_FIELDS } from '@/lib/utils/import';
import { calculateInventoryMetrics } from '@/lib/validators/inventory';

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
    const mappedData = mapImportToSchema(data, INVENTORY_IMPORT_FIELDS);

    // Validate required fields
    const errors = validateImportData(mappedData, ['item_id', 'item_name']);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation errors', errors },
        { status: 400 }
      );
    }

    // Import items
    const client = await getClient();
    let imported = 0;

    try {
      await client.query('BEGIN');

      for (const itemData of mappedData) {
        const metrics = calculateInventoryMetrics(itemData);
        
        await client.query(
          `INSERT INTO inventory_items (
            item_id, item_name, date, quantity, reorder_level,
            order_quantity, current_cost_per_unit, unit_cost_paid,
            total_inventory_value, total_item_reorder_cost,
            last_updated, updated_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
          ON CONFLICT (item_id) DO NOTHING`,
          [
            itemData.item_id, itemData.item_name, itemData.date || new Date(),
            itemData.quantity || 0, itemData.reorder_level || 0,
            itemData.order_quantity || 0, itemData.current_cost_per_unit || 0,
            itemData.unit_cost_paid || 0, metrics.total_inventory_value,
            metrics.total_item_reorder_cost, user.userId
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
    console.error('Error in POST /api/inventory/bulk-import:', error);
    return NextResponse.json({ success: false, error: 'Failed to import items' }, { status: 500 });
  }
}