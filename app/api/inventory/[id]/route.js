/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory]
 *   put:
 *     summary: Update inventory item
 *     tags: [Inventory]
 *   delete:
 *     summary: Delete inventory item
 *     tags: [Inventory]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/database/aurora';
import { validateInventoryData, checkInventoryDuplicates, calculateInventoryMetrics } from '@/lib/validators/inventory';
import { createAuditLog } from '@/lib/audit';

export async function GET(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const result = await query('SELECT * FROM inventory_items WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error in GET /api/inventory/[id]:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch item' }, { status: 500 });
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
    const oldResult = await query('SELECT * FROM inventory_items WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    const oldValues = oldResult.rows[0];

    // Validate data
    const validation = validateInventoryData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Calculate metrics
    const metrics = calculateInventoryMetrics(body);

    // Update item
    const result = await query(
      `UPDATE inventory_items SET
        item_id = $1, item_name = $2, date = $3, quantity = $4, reorder_level = $5,
        suggested_reorder_quantity = $6, order_quantity = $7, order_status = $8,
        current_cost_per_unit = $9, unit_cost_paid = $10,
        total_inventory_value = $11, total_item_reorder_cost = $12,
        last_updated = NOW(), updated_by = $13
       WHERE id = $14
       RETURNING *`,
      [
        body.item_id, body.item_name, body.date, body.quantity, body.reorder_level,
        body.suggested_reorder_quantity, body.order_quantity, body.order_status,
        body.current_cost_per_unit, body.unit_cost_paid,
        metrics.total_inventory_value, metrics.total_item_reorder_cost,
        user.userId, id
      ]
    );

    const item = result.rows[0];

    // Create audit log
    await createAuditLog({
      user_id: user.userId,
      workflow: 'inventory',
      record_id: id,
      action: 'update',
      old_values: oldValues,
      new_values: item
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error in PUT /api/inventory/[id]:', error);
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get item data before deletion
    const oldResult = await query('SELECT * FROM inventory_items WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    // Delete item
    await query('DELETE FROM inventory_items WHERE id = $1', [id]);

    // Create audit log
    await createAuditLog({
      user_id: user.userId,
      workflow: 'inventory',
      record_id: id,
      action: 'delete',
      old_values: oldResult.rows[0]
    });

    return NextResponse.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/inventory/[id]:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}