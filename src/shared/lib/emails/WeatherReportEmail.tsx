// WeatherReportEmail.tsx
import type { FavoritePlaceWithWeatherType } from "@/messages/application/send-daily-report.usecase";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WeatherReportEmailProps {
  userName: string;
  favoritePlaces: FavoritePlaceWithWeatherType[];
  reportDate: string;
}

export const WeatherReportEmail: React.FC<WeatherReportEmailProps> = ({
  userName,
  favoritePlaces,
  reportDate,
}) => {
  const previewText = `Relatório meteorológico dos seus ${favoritePlaces.length} locais favoritos - ${reportDate}`;

  // Função para calcular médias
  const calculateAverages = (weatherData: any[]) => {
    if (weatherData.length === 0) return null;

    const totals = weatherData.reduce(
      (acc, curr) => ({
        temperature: acc.temperature + parseFloat(curr.temperature),
        humidity: acc.humidity + curr.humidity,
        pressure: acc.pressure + curr.pressure,
        windSpeed: acc.windSpeed + parseFloat(curr.windSpeed),
      }),
      { temperature: 0, humidity: 0, pressure: 0, windSpeed: 0 }
    );

    return {
      temperature: (totals.temperature / weatherData.length).toFixed(1),
      humidity: Math.round(totals.humidity / weatherData.length),
      pressure: Math.round(totals.pressure / weatherData.length),
      windSpeed: (totals.windSpeed / weatherData.length).toFixed(1),
    };
  };

  // Função para obter valores mínimos e máximos
  const getMinMax = (weatherData: any[]) => {
    if (weatherData.length === 0) return null;

    const temperatures = weatherData.map((d) => parseFloat(d.temperature));
    const humidities = weatherData.map((d) => d.humidity);

    return {
      minTemp: Math.min(...temperatures).toFixed(1),
      maxTemp: Math.max(...temperatures).toFixed(1),
      minHumidity: Math.min(...humidities),
      maxHumidity: Math.max(...humidities),
    };
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🌤️ Weather Sync</Heading>
            <Text style={subtitle}>Relatório Meteorológico Diário</Text>
          </Section>

          {/* Saudação */}
          <Section style={content}>
            <Text style={greeting}>Olá, {userName}!</Text>
            <Text style={paragraph}>
              Aqui está o resumo meteorológico dos seus locais favoritos para{" "}
              <strong>{reportDate}</strong>.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Resumo Geral */}
          <Section style={summarySection}>
            <Heading as="h2" style={h2}>
              📊 Resumo Geral
            </Heading>
            <div style={statsGrid}>
              <div style={statBox}>
                <Text style={statNumber}>{favoritePlaces.length}</Text>
                <Text style={statLabel}>Locais Monitorados</Text>
              </div>
              <div style={statBox}>
                <Text style={statNumber}>
                  {favoritePlaces.reduce(
                    (sum, place) => sum + place.weatherData.length,
                    0
                  )}
                </Text>
                <Text style={statLabel}>Leituras Totais</Text>
              </div>
            </div>
          </Section>

          <Hr style={hr} />

          {/* Dados por Local */}
          {favoritePlaces.map((place, index) => {
            const averages = calculateAverages(place.weatherData);
            const minMax = getMinMax(place.weatherData);

            return (
              <Section key={place.placeId} style={placeSection}>
                <Heading as="h3" style={h3}>
                  📍 {place.name || `Local ${place.placeId}`}
                </Heading>

                {averages && minMax ? (
                  <>
                    {/* Grid de Métricas */}
                    <div style={metricsGrid}>
                      {/* Temperatura */}
                      <div style={metricCard}>
                        <div style={metricHeader}>
                          <Text style={metricIcon}>🌡️</Text>
                          <Text style={metricTitle}>Temperatura</Text>
                        </div>
                        <Text style={metricValue}>
                          {averages.temperature}°C
                        </Text>
                        <Text style={metricRange}>
                          {minMax.minTemp}°C - {minMax.maxTemp}°C
                        </Text>
                      </div>

                      {/* Umidade */}
                      <div style={metricCard}>
                        <div style={metricHeader}>
                          <Text style={metricIcon}>💧</Text>
                          <Text style={metricTitle}>Umidade</Text>
                        </div>
                        <Text style={metricValue}>{averages.humidity}%</Text>
                        <Text style={metricRange}>
                          {minMax.minHumidity}% - {minMax.maxHumidity}%
                        </Text>
                      </div>

                      {/* Pressão */}
                      <div style={metricCard}>
                        <div style={metricHeader}>
                          <Text style={metricIcon}>🔵</Text>
                          <Text style={metricTitle}>Pressão</Text>
                        </div>
                        <Text style={metricValue}>{averages.pressure} hPa</Text>
                      </div>

                      {/* Vento */}
                      <div style={metricCard}>
                        <div style={metricHeader}>
                          <Text style={metricIcon}>💨</Text>
                          <Text style={metricTitle}>Vento</Text>
                        </div>
                        <Text style={metricValue}>
                          {averages.windSpeed} km/h
                        </Text>
                      </div>
                    </div>

                    <Text style={dataInfo}>
                      Baseado em {place.weatherData.length} leituras nas últimas
                      24 horas
                    </Text>
                  </>
                ) : (
                  <Text style={noDataText}>
                    Sem dados disponíveis para este local
                  </Text>
                )}

                {index < favoritePlaces.length - 1 && <Hr style={lightHr} />}
              </Section>
            );
          })}

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este relatório foi gerado automaticamente pelo Weather Sync.
              <br />
              Para gerenciar seus locais favoritos ou alterar suas preferências
              de notificação, acesse nosso aplicativo.
            </Text>
            <Text style={copyright}>
              © {new Date().getFullYear()} Weather Sync. Todos os direitos
              reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Estilos
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "32px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 32px 24px",
  textAlign: "center" as const,
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  borderRadius: "8px 8px 0 0",
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
  padding: "0",
};

