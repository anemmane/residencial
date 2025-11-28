import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

export default function Menu({ user }) {
  return (
    <Sidebar>
      <Logo>🏠 Residencial</Logo>
      <NavList>
        <NavItem>
          <StyledLink to="/dashboard">Dashboard</StyledLink>
        </NavItem>
        <NavItem>
          <StyledLink to="/pagos">Pagos</StyledLink>
        </NavItem>
        <NavItem>
          <StyledLink to="/emergencias">Emergencias</StyledLink>
        </NavItem>
        <NavItem>
          <StyledLink to="/quejas">Quejas</StyledLink>
        </NavItem>
        <NavItem>
          <StyledLink to="/votaciones">Votaciones</StyledLink>
        </NavItem>
        <NavItem>
          <StyledLink to="/votacioneslive">Votaciones Live</StyledLink>
        </NavItem>
        {user.role === "admin" && (
          <NavItem>
            <StyledLink to="/admin">Panel Admin</StyledLink>
          </NavItem>
        )}
      </NavList>
      <Footer>Bienvenido, {user.nombre}</Footer>
    </Sidebar>
  );
}

// 🎨 ESTILOS
const Sidebar = styled.div`
  width: 220px;
  min-height: 100vh;
  background: #3949ab;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  text-align: center;
  margin-bottom: 2rem;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 1rem;
`;

const StyledLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: #e8eaf6;
  font-weight: 600;
  padding: 10px 15px;
  border-radius: 12px;
  transition: background 0.2s ease, transform 0.1s ease;

  &:hover {
    background: #5c6bc0;
    transform: translateX(4px);
  }
`;

const Footer = styled.div`
  color: #c5cae9;
  font-size: 0.9rem;
  text-align: center;
`;
