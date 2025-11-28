import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

export default function Quejas({ user }) {
  const [quejas, setQuejas] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const config = {
    headers: { Authorization: `Bearer ${user.token}` },
  };

  useEffect(() => {
    const url =
      user.rol === "admin"
        ? "/api/quejas.php"
        : `/api/quejas.php?usuario=${user.id_habitante}`;

    axios
      .get(url, config)
      .then((res) => {
        setQuejas(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      });
  }, []);

  const enviarQueja = () => {
    if (!descripcion.trim()) return alert("Escribe una descripción");

    axios
      .post("/api/quejas.php", { descripcion }, config)
      .then(() => axios.get("/api/quejas.php", config))
      .then((res) => setQuejas(res.data))
      .catch((err) => alert(err.response?.data?.error || err.message));
  };

  return (
    <Container>
      <Card>
        <Title>📋 Módulo de Quejas</Title>

        {user.rol === "usuario" && (
          <FormSection>
            <Textarea
              placeholder="Describe tu queja o sugerencia..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            ></Textarea>
            <Button onClick={enviarQueja}>Enviar Queja</Button>
          </FormSection>
        )}

        {loading ? (
          <Message>Cargando quejas...</Message>
        ) : error ? (
          <ErrorMsg>Error: {error}</ErrorMsg>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                {user.rol === "admin" && <th>Usuario</th>}
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {quejas.map((q) => (
                <tr key={q.id_queja}>
                  <td>{q.id_queja}</td>
                  {user.rol === "admin" && <td>{q.usuario}</td>}
                  <td>{q.descripcion}</td>
                  <td>{new Date(q.fecha_creacion).toLocaleDateString()}</td>
                  <td>{q.estatus}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
}

// Estilos sin cambios
const Container = styled.div`
  padding: 2rem;
  display: flex;
  justify-content: center;
`;
const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  width: 90%;
  max-width: 900px;
`;
const Title = styled.h2``;
const FormSection = styled.div``;
const Textarea = styled.textarea``;
const Button = styled.button``;
const Table = styled.table``;
const Message = styled.p``;
const ErrorMsg = styled.p``;
