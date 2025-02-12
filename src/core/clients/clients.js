"use server";

import axios from "axios";

export const sendAlert = async (staticLocation, numbers) => {
  try {
    const latitude = staticLocation[0];
    const longitude = staticLocation[1];
    const timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    console.log("📤 Preparando envio de alertas...");
    console.log("📍 Localização enviada:", latitude, longitude);
    console.log("📞 Enviando alerta para os números:", numbers);

    if (!numbers || numbers.length === 0) {
      console.error("❌ Nenhum número para enviar alerta.");
      return { success: false, message: "Nenhum número encontrado para envio." };
    }

    for (const number of numbers) {
      const payload = {
        number,
        openTicket: "0",
        queueId: "0",
        body: `🚨 Alerta de Segurança! 🚨\n\nO motorista saiu do raio de segurança!\n📍 Localização:\nLatitude: ${latitude}, Longitude: ${longitude}\n⏰ Horário: ${timestamp}`,
      };

      console.log(`📤 Tentando enviar mensagem para ${number}...`);
      console.log("📦 Payload enviado:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        "https://atendimentoapi4.wichat.com.br/api/messages/send",
        payload,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibG9hZ3V4Iiwic3RhdHVzIjoidGVzdFRvcnJlIiwiaWQiOjE1OTQ1Njc4OTEyMzZ9.p64gQLxMpkk8U-EGvnCYyVWhWi9QMt8XjXOCTSFdm98`,
          },
        }
      );

      console.log(`✅ Mensagem enviada para ${number}! Resposta da API:`, response.data);
    }

    return { success: true, message: "Mensagens enviadas para todos os números!" };
  } catch (error) {
    console.error("❌ Erro ao enviar alerta para a API!");

    if (error.response) {
      console.error("🔴 Código de Status:", error.response.status);
      console.error("📩 Resposta da API:", error.response.data);
    } else {
      console.error("🔴 Erro inesperado:", error.message);
    }

    return { success: false, message: "Erro ao enviar alerta." };
  }
};
