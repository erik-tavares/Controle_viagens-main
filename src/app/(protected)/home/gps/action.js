'use server'

import { sendAlert } from "@/core/clients/clients";

export const triggerAlert = async (staticLocation) => {
  try {
    await sendAlert(staticLocation);
    return { success: true, message: "Alerta enviado com sucesso!" };
  } catch (error) {
    return { success: false, message: error.message || "Erro ao enviar alerta" };
  }
};