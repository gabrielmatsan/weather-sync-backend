import type { MessageSender } from "@/webhooks/messages/interfaces/message-sender.interface";
import type {
  AlertSeverity,
  WeatherAlertType,
} from "../domain/notification.type";

interface NotificationData {
  to: string;
  alertType: WeatherAlertType;
  data: {
    severity: AlertSeverity;
    location: string;
    description: string;
    startTime?: string;
    endTime?: string;
    precautions?: string[];
    imageUrl?: string;
    mapUrl?: string;
    temperature?: number;
    precipitation?: number;
    windSpeed?: number;
    customMessage?: string;
  };
}

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendNotificationUseCase(
  messageSender: MessageSender,
  notification: NotificationData
): Promise<NotificationResult> {
  try {
    const message = buildAlertMessage(
      notification.alertType,
      notification.data
    );
    const mediaUrl = notification.data.imageUrl
      ? [notification.data.imageUrl]
      : undefined;

    const result = await messageSender.sendMessage(
      notification.to,
      message,
      mediaUrl
    );

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    };
  } catch (error) {
    console.error("Error sending notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

function buildAlertMessage(type: WeatherAlertType, data: any): string {
  const header = getAlertHeader(type, data.severity);
  const body = getAlertBody(type, data);
  const footer = getAlertFooter(data);

  return `${header}\n\n${body}\n\n${footer}`;
}

function getAlertHeader(
  type: WeatherAlertType,
  severity: AlertSeverity
): string {
  const severityEmoji = getSeverityEmoji(severity);
  const alertEmoji = getAlertTypeEmoji(type);
  const severityText = getSeverityText(severity);

  return `${severityEmoji} ALERTA CLIMÁTICO ${severityText} ${alertEmoji}`;
}

function getAlertBody(type: WeatherAlertType, data: any): string {
  let message = `📍 Local: ${data.location}\n`;
  message += `⚠️ Tipo: ${getAlertTypeText(type)}\n`;

  if (data.startTime) {
    message += `🕒 Início: ${data.startTime}\n`;
  }

  if (data.endTime) {
    message += `🕕 Término: ${data.endTime}\n`;
  }

  message += `\n📝 Descrição:\n${data.description}\n`;

  // Dados meteorológicos específicos
  if (data.temperature !== undefined) {
    message += `\n🌡️ Temperatura: ${data.temperature}°C`;
  }

  if (data.precipitation !== undefined) {
    message += `\n💧 Precipitação: ${data.precipitation}mm`;
  }

  if (data.windSpeed !== undefined) {
    message += `\n💨 Vento: ${data.windSpeed} km/h`;
  }

  if (data.precautions && data.precautions.length > 0) {
    message += `\n\n⚠️ PRECAUÇÕES:\n`;
    data.precautions.forEach((precaution: string) => {
      message += `• ${precaution}\n`;
    });
  }

  return message;
}

function getAlertFooter(data: any): string {
  let footer = `\n🔔 Mantenha-se informado e em segurança!`;

  if (data.mapUrl) {
    footer += `\n\n🗺️ Mapa: ${data.mapUrl}`;
  }

  footer += `\n\n📞 Em caso de emergência: Ligue 193 (Bombeiros) ou 199 (Defesa Civil)`;

  return footer;
}

function getSeverityEmoji(severity: AlertSeverity): string {
  const severityMap = {
    low: "🟢",
    moderate: "🟡",
    high: "🟠",
    extreme: "🔴",
  };

  return severityMap[severity] || "⚪";
}

function getSeverityText(severity: AlertSeverity): string {
  const severityTextMap = {
    low: "(BAIXO)",
    moderate: "(MODERADO)",
    high: "(ALTO)",
    extreme: "(EXTREMO)",
  };

  return severityTextMap[severity] || "";
}

function getAlertTypeEmoji(type: WeatherAlertType): string {
  const alertTypeEmojiMap = {
    heavy_rain: "🌧️",
    flood: "🌊",
    flooding: "🌊",
    storm: "⛈️",
    heat_wave: "🌡️☀️",
    cold_wave: "❄️🥶",
    hurricane: "🌪️",
    tornado: "🌪️",
    drought: "🏜️",
    general: "⚠️",
  };

  return alertTypeEmojiMap[type] || "⚠️";
}

function getAlertTypeText(type: WeatherAlertType): string {
  const alertTypeTextMap = {
    heavy_rain: "Chuva Intensa",
    flood: "Inundação",
    flooding: "Inundação",
    storm: "Tempestade",
    heat_wave: "Onda de Calor",
    cold_wave: "Onda de Frio",
    hurricane: "Furacão",
    tornado: "Tornado",
    drought: "Seca",
    general: "Alerta Geral",
  };

  return alertTypeTextMap[type] || "Alerta Climático";
}

// Factory function para criar o caso de uso com dependências
export function createSendNotificationUseCase(messageSender: MessageSender) {
  return (notification: NotificationData) =>
    sendNotificationUseCase(messageSender, notification);
}
