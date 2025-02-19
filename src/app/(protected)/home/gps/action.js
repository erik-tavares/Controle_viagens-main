"use server";

import { sendAlert } from "@/core/clients/clients";

export const triggerAlert = async (
  staticLocation,
  numbers,
  savedRouteStart
) => {
  try {
    console.log("🚀 triggerAlert() chamado!");
    console.log("📞 Números recebidos:", numbers);
    console.log("📍 Localização recebida:", staticLocation);
    console.log("📦 Dados recebidos:", savedRouteStart);

    if (
      !savedRouteStart ||
      !savedRouteStart.startCity ||
      !savedRouteStart.endCity
    ) {
      console.error("❌ savedRouteStart inválido:", savedRouteStart);
      return {
        success: false,
        message: "Dados inválidos para envio do alerta.",
      };
    }

    console.log("📡 Chamando sendAlert()...");
    const response = await sendAlert(staticLocation, numbers, savedRouteStart);

    console.log("✅ Resposta da API dentro de triggerAlert():", response);

    return { success: true, message: "Alerta enviado com sucesso!" };
  } catch (error) {
    console.error(
      "❌ Erro ao enviar alerta em triggerAlert():",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.message || "Erro ao enviar alerta",
    };
  }
};
