import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import styled from "styled-components";

import Dashboard from "./pages/Dashboard.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import EmergencyPage from "./pages/EmergencyPage.jsx";
import VotacionesPage from "./pages/VotacionesPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Menu from "./components/Menu.jsx"; // tu menú estilizado

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
    // Página de login ocupa todo el ancho
    return <LoginPage setUser={setUser} />;
  }

  return (
    <AppContainer>
      {/* Menú lateral */}
      <Menu user={user} />

      {/* Contenido principal */}
      <Content>
        <Header>
          <h1>Residencial App</h1>
          <LogoutButton onClick={logout}>Cerrar sesión</LogoutButton>
        </Header>

        <Routes>
          {user.rol === "admin" && <Route path="/dashboard" element={<Dashboard user={user} />} />}
          {user.rol === "usuario" && <Route path="/payment" element={<PaymentPage user={user} />} />}
          <Route path="/emergency" element={<EmergencyPage user={user} />} />
          <Route path="/votaciones" element={<VotacionesPage user={user} />} />
          <Route
            path="*"
            element={user.rol === "admin" ? <Dashboard user={user} /> : <PaymentPage user={user} />}
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
