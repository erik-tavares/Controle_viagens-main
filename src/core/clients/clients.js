"use server";

import axios from "axios";

export const sendAlert = async (staticLocation, numbers, savedRouteStart) => {
  try {
    const latitude = staticLocation[0];
    const longitude = staticLocation[1];
    const destino = savedRouteStart.startCity;
    const destinoFinal = savedRouteStart.endCity;
    const timestamp = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    console.log("📤 Preparando envio de alertas...");
    console.log("📍 Localização enviada:", latitude, longitude);
    console.log("📞 Enviando alerta para os números:", numbers);

    if (!numbers || numbers.length === 0) {
      console.error("❌ Nenhum número para enviar alerta.");
      return {
        success: false,
        message: "Nenhum número encontrado para envio.",
      };
    }

    for (const number of numbers) {
      const payload = {
        number,
        openTicket: "0",
        queueId: "0",
        body: `🚨 Alerta de Segurança! 🚨\n\nO motorista saiu do raio de segurança!\n\nNome: José da Silva Lopes\nPlaca: DBC-9A82\n\nOrigem: ${destino}.\n\nDestino: ${destinoFinal}.\n \nLatitude: ${latitude}, Longitude: ${longitude}\n⏰ Data e Hora do desvio da rota: ${timestamp}\n\nOBS: A torre de controle Paraíso Giovanella Embu-SP, já foi notificada.\nPara maiores informações contate a torre de controle nos canais abaixo:\nE-mail: paradisoembu@transgiovanella.com.br\nFone: (11) 8578-3358\nCelular: (11) 98655-0067.`,
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

      console.log(
        `✅ Mensagem enviada para ${number}! Resposta da API:`,
        response.data
      );
    }

    return {
      success: true,
      message: "Mensagens enviadas para todos os números!",
    };
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
