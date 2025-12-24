export function validateInventoryData(data) {
  const errors = [];
  const warnings = [];
  
  // Required fields
  if (!data.item_id?.trim()) {
    errors.push({
      field: 'item_id',
      message: 'Item ID is required',
      severity: 'error'
    });
  }
  
  if (!data.item_name?.trim()) {
    errors.push({
      field: 'item_name',
      message: 'Item name is required',
      severity: 'error'
    });
  }
  
  // Quantity validation
  if (data.quantity !== undefined && data.quantity !== null) {
    if (data.quantity < 0) {
      errors.push({
        field: 'quantity',
        message: 'Quantity cannot be negative',
        severity: 'error'
      });
    }
    
    if (data.quantity === 0) {
      warnings.push({
        field: 'quantity',
        message: 'Item is out of stock',
        severity: 'warning'
      });
    }
  }
  
  // Reorder level validation
  if (data.reorder_level !== undefined && data.reorder_level !== null) {
    if (data.reorder_level < 0) {
      errors.push({
        field: 'reorder_level',
        message: 'Reorder level must be positive',
        severity: 'error'
      });
    }
  }
  
  // Cost validation
  if (data.current_cost_per_unit !== undefined && data.current_cost_per_unit !== null) {
    if (data.current_cost_per_unit <= 0) {
      errors.push({
        field: 'current_cost_per_unit',
        message: 'Cost per unit must be positive',
        severity: 'error'
      });
    }
    
    if (data.current_cost_per_unit > 10000) {
      warnings.push({
        field: 'current_cost_per_unit',
        message: 'Unusually high cost per unit - please verify',
        severity: 'warning'
      });
    }
  }
  
  // Date validation
  if (data.date) {
    const itemDate = new Date(data.date);
    const now = new Date();
    
    if (itemDate > now) {
      errors.push({
        field: 'date',
        message: 'Date cannot be in the future',
        severity: 'error'
      });
    }
  }
  
  // Cost discrepancy check
  if (data.current_cost_per_unit && data.unit_cost_paid) {
    const difference = Math.abs(data.current_cost_per_unit - data.unit_cost_paid);
    const percentDiff = (difference / data.current_cost_per_unit) * 100;
    
    if (percentDiff > 10) {
      warnings.push({
        field: 'unit_cost_paid',
        message: `Cost discrepancy detected: ${percentDiff.toFixed(1)}% difference between current and paid cost`,
        severity: 'warning'
      });
    }
  }
  
  // Reorder check
  if (data.quantity !== undefined && data.reorder_level !== undefined) {
    if (data.quantity <= data.reorder_level) {
      warnings.push({
        field: 'quantity',
        message: 'Item is at or below reorder level',
        severity: 'warning'
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    allIssues: [...errors, ...warnings]
  };
}

export async function checkInventoryDuplicates(query, data, excludeId = null) {
  try {
    if (!data.item_id) return [];
    
    const result = excludeId
      ? await query(
          'SELECT id, item_id FROM inventory_items WHERE item_id = $1 AND id != $2',
          [data.item_id, excludeId]
        )
      : await query(
          'SELECT id, item_id FROM inventory_items WHERE item_id = $1',
          [data.item_id]
        );
    
    if (result.rows.length > 0) {
      return [{
        field: 'item_id',
        message: 'Item ID already exists',
        severity: 'error',
        duplicate_id: result.rows[0].id
      }];
    }
    
    return [];
  } catch (error) {
    console.error('Error checking inventory duplicates:', error);
    return [];
  }
}

export function calculateInventoryMetrics(item) {
  const quantity = parseFloat(item.quantity) || 0;
  const currentCost = parseFloat(item.current_cost_per_unit) || 0;
  const orderQuantity = parseFloat(item.order_quantity) || 0;
  const unitCostPaid = parseFloat(item.unit_cost_paid) || currentCost;
  
  const totalInventoryValue = quantity * currentCost;
  const totalItemReorderCost = orderQuantity * unitCostPaid;
  
  return {
    total_inventory_value: totalInventoryValue.toFixed(2),
    total_item_reorder_cost: totalItemReorderCost.toFixed(2)
  };
}