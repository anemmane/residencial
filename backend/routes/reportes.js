import express from "express";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import mysql from "mysql2";
import { fileURLToPath } from "url";
import { Parser as CsvParser } from "json2csv";

const router = express.Router();

// Resolver __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conexión a la base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "anemSQLudg2025",
  database: "residencial_db",
});

// ======================================================
// 📊 Endpoint principal: /reportes-financieros
// Admite parámetros: ?inicio=YYYY-MM-DD&fin=YYYY-MM-DD&formato=pdf|csv
// ======================================================
router.get("/", (req, res) => {
  const { inicio, fin, formato } = req.query;

  // Consulta dinámica con o sin rango de fechas
  let sql = `
    SELECT 
      concepto,
      SUM(CASE WHEN estatus='Pagado' THEN monto ELSE 0 END) AS total_pagado,
      SUM(CASE WHEN estatus='Pendiente' THEN monto ELSE 0 END) AS total_pendiente,
      COUNT(*) AS total_registros
    FROM pagos_mensuales
  `;

  const params = [];
  if (inicio && fin) {
    sql += " WHERE DATE(fecha_generacion) BETWEEN ? AND ? ";
    params.push(inicio, fin);
  }

  sql += " GROUP BY concepto";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ Error al generar el reporte:", err);
      return res.status(500).json({ error: "Error al generar el reporte financiero" });
    }

    if (!results.length) {
      return res.status(404).json({ error: "No hay datos para el rango de fechas especificado" });
    }

    // === PDF ===
    if (formato === "pdf") {
      const pdf = new PDFDocument();
      const filePath = path.join(__dirname, `../reporte_financiero_${Date.now()}.pdf`);
      const stream = fs.createWriteStream(filePath);
      pdf.pipe(stream);

      pdf.fontSize(20).text("📊 Reporte Financiero Residencial", { align: "center" });
      pdf.moveDown();

      if (inicio && fin) {
        pdf.fontSize(12).text(`Período: ${inicio} al ${fin}`, { align: "center" });
        pdf.moveDown();
      }

      results.forEach((r) => {
        pdf.fontSize(14).text(`Concepto: ${r.concepto}`);
        pdf.text(`Total Pagado: $${r.total_pagado}`);
        pdf.text(`Total Pendiente: $${r.total_pendiente}`);
        pdf.text(`Total Registros: ${r.total_registros}`);
        pdf.moveDown();
      });

      pdf.end();
      stream.on("finish", () => res.download(filePath));
      return;
    }

    // === CSV ===
    if (formato === "csv") {
      const parser = new CsvParser({
        fields: ["concepto", "total_pagado", "total_pendiente", "total_registros"],
      });
      const csv = parser.parse(results);
      const filePath = path.join(__dirname, `../reporte_financiero_${Date.now()}.csv`);
      fs.writeFileSync(filePath, csv);
      return res.download(filePath);
    }

    // === JSON (por defecto) ===
    res.json(results);
  });
});

export default router;
