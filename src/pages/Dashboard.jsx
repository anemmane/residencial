// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard({ user }) {
  const [pagos, setPagos] = useState([]);
  const [emergencias, setEmergencias] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [loadingEmergencias, setLoadingEmergencias] = useState(true);
  const [errorPagos, setErrorPagos] = useState(null);
  const [errorEmergencias, setErrorEmergencias] = useState(null);

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    // Obtener pagos
    axios
      .get("http://localhost:3001/pagos", config)
      .then(res => {
        setPagos(res.data);
        setLoadingPagos(false);
      })
      .catch(err => {
        setErrorPagos(err.response?.data?.error || err.message);
        setLoadingPagos(false);
      });

    // Obtener emergencias
    axios
      .get("http://localhost:3001/emergencias", config)
      .then(res => {
        setEmergencias(res.data);
        setLoadingEmergencias(false);
      })
      .catch(err => {
        setErrorEmergencias(err.response?.data?.error || err.message);
        setLoadingEmergencias(false);
      });
  }, [user]);

  const formatDate = dateStr => new Date(dateStr).toLocaleDateString();

  return (
    <div className="dashboard-container">
      <h1>Panel Residencial</h1>

      <section className="pagos-section">
        <h2>Pagos</h2>
        {loadingPagos ? (
          <p>Cargando pagos...</p>
        ) : errorPagos ? (
          <p style={{ color: "red" }}>Error: {errorPagos}</p>
        ) : pagos.length === 0 ? (
          <p>No hay pagos registrados</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Fecha Generación</th>
                <th>Fecha Límite</th>
                <th>Estatus</th>
                <th>Línea de Captura</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map(p => (
                <tr key={p.id_pago}>
                  <td>{p.concepto}</td>
                  <td>${p.monto}</td>
                  <td>{formatDate(p.fecha_generacion)}</td>
                  <td>{formatDate(p.fecha_limite)}</td>
                  <td>{p.estatus}</td>
                  <td>{p.linea_captura}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="emergencias-section">
        <h2>Emergencias</h2>
        {loadingEmergencias ? (
          <p>Cargando emergencias...</p>
        ) : errorEmergencias ? (
          <p style={{ color: "red" }}>Error: {errorEmergencias}</p>
        ) : emergencias.length === 0 ? (
          <p>No hay emergencias registradas</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {emergencias.map(e => (
                <tr key={e.id_emergencia}>
                  <td>{e.descripcion}</td>
                  <td>{formatDate(e.fecha_solicitud)}</td>
                  <td>{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
