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
// 🚨 🚨 🚨 NUEVO: REGISTRO DE EMERGENCIAS
// ======================================================
app.post("/emergencias", (req, res) => {
  const { id_residencia, descripcion } = req.body;

  if (!id_residencia || !descripcion) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const fecha_solicitud = new Date().toISOString().split("T")[0];

  const query = `
    INSERT INTO emergencias (id_residencia, descripcion, fecha_solicitud)
    VALUES (?, ?, ?)
  `;

  db.query(query, [id_residencia, descripcion, fecha_solicitud], (err, result) => {
    if (err) {
      console.error("❌ Error al registrar emergencia:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    res.json({
      message: "Emergencia registrada correctamente",
      id_emergencia: result.insertId,
    });
  });
});

// ======================================================
// 🚨 GET: Listar emergencias (solo admin)
// ======================================================

app.get("/emergencias", verificarToken, (req, res) => {
  const { rol, id_residencia } = req.user;

  // Selecciona todas las columnas, incluyendo 'status'
  let sql = "SELECT id_emergencia, id_residencia, descripcion, fecha_solicitud, status FROM emergencias";
  const params = [];

  // Solo usuarios normales ven solo sus emergencias
  if (rol.toLowerCase() !== "admin") {
    sql += " WHERE id_residencia = ?";
    params.push(id_residencia);
  }

  sql += " ORDER BY fecha_solicitud DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener emergencias:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    res.json(results);
  });
});

// ======================================================
// 🔹 GET: Listar votaciones
// ======================================================
app.get("/votaciones", verificarToken, (req, res) => {
  const { rol, id_habitante } = req.user;

  // Traer votaciones con totales de votos
  const sql = `
    SELECT v.id_votacion,
           v.concepto AS titulo,
           v.estado,
           v.fecha_inicio,
           v.fecha_fin,
           COALESCE(SUM(vt.voto = 'A favor'),0) AS votos_si,
           COALESCE(SUM(vt.voto = 'En contra'),0) AS votos_no,
           COUNT(vt.id_voto) AS total_votos
    FROM votaciones v
    LEFT JOIN votos vt ON vt.id_votacion = v.id_votacion
    GROUP BY v.id_votacion
    ORDER BY v.fecha_inicio DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener votaciones:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    res.json(results);
  });
});

// ======================================================
// 🔹 POST: Registrar voto
// ======================================================
app.post("/votar", verificarToken, (req, res) => {
  const { id_votacion, voto } = req.body;
  const { id_habitante } = req.user;

  if (!id_votacion || !voto) {
    return res.status(400).json({ error: "Faltan datos para registrar el voto" });
  }

  // Validar que el voto sea correcto
  const votosValidos = ["A favor", "En contra", "Abstención"];
  if (!votosValidos.includes(voto)) {
    return res.status(400).json({ error: "Voto inválido" });
  }

  // Verificar si ya votó
  const checkSql = "SELECT * FROM votos WHERE id_votacion=? AND id_habitante=?";
  db.query(checkSql, [id_votacion, id_habitante], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error en el servidor" });
    if (rows.length > 0) return res.status(400).json({ error: "Ya votaste esta votación" });

    // Insertar voto
    const insertSql = "INSERT INTO votos (id_votacion, id_habitante, voto) VALUES (?, ?, ?)";
    db.query(insertSql, [id_votacion, id_habitante, voto], (err2) => {
      if (err2) return res.status(500).json({ error: "Error al registrar voto" });
      res.json({ message: "Voto registrado correctamente" });
    });
  });
});

// ======================================================
// POST /quejas — Registrar nueva queja
// ======================================================
app.post("/quejas", verificarToken, (req, res) => {
  const { descripcion } = req.body;
  const { id_habitante, id_residencia } = req.user;

  // Validación
  if (!descripcion || !id_residencia || !id_habitante) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const sql = `
    INSERT INTO quejas (id_residencia, id_habitante, descripcion, estatus, fecha_creacion)
    VALUES (?, ?, ?, 'Pendiente', NOW())
  `;
  db.query(sql, [id_residencia, id_habitante, descripcion], (err, result) => {
    if (err) {
      console.error("❌ Error al guardar queja:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    res.json({
      message: "Queja registrada correctamente",
      id_queja: result.insertId,
    });
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
