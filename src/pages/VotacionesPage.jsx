import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";

export default function VotacionesPage({ user }) {
  const [votaciones, setVotaciones] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    axios
      .get("/api/votaciones.php", config)
      .then((res) => setVotaciones(res.data))
      .catch(() =>
        setMensaje("Error al cargar votaciones")
      );
  }, []);

  const votar = async (id_votacion, voto) => {
    try {
      const res = await axios.post(
        "/api/votar.php",
        { id_votacion, voto },
        config
      );

      alert(res.data.message);

      const refreshed = await axios.get("/api/votaciones.php", config);
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
                  <Button onClick={() => votar(v.id_votacion, "Sí")}>
                    Votar Sí
                  </Button>
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

// Estilos sin cambios
const Container = styled.div``;
const Title = styled.h1``;
const Card = styled.div``;
const Button = styled.button``;
