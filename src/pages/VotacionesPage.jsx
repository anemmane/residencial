import React, { useEffect, useState } from "react";
import styled from "styled-components";

export default function VotacionesPage({ user }) {
  const [votaciones, setVotaciones] = useState([]);
  const [votoEnviado, setVotoEnviado] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.token) return;

    fetch("http://localhost:3001/votaciones", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error al obtener votaciones: ${res.status}`);
        return res.json();
      })
      .then(data => setVotaciones(data))
      .catch(err => setError(err.message));
  }, [user]);

  const handleVotar = (id_votacion, voto) => {
    if (!user?.token) {
      setError("Usuario no autenticado");
      return;
    }

    fetch("http://localhost:3001/votar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.token}`,
      },
      body: JSON.stringify({ id_votacion, id_residencia: user.id_residencia, voto }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error al enviar voto: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setVotoEnviado(prev => ({ ...prev, [id_votacion]: voto }));
      })
      .catch(err => setError(err.message));
  };

  if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;

  return (
    <Container>
      <Card>
        <Title>🗳️ Votaciones</Title>
        {votaciones.length === 0 ? (
          <EmptyMessage>No hay votaciones disponibles.</EmptyMessage>
        ) : (
          <List>
            {votaciones.map(v => (
              <ListItem key={v.id_votacion}>
                <Concepto>{v.concepto}</Concepto>
                <Fecha>📅 Fecha: {new Date(v.fecha).toLocaleDateString()}</Fecha>

                {!votoEnviado[v.id_votacion] ? (
                  <Botonera>
                    <ButtonYes onClick={() => handleVotar(v.id_votacion, "sí")}>
                      Sí
                    </ButtonYes>
                    <ButtonNo onClick={() => handleVotar(v.id_votacion, "no")}>
                      No
                    </ButtonNo>
                  </Botonera>
                ) : (
                  <VotoConfirmado>
                    ✅ Votaste: <strong>{votoEnviado[v.id_votacion]}</strong>
                  </VotoConfirmado>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Card>
    </Container>
  );
}

// --- STYLED COMPONENTS ---
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 90vh;
  padding-top: 3rem;
  background: linear-gradient(135deg, #c5cae9, #e8eaf6);
`;

const Card = styled.div`
  background: #ffffff;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
`;

const Title = styled.h2`
  color: #3949ab;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  background: #f5f5f5;
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  box-shadow: 0 3px 10px rgba(57, 73, 171, 0.1);
`;

const Concepto = styled.p`
  font-weight: 600;
  font-size: 1.1rem;
  color: #1a237e;
`;

const Fecha = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

const Botonera = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const ButtonBase = styled.button`
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;

  &:hover {
    transform: scale(1.03);
  }

  &:active {
    transform: scale(0.97);
  }
`;

const ButtonYes = styled(ButtonBase)`
  background: #43a047;
  &:hover {
    background: #2e7d32;
  }
`;

const ButtonNo = styled(ButtonBase)`
  background: #e53935;
  &:hover {
    background: #b71c1c;
  }
`;

const VotoConfirmado = styled.p`
  text-align: center;
  color: #1e88e5;
  font-weight: 600;
  margin-top: 0.5rem;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #555;
  font-size: 1rem;
`;

const ErrorMessage = styled.p`
  color: #b71c1c;
  text-align: center;
  font-weight: bold;
  margin-top: 2rem;
`;
