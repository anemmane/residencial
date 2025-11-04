import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #e0eafc, #cfdef3);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  font-family: "Inter", sans-serif;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #1f2a44;
  margin-bottom: 2rem;
  text-align: center;
`;

const Section = styled.section`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 1000px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.6rem;
  margin-bottom: 1.2rem;
  color: #2e3a59;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
`;

const Th = styled.th`
  background-color: #2e3a59;
  color: white;
  text-align: left;
  padding: 0.8rem;
`;

const Td = styled.td`
  padding: 0.8rem;
  border-bottom: 1px solid #e0e0e0;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 10px;
  font-size: 0.85rem;
  color: white;
  background-color: ${({ status }) =>
    status === "Pagado"
      ? "#22c55e"
      : status === "Pendiente"
      ? "#eab308"
      : "#ef4444"};
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  border-radius: 10px;
  border: 1px solid #ccc;
  padding: 0.8rem;
  font-size: 1rem;
  resize: none;
  margin-bottom: 1rem;
  outline: none;
  &:focus {
    border-color: #2e3a59;
  }
`;

const Button = styled.button`
  background-color: #2e3a59;
  color: white;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background-color: #1f2a44;
  }
`;

const Message = styled.p`
  color: ${({ error }) => (error ? "#ef4444" : "#333")};
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  margin: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

