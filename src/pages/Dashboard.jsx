import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [residencias, setResidencias] = useState([]);
  const [habitantes, setHabitantes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [emergencias, setEmergencias] = useState([]);
  const [votaciones, setVotaciones] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/residencias")
      .then(res => res.json())
      .then(data => setResidencias(data));

    fetch("http://localhost:3001/habitantes")
      .then(res => res.json())
      .then(data => setHabitantes(data));

    fetch("http://localhost:3001/pagos")
      .then(res => res.json())
      .then(data => setPagos(data));

    fetch("http://localhost:3001/emergencias")
      .then(res => res.json())
      .then(data => setEmergencias(data));

    fetch("http://localhost:3001/votaciones")
      .then(res => res.json())
      .then(data => setVotaciones(data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Panel Administrativo</h2>

      <h3 className="text-xl font-semibold mt-4">Residencias</h3>
      <ul className="list-disc ml-6">
        {residencias.map(r => (
          <li key={r.id_residencia}>
            {r.nombre_familia} - Dirección: {r.direccion} - Registrada: {r.fecha_registro}
          </li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mt-4">Habitantes</h3>
      <ul className="list-disc ml-6">
        {habitantes.map(h => (
          <li key={h.id_habitante}>
            {h.nombre} ({h.fecha_nacimiento}) - Status: {h.status} - Residencia: {h.id_residencia}
          </li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mt-4">Pagos Mensuales</h3>
      <ul className="list-disc ml-6">
        {pagos.map(p => (
          <li key={p.id_pago}>
            Residencia ID: {p.id_residencia}, Monto: ${p.monto}, Vencimiento: {p.fecha_limite}, Estado: {p.estatus}, Concepto: {p.concepto}
          </li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mt-4">Emergencias</h3>
      <ul className="list-disc ml-6">
        {emergencias.map(e => (
          <li key={e.id_emergencia}>
            Residencia ID: {e.id_residencia}, Fecha: {e.fecha_solicitud}, Estado: {e.estatus}
          </li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mt-4">Votaciones</h3>
      <ul className="list-disc ml-6">
        {votaciones.map(v => (
          <li key={v.id_votacion}>
            Residencia ID: {v.id_residencia}, Fecha: {v.fecha_voto}, Concepto: {v.concepto}, Voto: {v.voto}
          </li>
        ))}
      </ul>
    </div>
  );
}
