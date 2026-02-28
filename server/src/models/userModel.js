import { pool } from "../config/db.js";

let cachedColumns = null;

async function getUsersColumns() {
  if (cachedColumns) return cachedColumns;

  const [rows] = await pool.query(
    `
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
    `
  );

  cachedColumns = new Set(rows.map((row) => row.COLUMN_NAME));
  return cachedColumns;
}

function buildUsername(email) {
  const localPart = String(email).split("@")[0] || "user";
  const cleaned = localPart.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "user";
  const suffix = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
  return `${cleaned}_${suffix}`.slice(0, 50);
}

export async function findUserByEmail(email) {
  const columns = await getUsersColumns();
  let passwordExpr = "password AS password";
  if (columns.has("password") && columns.has("password_hash")) {
    passwordExpr = "COALESCE(NULLIF(password, ''), password_hash) AS password";
  } else if (!columns.has("password") && columns.has("password_hash")) {
    passwordExpr = "password_hash AS password";
  }

  let nameExpr = "'' AS name";
  if (columns.has("name") && columns.has("username")) {
    nameExpr = "COALESCE(name, username) AS name";
  } else if (columns.has("name")) {
    nameExpr = "name";
  } else if (columns.has("username")) {
    nameExpr = "username AS name";
  }

  const [rows] = await pool.query(
    `SELECT id, ${nameExpr}, email, ${passwordExpr} FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

export async function createUser({ name, email, passwordHash }) {
  const columns = await getUsersColumns();
  const fieldNames = [];
  const values = [];

  if (columns.has("name")) {
    fieldNames.push("name");
    values.push(name);
  }

  if (columns.has("username")) {
    fieldNames.push("username");
    values.push(buildUsername(email));
  }

  if (columns.has("email")) {
    fieldNames.push("email");
    values.push(email);
  }

  if (columns.has("phone")) {
    fieldNames.push("phone");
    values.push("0000000000");
  }

  if (columns.has("password")) {
    fieldNames.push("password");
    values.push(passwordHash);
  }

  if (columns.has("password_hash")) {
    fieldNames.push("password_hash");
    values.push(passwordHash);
  }

  const placeholders = fieldNames.map(() => "?").join(", ");
  const sql = `INSERT INTO users (${fieldNames.join(", ")}) VALUES (${placeholders})`;
  const [result] = await pool.query(sql, values);
  return result.insertId;
}
