// sendDailyReport.usecase.ts - TIPAGEM CORRIGIDA
import type { IFavoritePlaceRepository } from "@/favorite-places/domain/favorite-place.interface.repository";
import { favoritePlaceType } from "@/favorite-places/domain/favorite-place.type";
import { mail } from "@/shared/lib/mail/mail";
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

  // ENVIAR EMAILS PARA USUÁRIOS COM DADOS VÁLIDOS
  await Promise.allSettled(
    usersWithValidData.map(async (user) => {
      try {
        const placesWithData = user.userFavoritePlaces.filter(
          (place) => place.weatherData.length > 0
        );
        const totalReadings = placesWithData.reduce(
          (sum, place) => sum + place.weatherData.length,
          0
        );

        // Gerar HTML do email
        // const emailHtml = generateEmailHTML(user, placesWithData);
        // const emailText = generateEmailText(user, placesWithData);

        // Enviar email
        const sendEmailResult = await mail.sendMail({
          from: { name: "Weather Sync", address: "weather-sync@gmail.com" },
          to: user.userEmail,
          subject: `🌤️ Relatório dos seus ${placesWithData.length} locais favoritos - ${new Date().toLocaleDateString("pt-BR")}`,
          text: "testando",
          // html: emailHtml,
        });

        const previewUrl = nodemailer.getTestMessageUrl(sendEmailResult);

        console.log(
          `✅ Email enviado para ${user.userEmail} - ${placesWithData.length} locais, ${totalReadings} leituras`
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
