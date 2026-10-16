// MySQL connection pool. All queries use placeholders (prepared statements).
import mysql from 'mysql2/promise';
import env from '../config/env.js';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...env.db,
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 10,
      dateStrings: true,
      multipleStatements: false,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
