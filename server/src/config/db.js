import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const useSsl = String(process.env.DB_SSL || "true").toLowerCase() === "true";
const databaseUrl = process.env.DATABASE_URL;

function buildDbConfig() {
  if (databaseUrl) {
    const url = new URL(databaseUrl);
    const sslMode = (url.searchParams.get("ssl-mode") || "").toUpperCase();
    const requiresSsl = sslMode === "REQUIRED" || useSsl;

    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: requiresSsl ? { rejectUnauthorized: false } : undefined
    };
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined
  };
}

export const pool = mysql.createPool(buildDbConfig());

export async function ensureUsersTable() {
  const createQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NULL,
      email VARCHAR(255) NULL,
      password VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;
  await pool.query(createQuery);

  const requiredColumns = [
    { name: "name", ddl: "ALTER TABLE users ADD COLUMN name VARCHAR(255) NULL" },
    { name: "email", ddl: "ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL" },
    { name: "password", ddl: "ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL" },
    { name: "created_at", ddl: "ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" }
  ];

  for (const column of requiredColumns) {
    const [rows] = await pool.query(
      `
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = ?
      LIMIT 1
      `,
      [column.name]
    );

    if (rows.length === 0) {
      await pool.query(column.ddl);
    }
  }
}
