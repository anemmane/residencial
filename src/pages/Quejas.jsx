import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Quejas({ user }) {
  const [quejas, setQuejas] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const config = {
    headers: { Authorization: `Bearer ${user.token}` },
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/quejas", config)
      .then((res) => {
        setQuejas(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      });
  }, []);

  const enviarQueja = () => {
    if (!descripcion.trim()) return alert("Escribe una descripción");
    axios
      .post("http://localhost:3001/quejas", { descripcion }, config)
      .then(() => {
        alert("Queja enviada correctamente");
        setDescripcion("");
      })
      .catch((err) => alert(err.response?.data?.error || err.message));
  };

  return (
    <div className="card bg-base-100 shadow-md p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Módulo de Quejas</h2>

      {/* Formulario de creación */}
      <div className="mb-6">
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Describe tu queja o sugerencia..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        ></textarea>
        <button className="btn btn-primary mt-2" onClick={enviarQueja}>
          Enviar Queja
        </button>
      </div>

      {/* Listado de quejas */}
      {loading ? (
        <p>Cargando quejas...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            {quejas.map((q) => (
              <tr key={q.id_queja}>
                <td>{q.id_queja}</td>
                <td>{q.usuario}</td>
                <td>{q.descripcion}</td>
                <td>{new Date(q.fecha_creacion).toLocaleDateString()}</td>
                <td>{q.estatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
