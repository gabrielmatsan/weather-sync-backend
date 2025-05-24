import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface WeatherEmailProps {
  userName: string;
  weatherData: {
    time: string;
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
  }[];
  summary: {
    min: number;
    max: number;
    average: number;
    city: string;
  };
}

export default function WeatherEmailReact({
  userName,
  weatherData,
  summary,
}: WeatherEmailProps) {
  // 🎨 Cores modernas
  const colors = {
    primary: "#667eea",
    secondary: "#764ba2",
    temperature: "#f59e0b",
    humidity: "#3b82f6",
    pressure: "#8b5cf6",
    wind: "#dc2626",
  };

  return (
    <Html>
      <Head />
      <Preview>🌤️ Weather Sync - Dashboard de {summary.city}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header com gradiente */}
          <Section style={styles.header}>
            <Heading style={styles.title}>☀️ Weather Sync</Heading>
            <Text style={styles.subtitle}>
              Olá {userName}! Seu dashboard meteorológico está pronto 📊
            </Text>
          </Section>

          {/* Cards de Resumo */}
          <Section style={styles.summaryGrid}>
            <div style={styles.card}>
              <div
                style={{
                  ...styles.cardIcon,
                  backgroundColor: colors.temperature,
                }}
              >
                🌡️
              </div>
              <div>
                <Text style={styles.cardTitle}>Temperatura</Text>
                <Text style={styles.cardValue}>
                  {summary.min}° - {summary.max}°C
                </Text>
              </div>
            </div>

            <div style={styles.card}>
              <div
                style={{ ...styles.cardIcon, backgroundColor: colors.humidity }}
              >
                💧
              </div>
              <div>
                <Text style={styles.cardTitle}>Umidade Média</Text>
                <Text style={styles.cardValue}>
                  {Math.round(
                    weatherData.reduce((sum, d) => sum + d.humidity, 0) /
                      weatherData.length
                  )}
                  %
                </Text>
              </div>
            </div>

            <div style={styles.card}>
              <div
                style={{ ...styles.cardIcon, backgroundColor: colors.pressure }}
              >
                📊
              </div>
              <div>
                <Text style={styles.cardTitle}>Pressão</Text>
                <Text style={styles.cardValue}>
                  {Math.round(
                    weatherData.reduce((sum, d) => sum + d.pressure, 0) /
                      weatherData.length
                  )}{" "}
                  hPa
                </Text>
              </div>
            </div>

            <div style={styles.card}>
              <div style={{ ...styles.cardIcon, backgroundColor: colors.wind }}>
                💨
              </div>
              <div>
                <Text style={styles.cardTitle}>Vento Máx</Text>
                <Text style={styles.cardValue}>
                  {Math.max(...weatherData.map((d) => d.windSpeed)).toFixed(1)}{" "}
                  km/h
                </Text>
              </div>
            </div>
          </Section>

          {/* Gráfico Principal - Linha */}
          <Section style={styles.chartSection}>
            <Heading style={styles.chartTitle}>📈 Tendências do Dia</Heading>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke={colors.temperature}
                    strokeWidth={3}
                    dot={{ fill: colors.temperature, strokeWidth: 2, r: 4 }}
                    name="Temperatura (°C)"
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke={colors.humidity}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: colors.humidity, strokeWidth: 2, r: 3 }}
                    name="Umidade (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* Gráfico de Barras - Comparação */}
          <Section style={styles.chartSection}>
            <Heading style={styles.chartTitle}>📊 Comparação Detalhada</Heading>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Bar
                    dataKey="temperature"
                    fill={colors.temperature}
                    radius={[4, 4, 0, 0]}
                    name="Temperatura (°C)"
                  />
                  <Bar
                    dataKey="humidity"
                    fill={colors.humidity}
                    radius={[4, 4, 0, 0]}
                    name="Umidade (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* Gráfico de Área - Pressão */}
          <Section style={styles.chartSection}>
            <Heading style={styles.chartTitle}>⚡ Pressão Atmosférica</Heading>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="pressure"
                    stroke={colors.pressure}
                    fill={colors.pressure}
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Pressão (hPa)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* Wind Rose - Direção do Vento */}
          <Section style={styles.chartSection}>
            <Heading style={styles.chartTitle}>🧭 Rosa dos Ventos</Heading>
            <div style={styles.windRose}>
              {weatherData.map((data, index) => {
                const angle = (data.windDirection - 90) * (Math.PI / 180);
                const radius = (data.windSpeed / 30) * 80; // Max 80px radius
                const x = 100 + Math.cos(angle) * radius;
                const y = 100 + Math.sin(angle) * radius;

                return (
                  <div
                    key={index}
                    style={{
                      position: "absolute",
                      left: x,
                      top: y,
                      width: "8px",
                      height: "8px",
                      backgroundColor: colors.wind,
                      borderRadius: "50%",
                      opacity: 0.7 + (index / weatherData.length) * 0.3,
                    }}
                  />
                );
              })}

              {/* Pontos cardeais */}
              <Text style={{ ...styles.windLabel, top: "10px", left: "95px" }}>
                N
              </Text>
              <Text style={{ ...styles.windLabel, top: "95px", right: "10px" }}>
                E
              </Text>
              <Text
                style={{ ...styles.windLabel, bottom: "10px", left: "95px" }}
              >
                S
              </Text>
              <Text style={{ ...styles.windLabel, top: "95px", left: "10px" }}>
                W
              </Text>
            </div>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 Weather Sync - Dados em tempo real dos sensores
            </Text>
            <Text style={styles.footerSubtext}>
              Dashboard gerado em {new Date().toLocaleString("pt-BR")}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// 🎨 Estilos modernos
