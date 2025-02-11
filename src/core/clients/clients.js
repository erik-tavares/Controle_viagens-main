'use client'
import axios from "axios";

export const sendAlert = async (staticLocation) => {
  try {
    const payload = {
      number: "5551998886750", // Número fixo para envio (ajuste se necessário)
      openTicket: "0",
      queueId: "0",
      body: `O marcador está fora do raio de segurança!\nLocalização: Latitude ${staticLocation[0]}, Longitude ${staticLocation[1]}`,
    };

    const response = await axios.post("https://atendimentoapi4.wichat.com.br/api/messages/send", payload);

    console.log("Alerta enviado com sucesso!", response.data);
  } catch (error) {
    console.error("Erro ao enviar alerta:", error.response?.data || error.message);
  }
};
