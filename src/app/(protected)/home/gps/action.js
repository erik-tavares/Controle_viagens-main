'use server';

import { sendAlert } from "@/core/clients/clients";

export const triggerAlert = async (staticLocation, numbers) => {
  try {
    console.log("🚀 Enviando alerta para os números:", numbers);
    console.log("📍 Localização:", staticLocation);

    if (!numbers || numbers.length === 0) {
      console.error("❌ Nenhum número de telefone disponível!");
      return { success: false, message: "Nenhum número de telefone fornecido." };
    }

    const response = await sendAlert(staticLocation, numbers);
    
    console.log("✅ Resposta da API:", response);
    
    return { success: true, message: "Alerta enviado com sucesso!" };
  } catch (error) {
    console.error("❌ Erro ao enviar alerta:", error.response?.data || error.message);
    return { success: false, message: error.message || "Erro ao enviar alerta" };
  }
};
