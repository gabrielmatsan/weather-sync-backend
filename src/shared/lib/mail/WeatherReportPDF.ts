import type { FavoritePlaceWithWeatherType } from "@/messages/application/send-daily-report.usecase";
import puppeteer from "puppeteer";

// Template HTML com gráficos usando Chart.js (mais compatível com geração de PDF)
const generateHTMLTemplate = (
  userName: string,
  favoritePlaces: FavoritePlaceWithWeatherType[],
  reportDate: string
): string => {
  // Calcular estatísticas
  const totalPlaces = favoritePlaces.length;
  const totalReadings = favoritePlaces.reduce(
    (sum, place) => sum + place.weatherData.length,
    0
  );

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

  // Gerar dados dos gráficos para cada local
  const chartsData = favoritePlaces.map((place) => {
    const chartData = place.weatherData.map((item) => ({
      hora: new Date(item.createdAt).getHours(),
      temperatura: parseFloat(item.temperature),
      umidade: item.humidity,
      pressao: item.pressure,
      vento: parseFloat(item.windSpeed),
    }));

    return {
      placeId: place.placeId,
      placeName: place.name || `Local ${place.placeId}`,
      data: chartData,
      averages: calculateAverages(place.weatherData),
      minMax: getMinMax(place.weatherData),
    };
  });

  // Gerar scripts dos gráficos
  const generateChartScripts = () => {
    return chartsData
      .map((placeData, index) => {
        if (placeData.data.length === 0) return "";

        return `
        // Gráfico de Temperatura e Umidade - ${placeData.placeName}
        (function() {
          const ctx1_${index} = document.getElementById('chart-temp-${index}').getContext('2d');
          new Chart(ctx1_${index}, {
            type: 'line',
            data: {
              labels: ${JSON.stringify(placeData.data.map((d) => d.hora + "h"))},
              datasets: [{
                label: 'Temperatura (°C)',
                data: ${JSON.stringify(placeData.data.map((d) => d.temperatura))},
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
              }, {
                label: 'Umidade (%)',
                data: ${JSON.stringify(placeData.data.map((d) => d.umidade))},
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index',
                intersect: false
              },
              plugins: {
                legend: {
                  position: 'top'
                }
              },
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Temperatura (°C)'
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Umidade (%)'
                  },
                  grid: {
                    drawOnChartArea: false
                  }
                }
              }
            }
          });

          // Gráfico de Pressão e Vento
          const ctx2_${index} = document.getElementById('chart-pressure-${index}').getContext('2d');
          new Chart(ctx2_${index}, {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(placeData.data.map((d) => d.hora + "h"))},
              datasets: [{
                label: 'Pressão (hPa)',
                data: ${JSON.stringify(placeData.data.map((d) => d.pressao))},
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgb(153, 102, 255)',
                borderWidth: 1,
                yAxisID: 'y'
              }, {
                label: 'Vento (km/h)',
                data: ${JSON.stringify(placeData.data.map((d) => d.vento))},
                type: 'line',
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top'
                }
              },
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Pressão (hPa)'
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Vento (km/h)'
                  },
                  grid: {
                    drawOnChartArea: false
                  }
                }
              }
            }
          });
        })();
      `;
      })
      .join("\n");
  };

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Sync - Relatório Meteorológico</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        .greeting {
            font-size: 1.5em;
            margin-bottom: 20px;
            color: #333;
        }
        
        .stats-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        
        .stat-box {
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid #e9ecef;
        }
        
        .stat-number {
            font-size: 3em;
            font-weight: bold;
            color: #667eea;
            display: block;
        }
        
        .stat-label {
            font-size: 1em;
            color: #666;
            margin-top: 5px;
        }
        
        .place-section {
            margin: 40px 0;
            padding: 30px;
            background-color: #f8f9fa;
            border-radius: 10px;
            page-break-inside: avoid;
        }
        
        .place-title {
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        
        .metric-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
        }
        
        .metric-icon {
            font-size: 1.5em;
        }
        
        .metric-title {
            font-size: 0.9em;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
            display: block;
        }
        
        .metric-range {
            font-size: 0.9em;
            color: #999;
            margin-top: 5px;
        }
        
        .chart-container {
            margin: 30px 0;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        
        .chart-title {
            font-size: 1.2em;
            margin-bottom: 15px;
            color: #555;
        }
        
        canvas {
            max-width: 100%;
            height: 300px !important;
        }
        
        .data-info {
            text-align: center;
            color: #666;
            font-style: italic;
            margin-top: 15px;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        
        .no-data {
            text-align: center;
            padding: 40px;
            color: #999;
            font-style: italic;
        }
        
        @media print {
            .place-section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Weather Sync</h1>
            <div class="subtitle">Relatório Meteorológico - ${reportDate}</div>
        </div>
        
        <div class="content">
            <h2 class="greeting">Olá, ${userName}!</h2>
            <p>Este é o seu relatório meteorológico personalizado com os dados dos seus locais favoritos.</p>
            
            <div class="stats-container">
                <div class="stat-box">
                    <span class="stat-number">${totalPlaces}</span>
                    <span class="stat-label">Locais Monitorados</span>
                </div>
                <div class="stat-box">
                    <span class="stat-number">${totalReadings}</span>
                    <span class="stat-label">Leituras Totais</span>
                </div>
            </div>
            
            ${chartsData
              .map(
                (placeData, index) => `
                <div class="place-section">
                    <h3 class="place-title">
                        <span>📍</span>
                        <span>${placeData.placeName}</span>
                    </h3>
                    
                    ${
                      placeData.averages && placeData.minMax
                        ? `
                        <div class="metrics-grid">
                            <div class="metric-card">
                                <div class="metric-header">
                                    <span class="metric-icon">🌡️</span>
                                    <span class="metric-title">Temperatura</span>
                                </div>
                                <span class="metric-value">${placeData.averages.temperature}°C</span>
                                <div class="metric-range">${placeData.minMax.minTemp}°C - ${placeData.minMax.maxTemp}°C</div>
                            </div>
                            
                            <div class="metric-card">
                                <div class="metric-header">
                                    <span class="metric-icon">💧</span>
                                    <span class="metric-title">Umidade</span>
                                </div>
                                <span class="metric-value">${placeData.averages.humidity}%</span>
                                <div class="metric-range">${placeData.minMax.minHumidity}% - ${placeData.minMax.maxHumidity}%</div>
                            </div>
                            
                            <div class="metric-card">
                                <div class="metric-header">
                                    <span class="metric-icon">🔵</span>
                                    <span class="metric-title">Pressão</span>
                                </div>
                                <span class="metric-value">${placeData.averages.pressure} hPa</span>
                            </div>
                            
                            <div class="metric-card">
                                <div class="metric-header">
                                    <span class="metric-icon">💨</span>
                                    <span class="metric-title">Vento</span>
                                </div>
                                <span class="metric-value">${placeData.averages.windSpeed} km/h</span>
                            </div>
                        </div>
                        
                        ${
                          placeData.data.length > 0
                            ? `
                            <div class="chart-container">
                                <h4 class="chart-title">Temperatura e Umidade ao Longo do Dia</h4>
                                <canvas id="chart-temp-${index}"></canvas>
                            </div>
                            
                            <div class="chart-container">
                                <h4 class="chart-title">Pressão e Velocidade do Vento</h4>
                                <canvas id="chart-pressure-${index}"></canvas>
                            </div>
                        `
                            : ""
                        }
                        
                        <p class="data-info">
                            Baseado em ${placeData.data.length} leituras nas últimas 24 horas
                        </p>
                    `
                        : `
                        <div class="no-data">
                            Sem dados disponíveis para este local
                        </div>
                    `
                    }
                </div>
            `
              )
              .join("")}
        </div>
        
        <div class="footer">
            <p>Relatório gerado automaticamente pelo Weather Sync</p>
            <p>© ${new Date().getFullYear()} Weather Sync. Todos os direitos reservados.</p>
        </div>
    </div>
    
    <script>
        // Aguardar o DOM carregar
        window.addEventListener('DOMContentLoaded', function() {
            ${generateChartScripts()}
        });
    </script>
</body>
</html>
  `;
};

// Função para gerar PDF usando Puppeteer
export async function generateWeatherPDF(
  userName: string,
  favoritePlaces: FavoritePlaceWithWeatherType[],
  reportDate: string
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Gerar HTML com os dados
    const html = generateHTMLTemplate(userName, favoritePlaces, reportDate);

    // Definir o conteúdo da página
    await page.setContent(html, {
      waitUntil: "networkidle0", // Aguarda até que não haja requisições de rede por 500ms
    });

    setTimeout(() => {
      console.log(
        "Aguardando 2 segundos para garantir que o conteúdo esteja carregado..."
      );
    }, 2000);
    // Gerar o PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    return pdf as Buffer;
  } finally {
    await browser.close();
  }
}

// Função para gerar PDF e salvar em arquivo
export async function generateWeatherPDFToFile(
  userName: string,
  favoritePlaces: FavoritePlaceWithWeatherType[],
  reportDate: string,
  filePath: string
): Promise<void> {
  const fs = await import("fs/promises");
  const pdfBuffer = await generateWeatherPDF(
    userName,
    favoritePlaces,
    reportDate
  );
  await fs.writeFile(filePath, pdfBuffer);
}

export default generateWeatherPDF;
