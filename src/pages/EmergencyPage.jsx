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

    fetch("/api/emergencias.php", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al traer emergencias: " + res.status);
        return res.json();
      })
      .then((data) => {
        setEmergencias(data);
      })
      .catch(() => {
        setStatus("❌ Error al cargar emergencias");
      });
  }, [user]);

  const handleReport = async () => {
    if (!name || !apartment || !description) {
      setStatus("❌ Completa todos los campos");
      return;
    }

    try {
      const res = await fetch("/api/emergencias.php", {
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
      } else {
        setStatus("❌ Error: " + data.error);
      }
    } catch (error) {
      setStatus("❌ Error al conectar con el servidor");
    }
  };

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

  return (
    <Container>
      <Card>
        <Title>🚨 Emergencias</Title>
        <Subtitle>Reporte rápido de incidentes en tu residencia</Subtitle>

        <Input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />

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

// 🎨 Estilos (SIN CAMBIOS)
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
`;

const Title = styled.h2`
  color: #e53935;
  font-size: 2rem;
`;

const Subtitle = styled.p`
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border: 2px solid #ffcdd2;
  border-radius: 10px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border: 2px solid #ffcdd2;
  border-radius: 10px;
  min-height: 100px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #e53935;
  color: white;
  border: none;
  border-radius: 10px;
`;

const StatusMessage = styled.p`
  margin-top: 1rem;
  font-weight: 500;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  color: white;
  background-color: ${(props) =>
    props.status?.toLowerCase() === "en proceso"
      ? "#f9a825"
      : props.status?.toLowerCase() === "resuelto"
      ? "#2e7d32"
      : "#c62828"};
`;
