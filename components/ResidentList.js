import React, { useState } from "react";

const initialResidents = [
  { id: 1, name: "Carlos López", status: "Pagado" },
  { id: 2, name: "María Pérez", status: "Pendiente" },
  { id: 3, name: "Luis García", status: "Pendiente" }
];

export default function ResidentList() {
  const [residents, setResidents] = useState(initialResidents);

  const markAsPaid = (id) => {
    setResidents((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Pagado" } : r
      )
    );
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Base de Datos de Residentes</h2>
      <ul>
        {residents.map((r) => (
          <li key={r.id} className="flex justify-between items-center p-2 border-b">
            <span>{r.name} - <strong>{r.status}</strong></span>
            {r.status === "Pendiente" && (
              <button
                onClick={() => markAsPaid(r.id)}
                className="bg-green-600 text-white px-2 py-1 rounded"
              >
                Marcar Pagado
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
