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
      .then((res) => {
        setPagos(res.data);
        setLoadingPagos(false);
      })
      .catch((err) => {
        setErrorPagos(err.response?.data?.error || err.message);
        setLoadingPagos(false);
      });

    // Obtener emergencias
    axios
      .get("http://localhost:3001/emergencias", config)
      .then((res) => {
        setEmergencias(res.data);
        setLoadingEmergencias(false);
      })
      .catch((err) => {
        setErrorEmergencias(err.response?.data?.error || err.message);
        setLoadingEmergencias(false);
      });
  }, [user]);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Panel Residencial</h1>

      {/* Sección de Pagos */}
      <section className="mb-8">
        <div className="card bg-base-100 shadow-md p-4">
          <h2 className="card-title text-xl mb-4">Pagos</h2>

          {loadingPagos ? (
            <p>Cargando pagos...</p>
          ) : errorPagos ? (
            <p className="text-red-500">Error: {errorPagos}</p>
          ) : pagos.length === 0 ? (
            <p>No hay pagos registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
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
                  {pagos.map((p) => (
                    <tr key={p.id_pago}>
                      <td>{p.concepto}</td>
                      <td>${p.monto}</td>
                      <td>{formatDate(p.fecha_generacion)}</td>
                      <td>{p.fecha_limite ? formatDate(p.fecha_limite) : "-"}</td>
                      <td>
                        <span
                          className={`badge ${
                            p.estatus === "Pagado"
                              ? "badge-success"
                              : p.estatus === "Pendiente"
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {p.estatus}
                        </span>
                      </td>
                      <td>{p.linea_captura}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Sección de Emergencias */}
      <section>
        <div className="card bg-base-100 shadow-md p-4">
          <h2 className="card-title text-xl mb-4">Emergencias</h2>

          {loadingEmergencias ? (
            <p>Cargando emergencias...</p>
          ) : errorEmergencias ? (
            <p className="text-red-500">Error: {errorEmergencias}</p>
          ) : emergencias.length === 0 ? (
            <p>No hay emergencias registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Fecha</th>
                    <th>Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencias.map((e) => (
                    <tr key={e.id_emergencia}>
                      <td>{e.descripcion}</td>
                      <td>{formatDate(e.fecha_solicitud)}</td>
                      <td>
                        <span
                          className={`badge ${
                            e.status === "Resuelta"
                              ? "badge-success"
                              : e.status === "Pendiente"
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
