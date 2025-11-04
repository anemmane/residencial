import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import styled from "styled-components";

import Dashboard from "./pages/Dashboard.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import EmergencyPage from "./pages/EmergencyPage.jsx";
import VotacionesPage from "./pages/VotacionesPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Menu from "./components/Menu.jsx";
import QuejasPage from "./pages/Quejas.jsx"; // ✅ Nueva página para quejas
import VotacionesLive from "./pages/VotacionesLive"; // 👈 import nuevo

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

  if (!user) {
    return <LoginPage setUser={setUser} />;
  }

  return (
    <AppContainer>
      <Menu user={user} />

      <Content>
        <Header>
          <h1>Residencial App</h1>
          <LogoutButton onClick={logout}>Cerrar sesión</LogoutButton>
        </Header>

        <Routes>
          {/* 👑 ADMIN */}
          {user.rol === "admin" && (
            <Route path="/dashboard" element={<Dashboard user={user} />} />
          )}

          {/* 👤 USUARIO */}
          {user.rol === "usuario" && (
            <>
              <Route path="/dashboard" element={<PaymentPage user={user} />} />
              <Route path="/quejas" element={<QuejasPage user={user} />} />
            </>
          )}

          {/* 🌐 Rutas comunes */}
          <Route path="/emergencias" element={<EmergencyPage user={user} />} />
          <Route path="/votaciones" element={<VotacionesPage user={user} />} />
          <Route path="/votacioneslive" element={<VotacionesLive user={user} />} />

          {/* 🚪 Ruta por defecto */}
          <Route
            path="*"
            element={
              user.rol === "admin" ? (
                <Dashboard user={user} />
              ) : (
                <PaymentPage user={user} />
              )
            }
          />
        </Routes>
      </Content>
    </AppContainer>
  );
}

// 🎨 --- Estilos con styled-components
const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  background: #e8eaf6;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.8rem;
    font-weight: bold;
    color: #3949ab;
  }
`;

const LogoutButton = styled.button`
  background: #f44336;
  color: #fff;
  font-weight: bold;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #d32f2f;
  }
`;