export default function Dashboard({ user }) {
  const [pagos, setPagos] = useState([]);
  const [emergencias, setEmergencias] = useState([]);
  const [quejas, setQuejas] = useState([]);
  const [descripcionQueja, setDescripcionQueja] = useState("");
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [loadingEmergencias, setLoadingEmergencias] = useState(true);
  const [loadingQuejas, setLoadingQuejas] = useState(true);
  const [errorPagos, setErrorPagos] = useState(null);
  const [errorEmergencias, setErrorEmergencias] = useState(null);
  const [errorQuejas, setErrorQuejas] = useState(null);

  // Reportes Financieros (solo admin)
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [reporte, setReporte] = useState(null);
  const [loadingReporte, setLoadingReporte] = useState(false);

  useEffect(() => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    axios
      .get("http://localhost:3001/pagos", config)
      .then((res) => setPagos(res.data))
      .catch((err) => setErrorPagos(err.response?.data?.error || err.message))
      .finally(() => setLoadingPagos(false));

    axios
      .get("http://localhost:3001/emergencias", config)
      .then((res) => setEmergencias(res.data))
      .catch((err) =>
        setErrorEmergencias(err.response?.data?.error || err.message)
      )
      .finally(() => setLoadingEmergencias(false));

    axios
      .get("http://localhost:3001/quejas", config)
      .then((res) => setQuejas(res.data))
      .catch((err) => setErrorQuejas(err.response?.data?.error || err.message))
      .finally(() => setLoadingQuejas(false));
  }, [user]);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const enviarQueja = async () => {
    if (!descripcionQueja.trim())
      return alert("Por favor escribe una descripción.");
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    try {
      await axios.post(
        "http://localhost:3001/quejas",
        {
          id_usuario: user.id_usuario,
          descripcion: descripcionQueja,
        },
        config
      );
      alert("Queja enviada correctamente.");
      setDescripcionQueja("");
      const res = await axios.get("http://localhost:3001/quejas", config);
      setQuejas(res.data);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const cargarReporte = async () => {
    if (!inicio || !fin) return alert("Selecciona un rango de fechas válido.");
    setLoadingReporte(true);
    try {
      const res = await axios.get(
        `http://localhost:3001/reportes-financieros?inicio=${inicio}&fin=${fin}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReporte(res.data);
    } catch (err) {
      alert("Error al cargar el reporte financiero: " + err.message);
    } finally {
      setLoadingReporte(false);
    }
  };

  return (
    <DashboardContainer>
      <Title>Panel Residencial</Title>

      {/* Pagos */}
      <Section>
        <SectionTitle>Pagos</SectionTitle>
        {loadingPagos ? (
          <Message>Cargando pagos...</Message>
        ) : errorPagos ? (
          <Message error>Error: {errorPagos}</Message>
        ) : pagos.length === 0 ? (
          <Message>No hay pagos registrados</Message>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Concepto</Th>
                <Th>Monto</Th>
                <Th>Generado</Th>
                <Th>Límite</Th>
                <Th>Estatus</Th>
                <Th>Línea de Captura</Th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id_pago}>
                  <Td>{p.concepto}</Td>
                  <Td>${p.monto}</Td>
                  <Td>{formatDate(p.fecha_generacion)}</Td>
                  <Td>{p.fecha_limite ? formatDate(p.fecha_limite) : "-"}</Td>
                  <Td>
                    <Badge status={p.estatus}>{p.estatus}</Badge>
                  </Td>
                  <Td>{p.linea_captura}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      {/* Emergencias */}
      <Section>
        <SectionTitle>Emergencias</SectionTitle>
        {loadingEmergencias ? (
          <Message>Cargando emergencias...</Message>
        ) : errorEmergencias ? (
          <Message error>Error: {errorEmergencias}</Message>
        ) : emergencias.length === 0 ? (
          <Message>No hay emergencias registradas</Message>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Descripción</Th>
                <Th>Fecha</Th>
                <Th>Estatus</Th>
              </tr>
            </thead>
            <tbody>
              {emergencias.map((e) => (
                <tr key={e.id_emergencia}>
                  <Td>{e.descripcion}</Td>
                  <Td>{formatDate(e.fecha_solicitud)}</Td>
                  <Td>
                    <Badge status={e.status}>{e.status}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      {/* Quejas */}
      <Section>
        <SectionTitle>Quejas</SectionTitle>
        <Textarea
          placeholder="Describe tu queja o sugerencia..."
          value={descripcionQueja}
          onChange={(e) => setDescripcionQueja(e.target.value)}
        />
        <Button onClick={enviarQueja}>Enviar Queja</Button>

        {loadingQuejas ? (
          <Message>Cargando quejas...</Message>
        ) : errorQuejas ? (
          <Message error>Error: {errorQuejas}</Message>
        ) : quejas.length === 0 ? (
          <Message>No hay quejas registradas</Message>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Descripción</Th>
                <Th>Fecha</Th>
                <Th>Estatus</Th>
              </tr>
            </thead>
            <tbody>
              {quejas.map((q) => (
                <tr key={q.id_queja}>
                  <Td>{q.id_queja}</Td>
                  <Td>{q.descripcion}</Td>
                  <Td>{formatDate(q.fecha_creacion)}</Td>
                  <Td>
                    <Badge status={q.estatus}>{q.estatus}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      {/* Reportes Financieros (solo admin) */}
      {user.rol === "admin" && (
        <Section>
          <SectionTitle>📊 Reportes Financieros</SectionTitle>
          <div>
            <label>
              Desde: <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </label>
            <label>
              Hasta: <Input type="date" value={fin} onChange={(e) => setFin(e.target.value)} />
            </label>
            <Button onClick={cargarReporte}>Ver Reporte</Button>
          </div>

          {loadingReporte ? (
            <Message>Cargando reporte...</Message>
          ) : reporte ? (
            <>
              <h3>Totales</h3>
              <p>Pagado: ${reporte.totales?.totalPagado || 0}</p>
              <p>Pendiente: ${reporte.totales?.totalPendiente || 0}</p>
              <p>Vencido: ${reporte.totales?.totalVencido || 0}</p>

              <h3>Detalles</h3>
              <ul>
                {reporte.registros?.map((r) => (
                  <li key={r.id_pago}>
                    #{r.id_pago} - {r.concepto} - ${r.monto} - {r.estatus}
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: "1rem" }}>
                <a href="http://localhost:3001/reportes-financieros/pdf" target="_blank" rel="noreferrer">
                  📄 Descargar PDF
                </a>{" "}
                |{" "}
                <a href="http://localhost:3001/reportes-financieros/csv" target="_blank" rel="noreferrer">
                  📥 Descargar CSV
                </a>
              </div>
            </>
          ) : (
            <Message>Selecciona un rango de fechas para generar el reporte.</Message>
          )}
        </Section>
      )}
    </DashboardContainer>
  );
}
