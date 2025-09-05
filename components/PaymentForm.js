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
