import React, { useState } from "react";

// PagoSimulado.jsx
// Componente React (Tailwind) que muestra un modal para ingresar datos de pago simulados.
// - Uso: import PagoSimulado from './PagoSimulado.jsx' y renderizar <PagoSimulado open={open} onClose={() => setOpen(false)} />
// - Requisitos: Tailwind en el proyecto. Guarda el token JWT en localStorage('token').

export default function PagoSimulado({ open, onClose, monto = 0, concepto = "Pago", id_residencia = 1 }) {
  const [step, setStep] = useState(0); // 0 = form, 1 = procesando, 2 = éxito, 3 = error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [card, setCard] = useState({ numero: "", nombre: "", expiracion: "", cvv: "" });
  const [medioPago, setMedioPago] = useState("En línea");

  if (!open) return null;

  const validateCard = () => {
    const num = card.numero.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(num)) return "Número de tarjeta debe tener 16 dígitos";
    if (!/^\d{3,4}$/.test(card.cvv)) return "CVV inválido";
    if (!/^\d{2}\/\d{2}$/.test(card.expiracion)) return "Expiración debe ser MM/AA";
    if (card.nombre.trim().length < 3) return "Nombre incompleto";
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "numero") {
      // formatear cada 4 dígitos
      const onlyNums = value.replace(/[^0-9]/g, "").slice(0, 16);
      const spaced = onlyNums.replace(/(.{4})/g, "$1 ").trim();
      setCard((c) => ({ ...c, numero: spaced }));
      return;
    }
    if (name === "cvv") {
      const only = value.replace(/[^0-9]/g, "").slice(0, 4);
      setCard((c) => ({ ...c, cvv: only }));
      return;
    }
    if (name === "expiracion") {
      const only = value.replace(/[^0-9]/g, "").slice(0, 4);
      let mm = only.slice(0, 2);
      let aa = only.slice(2, 4);
      let formatted = mm;
      if (aa) formatted = mm + "/" + aa;
      setCard((c) => ({ ...c, expiracion: formatted }));
      return;
    }
    setCard((c) => ({ ...c, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validateCard();
    if (v) {
      setError(v);
      return;
    }

    setStep(1);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const body = { monto, concepto, id_residencia, medio_pago: medioPago };

      const res = await fetch("/crear-preferencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear preferencia");

      // simulamos procesamiento de tarjeta
      await new Promise((r) => setTimeout(r, 1500));

      setStep(2);
      setLoading(false);

      // opcional: redirigir a init_point simulado
      // window.location.href = data.init_point;

    } catch (err) {
      console.error(err);
      setError(err.message || "Error inesperado");
      setStep(3);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Pagar — {concepto}</h3>
          <button className="text-gray-500" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {step === 0 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Monto</label>
              <div className="mt-1 text-xl font-medium">${monto.toFixed(2)}</div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Número de tarjeta</label>
              <input
                name="numero"
                value={card.numero}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                className="w-full mt-1 p-2 border rounded-lg"
                inputMode="numeric"
                autoComplete="cc-number"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm text-gray-600">Nombre en la tarjeta</label>
                <input
                  name="nombre"
                  value={card.nombre}
                  onChange={handleChange}
                  placeholder="NOMBRE APELLIDO"
                  className="w-full mt-1 p-2 border rounded-lg"
                  autoComplete="cc-name"
                />
              </div>

              <div className="w-32">
                <label className="block text-sm text-gray-600">Expiración</label>
                <input
                  name="expiracion"
                  value={card.expiracion}
                  onChange={handleChange}
                  placeholder="MM/AA"
                  className="w-full mt-1 p-2 border rounded-lg"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                />
              </div>

              <div className="w-24">
                <label className="block text-sm text-gray-600">CVV</label>
                <input
                  name="cvv"
                  value={card.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  className="w-full mt-1 p-2 border rounded-lg"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Método de pago (simulado)</label>
              <select value={medioPago} onChange={(e) => setMedioPago(e.target.value)} className="w-full mt-1 p-2 border rounded-lg">
                <option>En línea</option>
                <option>Tarjeta</option>
                <option>Transferencia</option>
                <option>Otro</option>
                <option>Efectivo</option>
              </select>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border">Cancelar</button>
              <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white">Pagar</button>
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="text-center py-8">
            <div className="mb-4">Procesando pago...</div>
            <div className="mx-auto w-12 h-12 border-4 border-dashed rounded-full animate-spin" />
          </div>
        )}

        {step === 2 && (
          <div className="text-center py-6">
            <div className="text-green-600 font-semibold mb-2">Pago simulado exitoso ✅</div>
            <div className="text-sm text-gray-600 mb-4">Se ha generado la preferencia y registrado el pago como Pendiente/Pagado según flujo.</div>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-green-600 text-white">Cerrar</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-6">
            <div className="text-red-600 font-semibold mb-2">Error</div>
            <div className="text-sm text-gray-600 mb-4">{error}</div>
            <div className="flex gap-2">
              <button onClick={() => setStep(0)} className="flex-1 py-2 rounded-lg border">Intentar otra vez</button>
              <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-200">Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
