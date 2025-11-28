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

  const esAdmin = user.rol === "admin";

  useEffect(() => {
    axios
      .get("/api/pagos.php", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setPagos(res.data);
        setLoading(false);
      })
      .catch(() => {
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
      await axios.post(
        "/api/crear-preferencia.php",
        {
          monto: parseFloat(selectedPago.monto),
          concepto: selectedPago.concepto,
          id_residencia: user.id_residencia,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      alert("✅ Pago simulado realizado");
      cerrarModal();
    } catch {
      alert("❌ No se pudo completar el pago");
    }
  };

  const handleVerPDF = async (linea_captura) => {
    try {
      const res = await axios.get(
        `/api/verificar-pago.php?linea_captura=${linea_captura}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `recibo_${linea_captura}.pdf`;
      link.click();
    } catch {
      alert("Error al descargar PDF");
    }
  };

  if (loading) return <CenteredText>Cargando pagos...</CenteredText>;

  // -------- ADMIN --------
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
                <Th>Línea</Th>
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
                  <Td>{pago.estatus}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      </DashboardContainer>
    );
  }

  // -------- USUARIO --------
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
            <Info><strong>Línea:</strong> {pago.linea_captura}</Info>

            <Actions>
              {pago.estatus === "Pendiente" && (
                <Button primary onClick={() => abrirModal(pago)}>
                  Pagar
                </Button>
              )}

              <Button onClick={() => handleVerPDF(pago.linea_captura)}>
                PDF
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
                  value={formData.numeroTarjeta}
                  onChange={(e) => setFormData({ ...formData, numeroTarjeta: e.target.value })}
                  required
                />
              </FormGroup>

              <Grid>
                <FormGroup>
                  <Label>Fecha</Label>
                  <Input
                    type="text"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>CVV</Label>
                  <Input
                    type="password"
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

/* ------------------  ESTILOS  ------------------ */

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
`;

const Section = styled.section`
  background: white;
  padding: 2rem;
  border-radius: 15px;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 0.8rem;
  background: #2e3a59;
  color: white;
`;

const Td = styled.td`
  padding: 0.8rem;
  border-bottom: 1px solid #ddd;
`;

const Container = styled.div`
  display: grid;
  gap: 1.5rem;
  padding: 2rem;
`;

const CenteredText = styled.p`
  text-align: center;
  margin-top: 3rem;
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
`;

const Info = styled.p``;

const Actions = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: none;
  background-color: ${(props) => (props.primary ? "#3949ab" : "#e0e0e0")};
  color: ${(props) => (props.primary ? "#fff" : "#000")};
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
`;

const ModalCard = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  margin: 10% auto;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalTitle = styled.h2`
  text-align: center;
`;

const Form = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem;
  border-radius: 10px;
  border: 1px solid #c5cae9;
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
