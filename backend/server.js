// server.js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "clave_secreta_segura";

// Conexión MySQL
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

// Middleware de autenticación
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

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Faltan credenciales" });

  const sql = "SELECT * FROM habitantes WHERE usuario = ?";
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

// Endpoints de Pagos
app.get("/pagos", verificarToken, (req, res) => {
  const { rol, id_residencia } = req.user;

  let sql = "SELECT * FROM pagos_mensuales";
  const params = [];

  if (rol !== "admin") {
    sql += " WHERE id_residencia = ?";
    params.push(id_residencia);
  }

  sql += " ORDER BY fecha_generacion DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Endpoints de Emergencias
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
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Endpoints de Votaciones
app.get("/votaciones", (req, res) => {
  const sql = "SELECT * FROM votaciones ORDER BY fecha DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/votar", (req, res) => {
  const { id_votacion, id_habitante, voto } = req.body;
  const sqlCheck = "SELECT * FROM votos WHERE id_votacion = ? AND id_habitante = ?";
  db.query(sqlCheck, [id_votacion, id_habitante], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0)
      return res.status(400).json({ error: "Ya votaste esta votación" });

    const sqlInsert = "INSERT INTO votos (id_votacion, id_habitante, voto) VALUES (?, ?, ?)";
    db.query(sqlInsert, [id_votacion, id_habitante, voto], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Voto registrado correctamente" });
    });
  });
});

// Resultados de votaciones (admin)
app.get("/admin/votaciones/resultados", (req, res) => {
  const sql = `
    SELECT v.id_votacion, v.concepto, v.fecha,
           COUNT(CASE WHEN vo.voto='sí' THEN 1 END) AS votos_si,
           COUNT(CASE WHEN vo.voto='no' THEN 1 END) AS votos_no
    FROM votaciones v
    LEFT JOIN votos vo ON vo.id_votacion = v.id_votacion
    GROUP BY v.id_votacion
    ORDER BY v.fecha DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Iniciar servidor
app.listen(3001, () => console.log("🚀 Servidor corriendo en http://localhost:3001"));
