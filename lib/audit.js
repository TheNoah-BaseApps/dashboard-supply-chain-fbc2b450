import { query } from './database';

export async function createAuditLog({
  user_id,
  workflow,
  record_id,
  action,
  old_values = null,
  new_values = null
}) {
  try {
    const sql = `
      INSERT INTO audit_logs (user_id, workflow, record_id, action, old_values, new_values, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    
    const result = await query(sql, [
      user_id,
      workflow,
      record_id,
      action,
      old_values ? JSON.stringify(old_values) : null,
      new_values ? JSON.stringify(new_values) : null
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
}

export async function getAuditLogs(filters = {}) {
  try {
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    if (filters.user_id) {
      conditions.push(`user_id = $${paramIndex}`);
      params.push(filters.user_id);
      paramIndex++;
    }
    
    if (filters.workflow) {
      conditions.push(`workflow = $${paramIndex}`);
      params.push(filters.workflow);
      paramIndex++;
    }
    
    if (filters.action) {
      conditions.push(`action = $${paramIndex}`);
      params.push(filters.action);
      paramIndex++;
    }
    
    if (filters.start_date) {
      conditions.push(`timestamp >= $${paramIndex}`);
      params.push(filters.start_date);
      paramIndex++;
    }
    
    if (filters.end_date) {
      conditions.push(`timestamp <= $${paramIndex}`);
      params.push(filters.end_date);
      paramIndex++;
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const sql = `
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.timestamp DESC
      LIMIT 100
    `;
    
    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}

export async function getRecordHistory(workflow, record_id) {
  try {
    const sql = `
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.workflow = $1 AND al.record_id = $2
      ORDER BY al.timestamp DESC
    `;
    
    const result = await query(sql, [workflow, record_id]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching record history:', error);
    throw error;
  }
}