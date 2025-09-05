import React from "react";
import PaymentForm from "../components/PaymentForm";

export default function Home() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Bienvenido al Sistema Residencial</h2>
      <PaymentForm />
    </div>
  );
}
