// sendDailyReport.usecase.ts (INTEGRADO COM PDF + GRÁFICOS)

import { WeatherChartGenerator } from "@/shared/lib/emails/daily/weather-chart.interface";
import { ReactEmailService } from "@/shared/lib/emails/daily/weather-email-template";
import {
  WeatherDashboardService,
  type WeatherRecord,
} from "@/shared/lib/generate-pdfs";
import { mail } from "@/shared/lib/mail/mail";
import type { IUsersRepository } from "@/users/domain/users-repository.interface";
import type { IWeatherRepository } from "@/weather/domain/weather-repository.interface";
import nodemailer from "nodemailer";

interface DashboardSendConfig {
  usePDF: boolean;
  useReactEmail: boolean;
  saveFiles?: boolean;
  outputDir?: string;
}

export async function sendDailyReport(
  userRepository: IUsersRepository,
  weatherRepository: IWeatherRepository,
  config: DashboardSendConfig = {
    usePDF: true, // 🆕 Usar PDF por padrão
    useReactEmail: false, // 🆕 React Email como fallback
  }
) {
  console.log("🚀 Iniciando envio de relatórios meteorológicos...");
  console.log(`📊 Modo: ${config.usePDF ? "PDF com gráficos" : "React Email"}`);

  const users = await userRepository.getUsersToSendEmail();

  if (users.length === 0) {
    console.log("❌ No users to send email");
    return {
      total: 0,
      successful: 0,
      failed: 0,
      error: "No users to send email",
    };
  }

  console.log(`👥 Encontrados ${users.length} usuários para envio`);

  const weatherData = await weatherRepository.getWeatherByPlaceIdAndDate(
    new Date(),
    5458 // ✅ Usar 5458 conforme seu código
  );
  console.log(weatherData[0]);
  console.info(weatherData[0]);

  if (weatherData.length === 0) {
    console.log("❌ No weather data available for today");
    return {
      total: users.length,
      successful: 0,
      failed: users.length,
      error: "No weather data",
    };
  }

  console.log(`🌤️ Encontrados ${weatherData.length} registros meteorológicos`);

  const chartData = WeatherChartGenerator.transformData(weatherData);

  if (chartData.length === 0) {
    console.log("❌ Falha na transformação dos dados");
    return {
      total: users.length,
      successful: 0,
      failed: users.length,
      error: "Data transformation failed",
    };
  }

  console.log(`📊 Dados transformados: ${chartData.length} pontos válidos`);

  const summary = {
    min: Math.min(...chartData.map((d) => d.temperature)),
    max: Math.max(...chartData.map((d) => d.temperature)),
    average: Math.round(
      chartData.reduce((sum, d) => sum + d.temperature, 0) / chartData.length
    ),
    city: "Belém",
  };

  console.log(`📈 Estatísticas calculadas:`, summary);

  // 🆕 ESCOLHER MÉTODO DE ENVIO
  if (config.usePDF) {
    return await sendWithPDFDashboards(
      users,
      weatherData.filter(
        (record) => record.createdAt !== null
      ) as WeatherRecord[],
      chartData,
      summary,
      config
    );
  } else {
    return await sendWithReactEmail(users, chartData, summary);
  }
}

