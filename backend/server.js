const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

//Envío de correos


const nodemailer = require("nodemailer");

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


const db = new sqlite3.Database(":memory:"); // Para demo, memoria. Puedes usar archivo .db

// Crear tablas
db.serialize(() => {
  db.run(`CREATE TABLE residents (
    id INTEGER PRIMARY KEY,
    nombre TEXT,
    apartamento TEXT,
    telefono TEXT,
    email TEXT
  )`);

  db.run(`CREATE TABLE payments (
    id INTEGER PRIMARY KEY,
    resident_id INTEGER,
    monto REAL,
    fecha TEXT,
    estado TEXT,
    FOREIGN KEY(resident_id) REFERENCES residents(id)
  )`);

  // Insertar datos de prueba
  const residents = [
    [1, "Juan Pérez", "101", "555-1234", "juan@mail.com"],
    [2, "Ana López", "102", "555-5678", "ana@mail.com"],
    [3, "Carlos Gómez", "103", "555-9012", "carlos@mail.com"],
    [4, "Laura Martínez", "104", "555-3456", "laura@mail.com"],
    [5, "Diego Ramírez", "105", "555-7890", "diego@mail.com"]
  ];

  const payments = [
    [1, 1, 1000, "2025-10-01", "Pagado"],
    [2, 2, 1200, "2025-10-02", "Pendiente"],
    [3, 3, 900, "2025-10-01", "Pagado"],
    [4, 4, 1100, "2025-10-03", "Pendiente"],
    [5, 5, 950, "2025-10-02", "Pagado"]
  ];

  residents.forEach(r => db.run(`INSERT INTO residents VALUES (?,?,?,?,?)`, r));
  payments.forEach(p => db.run(`INSERT INTO payments VALUES (?,?,?,?,?)`, p));
});

// Endpoints
app.get("/residents", (req, res) => {
  db.all("SELECT * FROM residents", (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

app.get("/payments", (req, res) => {
  db.all("SELECT * FROM payments", (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

app.listen(3001, () => console.log("Backend corriendo en http://localhost:3001"));

// Endpoint para registrar un pago
app.post("/payments", (req, res) => {
  const { resident_id, monto, estado } = req.body;
  const fecha = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  if (!resident_id || !monto || !estado) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const sql = "INSERT INTO payments (resident_id, monto, fecha, estado) VALUES (?,?,?,?)";
  db.run(sql, [resident_id, monto, fecha, estado], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, resident_id, monto, fecha, estado });
  });
});


// credenciales mercado pago
const mercadopago = require("mercadopago");

// Configurar credenciales de sandbox
// Configuración API
mercadopago.configurations = {
  access_token: "TEST-8589744676726388-100318-8a92869490e0c2fbdf1ae0c622b5f04b-202623593"
};

app.post("/create_preference", async (req, res) => {
  const { amount, resident_id } = req.body;

  if (!amount || !resident_id) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const preference = {
    items: [
      {
        title: `Pago de cuota - Residente ${resident_id}`,
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
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    res.json({ id: response.body.id });
  } catch (error) {
    console.error("Error creando preferencia:", error);
    res.status(500).json({ error: "Error creando preferencia de pago" });
  }
});

app.post("/webhook", express.json(), async (req, res) => {
  const payment = req.body;

  // Verifica que sea un pago aprobado
  if (payment.type === "payment" && payment.data.status === "approved") {
    const { amount, resident_id } = payment.data;

    db.run(
      "INSERT INTO payments (resident_id, monto, estado) VALUES (?, ?, ?)",
      [resident_id, amount, "Pagado"],
      function (err) {
        if (err) console.error(err);
      }
    );
  }

  res.sendStatus(200);
});

//recordatorios de pagos
const schedule = require("node-schedule");

// Función para enviar recordatorios
const sendPaymentReminders = () => {
  db.all(
    `SELECT r.nombre, r.email, p.monto, p.fecha
     FROM residents r
     JOIN payments p ON r.id = p.resident_id
     WHERE p.estado = "Pendiente"`,
    (err, rows) => {
      if (err) return console.error("Error al obtener pagos pendientes:", err);

      rows.forEach(({ nombre, email, monto, fecha }) => {
        // Aquí puedes enviar correo real usando nodemailer
        console.log(`📧 Recordatorio enviado a ${nombre} (${email}): 
        Pago de $${monto} pendiente desde ${fecha}`);
      });
    }
  );
};

// Programar recordatorios diarios a las 9:00 AM
schedule.scheduleJob("0 9 * * *", () => {
  console.log("⏰ Ejecutando recordatorios de pagos...");
  sendPaymentReminders();
});


// --- Llamada manual para prueba ---
sendPaymentReminders();

// --- Luego levantamos el servidor ---
app.listen(3001, () => console.log("Backend corriendo en http://localhost:3001"));