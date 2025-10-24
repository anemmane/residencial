// ======================================================
// 🌐 server.js — Residencial App (Sandbox)
// ======================================================
import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// ======================================================
// 🔐 Configuración general
// ======================================================
const SECRET = "clave_secreta_segura";

// ======================================================
// 🗄️ Conexión MySQL
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
// 🧩 Middleware de autenticación JWT
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
    if (results.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

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
// 💰 CREAR PREFERENCIA DE PAGO SIMULADA
// ======================================================
app.post("/crear-preferencia", verificarToken, async (req, res) => {
  const { monto, concepto, id_residencia, medio_pago } = req.body;

  if (!monto || !concepto || !id_residencia)
    return res.status(400).json({ error: "Faltan datos para generar el pago" });

  // Validar medio_pago según ENUM de la base de datos
  const medios_validos = ["Efectivo", "Transferencia", "En línea", "Otro", "Tarjeta"];
  const medio_pago_valido = medios_validos.includes(medio_pago) ? medio_pago : "Otro";

  const linea_captura = "LC" + Date.now() + "-" + id_residencia;

  try {
    const sql = `
      INSERT INTO pagos_mensuales 
      (id_residencia, concepto, monto, linea_captura, estatus, fecha_generacion, medio_pago)
      VALUES (?, ?, ?, ?, ?, NOW(), ?)
    `;

    db.query(
      sql,
      [id_residencia, concepto, monto, linea_captura, "Pendiente", medio_pago_valido],
      (err) => {
        if (err) {
          console.error("❌ Error al insertar el pago:", err);
          return res.status(500).json({ error: "Error al registrar el pago" });
        }

        // Respuesta simulada de preferencia de pago
        const preferenceSimulada = {
          id_preference: "SIMULADA_" + Date.now(),
          init_point: `http://localhost:5173/payment-simulado/${linea_captura}`,
          linea_captura,
        };

        res.json(preferenceSimulada);
      }
    );
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    res.status(500).json({ error: "Error al crear preferencia de pago" });
  }
});

// ======================================================
// 🧾 VERIFICAR PAGO Y GENERAR PDF
// ======================================================
app.get("/verificar-pago/:linea_captura", verificarToken, (req, res) => {
  const { linea_captura } = req.params;

  const sql = "SELECT * FROM pagos_mensuales WHERE linea_captura=?";
  db.query(sql, [linea_captura], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: "Pago no encontrado" });

    const pago = results[0];

    if (pago.estatus === "Pendiente") {
      const sqlUpdate = "UPDATE pagos_mensuales SET estatus='Pagado' WHERE linea_captura=?";
      db.query(sqlUpdate, [linea_captura]);
      pago.estatus = "Pagado";
    }

    const pdf = new PDFDocument();
    const filePath = path.join("./", `recibo_${linea_captura}.pdf`);
    pdf.pipe(fs.createWriteStream(filePath));
    pdf.fontSize(18).text("Recibo de Pago Residencial", { align: "center" });
    pdf.moveDown();
    pdf.fontSize(14).text(`Residencia ID: ${pago.id_residencia}`);
    pdf.text(`Monto: $${pago.monto}`);
    pdf.text(`Concepto: ${pago.concepto}`);
    pdf.text(`Estatus: ${pago.estatus}`);
    pdf.text(`Fecha: ${new Date().toLocaleString()}`);
    pdf.text(`Método de pago: ${pago.medio_pago}`);
    pdf.end();

    res.download(filePath);
  });
});

// ======================================================
// 🔍 CONSULTAR PAGOS
// ======================================================
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
// 🚨 CONSULTAR EMERGENCIAS
// ======================================================
app.get("/emergencias", verificarToken, (req, res) => {
  const { rol, id_residencia } = req.user;
  let sql = "SELECT * FROM emergencias";
  const params = [];

  if (rol !== "admin") {
    sql += " WHERE id_residencia = ?";
    params.push(id_residencia);
  }

  sql += " ORDER BY fecha_solicitud DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error al obtener emergencias:", err);
      return res.status(500).json({ error: "Error al obtener emergencias" });
    }
    res.json(results);
  });
});

// ======================================================
// 🗳️ CONSULTAR VOTACIONES
// ======================================================
app.get("/votaciones", verificarToken, (req, res) => {
  const { rol, id_residencia } = req.user;
  let sql = "SELECT * FROM votaciones";
  const params = [];

  if (rol !== "admin") {
    sql += " WHERE id_residencia = ?";
    params.push(id_residencia);
  }

  sql += " ORDER BY fecha_inicio DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error al obtener votaciones:", err);
      return res.status(500).json({ error: "Error al obtener votaciones" });
    }
    res.json(results);
  });
});

// ======================================================
// 🚀 INICIAR SERVIDOR
// ======================================================
app.listen(3001, () => console.log("🚀 Servidor corriendo en http://localhost:3001"));
