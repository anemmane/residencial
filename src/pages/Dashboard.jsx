import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [residents, setResidents] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/residents")
      .then(res => res.json())
      .then(data => setResidents(data));

    fetch("http://localhost:3001/payments")
      .then(res => res.json())
      .then(data => setPayments(data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Panel Administrativo</h2>

      <h3 className="text-xl font-semibold mt-4">Residentes</h3>
      <ul className="list-disc ml-6">
        {residents.map(r => (
          <li key={r.id}>{r.nombre} - Apt {r.apartamento}</li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mt-4">Pagos</h3>
      <ul className="list-disc ml-6">
        {payments.map(p => (
          <li key={p.id}>
            Resident ID: {p.resident_id}, Monto: ${p.monto}, Fecha: {p.fecha}, Estado: {p.estado}
          </li>
        ))}
      </ul>
    </div>
  );
}
