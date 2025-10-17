// src/pages/PaymentPage.jsx
import React, { useEffect, useState } from "react";

export default function PaymentPage({ user }) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/pagos/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setPagos(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [user.id]);

  const handlePagar = (linea_captura) => {
    alert(`Simulación de pago con línea de captura: ${linea_captura}`);
  };

  const hoy = new Date();

  if (loading) return <p>Cargando pagos...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Mis Pagos</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Mes</th>
            <th className="border p-2">Monto</th>
            <th className="border p-2">Fecha límite</th>
            <th className="border p-2">Estatus</th>
            <th className="border p-2">Línea de captura</th>
            <th className="border p-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {pagos.map(p => {
            const fechaLimite = new Date(p.fecha_limite);
            const vencido = fechaLimite < hoy && p.estatus_pago === "Pendiente";
            return (
              <tr key={p.id_pago} className={vencido ? "bg-red-100" : ""}>
                <td className="border p-2">{p.concepto}</td>
                <td className="border p-2">${p.monto}</td>
                <td className="border p-2">{p.fecha_limite}</td>
                <td className="border p-2">{p.estatus_pago}</td>
                <td className="border p-2">{p.linea_captura}</td>
                <td className="border p-2">
                  {p.estatus_pago === "Pendiente" && (
                    <button
                      onClick={() => handlePagar(p.linea_captura)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Pagar
                    </button>
                  )}
                  {p.estatus_pago === "Pagado" && <span className="text-green-600 font-bold">Pagado</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