// 🆕 FUNÇÃO PARA ENVIO COM PDF + GRÁFICOS
async function sendWithPDFDashboards(
  users: any[],
  weatherData: any[],
  chartData: any[],
  summary: any,
  config: DashboardSendConfig
) {
  console.log(
    `📧 Enviando dashboard PDF para ${users.length} usuários com ${chartData.length} leituras...`
  );

  // 🆕 Inicializar serviço de PDF
  const dashboardService = new WeatherDashboardService();

  const sendResults = await Promise.allSettled(
    users.map(async (user) => {
      try {
        console.log(`📤 Gerando PDF para ${user.email}...`);

        // 🆕 GERAR PDF COM GRÁFICOS - SEM LOGO PARA EVITAR ERRO
        const pdfResult = await dashboardService.generateDashboardForUser(
          user.name || "Usuário",
          user.email,
          weatherData.filter(
            (record) => record.createdAt !== null
          ) as WeatherRecord[], // Filtrar registros com createdAt válido
          "Belém",
          {
            // ✅ REMOVIDO logoPath para evitar erro ENOENT
            // logoPath: './assets/logo.png', // 🚫 Comentado até criar o arquivo
            customColors: {
              primary: "#667eea",
              secondary: "#764ba2",
              temperature: "#f59e0b",
              humidity: "#3b82f6",
              pressure: "#8b5cf6",
              wind: "#dc2626",
            },
            saveToFile: config.saveFiles,
            outputPath: config.outputDir
              ? `${config.outputDir}/dashboard-${user.email}-${new Date().toISOString().split("T")[0]}.pdf`
              : undefined,
          }
        );

        if (!pdfResult.success || !pdfResult.pdfBuffer) {
          throw new Error(`Falha na geração do PDF: ${pdfResult.error}`);
        }

        console.log(
          `✅ PDF gerado para ${user.email} (${Math.round(pdfResult.fileSize / 1024)}KB)`
        );

        // 🆕 GERAR EMAIL SIMPLES (SEM GRÁFICOS) + PDF ANEXADO
        const emailHtml = generatePDFEmailTemplate(
          user.name,
          summary,
          chartData.length
        );
        const textVersion = generateTextSummary(user.name, chartData);

        // 🆕 ENVIAR EMAIL COM PDF ANEXADO
        const fileName = `weather-dashboard-${summary.city}-${new Date().toISOString().split("T")[0]}.pdf`;

        const send = await mail.sendMail({
          from: {
            name: "Weather Sync PDF",
            address: "weather-sync@gmail.com",
          },
          to: user.email,
          subject: `🌤️ Weather Dashboard PDF - ${summary.city} (${new Date().toLocaleDateString("pt-BR")})`,
          text: textVersion,
          html: emailHtml,
          attachments: [
            {
              filename: fileName,
              content: pdfResult.pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });

        console.log(`✅ Email PDF enviado para ${user.email}`);

        const testUrl = nodemailer.getTestMessageUrl(send);
        console.log(`🔗 Preview URL: ${testUrl}`);
        if (testUrl) {
          console.log(`🔗 Preview PDF Email: ${testUrl}`);
          console.log(`📧 Para: ${user.email}`);
          console.log(`📊 Gráficos: Recharts (Linha, Barra, Área) + Tabela`);
          console.log(`📄 PDF: ${Math.round(pdfResult.fileSize / 1024)}KB`);
          console.log(`⏱️ Tempo de geração: ${pdfResult.generationTime}ms`);
          console.log(`🎨 Pontos de dados: ${pdfResult.dataPoints}`);
          console.log(`---`);
        }

        return {
          success: true,
          email: user.email,
          messageId: send.messageId,
          previewUrl: testUrl || null,
          technology: "PDF + Recharts + React Email",
          pdfSize: pdfResult.fileSize,
          generationTime: pdfResult.generationTime,
          chartCount: pdfResult.chartCount,
        };
      } catch (error) {
        console.error(`❌ Erro ao enviar PDF para ${user.email}:`, error);

        return {
          success: false,
          email: user.email,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        };
      }
    })
  );

  // 🆕 Limpar recursos do serviço PDF
  dashboardService.cleanup();

  const successful = sendResults.filter(
    (r) => r.status === "fulfilled" && r.value.success
  ).length;

  const failed = sendResults.length - successful;

  // 🆕 MOSTRAR PREVIEW URLs DOS PDFs
  console.log(`\n🔗 PREVIEW URLs DOS EMAILS PDF:`);
  sendResults.forEach((result, index) => {
    if (
      result.status === "fulfilled" &&
      result.value.success &&
      result.value.previewUrl
    ) {
      console.log(
        `   ${index + 1}. ${result.value.email}: ${result.value.previewUrl}`
      );
    }
  });

  // 🆕 ESTATÍSTICAS DETALHADAS DO PDF
  const pdfStats = sendResults
    .filter((r) => r.status === "fulfilled" && r.value.success)
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter(Boolean);

  const totalPdfSize = pdfStats.reduce(
    (sum, stat) => sum + (stat?.pdfSize || 0),
    0
  );
  const avgGenerationTime =
    pdfStats.length > 0
      ? Math.round(
          pdfStats.reduce((sum, stat) => sum + (stat?.generationTime || 0), 0) /
            pdfStats.length
        )
      : 0;

  console.log(`\n📊 Envio de Dashboard PDF concluído:
  ✅ Sucessos: ${successful}
  ❌ Falhas: ${failed}
  📧 Total: ${users.length}
  🌤️ Cidade: ${summary.city}
  📈 Leituras: ${chartData.length}
  🚀 Tecnologia: PDF + Recharts + React Email
  📄 Total PDF: ${Math.round(totalPdfSize / 1024)}KB
  ⏱️ Tempo médio: ${avgGenerationTime}ms`);

  return {
    total: users.length,
    successful,
    failed,
    summary,
    chartDataPoints: chartData.length,
    technology: "PDF + Recharts + React Email",
    pdfStats: {
      totalSize: totalPdfSize,
      avgGenerationTime,
      totalCharts: pdfStats.reduce(
        (sum, stat) => sum + (stat?.chartCount || 0),
        0
      ),
    },
    previewUrls: sendResults
      .filter(
        (r) => r.status === "fulfilled" && r.value.success && r.value.previewUrl
      )
      .map((r) => ({
        email: r.status === "fulfilled" ? r.value.email : undefined,
        url: r.status === "fulfilled" ? r.value.previewUrl : undefined,
      })),
    results: sendResults.map((result) =>
      result.status === "fulfilled"
        ? result.value
        : {
            success: false,
            error: result.reason,
          }
    ),
  };
}

// 🆕 TEMPLATE DE EMAIL SIMPLES PARA ACOMPANHAR PDF
function generatePDFEmailTemplate(
  userName: string,
  summary: any,
  dataCount: number
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Dashboard PDF</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 25px;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
            font-weight: 300;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin: 25px 0;
        }
        .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-card .emoji {
            font-size: 20px;
            margin-bottom: 5px;
        }
        .stat-card .label {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .stat-card .value {
            font-size: 16px;
            font-weight: bold;
            color: #1e293b;
        }
        .attachment-notice {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .attachment-notice h3 {
            margin: 0 0 10px 0;
            color: #92400e;
            font-size: 18px;
        }
        .features {
            background: #f0f9ff;
            border: 1px solid #0284c7;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .features h4 {
            margin: 0 0 15px 0;
            color: #0c4a6e;
            font-size: 16px;
        }
        .features ul {
            margin: 0;
            padding-left: 20px;
        }
        .features li {
            margin-bottom: 8px;
            color: #0369a1;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌤️ Weather Dashboard</h1>
            <p>Relatório meteorológico para <strong>${userName}</strong></p>
            <p>${summary.city} • ${new Date().toLocaleDateString("pt-BR")}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="emoji">🌡️</div>
                <div class="label">Temperatura</div>
                <div class="value">${summary.min}° - ${summary.max}°C</div>
            </div>
            <div class="stat-card">
                <div class="emoji">📍</div>
                <div class="label">Localização</div>
                <div class="value">${summary.city}</div>
            </div>
            <div class="stat-card">
                <div class="emoji">📈</div>
                <div class="label">Registros</div>
                <div class="value">${dataCount} leituras</div>
            </div>
            <div class="stat-card">
                <div class="emoji">🎯</div>
                <div class="label">Média</div>
                <div class="value">${summary.average}°C</div>
            </div>
        </div>

        <div class="attachment-notice">
            <h3>📎 Dashboard Completo em Anexo!</h3>
            <p><strong>Abra o arquivo PDF anexado</strong> para visualizar todos os gráficos interativos e dados detalhados.</p>
        </div>

        <div class="features">
            <h4>📊 O que está incluído no PDF:</h4>
            <ul>
                <li>📈 Gráfico de linha com tendências de temperatura e umidade</li>
                <li>📊 Gráfico de barras comparativo por horário</li>
                <li>⚡ Gráfico de área da pressão atmosférica</li>
                <li>📋 Tabela completa com todos os dados coletados</li>
                <li>🎨 Design profissional pronto para impressão</li>
            </ul>
        </div>

        <div class="footer">
            <p><strong>Weather Dashboard</strong> • ${new Date().toLocaleDateString("pt-BR")}</p>
            <p>Dados coletados automaticamente dos sensores IoT de ${summary.city}</p>
            <p>Powered by Recharts + Puppeteer + React Email</p>
        </div>
    </div>
</body>
</html>
  `.trim();
}

// 📧 FUNÇÃO ORIGINAL REACT EMAIL (MANTIDA COMO FALLBACK)
async function sendWithReactEmail(
  users: any[],
  chartData: any[],
  summary: any
) {
  console.log(
    `📧 Enviando dashboard React Email para ${users.length} usuários com ${chartData.length} leituras...`
  );

  const sendResults = await Promise.allSettled(
    users.map(async (user) => {
      try {
        console.log(`📤 Gerando email React para ${user.email}...`);

        const htmlTemplate = await ReactEmailService.generateWeatherEmail(
          user.name,
          chartData,
          summary
        );

        console.log(
          `✅ Template React gerado para ${user.email} (${htmlTemplate.length} chars)`
        );

        const textVersion = generateTextSummary(user.name, chartData);

        const send = await mail.sendMail({
          from: {
            name: "Weather Sync",
            address: "weather-sync@gmail.com",
          },
          to: user.email,
          subject: `🌤️ Weather Sync - Dashboard React de ${summary.city} (${new Date().toLocaleDateString("pt-BR")})`,
          text: textVersion,
          html: htmlTemplate,
        });

        console.log(`✅ Email React enviado para ${user.email}`);

        const testUrl = nodemailer.getTestMessageUrl(send);
        console.log(`🔗 Preview URL: ${testUrl}`);
        if (testUrl) {
          console.log(`🔗 Preview React Email: ${testUrl}`);
          console.log(`📧 Para: ${user.email}`);
          console.log(
            `📊 Gráficos: Recharts (Linha, Barra, Área, Rosa dos Ventos)`
          );
          console.log(`🎨 Template: ${htmlTemplate.length} chars`);
          console.log(`---`);
        }

        return {
          success: true,
          email: user.email,
          messageId: send.messageId,
          previewUrl: testUrl || null,
          technology: "React Email + Recharts",
        };
      } catch (error) {
        console.error(
          `❌ Erro ao enviar React Email para ${user.email}:`,
          error
        );

        return {
          success: false,
          email: user.email,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        };
      }
    })
  );

  const successful = sendResults.filter(
    (r) => r.status === "fulfilled" && r.value.success
  ).length;

  const failed = sendResults.length - successful;

  console.log(`🔗 PREVIEW URLs DOS EMAILS REACT:`);
  sendResults.forEach((result, index) => {
    if (
      result.status === "fulfilled" &&
      result.value.success &&
      result.value.previewUrl
    ) {
      console.log(
        `   ${index + 1}. ${result.value.email}: ${result.value.previewUrl}`
      );
    }
  });

  console.log(`📊 Envio de React Emails concluído:
  ✅ Sucessos: ${successful}
  ❌ Falhas: ${failed}
  📧 Total: ${users.length}
  🌤️ Cidade: ${summary.city}
  📈 Leituras: ${chartData.length}
  🚀 Tecnologia: React Email + Recharts`);

  return {
    total: users.length,
    successful,
    failed,
    summary,
    chartDataPoints: chartData.length,
    technology: "React Email + Recharts",
    previewUrls: sendResults
      .filter(
        (r) => r.status === "fulfilled" && r.value.success && r.value.previewUrl
      )
      .map((r) => ({
        email: r.status === "fulfilled" ? r.value.email : undefined,
        url: r.status === "fulfilled" ? r.value.previewUrl : undefined,
      })),
    results: sendResults.map((result) =>
      result.status === "fulfilled"
        ? result.value
        : {
            success: false,
            error: result.reason,
          }
    ),
  };
}

function generateTextSummary(
  userName: string,
  chartData: WeatherChartData[]
): string {
  if (chartData.length === 0) {
    return `Olá ${userName}, não há dados meteorológicos disponíveis hoje.`;
  }

  const temperatures = chartData.map((d) => d.temperature);
  const humidities = chartData.map((d) => d.humidity);
  const windSpeeds = chartData.map((d) => d.windSpeed);

  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);
  const avgHumidity = Math.round(
    humidities.reduce((sum, h) => sum + h, 0) / humidities.length
  );
  const maxWind = Math.max(...windSpeeds);

  return `
Weather Sync - Dashboard PDF Meteorológico

Olá ${userName}!

📊 RESUMO DO DIA (${chartData.length} leituras):

🌡️ TEMPERATURA:
• Mínima: ${minTemp}°C
• Máxima: ${maxTemp}°C
• Variação: ${maxTemp - minTemp}°C

💧 UMIDADE:
• Média: ${avgHumidity}%

💨 VENTO:
• Velocidade máxima: ${maxWind.toFixed(1)} km/h

📄 DASHBOARD PDF ANEXADO:
• Gráficos Recharts renderizados (Linha, Barra, Área)
• Tabela completa de dados
• Design profissional para impressão
• Estatísticas detalhadas
• Gerado com Puppeteer + React

Para visualizar todos os gráficos, abra o arquivo PDF em anexo.

---
© ${new Date().getFullYear()} Weather Sync
Dados coletados em tempo real pelos sensores de Belém.
Powered by PDF + Recharts + React Email
  `.trim();
}

// 🆕 FUNÇÃO DE TESTE DEDICADA PARA PDF
export async function testPDFDashboard(
  userRepository: IUsersRepository,
  weatherRepository: IWeatherRepository
) {
  console.log("🧪 Testando geração de Dashboard PDF...");

  try {
    const result = await sendDailyReport(userRepository, weatherRepository, {
      usePDF: true,
      useReactEmail: false,
      saveFiles: true,
      outputDir: "./test-pdfs",
    });

    console.log("✅ Teste PDF concluído:", result);
    return result;
  } catch (error) {
    console.error("❌ Erro no teste PDF:", error);
    throw error;
  }
}

// ✅ FUNÇÃO PARA TESTAR PREVIEW URLs ISOLADAMENTE (MANTIDA)
export async function testPreviewUrls() {
  console.log("🧪 Testando Preview URLs...");

  try {
    const testEmail = await mail.sendMail({
      from: "teste@weather-sync.com",
      to: "teste@example.com",
      subject: "Teste Preview URL",
      html: "<h1>Teste</h1>",
      text: "Teste",
    });

    const testUrl = nodemailer.getTestMessageUrl(testEmail);

    if (testUrl) {
      console.log(`✅ Preview URL funcionando: ${testUrl}`);
    } else {
      console.log(`❌ Preview URL não gerada`);
      console.log(`🔧 Response:`, testEmail.response);
      console.log(`🔧 MessageId:`, testEmail.messageId);
    }

    return { success: true, url: testUrl, messageId: testEmail.messageId };
  } catch (error) {
    console.error("❌ Erro no teste:", error);
    throw error;
  }
}

// ✅ DEBUG COMPLETO COM PREVIEW URL (MANTIDO)
export async function sendDailyReportDebug(
  userRepository: IUsersRepository,
  weatherRepository: IWeatherRepository
) {
  console.log("🔍 DEBUG: Testando fluxo completo...");

  const previewTest = await testPreviewUrls();
  console.log("🧪 Resultado do teste:", previewTest);

  try {
    const users = await userRepository.getUsersToSendEmail();
    console.log(`🔍 DEBUG: ${users.length} usuários encontrados`);

    const weatherData = await weatherRepository.getWeatherByPlaceIdAndDate(
      new Date(),
      5458
    );
    console.log(`🔍 DEBUG: ${weatherData.length} registros meteorológicos`);

    if (weatherData.length > 0) {
      const chartData = WeatherChartGenerator.transformData(weatherData);
      console.log(`🔍 DEBUG: ${chartData.length} dados transformados`);

      if (chartData.length > 0 && users.length > 0) {
        // 🆕 Testar geração de PDF
        const dashboardService = new WeatherDashboardService();
        const pdfResult = await dashboardService.generateDashboardForUser(
          users[0].name,
          users[0].email,
          weatherData,
          "Belém"
        );

        console.log(`🔍 DEBUG: PDF gerado - Sucesso: ${pdfResult.success}`);
        if (pdfResult.success) {
          console.log(
            `🔍 DEBUG: PDF - ${Math.round(pdfResult.fileSize / 1024)}KB em ${pdfResult.generationTime}ms`
          );
        }

        dashboardService.cleanup();
      }
    }

    return {
      debug: true,
      users: users.length,
      weatherRecords: weatherData.length,
      previewUrlTest: previewTest,
      status: "✅ Debug completo",
    };
  } catch (error) {
    console.error("🔍 DEBUG ERROR:", error);
    return {
      debug: true,
      status: "❌ Debug com erro",
      error: error.message,
    };
  }
}