const subtitle = {
  color: "#e2e8f0",
  fontSize: "16px",
  margin: "8px 0 0",
};

const content = {
  padding: "0 32px",
};

const greeting = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a202c",
  marginBottom: "8px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4a5568",
};

const h2 = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#1a202c",
  margin: "0 0 16px",
};

const h3 = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#2d3748",
  margin: "0 0 16px",
};

const summarySection = {
  padding: "24px 32px",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  marginTop: "16px",
};

const statBox = {
  textAlign: "center" as const,
  padding: "20px",
  backgroundColor: "#f7fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const statNumber = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#667eea",
  margin: "0",
};

const statLabel = {
  fontSize: "14px",
  color: "#718096",
  margin: "4px 0 0",
};

const placeSection = {
  padding: "24px 32px",
};

const metricsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "16px",
};

const metricCard = {
  padding: "16px",
  backgroundColor: "#f7fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const metricHeader = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "8px",
};

const metricIcon = {
  fontSize: "20px",
  margin: "0",
};

const metricTitle = {
  fontSize: "13px",
  color: "#718096",
  margin: "0",
  fontWeight: "500",
};

const metricValue = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#1a202c",
  margin: "0",
};

const metricRange = {
  fontSize: "12px",
  color: "#a0aec0",
  margin: "4px 0 0",
};

const dataInfo = {
  fontSize: "13px",
  color: "#718096",
  marginTop: "16px",
  fontStyle: "italic",
};

const noDataText = {
  fontSize: "14px",
  color: "#a0aec0",
  textAlign: "center" as const,
  padding: "24px",
  backgroundColor: "#f7fafc",
  borderRadius: "8px",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "32px 0",
};

const lightHr = {
  borderColor: "#f7fafc",
  margin: "24px 0",
};

const footer = {
  padding: "0 32px",
};

const footerText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#718096",
  textAlign: "center" as const,
};

const copyright = {
  fontSize: "12px",
  color: "#a0aec0",
  textAlign: "center" as const,
  marginTop: "16px",
};

export default WeatherReportEmail;
