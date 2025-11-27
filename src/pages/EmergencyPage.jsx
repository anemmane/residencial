import React, { useState, useEffect } from "react";
import styled from "styled-components";

export default function EmergencyPage({ user }) {
  const [name, setName] = useState("");
  const [apartment, setApartment] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [emergencias, setEmergencias] = useState([]);

  useEffect(() => {
    if (!user?.token) return;

    // Traer emergencias si es admin o para su propio apartamento
    fetch("http://localhost:3001/emergencias", {
      headers: { "Authorization": `Bearer ${user.token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al traer emergencias: " + res.status);
        return res.json();
      })
      .then(data => {
        console.log("Emergencias recibidas:", data); // <-- para debug
        setEmergencias(data);
      })
      .catch(err => {
        console.error(err);
        setStatus("❌ Error al cargar emergencias");
      });
  }, [user]);

  const handleReport = async () => {
    if (!name || !apartment || !description) {
      setStatus("❌ Completa todos los campos");
      return;
    }

    if (isNaN(Number(apartment))) {
      setStatus("❌ El apartamento debe ser un número");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/emergencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_residencia: Number(apartment),
          descripcion: `Reporte de ${name}: ${description}`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("✅ Reporte enviado correctamente");
        setName("");
        setApartment("");
        setDescription("");
        // Actualizar la lista de emergencias
        setEmergencias(prev => [
          { id_emergencia: data.id_emergencia, id_residencia: Number(apartment), descripcion: `Reporte de ${name}: ${description}`, fecha_solicitud: new Date().toISOString().split("T")[0], status: "En proceso" },
          ...prev
        ]);
      } else {
        setStatus("❌ Error: " + data.error);
      }
    } catch (error) {
      console.error(error);
      setStatus("❌ Error al conectar con el servidor");
    }
  };

  // Tabla de admin
if (user?.rol?.toLowerCase() === "admin") {
  return (
    <Container>
      <Card style={{ maxWidth: "90%" }}>
        <Title>🚨 Emergencias Registradas</Title>
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Apartamento</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {emergencias.map((e, idx) => (
              <tr key={e.id_emergencia} className={idx % 2 === 0 ? "even" : "odd"}>
                <td>{e.id_emergencia}</td>
                <td>{e.id_residencia}</td>
                <td>{e.descripcion}</td>
                <td>{e.fecha_solicitud}</td>
                <td>
                  <StatusBadge status={e.status}>{e.status}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}

  // Formulario para usuarios normales
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
          type="number"
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

// 🎨 Styled-components se mantienen iguales...

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

// Styled-components para tabla
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.95rem;

  th, td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e0e0e0;
    text-align: left;
  }

  th {
    background: #e53935;
    color: white;
    font-weight: 600;
    text-transform: uppercase;
  }

  tr.even {
    background: #fff5f5;
  }

  tr.odd {
    background: #ffe6e6;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  background-color: ${(props) =>
    props.status.toLowerCase() === "en proceso"
      ? "#f9a825"
      : props.status.toLowerCase() === "resuelto"
      ? "#2e7d32"
      : "#c62828"};
`;