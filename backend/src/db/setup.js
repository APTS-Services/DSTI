// src/db/setup.js — applies database/schema.sql (safe to re-run).
// Usage: npm run db:setup
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

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
    password: process.env.DB_PASS || '',
    multipleStatements: true
  });
  try {
    await connection.query(sql);
    console.log(`Schema applied to ${dbName}.`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Schema setup failed:', err.message);
  process.exit(1);
});
