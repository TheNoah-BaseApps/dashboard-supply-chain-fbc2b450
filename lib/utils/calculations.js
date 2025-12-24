export function calculateTotalInventoryValue(items) {
  return items.reduce((total, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const cost = parseFloat(item.current_cost_per_unit) || 0;
    return total + (quantity * cost);
  }, 0);
}

export function calculateReorderCost(items) {
  return items.reduce((total, item) => {
    const orderQty = parseFloat(item.order_quantity) || 0;
    const cost = parseFloat(item.unit_cost_paid) || parseFloat(item.current_cost_per_unit) || 0;
    return total + (orderQty * cost);
  }, 0);
}

export function getItemsNeedingReorder(items) {
  return items.filter(item => {
    const quantity = parseInt(item.quantity) || 0;
    const reorderLevel = parseInt(item.reorder_level) || 0;
    return quantity <= reorderLevel;
  });
}

export function calculateSuggestedReorderQuantity(item) {
  const currentQty = parseInt(item.quantity) || 0;
  const reorderLevel = parseInt(item.reorder_level) || 0;
  const avgUsage = parseInt(item.suggested_reorder_quantity) || reorderLevel * 2;
  
  if (currentQty <= reorderLevel) {
    return Math.max(avgUsage, reorderLevel * 2 - currentQty);
  }
  
  return 0;
}

export function calculateCostVariance(items) {
  return items.map(item => {
    const currentCost = parseFloat(item.current_cost_per_unit) || 0;
    const paidCost = parseFloat(item.unit_cost_paid) || currentCost;
    
    if (currentCost === 0) return { ...item, variance: 0, variance_percent: 0 };
    
    const variance = paidCost - currentCost;
    const variancePercent = (variance / currentCost) * 100;
    
    return {
      ...item,
      variance: variance.toFixed(2),
      variance_percent: variancePercent.toFixed(2)
    };
  });
}

export function groupItemsByStatus(items) {
  const grouped = {
    in_stock: [],
    low_stock: [],
    out_of_stock: [],
    ordered: []
  };
  
  items.forEach(item => {
    const quantity = parseInt(item.quantity) || 0;
    const reorderLevel = parseInt(item.reorder_level) || 0;
    const orderStatus = item.order_status;
    
    if (orderStatus) {
      grouped.ordered.push(item);
    } else if (quantity === 0) {
      grouped.out_of_stock.push(item);
    } else if (quantity <= reorderLevel) {
      grouped.low_stock.push(item);
    } else {
      grouped.in_stock.push(item);
    }
  });
  
  return grouped;
}

export function formatCurrency(value) {
  const num = parseFloat(value) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

export function formatNumber(value) {
  const num = parseFloat(value) || 0;
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(value) {
  const num = parseFloat(value) || 0;
  return `${num.toFixed(2)}%`;
}