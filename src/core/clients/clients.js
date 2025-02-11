"use server";

import axios from "axios";

export const sendAlert = async (staticLocation, numbers) => {
  try {
    const latitude = staticLocation[0];
    const longitude = staticLocation[1];
    const timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    if (!numbers || numbers.length === 0) {
      throw new Error("Nenhum número de telefone fornecido.");
    }

    for (const number of numbers) {
      console.log(`📲 Enviando alerta para: ${number}`);

      const payload = {
        number,
        openTicket: "0",
        queueId: "0",
        body: `🚨 O Motorista saiu do Raio de Segurança!\n📍 Localização: Latitude ${latitude}, Longitude ${longitude}\n🕒 Horário: ${timestamp}`,
      };

      const response = await axios.post(
        "https://atendimentoapi4.wichat.com.br/api/messages/send",
        payload,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibG9hZ3V4Iiwic3RhdHVzIjoidGVzdFRvcnJlIiwiaWQiOjE1OTQ1Njc4OTEyMzZ9.p64gQLxMpkk8U-EGvnCYyVWhWi9QMt8XjXOCTSFdm98`, // Removida a vírgula extra
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Alerta enviado com sucesso para ${number}:`, response.data);
    }
  } catch (error) {
    console.error("❌ Erro ao enviar alerta:", error.response?.data || error.message);
  }
};
