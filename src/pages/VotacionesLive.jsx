// src/components/VotacionesLive.jsx
import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  min-height: 100vh;
  padding: 2rem;
  font-family: "Inter", sans-serif;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #1f2a44;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const VideoFrame = styled.iframe`
  width: 100%;
  max-width: 900px;
  height: 500px;
  border-radius: 15px;
  border: none;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
`;

export default function VotacionesLive() {
  // 👉 Reemplaza este ID por el video o transmisión de tu canal
  const videoId = "dQw4w9WgXcQ"; // Ejemplo: "live_stream_id"

  return (
    <Container>
      <Title>🎥 Transmisión en Vivo</Title>
      <VideoFrame
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        allowFullScreen
      ></VideoFrame>
    </Container>
  );
}
