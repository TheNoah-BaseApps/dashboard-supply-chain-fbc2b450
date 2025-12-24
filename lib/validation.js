export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone);
};

export const validateWebsite = (website) => {
  try {
    new URL(website);
    return true;
  } catch {
    return false;
  }
};

export const validatePostalCode = (postalCode, country) => {
  const patterns = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,
    UK: /^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/,
    default: /^[\w\s-]{3,10}$/
  };
  
  const pattern = patterns[country] || patterns.default;
  return pattern.test(postalCode);
};

export const validateSupplier = (data) => {
  const errors = [];
  
  if (!data.supplier_key || data.supplier_key.trim() === '') {
    errors.push({ field: 'supplier_key', message: 'Supplier key is required' });
  }
  
  if (!data.supplier_name || data.supplier_name.trim() === '') {
    errors.push({ field: 'supplier_name', message: 'Supplier name is required' });
  }
  
  if (data.email && !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  if (data.phone && !validatePhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Invalid phone format' });
  }
  
  if (data.website && !validateWebsite(data.website)) {
    errors.push({ field: 'website', message: 'Invalid website URL' });
  }
  
  if (data.postal_code && data.country && !validatePostalCode(data.postal_code, data.country)) {
    errors.push({ field: 'postal_code', message: 'Invalid postal code format for country' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateInventoryItem = (data) => {
  const errors = [];
  
  if (!data.item_id || data.item_id.trim() === '') {
    errors.push({ field: 'item_id', message: 'Item ID is required' });
  }
  
  if (!data.item_name || data.item_name.trim() === '') {
    errors.push({ field: 'item_name', message: 'Item name is required' });
  }
  
  if (data.quantity !== undefined && data.quantity < 0) {
    errors.push({ field: 'quantity', message: 'Quantity cannot be negative' });
  }
  
  if (data.reorder_level !== undefined && data.reorder_level < 0) {
    errors.push({ field: 'reorder_level', message: 'Reorder level must be positive' });
  }
  
  if (data.current_cost_per_unit !== undefined && data.current_cost_per_unit < 0) {
    errors.push({ field: 'current_cost_per_unit', message: 'Cost per unit must be positive' });
  }
  
  if (data.date && new Date(data.date) > new Date()) {
    errors.push({ field: 'date', message: 'Date cannot be in the future' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const detectDuplicateSupplier = async (query, supplier_key, email, id = null) => {
  try {
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    if (supplier_key) {
      conditions.push(`supplier_key = $${paramIndex}`);
      params.push(supplier_key);
      paramIndex++;
    }
    
    if (email) {
      conditions.push(`email = $${paramIndex}`);
      params.push(email);
      paramIndex++;
    }
    
    if (id) {
      conditions.push(`id != $${paramIndex}`);
      params.push(id);
    }
    
    if (conditions.length === 0) return null;
    
    const sql = `SELECT id, supplier_key, email FROM suppliers WHERE ${conditions.join(' OR ')}`;
    const result = await query(sql, params);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error detecting duplicate supplier:', error);
    return null;
  }
};