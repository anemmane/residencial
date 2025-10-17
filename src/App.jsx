import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import EmergencyPage from "./pages/EmergencyPage.jsx";
import VotacionesPage from "./pages/VotacionesPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-700 p-4 text-white flex justify-between">
        <h1 className="font-bold">Residencial App</h1>
        <div className="space-x-4">
          {user ? (
            <>
              {user.rol === "admin" && <Link to="/dashboard">Panel</Link>}
              {user.rol === "usuario" && <Link to="/payment">Mis Pagos</Link>}
              <Link to="/emergency" className="text-red-400 font-bold">Emergencias</Link>
              <Link to="/votaciones" className="text-yellow-300 font-bold">Votaciones</Link>
              <button onClick={logout} className="ml-4 bg-red-500 px-2 py-1 rounded">Cerrar sesión</button>
            </>
          ) : (
            <Link to="/">Inicio de sesión</Link>
          )}
        </div>
      </nav>
      <main className="p-4">
        <Routes>
          {!user ? (
            <Route path="/*" element={<LoginPage setUser={setUser} />} />
          ) : (
            <>
              {user.rol === "admin" && <Route path="/dashboard" element={<Dashboard user={user} />} />}
              {user.rol === "usuario" && <Route path="/payment" element={<PaymentPage user={user} />} />}
              <Route path="/emergency" element={<EmergencyPage user={user} />} />
              <Route path="/votaciones" element={<VotacionesPage user={user} />} />
              <Route path="*" element={user.rol === "admin" ? <Dashboard user={user} /> : <PaymentPage user={user} />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}
