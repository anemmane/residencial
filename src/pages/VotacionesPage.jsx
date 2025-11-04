import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
  padding: 2rem;
  background: #f5f6fa;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2e3a59;
  margin-bottom: 1.5rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.2rem;
`;

const Button = styled.button`
  background: #2e3a59;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: #1f2a44;
  }
`;

export default function VotacionesPage({ user }) {
  const [votaciones, setVotaciones] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    axios
      .get("http://localhost:3001/votaciones", config)
      .then((res) => setVotaciones(res.data))
      .catch((err) =>
        setMensaje(err.response?.data?.error || "Error al cargar votaciones")
      );
  }, []);

  const votar = async (id_votacion, voto) => {
    try {
      const res = await axios.post(
        "http://localhost:3001/votar",
        { id_votacion, voto },
        config
      );
      alert(res.data.message);
      // recargar votaciones para ver actualización
      const refreshed = await axios.get("http://localhost:3001/votaciones", config);
      setVotaciones(refreshed.data);
    } catch (err) {
      alert(err.response?.data?.error || "Error al registrar voto");
    }
  };

  return (
    <Container>
      <Title>Votaciones</Title>

      {mensaje && <p>{mensaje}</p>}

      {votaciones.length === 0 ? (
        <p>No hay votaciones disponibles</p>
      ) : (
        votaciones.map((v) => (
          <Card key={v.id_votacion}>
            <h3>{v.titulo}</h3>
            <p>{v.descripcion}</p>
            <p>
              Estado: <b>{v.estado}</b>
            </p>

            {user.rol === "admin" ? (
              <>
                <p>🗳️ Total de votos: {v.total_votos}</p>
                <p>✅ Sí: {v.votos_si} | ❌ No: {v.votos_no}</p>
              </>
            ) : (
              v.estado === "Activa" && (
                <div style={{ marginTop: "1rem" }}>
                  <Button onClick={() => votar(v.id_votacion, "Sí")}>Votar Sí</Button>
                  <Button
                    onClick={() => votar(v.id_votacion, "No")}
                    style={{ marginLeft: "1rem", background: "#e11d48" }}
                  >
                    Votar No
                  </Button>
                </div>
              )
            )}
          </Card>
        ))
      )}
    </Container>
  );
}
