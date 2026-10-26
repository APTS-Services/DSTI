// src/config/db.js — MySQL connection pool + small query helpers.
const mysql = require('mysql2');
const config = require('./index');
const logger = require('../utils/logger');

const pool = mysql.createPool(config.db);

pool.on('error', (err) => {
  logger.error(`[db pool] ${err.message}`);
});

/**
 * Runs a query and returns the rows (SELECT) or the result header (writes).
 * All callers use parameter placeholders — never string interpolation.
 */
async function q(sql, params = []) {
  const [rows] = await pool.promise().query(sql, params);
  return rows;
}

/** Returns the first row of a query, or null. */
async function one(sql, params = []) {
  const rows = await q(sql, params);
  return rows[0] || null;
}

/** Runs work inside a transaction; rolls back on any error. */
async function withTransaction(work) {
  const conn = await pool.promise().getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Fail fast when the database is unreachable. */
async function assertConnection() {
  const connection = await pool.promise().getConnection();
  try {
    await connection.query('SELECT 1');
  } finally {
    connection.release();
  }
}

module.exports = { pool, q, one, withTransaction, assertConnection };
