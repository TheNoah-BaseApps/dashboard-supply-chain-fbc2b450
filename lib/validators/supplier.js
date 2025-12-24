import { validateEmail, validatePhone, validateWebsite, validatePostalCode } from '../validation';

export function validateSupplierData(data) {
  const errors = [];
  const warnings = [];
  
  // Required fields
  if (!data.supplier_key?.trim()) {
    errors.push({
      field: 'supplier_key',
      message: 'Supplier key is required',
      severity: 'error'
    });
  }
  
  if (!data.supplier_name?.trim()) {
    errors.push({
      field: 'supplier_name',
      message: 'Supplier name is required',
      severity: 'error'
    });
  }
  
  // Email validation
  if (data.email) {
    if (!validateEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        severity: 'error'
      });
    }
  } else {
    warnings.push({
      field: 'email',
      message: 'Email address is recommended',
      severity: 'warning'
    });
  }
  
  // Phone validation
  if (data.phone && !validatePhone(data.phone)) {
    errors.push({
      field: 'phone',
      message: 'Invalid phone number format',
      severity: 'error'
    });
  }
  
  // Website validation
  if (data.website && !validateWebsite(data.website)) {
    errors.push({
      field: 'website',
      message: 'Invalid website URL',
      severity: 'error'
    });
  }
  
  // Postal code validation
  if (data.postal_code && data.country) {
    if (!validatePostalCode(data.postal_code, data.country)) {
      errors.push({
        field: 'postal_code',
        message: `Invalid postal code format for ${data.country}`,
        severity: 'error'
      });
    }
  }
  
  // Check for missing contact information
  if (!data.contact_name?.trim()) {
    warnings.push({
      field: 'contact_name',
      message: 'Contact name is recommended',
      severity: 'warning'
    });
  }
  
  if (!data.phone?.trim()) {
    warnings.push({
      field: 'phone',
      message: 'Phone number is recommended',
      severity: 'warning'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    allIssues: [...errors, ...warnings]
  };
}

export async function checkSupplierDuplicates(query, data, excludeId = null) {
  try {
    const checks = [];
    
    // Check duplicate supplier_key
    if (data.supplier_key) {
      const keyCheck = excludeId
        ? await query(
            'SELECT id, supplier_key FROM suppliers WHERE supplier_key = $1 AND id != $2',
            [data.supplier_key, excludeId]
          )
        : await query(
            'SELECT id, supplier_key FROM suppliers WHERE supplier_key = $1',
            [data.supplier_key]
          );
      
      if (keyCheck.rows.length > 0) {
        checks.push({
          field: 'supplier_key',
          message: 'Supplier key already exists',
          severity: 'error',
          duplicate_id: keyCheck.rows[0].id
        });
      }
    }
    
    // Check duplicate email
    if (data.email) {
      const emailCheck = excludeId
        ? await query(
            'SELECT id, email FROM suppliers WHERE email = $1 AND id != $2',
            [data.email, excludeId]
          )
        : await query(
            'SELECT id, email FROM suppliers WHERE email = $1',
            [data.email]
          );
      
      if (emailCheck.rows.length > 0) {
        checks.push({
          field: 'email',
          message: 'Email already registered to another supplier',
          severity: 'warning',
          duplicate_id: emailCheck.rows[0].id
        });
      }
    }
    
    return checks;
  } catch (error) {
    console.error('Error checking supplier duplicates:', error);
    return [];
  }
}