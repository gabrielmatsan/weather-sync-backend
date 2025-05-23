export function messageFloodWarning(local: string, floor: string) {
    const FLOOD_MESSAGE_ALERT = `🚨 *ALERTA CRÍTICO* 🚨

🌊 *ENCHENTE DETECTADA* 🌊

📍 *Bairro:* ${local}
📏 *Nível da água:* ${floor}m

⚠️ *CUIDADOS IMEDIATOS:*
• Evite circular pela área
• Não atravesse águas profundas
• Procure locais seguros e elevados

🆘 *Emergência: 193*

🕐 ${new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
    })}
🤖 Weather Sync Alert`;

    return FLOOD_MESSAGE_ALERT;
}
