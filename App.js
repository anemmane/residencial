import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-700 p-4 text-white flex justify-between">
        <h1 className="font-bold">Residencial App</h1>
        <div className="space-x-4">
          <Link to="/">Inicio</Link>
          <Link to="/dashboard">Panel</Link>
        </div>
      </nav>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}
