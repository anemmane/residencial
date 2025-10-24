import React, { useEffect } from "react";

export default function PaymentButton({ initPoint }) {
  useEffect(() => {
    if (!window.MercadoPago) return;

    const mp = new window.MercadoPago("TEST-xxxxxxxxxxxxxx", {
      locale: "es-MX",
    });

    mp.checkout({
      preference: { id: initPoint },
      autoOpen: true,
    });
  }, [initPoint]);

  return (
    <button
      onClick={() => window.open(initPoint, "_blank")}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Pagar ahora
    </button>
  );
}
