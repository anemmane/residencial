// backend/db.js
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "anemSQLudg2025",
  database: "residencial_db",
});
