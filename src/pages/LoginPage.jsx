import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

export default function LoginPage({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

      const userData = {
        nombre: data.nombre,
        rol: data.rol,
        id_residencia: data.id_residencia,
        token: data.token,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      navigate(data.rol === "admin" ? "/dashboard" : "/payment");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>Iniciar Sesión</Title>
        {error && <ErrorMsg>{error}</ErrorMsg>}

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? <LoadingDots>...</LoadingDots> : "Entrar"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

// 🎨 --- Estilos
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #7986cb, #5c6bc0);
`;

const Card = styled.div`
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 380px;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color: #3949ab;
  margin-bottom: 1rem;
`;

const ErrorMsg = styled.p`
  color: #f44336;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid #c5cae9;
  font-size: 1rem;
  transition: border 0.2s;

  &:focus {
    border-color: #3949ab;
    outline: none;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background-color: #3949ab;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;

  &:hover:not(:disabled) {
    background-color: #5c6bc0;
  }

  &:disabled {
    background-color: #9fa8da;
    cursor: not-allowed;
  }
`;

const blink = keyframes`
  0%, 100% { opacity: 0 }
  50% { opacity: 1 }
`;

const LoadingDots = styled.span`
  display: inline-block;
  animation: ${blink} 1s infinite;
`;
