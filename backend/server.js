// server.js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const mercadopago = require("mercadopago");

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// Conexión MySQL
// -----------------------------
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

// -----------------------------
// Nodemailer - recordatorios
// -----------------------------
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
    else console.log("📧 Correo enviado a", email, info.response);
  });
};

// Función de recordatorios
const sendPaymentReminders = () => {
  const sql = `
    SELECT r.nombre_familia, h.nombre AS nombre_persona, h.email, p.monto, p.fecha_limite
    FROM residencias r
    JOIN habitantes h ON h.id_residencia = r.id_residencia
    JOIN pagos_mensuales p ON p.id_residencia = r.id_residencia
    WHERE p.estatus = 'Pendiente'
  `;
  db.query(sql, (err, results) => {
    if (err) return console.error(err);
    results.forEach(r => {
      sendPaymentReminderEmail({
        nombre: `${r.nombre_familia} - ${r.nombre_persona}`,
        email: r.email,
        monto: r.monto,
        fecha: r.fecha_limite
      });
    });
  });
};

// Programar recordatorios diarios 9:00 AM
schedule.scheduleJob("0 9 * * *", () => {
  console.log("⏰ Ejecutando recordatorios de pagos...");
  sendPaymentReminders();
});

// -----------------------------
// Endpoints
// -----------------------------

// Obtener residencias
app.get("/residencias", (req, res) => {
  db.query("SELECT * FROM residencias", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Obtener habitantes
app.get("/habitantes", (req, res) => {
  db.query("SELECT * FROM habitantes", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Obtener pagos
app.get("/pagos", (req, res) => {
  db.query("SELECT * FROM pagos_mensuales", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Obtener emergencias
app.get("/emergencias", (req, res) => {
  db.query("SELECT * FROM emergencias", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Obtener votaciones
app.get("/votaciones", (req, res) => {
  db.query("SELECT * FROM votaciones", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Registrar pago
app.post("/pagos", (req, res) => {
  const { id_residencia, monto, fecha_generacion, fecha_limite, concepto, estatus, linea_captura, medio_pago } = req.body;

  const sql = `
    INSERT INTO pagos_mensuales
      (id_residencia, monto, fecha_generacion, fecha_limite, concepto, estatus, linea_captura, medio_pago)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [id_residencia, monto, fecha_generacion, fecha_limite, concepto, estatus, linea_captura, medio_pago], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: results.insertId, ...req.body });
  });
});

// -----------------------------
// Mercado Pago
// -----------------------------
// -----------------------------
// Mercado Pago
// -----------------------------

// Configurar credenciales de sandbox
mercadopago.configurations = {
  access_token: "TEST-8589744676726388-100318-8a92869490e0c2fbdf1ae0c622b5f04b-202623593"
};

// Endpoint para crear preferencia de pago
app.post("/create_preference", async (req, res) => {
  const { amount, id_residencia } = req.body;

  if (!amount || !id_residencia) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const preference = {
    items: [
      {
        title: `Pago de cuota - Residencia ${id_residencia}`,
        unit_price: parseFloat(amount),
        quantity: 1,
      },
    ],
    back_urls: {
      success: "http://localhost:5173/payment",
      failure: "http://localhost:5173/payment",
      pending: "http://localhost:5173/payment",
    },
    auto_return: "approved",
    notification_url: "http://localhost:3001/webhook", // Para recibir notificaciones
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    res.json({ id: response.body.id });
  } catch (error) {
    console.error("Error creando preferencia:", error);
    res.status(500).json({ error: "Error creando preferencia de pago" });
  }
});

// Webhook de Mercado Pago
app.post("/webhook", express.json(), (req, res) => {
  const payment = req.body;

  // Verificar que sea un pago aprobado
  if (payment.type === "payment" && payment.data.status === "approved") {
    const { id_residencia, transaction_amount } = payment.data;

    const sql = `
      INSERT INTO pagos_mensuales (id_residencia, monto, estatus)
      VALUES (?, ?, 'Pagado')
    `;
    db.query(sql, [id_residencia, transaction_amount], (err) => {
      if (err) console.error("Error al registrar pago desde webhook:", err);
    });
  }

  res.sendStatus(200);
});


// -----------------------------
// Emergencias
// -----------------------------
app.post("/emergencias", (req, res) => {
  const { id_residencia, fecha_solicitud, estatus } = req.body;
  const sql = "INSERT INTO emergencias (id_residencia, fecha_solicitud, estatus) VALUES (?, ?, ?)";
  db.query(sql, [id_residencia, fecha_solicitud, estatus], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: results.insertId, ...req.body });
  });
});

// -----------------------------
// Votaciones
// -----------------------------
app.post("/votaciones", (req, res) => {
  const { id_residencia, fecha_voto, concepto, voto } = req.body;
  const sql = "INSERT INTO votaciones (id_residencia, fecha_voto, concepto, voto) VALUES (?, ?, ?, ?)";
  db.query(sql, [id_residencia, fecha_voto, concepto, voto], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: results.insertId, ...req.body });
  });
});

// -----------------------------
// Iniciar servidor
// -----------------------------
app.listen(3001, () => console.log("Backend corriendo en http://localhost:3001"));
