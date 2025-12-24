export function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { headers: [], data: [] };
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let insideQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.replace(/^"|"$/g, '') || '';
    });
    
    data.push(row);
  }
  
  return { headers, data };
}

export function validateImportData(data, requiredFields) {
  const errors = [];
  
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        errors.push({
          row: index + 2,
          field,
          message: `Missing required field: ${field}`
        });
      }
    });
  });
  
  return errors;
}

export function mapImportToSchema(data, fieldMapping) {
  return data.map(row => {
    const mapped = {};
    Object.entries(fieldMapping).forEach(([importField, dbField]) => {
      mapped[dbField] = row[importField];
    });
    return mapped;
  });
}

export const SUPPLIER_IMPORT_FIELDS = {
  'Supplier Key': 'supplier_key',
  'Supplier Name': 'supplier_name',
  'Contact Name': 'contact_name',
  'Contact Title': 'contact_title',
  'Address': 'address',
  'City': 'city',
  'Region': 'region',
  'Postal Code': 'postal_code',
  'Country': 'country',
  'Phone': 'phone',
  'Email': 'email',
  'Website': 'website'
};

export const INVENTORY_IMPORT_FIELDS = {
  'Item ID': 'item_id',
  'Item Name': 'item_name',
  'Date': 'date',
  'Quantity': 'quantity',
  'Reorder Level': 'reorder_level',
  'Order Quantity': 'order_quantity',
  'Current Cost Per Unit': 'current_cost_per_unit',
  'Unit Cost Paid': 'unit_cost_paid'
};

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}