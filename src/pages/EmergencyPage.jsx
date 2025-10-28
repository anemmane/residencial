import React, { useState } from "react";
import styled from "styled-components";

export default function EmergencyPage() {
  const [name, setName] = useState("");
  const [apartment, setApartment] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  const handleReport = () => {
    if (!name || !apartment || !description) {
      setStatus("❌ Completa todos los campos");
      return;
    }

    setStatus("✅ Reporte enviado. Ayuda en camino!");
    setName("");
    setApartment("");
    setDescription("");
  };

  return (
    <Container>
      <Card>
        <Title>🚨 Emergencias</Title>
        <Subtitle>Reporte rápido de incidentes en tu residencia</Subtitle>

        <Input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          type="text"
          placeholder="Apartamento"
          value={apartment}
          onChange={(e) => setApartment(e.target.value)}
        />

        <Textarea
          placeholder="Descripción del incidente"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Button onClick={handleReport}>Reportar Emergencia</Button>

        {status && <StatusMessage>{status}</StatusMessage>}
      </Card>
    </Container>
  );
}

// 🎨 --- ESTILOS CON STYLED-COMPONENTS ---
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  background: linear-gradient(135deg, #ffb3b3, #ffe6e6);
`;

const Card = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const Title = styled.h2`
  color: #e53935;
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #555;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border: 2px solid #ffcdd2;
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #e53935;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border: 2px solid #ffcdd2;
  border-radius: 10px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #e53935;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #e53935;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;

  &:hover {
    background: #b71c1c;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const StatusMessage = styled.p`
  margin-top: 1rem;
  font-weight: 500;
  color: ${(props) =>
    props.children.startsWith("✅") ? "#2e7d32" : "#c62828"};
`;
