import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentPage({ user }) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPago, setSelectedPago] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    numeroTarjeta: "",
    fecha: "",
    cvv: "",
  });

  // 🔹 Cargar pagos al iniciar la página
  useEffect(() => {
    axios
      .get("http://localhost:3001/pagos", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setPagos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener pagos:", err);
        setLoading(false);
      });
  }, [user.token]);

  // 🔹 Abrir modal con datos del pago seleccionado
  const abrirModal = (pago) => {
    setSelectedPago(pago);
    setModalOpen(true);
  };

  // 🔹 Cerrar modal
  const cerrarModal = () => {
    setModalOpen(false);
    setFormData({ nombre: "", numeroTarjeta: "", fecha: "", cvv: "" });
  };

  // 🔹 Simular el pago
  const handlePagoSimulado = async (e) => {
    e.preventDefault();

    try {
      const body = {
        monto: parseFloat(selectedPago.monto),
        concepto: selectedPago.concepto,
        id_residencia: user.id_residencia,
      };

      const res = await axios.post("http://localhost:3001/crear-preferencia", body, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      console.log("Pago simulado realizado:", res.data);
      alert("✅ Pago simulado realizado con éxito");

      cerrarModal();

      // Actualizar lista de pagos
      setPagos((prev) =>
        prev.map((p) =>
          p.linea_captura === selectedPago.linea_captura
            ? { ...p, estatus: "Pagado" }
            : p
        )
      );
    } catch (error) {
      console.error("Error al simular pago:", error);
      alert("❌ No se pudo completar el pago simulado.");
    }
  };

  // 🔹 Descargar PDF del pago
  const handleVerPDF = async (linea_captura) => {
    try {
      const res = await axios.get(
        `http://localhost:3001/verificar-pago/${linea_captura}`,
        { headers: { Authorization: `Bearer ${user.token}` }, responseType: "blob" }
      );

      const url = window.URL.createObjectURL(res.data);
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

  if (loading) return <p className="text-center mt-10">Cargando pagos...</p>;
  if (pagos.length === 0)
    return <p className="text-center mt-10 text-gray-500">No hay pagos pendientes</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pagos.map((pago) => (
        <div
          key={pago.linea_captura}
          className="card bg-base-100 shadow-xl border border-gray-200"
        >
          <div className="card-body">
            <h2 className="card-title">{pago.concepto}</h2>
            <p>
              <span className="font-semibold">Monto:</span> ${pago.monto}
            </p>
            <p>
              <span className="font-semibold">Fecha:</span>{" "}
              {new Date(pago.fecha_generacion).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold">Línea de captura:</span>{" "}
              {pago.linea_captura}
            </p>
            <p>
              <span className="font-semibold">Estatus:</span>{" "}
              <span
                className={`badge ${
                  pago.estatus === "Pagado"
                    ? "badge-success"
                    : pago.estatus === "Pendiente"
                    ? "badge-warning"
                    : "badge-error"
                }`}
              >
                {pago.estatus}
              </span>
            </p>
            <div className="card-actions mt-4">
              {pago.estatus === "Pendiente" && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => abrirModal(pago)}
                >
                  Pagar
                </button>
              )}
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleVerPDF(pago.linea_captura)}
              >
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      ))}

{/* 🔹 Modal de pago simulado */}
{modalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
    <div
      className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 transform transition-all duration-300 scale-100 opacity-100 animate-fadeIn"
      style={{
        animation: "fadeIn 0.3s ease-out, zoomIn 0.3s ease-out",
      }}
    >
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
        Pago simulado
      </h2>

      <form onSubmit={handlePagoSimulado} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Nombre en la tarjeta
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
            className="input input-bordered w-full bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Número de tarjeta
          </label>
          <input
            type="text"
            maxLength="16"
            value={formData.numeroTarjeta}
            onChange={(e) =>
              setFormData({ ...formData, numeroTarjeta: e.target.value })
            }
            required
            className="input input-bordered w-full bg-gray-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Fecha (MM/AA)
            </label>
            <input
              type="text"
              maxLength="5"
              value={formData.fecha}
              onChange={(e) =>
                setFormData({ ...formData, fecha: e.target.value })
              }
              required
              className="input input-bordered w-full bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              CVV
            </label>
            <input
              type="password"
              maxLength="3"
              value={formData.cvv}
              onChange={(e) =>
                setFormData({ ...formData, cvv: e.target.value })
              }
              required
              className="input input-bordered w-full bg-gray-50"
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={cerrarModal}
            className="btn btn-outline"
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Confirmar pago
          </button>
        </div>
      </form>
    </div>
  </div>
)}


    </div>
  );
}
