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
      // 🚀 FormData porque InfinityFree NO acepta JSON
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch("/api/login.php", {
        method: "POST",
        body: formData, // <-- SIN headers
      });

      const text = await res.text();

      if (!text) throw new Error("Servidor no respondió");

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Respuesta del servidor:", text);
        throw new Error("Respuesta inválida del servidor");
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      const userData = {
        nombre: data.nombre,
        rol: data.rol,
        id_residencia: data.id_residencia,
        token: data.token,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
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

// Estilos sin cambio...
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
  color: #3949ab;
`;

const ErrorMsg = styled.p`
  color: #f44336;
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
`;

const Button = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background-color: #3949ab;
  color: white;
  font-weight: bold;
  cursor: pointer;
`;

const blink = keyframes`
  0%, 100% { opacity: 0 }
  50% { opacity: 1 }
`;

const LoadingDots = styled.span`
  display: inline-block;
  animation: ${blink} 1s infinite;
`;
