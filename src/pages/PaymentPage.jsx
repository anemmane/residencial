import React, { useEffect, useState } from "react";

export default function PaymentPage({ user }) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/pagos", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPagos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user.token]);

  const handlePagar = async (pago) => {
    try {
      const res = await fetch("http://localhost:3001/crear-preferencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          monto: pago.monto,
          concepto: pago.concepto,
          id_residencia: user.id_residencia,
        }),
      });

      const data = await res.json();
      if (data.init_point) {
        window.open(data.init_point, "_blank");
      } else {
        alert("No se pudo crear la preferencia de pago.");
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("Ocurrió un error al generar el pago.");
    }
  };

  const handleVerPDF = async (linea_captura) => {
    try {
      const res = await fetch(`http://localhost:3001/verificar-pago/${linea_captura}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) {
        alert("No se pudo obtener el PDF del pago.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `recibo_${linea_captura}.pdf`;
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      alert("Ocurrió un error al descargar el PDF del pago.");
    }
  };

  if (loading) return <p>Cargando pagos...</p>;

  const hoy = new Date();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Mis Pagos</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Mes</th>
            <th className="border p-2">Monto</th>
            <th className="border p-2">Fecha límite</th>
            <th className="border p-2">Estatus</th>
            <th className="border p-2">Línea de captura</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pagos.map((pago) => (
            <tr key={pago.linea_captura}>
              <td className="border p-2">{pago.concepto}</td>
              <td className="border p-2">${pago.monto}</td>
              <td className="border p-2">{new Date(pago.fecha_generacion).toLocaleDateString()}</td>
              <td className="border p-2">{pago.estatus}</td>
              <td className="border p-2">{pago.linea_captura}</td>
              <td className="border p-2 space-x-2">
                {pago.estatus === "Pendiente" && (
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => handlePagar(pago)}
                  >
                    Pagar
                  </button>
                )}
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  onClick={() => handleVerPDF(pago.linea_captura)}
                >
                  Descargar PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
