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

  // 🔹 Cargar quejas según el rol
  useEffect(() => {
    const url =
      user.rol === "admin"
        ? "http://localhost:3001/quejas" // todas las quejas
        : `http://localhost:3001/quejas?usuario=${user.id_habitante}`; // solo las del usuario

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
      .post("http://localhost:3001/quejas", { descripcion }, config)
      .then(() => {
        alert("✅ Queja enviada correctamente");
        setDescripcion("");
        // Refrescar lista
        return axios.get("http://localhost:3001/quejas", config);
      })
      .then((res) => setQuejas(res.data))
      .catch((err) => alert(err.response?.data?.error || err.message));
  };

  return (
    <Container>
      <Card>
        <Title>📋 Módulo de Quejas</Title>

        {/* 👤 Solo los usuarios pueden enviar quejas */}
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

        {/* 🔹 Listado de quejas */}
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

// 🎨 --- ESTILOS UNIFICADOS (funcionan igual para admin y usuario)
const Container = styled.div`
  padding: 2rem;
  display: flex;
  justify-content: center;
`;

const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 900px;
`;

const Title = styled.h2`
  font-size: 1.6rem;
  font-weight: bold;
  color: #3949ab;
  margin-bottom: 1.5rem;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  border: 1px solid #c5cae9;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  resize: none;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background: #3949ab;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background: #5c6bc0;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th,
  td {
    border-bottom: 1px solid #ddd;
    text-align: left;
    padding: 0.8rem;
  }
  th {
    background-color: #e8eaf6;
    color: #1a237e;
  }
  tr:hover {
    background-color: #f5f5f5;
  }
`;

const Message = styled.p`
  text-align: center;
  color: #555;
`;

const ErrorMsg = styled.p`
  color: red;
  text-align: center;
`;
