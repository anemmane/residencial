import React, { useState } from "react";

export default function EmergencyPage() {
  const [name, setName] = useState("");
  const [apartment, setApartment] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  const handleReport = () => {
    if (!name || !apartment || !description) {
      setStatus("❌ Completa todos los campos");
      return;
    }

    // Aquí normalmente llamarías a un endpoint para guardar el reporte
    setStatus("✅ Reporte enviado. Ayuda en camino!");
    setName("");
    setApartment("");
    setDescription("");
  };

  return (
    <div className="p-4 max-w-lg mx-auto bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Emergencias</h2>
      <p className="mb-4">Reporte rápido de incidentes en tu residencia</p>

      <input
        type="text"
        placeholder="Nombre"
        className="border rounded p-2 w-full mb-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Apartamento"
        className="border rounded p-2 w-full mb-2"
        value={apartment}
        onChange={(e) => setApartment(e.target.value)}
      />

      <textarea
        placeholder="Descripción del incidente"
        className="border rounded p-2 w-full mb-2"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        onClick={handleReport}
        className="bg-red-600 text-white px-4 py-2 rounded w-full font-bold hover:bg-red-700"
      >
        Reportar Emergencia
      </button>

      {status && <p className="mt-2 font-medium">{status}</p>}
    </div>
  );
}
