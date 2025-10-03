import React, { useState } from "react";

export default function PaymentForm() {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const handlePayment = () => {
    if (amount > 0) {
      setStatus(`✅ Pago de $${amount} registrado correctamente.`);
      setAmount("");
    } else {
      setStatus("❌ Ingresa un monto válido.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Pago en Línea</h2>
      <input
        type="number"
        placeholder="Monto"
        className="border rounded p-2 w-full mb-2"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        onClick={handlePayment}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Pagar
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}

//mercadopago
const handlePayment = async () => {
  if (amount <= 0) {
    setStatus("❌ Ingresa un monto válido.");
    return;
  }

  try {
    // Crear preferencia en backend
    const res = await fetch("http://localhost:3001/create_preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, resident_id: residentId }),
    });
    const data = await res.json();

    // Redirigir a checkout de Mercado Pago
    window.location.href = `https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=${data.id}`;
  } catch (error) {
    console.error(error);
    setStatus("❌ Error al iniciar pago");
  }
};