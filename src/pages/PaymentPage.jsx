import React from "react";
import PaymentForm from "../components/PaymentForm";

export default function PaymentPage() {
  const residentId = 1; // Cambiar según usuario logueado
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Pago en Línea</h2>
      <PaymentForm residentId={residentId} />
    </div>
  );
}