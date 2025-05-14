import type { IPlaceRepository } from "@/places/domain/place-repository.interface";
import type { ISensorsRepository } from "@/sensors/domain/sensors-repository.interface";
import { MAX_WATER_LEVEL } from "@/shared/database/config.schema";
import { services } from "@/shared/singleton/services";
import type { IUsersRepository } from "@/users/domain/users-repository.interface";

interface CriticalSensorData {
  placeId: number;
  waterLevel: number;
}

export async function sendFloorWarningMessageUseCase(
  sensorRepository: ISensorsRepository,
  userRepository: IUsersRepository,
  placeRepository: IPlaceRepository
) {
  // busca novos dados dos sensores
  const sensorsData = await sensorRepository.getNewSensorsData();

  // Verifica se algum dos registros de sensores possui o nível de água acima do nível máximo, se houver, armazena o ID localmente
  const criticalPlaces: CriticalSensorData[] = sensorsData
    .filter((sensor) => sensor.waterLevel >= MAX_WATER_LEVEL)
    .map((sensor) => ({
      placeId: sensor.placeId,
      waterLevel: sensor.waterLevel,
    }));

  // Caso não haja sensores com nível crítico, retorna um objeto indicando que não há alertas a serem enviados
  if (criticalPlaces.length <= 0) {
    console.log("Nenhum sensor ultrapassou o nível crítico de água");
    return;
  }

  // Para cada ID de local crítico...
  for (const criticalPlace of criticalPlaces) {
    const users = await userRepository.getUsersToSendMessage(
      criticalPlace.placeId
    );

    // Caso nenhum usuário tenha favoritado esse local, vai para o próximo laço
    if (!users || users.length <= 0) {
      console.log("Nenhum usuário encontrado para enviar a mensagem");
      continue;
    }

    const place = await placeRepository.getPlaceById(criticalPlace.placeId);

    if (!place) {
      throw new Error("Place not found");
    }

    await Promise.allSettled(
      users.map((user) => {
        // Envia a mensagem para cada usuário
        const response = services.twilionWhatsappService.sendWhatsAppMessage(
          user.phoneNumber,
          {
            place: place.name,
            floor: criticalPlace.waterLevel.toString(),
          }
        );
        console.log("Response: ", response);
      })
    );
  }
}
