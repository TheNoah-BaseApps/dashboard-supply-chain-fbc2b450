export function convertToCSV(data, headers) {
  if (!data || data.length === 0) return '';
  
  const headerRow = headers.map(h => `"${h.label}"`).join(',');
  const dataRows = data.map(row => {
    return headers.map(h => {
      const value = row[h.key];
      if (value === null || value === undefined) return '""';
      if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportToCSV(data, filename, headers) {
  try {
    const csv = convertToCSV(data, headers);
    downloadCSV(csv, filename);
    return { success: true };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return { success: false, error: error.message };
  }
}

export const SUPPLIER_EXPORT_HEADERS = [
  { key: 'supplier_key', label: 'Supplier Key' },
  { key: 'supplier_name', label: 'Supplier Name' },
  { key: 'contact_name', label: 'Contact Name' },
  { key: 'contact_title', label: 'Contact Title' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'region', label: 'Region' },
  { key: 'postal_code', label: 'Postal Code' },
  { key: 'country', label: 'Country' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'website', label: 'Website' },
  { key: 'date_added', label: 'Date Added' },
  { key: 'last_updated', label: 'Last Updated' }
];

export const INVENTORY_EXPORT_HEADERS = [
  { key: 'item_id', label: 'Item ID' },
  { key: 'item_name', label: 'Item Name' },
  { key: 'date', label: 'Date' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'reorder_level', label: 'Reorder Level' },
  { key: 'suggested_reorder_quantity', label: 'Suggested Reorder Qty' },
  { key: 'order_quantity', label: 'Order Quantity' },
  { key: 'order_status', label: 'Order Status' },
  { key: 'current_cost_per_unit', label: 'Current Cost Per Unit' },
  { key: 'unit_cost_paid', label: 'Unit Cost Paid' },
  { key: 'total_inventory_value', label: 'Total Inventory Value' },
  { key: 'total_item_reorder_cost', label: 'Total Item Reorder Cost' },
  { key: 'last_updated', label: 'Last Updated' }
];