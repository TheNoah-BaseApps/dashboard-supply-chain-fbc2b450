import { query, getClient } from './database/aurora';

export { query, getClient };

export async function executeTransaction(queries) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const { sql, params } of queries) {
      const result = await client.query(sql, params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return { success: true, results };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function paginate(baseQuery, params, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) AS count_query`;
    const dataQuery = `${baseQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    
    const [countResult, dataResult] = await Promise.all([
      query(countQuery, params),
      query(dataQuery, [...params, limit, offset])
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    };
  } catch (error) {
    console.error('Pagination error:', error);
    throw error;
  }
}

export async function buildFilterQuery(baseTable, filters = {}) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string' && value.includes('%')) {
        conditions.push(`${key} ILIKE $${paramIndex}`);
        params.push(value);
      } else {
        conditions.push(`${key} = $${paramIndex}`);
        params.push(value);
      }
      paramIndex++;
    }
  });
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, params };
}