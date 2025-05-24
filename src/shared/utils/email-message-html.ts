import type { FavoritePlaceWithWeatherType } from "@/messages/application/send-daily-report.usecase";

export function generateEmailHTML(
  userName: string,
  favoritePlaces: FavoritePlaceWithWeatherType[],
  reportDate: string
): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">🌤️ Weather Sync</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0; font-size: 16px;">Relatório Meteorológico Diário</p>
      </div>
      
      <div style="padding: 40px 30px; background: #ffffff;">
        <h2 style="color: #1a202c; font-size: 24px; margin-bottom: 20px;">Olá, ${userName}!</h2>
        <p style="color: #4a5568; line-height: 1.8; font-size: 16px; margin-bottom: 30px;">
          Seu relatório meteorológico de <strong>${reportDate}</strong> está pronto! 
          Preparamos uma análise completa com gráficos detalhados dos seus <strong>${favoritePlaces.length} locais favoritos</strong>.
        </p>
        
        <div style="background: #f7fafc; padding: 25px; border-radius: 12px; border-left: 4px solid #667eea; margin: 30px 0;">
          <h3 style="color: #2d3748; margin-top: 0; font-size: 20px; margin-bottom: 15px;">📊 Resumo do Relatório:</h3>
          <div style="color: #4a5568; line-height: 1.8;">
            ${favoritePlaces
              .map((place) => {
                const readings = place.weatherData.length;
                const hasData = readings > 0;

                if (!hasData) {
                  return `
                  <div style="margin-bottom: 12px; padding: 10px; background: #fff5f5; border-radius: 6px;">
                    <strong style="color: #e53e3e;">📍 ${place.name || `Local ${place.placeId}`}</strong>
                    <span style="color: #c53030; font-size: 14px;"> - Sem dados disponíveis</span>
                  </div>
                `;
                }

                const temps = place.weatherData.map((d) =>
                  parseFloat(d.temperature)
                );
                const avgTemp = (
                  temps.reduce((a, b) => a + b, 0) / temps.length
                ).toFixed(1);

                return `
                <div style="margin-bottom: 12px; padding: 12px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #2d3748;">📍 ${place.name || `Local ${place.placeId}`}</strong>
                    <span style="background: #48bb78; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                      ${readings} leituras
                    </span>
                  </div>
                  <div style="margin-top: 8px; font-size: 14px; color: #718096;">
                    Temperatura média: <strong style="color: #667eea;">${avgTemp}°C</strong>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <div style="display: inline-block; background: #edf2f7; padding: 20px 30px; border-radius: 12px;">
            <p style="color: #2d3748; margin: 0; font-size: 16px;">
              📎 <strong>PDF anexo com gráficos completos</strong>
            </p>
            <p style="color: #718096; margin: 8px 0 0; font-size: 14px;">
              Visualize tendências, comparações e análises detalhadas
            </p>
          </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;">
        
        <div style="text-align: center;">
          <p style="color: #718096; font-size: 14px; line-height: 1.6;">
            Este relatório foi gerado automaticamente pelo Weather Sync.<br>
            Para gerenciar seus locais favoritos ou alterar suas preferências,<br>
            acesse nosso aplicativo.
          </p>
        </div>
      </div>
      
      <div style="background: #2d3748; color: #e2e8f0; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="margin: 0; font-size: 13px; line-height: 1.6;">
          © ${new Date().getFullYear()} Weather Sync. Todos os direitos reservados.<br>
          <span style="color: #a0aec0;">Você está recebendo este email porque habilitou notificações diárias.</span>
        </p>
      </div>
    </div>
  `;
}