const styles = {
  body: {
    backgroundColor: "#f1f5f9",
    fontFamily: "Arial, sans-serif",
    margin: 0,
    padding: 20,
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "40px 30px",
    textAlign: "center" as const,
  },
  title: {
    fontSize: "32px",
    fontWeight: "300",
    margin: 0,
  },
  subtitle: {
    fontSize: "16px",
    opacity: 0.9,
    margin: "10px 0 0 0",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    padding: "30px",
  },
  card: {
    display: "flex",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  cardIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    marginRight: "15px",
  },
  cardTitle: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500",
    textTransform: "uppercase" as const,
  },
  cardValue: {
    fontSize: "18px",
    color: "#1e293b",
    margin: "4px 0 0 0",
    fontWeight: "bold",
  },
  chartSection: {
    padding: "0 30px 30px",
  },
  chartTitle: {
    fontSize: "18px",
    color: "#374151",
    margin: "0 0 20px 0",
    fontWeight: "600",
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    padding: "20px",
  },
  windRose: {
    position: "relative" as const,
    width: "200px",
    height: "200px",
    margin: "0 auto",
    borderRadius: "50%",
    border: "3px solid #0284c7",
    background: "radial-gradient(circle, #f0f9ff 0%, #e0f2fe 100%)",
  },
  windLabel: {
    position: "absolute" as const,
    fontSize: "14px",
    fontWeight: "bold",
    color: "#1e293b",
  },
  footer: {
    backgroundColor: "#f8fafc",
    padding: "30px",
    textAlign: "center" as const,
    borderTop: "1px solid #e2e8f0",
  },
  footerText: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  footerSubtext: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "5px 0 0 0",
  },
};

// 🔧 SERVICE: Gerador de emails React
export class ReactEmailService {
  static async generateWeatherEmail(
    userName: string,
    weatherData: any[],
    summary: any
  ): Promise<string> {
    // Transformar dados para o formato do React Email
    const formattedData = weatherData.map((d) => ({
      time: d.time || d.hour,
      temperature: Number(d.temperature) || 0,
      humidity: Number(d.humidity) || 0,
      pressure: Number(d.pressure) || 1013,
      windSpeed: Number(d.windSpeed) || 0,
      windDirection: Number(d.windDirection) || 0,
    }));

    // Renderizar componente React para HTML
    const { render } = await import("@react-email/components");

    const emailHtml = render(
      React.createElement(WeatherEmailReact, {
        userName,
        weatherData: formattedData,
        summary,
      })
    );

    return emailHtml;
  }
}
