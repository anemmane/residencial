// ======================================================
// 🌐 server.js — Residencial App (con Reportes Financieros PDF/CSV)
// ======================================================
import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Parser as CsvParser } from "json2csv";

import reportesRouter from "./routes/reportes.js";
import quejasRoutes from "./routes/quejas.js";

// ======================================================
// 🔧 Configuración inicial
// ======================================================
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
const SECRET = "clave_secreta_segura";

// Resolver __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// 🗄️ Conexión a MySQL
// ======================================================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "anemSQLudg2025",
  database: "residencial_db",
});

db.connect((err) => {
  if (err) console.error("❌ Error al conectar con MySQL:", err);
  else console.log("✅ Conectado a la base de datos residencial_db");
});

// ======================================================
// 🔐 Middleware de autenticación
// ======================================================
function verificarToken(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(403).json({ error: "Token no proporcionado" });
  const token = header.split(" ")[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token inválido" });
    req.user = decoded;
    next();
  });
}

// ======================================================
// 🔹 LOGIN DE USUARIOS
// ======================================================
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Faltan credenciales" });

  const sql = "SELECT * FROM habitantes WHERE usuario=?";
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: "Error en el servidor" });
    if (results.length === 0)
      return res.status(401).json({ error: "Usuario no encontrado" });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) return res.status(500).json({ error: "Error al comparar contraseñas" });
      if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

      const token = jwt.sign(
        {
          id_habitante: user.id_habitante,
          id_residencia: user.id_residencia,
          rol: user.rol,
        },
        SECRET,
        { expiresIn: "2h" }
      );

      res.json({
        message: "Inicio de sesión exitoso",
        token,
        rol: user.rol,
        id_residencia: user.id_residencia,
        nombre: user.nombre,
      });
    });
  });
});

// ======================================================
// 💰 PAGOS — Crear y Verificar
// ======================================================
app.post("/crear-preferencia", verificarToken, (req, res) => {
  const { monto, concepto, id_residencia, medio_pago } = req.body;

  if (!monto || !concepto || !id_residencia)
    return res.status(400).json({ error: "Faltan datos para generar el pago" });

  const medios_validos = ["Efectivo", "Transferencia", "En línea", "Otro", "Tarjeta"];
  const medio_pago_valido = medios_validos.includes(medio_pago)
    ? medio_pago
    : "Otro";

  const linea_captura = "LC" + Date.now() + "-" + id_residencia;

  const sql = `
    INSERT INTO pagos_mensuales 
    (id_residencia, concepto, monto, linea_captura, estatus, fecha_generacion, medio_pago)
    VALUES (?, ?, ?, ?, 'Pendiente', NOW(), ?)
  `;
  db.query(
    sql,
    [id_residencia, concepto, monto, linea_captura, medio_pago_valido],
    (err) => {
      if (err) return res.status(500).json({ error: "Error al registrar el pago" });

      const preferenceSimulada = {
        id_preference: "SIMULADA_" + Date.now(),
        init_point: `http://localhost:5173/payment-simulado/${linea_captura}`,
        linea_captura,
      };
      res.json(preferenceSimulada);
    }
  );
});

app.get("/pagos", verificarToken, (req, res) => {
  const { rol, id_residencia } = req.user;
  let sql = "SELECT * FROM pagos_mensuales";
  const params = [];
  if (rol !== "admin") {
    sql += " WHERE id_residencia=?";
    params.push(id_residencia);
  }
  sql += " ORDER BY fecha_generacion DESC";
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ======================================================
// 📊 Rutas externas: Quejas y Reportes
// ======================================================
app.use("/quejas", quejasRoutes);
app.use("/reportes-financieros", reportesRouter);

// ======================================================
// 🚀 Iniciar Servidor
// ======================================================
app.listen(3001, () =>
  console.log("🚀 Servidor corriendo en http://localhost:3001")
);
