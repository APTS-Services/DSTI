// src/db/setup.js — applies database/schema.sql (safe to re-run).
// Usage: npm run db:setup
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Columns added after the first release. CREATE TABLE IF NOT EXISTS does not
// change an existing table, so they are added here (MySQL 8 has no
// ADD COLUMN IF NOT EXISTS).
const ADDED_COLUMNS = [
  ['feedback', 'category', 'VARCHAR(60) NULL AFTER phone'],
  ['feedback', 'response', 'TEXT NULL AFTER status'],
  ['feedback', 'responded_at', 'DATETIME NULL AFTER response'],
  ['feedback', 'resolved_at', 'DATETIME NULL AFTER responded_at']
];

async function addMissingColumns(connection, dbName) {
  for (const [table, column, definition] of ADDED_COLUMNS) {
    const [rows] = await connection.query(
      'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [dbName, table, column]
    );
    if (!rows.length) {
      await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      console.log(`Added ${table}.${column}`);
    }
  }
}

async function main() {
  const dbName = process.env.DB_NAME || 'dsti_website';
  if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
    throw new Error(`DB_NAME "${dbName}" is not a valid database name.`);
  }
  const raw = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'schema.sql'), 'utf8');
  // Respect DB_NAME from .env while keeping schema.sql usable on its own.
  const sql = raw
    .replace(/CREATE DATABASE IF NOT EXISTS dsti_website/g, `CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
    .replace(/^USE dsti_website;/m, `USE \`${dbName}\`;`);
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS ?? process.env.DB_PASSWORD ?? '',
    multipleStatements: true
  });
  try {
    await connection.query(sql);
    await addMissingColumns(connection, dbName);
    console.log(`Schema applied to ${dbName}.`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Schema setup failed:', err.message);
  process.exit(1);
});
