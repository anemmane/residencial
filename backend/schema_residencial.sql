// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const mercadopago = require("mercadopago");

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------
// Conexión a MySQL
// ----------------------------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "anemSQLudg2025",
  database: "residencial_db"
});

db.connect(err => {
  if (err) console.error("❌ Error al conectar con MySQL:", err);
  else console.log("✅ Conectado a la base de datos residencial_db");
});

// ----------------------------
// Nodemailer para recordatorios
// ----------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tu-email@gmail.com",
    pass: "tu-contraseña-o-app-password"
  }
});

const sendPaymentReminderEmail = ({ nombre, email, monto, fecha }) => {
  const mailOptions = {
    from: "tu-email@gmail.com",
    to: email,
    subject: "Recordatorio de pago pendiente",
    text: `Hola ${nombre}, tienes un pago pendiente de $${monto} con fecha ${fecha}. Por favor realiza tu pago a tiempo.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Error enviando correo:", error);
    else console.log("Correo enviado a", email, info.response);
  });
};

// ----------------------------
// Endpoints CRUD
// ----------------------------

// -- Residencias --
app.get("/residencias", (req, res) => {
  db.query("SELECT * FROM residencias", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/residencias", (req, res) => {
  const { nombre_familia, direccion } = req.body;
  const fecha_registro = new Date().toISOString().split("T")[0];
  db.query(
    "INSERT INTO residencias (nombre_familia, direccion, fecha_registro) VALUES (?,?,?)",
    [nombre_familia, direccion, fecha_registro],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id_residencia: result.insertId, nombre_familia, direccion, fecha_registro });
    }
  );
});

// -- Habitantes --
app.get("/habitantes/:id_residencia", (req, res) => {
  const { id_residencia } = req.params;
  db.query("SELECT * FROM habitantes WHERE id_residencia = ?", [id_residencia], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/habitantes", (req, res) => {
  const { id_residencia, nombre, fecha_nacimiento, status } = req.body;
  db.query(
    "INSERT INTO habitantes (id_residencia, nombre, fecha_nacimiento, status) VALUES (?,?,?,?)",
    [id_residencia, nombre, fecha_nacimiento, status || "Viviendo"],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id_habitante: result.insertId, id_residencia, nombre, fecha_nacimiento, status });
    }
  );
});

// -- Pagos mensuales --
app.get("/pagos/:id_residencia", (req, res) => {
  const { id_residencia } = req.params;
  db.query("SELECT * FROM pagos_mensuales WHERE id_residencia = ?", [id_residencia], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/pagos", (req, res) => {
  const { id_residencia, monto, fecha_limite, concepto, estatus, linea_captura, medio_pago } = req.body;
  const fecha_generacion = new Date().toISOString().split("T")[0];

  db.query(
    "INSERT INTO pagos_mensuales (id_residencia, monto, fecha_generacion, fecha_limite, concepto, estatus, linea_captura, medio_pago) VALUES (?,?,?,?,?,?,?,?)",
    [id_residencia, monto, fecha_generacion, fecha_limite, concepto, estatus || "Pendiente", linea_captura, medio_pago],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id_pago: result.insertId, id_residencia, monto, fecha_generacion, fecha_limite, concepto, estatus, linea_captura, medio_pago });
    }
  );
});

// -- Emergencias --
app.get("/emergencias/:id_residencia", (req, res) => {
  db.query("SELECT * FROM emergencias WHERE id_residencia = ?", [req.params.id_residencia], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/emergencias", (req, res) => {
  const { id_residencia, descripcion, status } = req.body;
  const fecha_solicitud = new Date().toISOString().split("T")[0];
  db.query(
    "INSERT INTO emergencias (id_residencia, descripcion, fecha_solicitud, status) VALUES (?,?,?,?)",
    [id_residencia, descripcion, fecha_solicitud, status || "En proceso"],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id_emergencia: result.insertId, id_residencia, descripcion, fecha_solicitud, status });
    }
  );
});

// -- Votaciones --
app.get("/votaciones", (req, res) => {
  db.query("SELECT * FROM votaciones", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/votaciones", (req, res) => {
  const { id_residencia, concepto, voto } = req.body;
  const fecha = new Date().toISOString().split("T")[0];
  db.query(
    "INSERT INTO votaciones (id_residencia, concepto, fecha, voto) VALUES (?,?,?,?)",
    [id_residencia, concepto, fecha, voto],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id_votacion: result.insertId, id_residencia, concepto, fecha, voto });
    }
  );
});

// ----------------------------
// Mercado Pago
// ----------------------------
mercadopago.configurations.setAccessToken("TEST-8589744676726388-100318-8a92869490e0c2fbdf1ae0c622b5f04b-202623593");

app.post("/create_preference", async (req, res) => {
  const { amount, id_residencia } = req.body;
  if (!amount || !id_residencia) return res.status(400).json({ error: "Faltan datos" });

  const preference = {
    items: [{ title: `Pago de cuota - Residencia ${id_residencia}`, unit_price: parseFloat(amount), quantity: 1 }],
    back_urls: { success: "http://localhost:5173/payment", failure: "http://localhost:5173/payment", pending: "http://localhost:5173/payment" },
    auto_return: "approved"
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    res.json({ id: response.body.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando preferencia" });
  }
});

// ----------------------------
// Webhook de pagos
// ----------------------------
app.post("/webhook", express.json(), (req, res) => {
  const payment = req.body;
  if (payment.type === "payment" && payment.data.status === "approved") {
    const { amount, id_residencia } = payment.data;
    db.query(
      "INSERT INTO pagos_mensuales (id_residencia, monto, fecha_generacion, estatus, medio_pago) VALUES (?, ?, CURDATE(), 'Pagado', 'En línea')",
      [id_residencia, amount],
      (err) => { if (err) console.error(err); }
    );
  }
  res.sendStatus(200);
});

// ----------------------------
// Recordatorios de pagos
// ----------------------------
const sendPaymentReminders = () => {
  const sql = `
    SELECT r.nombre_familia, r.direccion, p.monto, p.fecha_limite
    FROM residencias r
    JOIN pagos_mensuales p ON r.id_residencia = p.id_residencia
    WHERE p.estatus = 'Pendiente'
  `;
  db.query(sql, (err, rows) => {
    if (err) return console.error(err);

    rows.forEach(({ nombre_familia, direccion, monto, fecha_limite }) => {
      console.log(`📧 Recordatorio a ${nombre_familia} (${direccion}) - Pago pendiente $${monto}, fecha límite: ${fecha_limite}`);
      // sendPaymentReminderEmail({ nombre: nombre_familia, email: direccion, monto, fecha: fecha_limite });
    });
  });
};

// Ejecutar recordatorios todos los días a las 9:00 AM
schedule.scheduleJob("0 9 * * *", () => {
  console.log("⏰ Ejecutando recordatorios de pagos...");
  sendPaymentReminders();
});

// --- Servidor
app.listen(3001, () => console.log("Backend corriendo en http://localhost:3001"));
