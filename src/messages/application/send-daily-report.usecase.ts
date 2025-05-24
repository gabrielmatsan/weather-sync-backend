// sendDailyReport.usecase.ts - TIPAGEM CORRIGIDA
import type { IFavoritePlaceRepository } from "@/favorite-places/domain/favorite-place.interface.repository";
import { favoritePlaceType } from "@/favorite-places/domain/favorite-place.type";
import { generateWeatherPDF } from "@/shared/lib/mail/generate-weather-pdf";
import { mail } from "@/shared/lib/mail/mail";
import { generateEmailHTML } from "@/shared/utils/email-message-html";
import type { IUsersRepository } from "@/users/domain/users-repository.interface";
import type { IWeatherRepository } from "@/weather/domain/weather-repository.interface";
import { weatherType } from "@/weather/domain/weather.type";
import { t, type Static } from "elysia";
import nodemailer from "nodemailer";

// 🔧 TIPOS CORRIGIDOS
export const favoritePlaceWithWeatherType = t.Intersect([
  favoritePlaceType,
  t.Object({
    weatherData: t.Array(weatherType),
  }),
]);

export const userWithFavoritePlacesType = t.Object({
  userId: t.String(),
  userName: t.String(),
  userEmail: t.String(),
  userFavoritePlaces: t.Array(favoritePlaceWithWeatherType),
});

export type FavoritePlaceWithWeatherType = Static<
  typeof favoritePlaceWithWeatherType
>;
export type UserWithFavoritePlacesType = Static<
  typeof userWithFavoritePlacesType
>;

export async function sendDailyReport(
  userRepository: IUsersRepository,
  weatherRepository: IWeatherRepository,
  favoritePlacesRepository: IFavoritePlaceRepository
): Promise<void> {
  console.log("🚀 Iniciando envio de relatórios personalizados...");

  // 1️⃣ BUSCAR USUÁRIOS QUE PRECISAM RECEBER EMAIL
  const users = await userRepository.getUsersToSendEmail();

  if (users.length === 0) {
    console.log("❌ No users to send email");
    throw new Error("No users to send email");
  }

  console.log(`👥 Encontrados ${users.length} usuários para envio`);

  // 2️⃣ ORGANIZAR OS LUGARES FAVORITOS POR USUÁRIO
  const usersWithFavoritePlaces: UserWithFavoritePlacesType[] =
    await Promise.all(
      users.map(async (user) => {
        try {
          // Buscar locais favoritos do usuário
          const userFavoritePlaces =
            await favoritePlacesRepository.getFavoritePlacesByUserIdDetails(
              user.id
            );

          // Buscar dados meteorológicos para cada local favorito
          const favoritePlacesWithWeather: FavoritePlaceWithWeatherType[] =
            await Promise.all(
              userFavoritePlaces.map(
                async (
                  favoritePlace
                ): Promise<FavoritePlaceWithWeatherType> => {
                  try {
                    // Buscar dados meteorológicos
                    const weatherData =
                      await weatherRepository.getWeatherByPlaceIdAndDate(
                        new Date(),
                        favoritePlace.id
                      );

                    return {
                      userId: favoritePlace.userId.toString(),
                      placeId: favoritePlace.placeId,
                      createdAt: favoritePlace.createdAt,
                      weatherData, // Adiciona dados meteorológicos
                    };
                  } catch (error) {
                    console.warn(
                      `⚠️ Erro ao buscar dados para local ${favoritePlace.id}:`,
                      error
                    );

                    // Retornar favoritePlace original + dados vazios
                    return {
                      ...favoritePlace,
                      weatherData: [],
                    };
                  }
                }
              )
            );

          // Filtrar locais favoritos com dados meteorológicos
          return {
            userId: user.id.toString(),
            userName: user.name || "Usuário",
            userEmail: user.email,
            userFavoritePlaces: favoritePlacesWithWeather,
          };
        } catch (error) {
          console.error(`❌ Erro ao processar usuário ${user.email}:`, error);

          // Retornar usuário com dados vazios se houver erro
          return {
            userId: user.id.toString(),
            userName: user.name || "Usuário",
            userEmail: user.email,
            userFavoritePlaces: [],
          };
        }
      })
    );

  // 3️⃣ FILTRAR USUÁRIOS QUE TÊM LOCAIS FAVORITOS COM DADOS
  const usersWithValidData = usersWithFavoritePlaces.filter((user) =>
    user.userFavoritePlaces.some((place) => place.weatherData.length > 0)
  );

  if (usersWithValidData.length === 0) {
    console.log("❌ Nenhum usuário com dados  válidos");
    return;
  }

  // 4️⃣ ENVIAR EMAILS PARA USUÁRIOS
  await Promise.allSettled(
    usersWithValidData.map(async (user) => {
      try {
        const reportDate = new Date().toLocaleDateString("pt-BR");
        const placesWithData = user.userFavoritePlaces.filter(
          (place) => place.weatherData.length > 0
        );
        const totalReadings = user.userFavoritePlaces.reduce(
          (sum, place) => sum + place.weatherData.length,
          0
        );

        console.log(`📧 Preparando email para ${user.userEmail}...`);

        // Gerar HTML do email
        const emailHtml = generateEmailHTML(
          user.userName,
          user.userFavoritePlaces,
          reportDate
        );

        // Preparar anexos
        const attachments = [];

        // Se houver dados meteorológicos, gerar PDF
        if (placesWithData.length > 0) {
          try {
            console.log(`📄 Gerando PDF para ${user.userEmail}...`);
            const pdfBuffer = await generateWeatherPDF(
              user.userName,
              user.userFavoritePlaces,
              reportDate
            );

            attachments.push({
              filename: `weather-report-${reportDate.replace(/\//g, "-")}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            });
            console.log(`✅ PDF gerado com sucesso`);
          } catch (pdfError) {
            console.error(`❌ Erro ao gerar PDF:`, pdfError);
            // Continua o envio sem o PDF
          }
        }

        // Enviar email
        const sendEmailResult = await mail.sendMail({
          from: { name: "Weather Sync", address: "weather-sync@gmail.com" },
          to: user.userEmail,
          subject: `🌤️ Seu Relatório Meteorológico - ${reportDate}`,
          html: emailHtml,
          attachments: attachments.length > 0 ? attachments : undefined,
        });

        const previewUrl = nodemailer.getTestMessageUrl(sendEmailResult);

        console.log(
          `✅ Email enviado para ${user.userEmail} - ${user.userFavoritePlaces.length} locais, ${totalReadings} leituras${
            attachments.length > 0 ? " (com PDF)" : " (sem PDF)"
          }`
        );
        if (previewUrl) {
          console.log(`🔗 Preview: ${previewUrl}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao enviar email para ${user.userEmail}:`, error);
      }
    })
  );

  console.log("🎉 Envio de relatórios concluído!");
}
