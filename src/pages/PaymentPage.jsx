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

  useEffect(() => {
    axios
      .get("http://localhost:3001/pagos", {
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

      await axios.post("http://localhost:3001/crear-preferencia", body, {
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
        `http://localhost:3001/verificar-pago/${linea_captura}`,
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
              <Button onClick={() => handleVerPDF(pago.linea_captura)}>Descargar PDF</Button>
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

// --- Styled Components
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
  border: 1px solid #e0e0e0;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: #3949ab;
  margin-bottom: 0.75rem;
`;

const Info = styled.p`
  font-size: 0.95rem;
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
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  background-color: ${(props) => (props.primary ? "#3949ab" : "#e0e0e0")};
  color: ${(props) => (props.primary ? "#fff" : "#000")};
  transition: background 0.3s;

  &:hover:not(:disabled) {
    background-color: ${(props) => (props.primary ? "#5c6bc0" : "#c7c7c7")};
  }

  &:disabled {
    background-color: #9fa8da;
    cursor: not-allowed;
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
  width: 100%;
  max-width: 400px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
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
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #c5cae9;
  font-size: 0.95rem;
  transition: border 0.2s;

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
  margin-top: 1rem;
`;
