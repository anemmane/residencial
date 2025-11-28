import React, { useEffect, useState } from "react";
import axios from "axios";
import styled, { keyframes } from "styled-components";

export default function PaymentPage({ user }) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPago, setSelectedPago] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    numeroTarjeta: "",
    fecha: "",
    cvv: "",
  });

  const esAdmin = user.rol === "admin"; // <-- AJUSTA ESTE CAMPO

  useEffect(() => {
    axios
      .get("/pagos", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setPagos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener pagos:", err);
        setLoading(false);
      });
  }, [user.token]);

  const abrirModal = (pago) => {
    setSelectedPago(pago);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormData({ nombre: "", numeroTarjeta: "", fecha: "", cvv: "" });
  };

  const handlePagoSimulado = async (e) => {
    e.preventDefault();
    try {
      const body = {
        monto: parseFloat(selectedPago.monto),
        concepto: selectedPago.concepto,
        id_residencia: user.id_residencia,
      };

      await axios.post("/crear-preferencia", body, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      alert("✅ Pago simulado realizado con éxito");

      cerrarModal();

      setPagos((prev) =>
        prev.map((p) =>
          p.linea_captura === selectedPago.linea_captura
            ? { ...p, estatus: "Pagado" }
            : p
        )
      );
    } catch (error) {
      console.error("Error al simular pago:", error);
      alert("❌ No se pudo completar el pago simulado.");
    }
  };

  const handleVerPDF = async (linea_captura) => {
    try {
      const res = await axios.get(
        `/verificar-pago/${linea_captura}`,
        { headers: { Authorization: `Bearer ${user.token}` }, responseType: "blob" }
      );

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `recibo_${linea_captura}.pdf`;
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      alert("Ocurrió un error al descargar el PDF del pago.");
    }
  };

  if (loading) return <CenteredText>Cargando pagos...</CenteredText>;

  // --------------------------------------------------------
  // 🔥 🔥 🔥 VISTA ADMINISTRADOR (TABLA)
  // --------------------------------------------------------
  if (esAdmin) {
    return (
      <DashboardContainer>
        <Title>Panel de Pagos (Admin)</Title>

        <Section>
          <SectionTitle>Listado de Pagos</SectionTitle>

          <Table>
            <thead>
              <tr>
                <Th>Concepto</Th>
                <Th>Monto</Th>
                <Th>Fecha</Th>
                <Th>Línea de captura</Th>
                <Th>Estatus</Th>
              </tr>
            </thead>

            <tbody>
              {pagos.map((pago) => (
                <tr key={pago.linea_captura}>
                  <Td>{pago.concepto}</Td>
                  <Td>${pago.monto}</Td>
                  <Td>{new Date(pago.fecha_generacion).toLocaleDateString()}</Td>
                  <Td>{pago.linea_captura}</Td>
                  <Td>
                    <Badge status={pago.estatus}>{pago.estatus}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      </DashboardContainer>
    );
  }

  // --------------------------------------------------------
  // 🔥 🔥 🔥 VISTA USUARIO NORMAL (TU DISEÑO ORIGINAL)
  // --------------------------------------------------------

  if (pagos.length === 0)
    return <CenteredText>No hay pagos pendientes</CenteredText>;

  return (
    <Container>
      {pagos.map((pago) => (
        <Card key={pago.linea_captura}>
          <CardBody>
            <CardTitle>{pago.concepto}</CardTitle>
            <Info><strong>Monto:</strong> ${pago.monto}</Info>
            <Info><strong>Fecha:</strong> {new Date(pago.fecha_generacion).toLocaleDateString()}</Info>
            <Info><strong>Línea de captura:</strong> {pago.linea_captura}</Info>
            <Info>
              <strong>Estatus:</strong>{" "}
              <StatusBadge status={pago.estatus}>{pago.estatus}</StatusBadge>
            </Info>

            <Actions>
              {pago.estatus === "Pendiente" && (
                <Button primary onClick={() => abrirModal(pago)}>Pagar</Button>
              )}
              <Button onClick={() => handleVerPDF(pago.linea_captura)}>
                Descargar PDF
              </Button>
            </Actions>
          </CardBody>
        </Card>
      ))}

      {modalOpen && (
        <ModalBackdrop>
          <ModalCard>
            <ModalTitle>Pago simulado</ModalTitle>
            <Form onSubmit={handlePagoSimulado}>
              <FormGroup>
                <Label>Nombre en la tarjeta</Label>
                <Input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Número de tarjeta</Label>
                <Input
                  type="text"
                  maxLength="16"
                  value={formData.numeroTarjeta}
                  onChange={(e) => setFormData({ ...formData, numeroTarjeta: e.target.value })}
                  required
                />
              </FormGroup>

              <Grid>
                <FormGroup>
                  <Label>Fecha (MM/AA)</Label>
                  <Input
                    type="text"
                    maxLength="5"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>CVV</Label>
                  <Input
                    type="password"
                    maxLength="3"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    required
                  />
                </FormGroup>
              </Grid>

              <ModalActions>
                <Button type="button" onClick={cerrarModal}>Cancelar</Button>
                <Button primary type="submit">Confirmar pago</Button>
              </ModalActions>
            </Form>
          </ModalCard>
        </ModalBackdrop>
      )}
    </Container>
  );
}

/* ------------------  ESTILOS ------------------ */

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #e0eafc, #cfdef3);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #1f2a44;
`;

const Section = styled.section`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  width: 100%;
  max-width: 1000px;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  margin-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: #2e3a59;
  color: white;
  padding: 0.8rem;
`;

const Td = styled.td`
  padding: 0.8rem;
  border-bottom: 1px solid #ddd;
`;

const Badge = styled.span`
  background: ${(props) =>
    props.status === "Pagado" ? "#22c55e" :
    props.status === "Pendiente" ? "#f59e0b" :
    "#ef4444"};
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
`;

/* --- estilos originales --- */

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
`;

const CenteredText = styled.p`
  text-align: center;
  margin-top: 3rem;
  font-size: 1.2rem;
  color: #555;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  color: #3949ab;
`;

const Info = styled.p`
  margin: 0.25rem 0;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: bold;
  color: white;
  background-color: ${(props) =>
    props.status === "Pagado" ? "#4caf50" :
    props.status === "Pendiente" ? "#ff9800" :
    "#f44336"};
`;

const Actions = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  background-color: ${(props) => (props.primary ? "#3949ab" : "#e0e0e0")};
  color: ${(props) => (props.primary ? "#fff" : "#000")};

  &:hover {
    opacity: 0.9;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalCard = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalTitle = styled.h2`
  text-align: center;
  color: #3949ab;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: #555;
`;

const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #c5cae9;

  &:focus {
    border-color: #3949ab;
    outline: none;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

