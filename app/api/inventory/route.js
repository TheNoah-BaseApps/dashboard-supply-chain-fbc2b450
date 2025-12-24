/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create new inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/database/aurora';
import { validateInventoryData, checkInventoryDuplicates, calculateInventoryMetrics } from '@/lib/validators/inventory';
import { createAuditLog } from '@/lib/audit';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT i.*, u.name as updated_by_name 
       FROM inventory_items i
       LEFT JOIN users u ON i.updated_by = u.id
       ORDER BY i.last_updated DESC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error in GET /api/inventory:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch inventory' }, { status: 500 });
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
    const validation = validateInventoryData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Check for duplicates
    const duplicates = await checkInventoryDuplicates(query, body);
    if (duplicates.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Duplicate item found', duplicates },
        { status: 400 }
      );
    }

    // Calculate metrics
    const metrics = calculateInventoryMetrics(body);

    // Insert inventory item
    const result = await query(
      `INSERT INTO inventory_items (
        item_id, item_name, date, quantity, reorder_level,
        suggested_reorder_quantity, order_quantity, order_status,
        current_cost_per_unit, unit_cost_paid,
        total_inventory_value, total_item_reorder_cost,
        last_updated, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13)
      RETURNING *`,
      [
        body.item_id, body.item_name, body.date, body.quantity, body.reorder_level,
        body.suggested_reorder_quantity, body.order_quantity, body.order_status,
        body.current_cost_per_unit, body.unit_cost_paid,
        metrics.total_inventory_value, metrics.total_item_reorder_cost,
        user.userId
      ]
    );

    const item = result.rows[0];

    // Create audit log
    await createAuditLog({
      user_id: user.userId,
      workflow: 'inventory',
      record_id: item.id,
      action: 'create',
      new_values: item
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/inventory:', error);
    return NextResponse.json({ success: false, error: 'Failed to create inventory item' }, { status: 500 });
  }
}