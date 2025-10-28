import express from "express";
import { pool } from "../db.js"; // ajusta el path a tu conexión MySQL
// import { verifyToken } from "../middleware/auth.js"; // si usas JWT

const router = express.Router();

// 🔹 Obtener todas las quejas
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM quejas ORDER BY fecha_creacion DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las quejas" });
  }
});

// 🔹 Crear una nueva queja
router.post("/", async (req, res) => {
  const { id_usuario, descripcion } = req.body;
  if (!id_usuario || !descripcion)
    return res.status(400).json({ error: "Faltan datos requeridos" });

  try {
    await pool.query(
      "INSERT INTO quejas (id_usuario, descripcion) VALUES (?, ?)",
      [id_usuario, descripcion]
    );
    res.json({ message: "Queja registrada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar la queja" });
  }
});

// 🔹 Actualizar estatus (por admin)
router.put("/:id", async (req, res) => {
  const { estatus } = req.body;
  const { id } = req.params;
  try {
    await pool.query("UPDATE quejas SET estatus = ? WHERE id_queja = ?", [
      estatus,
      id,
    ]);
    res.json({ message: "Estatus actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el estatus" });
  }
});

export default router;
