import { sendFloorWarningMessageUseCase } from "@/messages/application/send-floor-warning-message.usecase";
import { PlaceRepository } from "@/places/infra/places.repository";
import { SensorsRepository } from "@/sensors/infra/sensors.repository";
import { UsersRepository } from "@/users/infra/users.repository";
import { beforeAll, describe } from "bun:test";

describe("SendFloorWarningMessageUseCase", () => {
  let sensorRepository: SensorsRepository;
  let userRepository: UsersRepository;
  let placeRepository: PlaceRepository;

  beforeAll(async () => {
    sensorRepository = new SensorsRepository();
    userRepository = new UsersRepository();
    placeRepository = new PlaceRepository();

    const sut = sendFloorWarningMessageUseCase(
      sensorRepository,
      userRepository,
      placeRepository
    );
  });
});
