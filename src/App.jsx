import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import EmergencyPage from "./pages/EmergencyPage";



export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-700 p-4 text-white flex justify-between">
        <h1 className="font-bold">Residencial App</h1>
        <div className="space-x-4">
          <Link to="/">Inicio</Link>
          <Link to="/dashboard">Panel</Link>
          <Link to="/payment">Pago en Línea</Link> 
          <Link to="/emergency" className="text-red-400 font-bold">Emergencias</Link>
        </div>
      </nav>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payment" element={<PaymentPage />} /> 
          <Route path="/emergency" element={<EmergencyPage />} />
        </Routes>
      </main>
    </div>
  );
}