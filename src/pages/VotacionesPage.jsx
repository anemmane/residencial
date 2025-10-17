import React, { useEffect, useState } from "react";

export default function VotacionesPage({ user }) {
  const [votaciones, setVotaciones] = useState([]);
  const [votoEnviado, setVotoEnviado] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/votaciones")
      .then(res => {
        if (!res.ok) throw new Error(`Error al obtener votaciones: ${res.status}`);
        return res.json();
      })
      .then(data => setVotaciones(data))
      .catch(err => setError(err.message));
  }, []);

  const handleVotar = (id_votacion, voto) => {
    fetch("http://localhost:3001/votar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_votacion, id_residencia: user.id_residencia, voto }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error al enviar voto: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setVotoEnviado(prev => ({ ...prev, [id_votacion]: voto }));
      })
      .catch(err => setError(err.message));
  };

  if (error) return <p className="text-red-500 font-bold">Error: {error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Votaciones</h2>
      {votaciones.length === 0 ? (
        <p>No hay votaciones disponibles.</p>
      ) : (
        <ul className="space-y-4">
          {votaciones.map(v => (
            <li key={v.id_votacion} className="border p-4 rounded bg-white shadow">
              <p className="font-semibold">{v.concepto}</p>
              <p className="text-sm text-gray-500">Fecha: {v.fecha}</p>
              {!votoEnviado[v.id_votacion] ? (
                <div className="mt-2 space-x-2">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() => handleVotar(v.id_votacion, "sí")}
                  >
                    Sí
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleVotar(v.id_votacion, "no")}
                  >
                    No
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-blue-600 font-bold">
                  Votaste: {votoEnviado[v.id_votacion]}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
