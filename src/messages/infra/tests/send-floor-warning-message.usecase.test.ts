import { AuthController } from "@/auth/infra/auth.controller";
import { dataSourceSchema } from "@/data-source/domain/data-source.schema";
import { favoritePlacesSchema } from "@/favorite-places/domain/favorite-places.schema";
import { placesSchema } from "@/places/domain/places.schema";
import { sensorsSchema } from "@/sensors/domain/sensors.schema";
import { db } from "@/shared/database/db";
import { hashPassword } from "@/shared/infra/password";
import type { CreateUserParams } from "@/users/domain/users-repository.interface";
import { usersSchema } from "@/users/domain/users.schema";
import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { and, eq } from "drizzle-orm";
import Elysia from "elysia";
import { MessageController } from "../message.controller";

describe("Send Floor Warning Message UseCase", () => {
  let app: Elysia;

  let userData: CreateUserParams;
  let user: any;
  let userId: string;
  let tokenData: string | null;

  let place: any;
  let placeId: number;

  let dataSource: any;
  let dataSourceId: number;

  let sensor: any;
  let sensorId: number;

  beforeAll(async () => {
    //@ts-expect-error
    app = new Elysia().use(MessageController).use(AuthController);

    // 1. Criar um usuário de teste
    let password: string = faker.internet.password();
    let hashedPassword: string = await hashPassword(password);
    userData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: hashedPassword,
      phoneNumber: "559188772828", // Número pessoal para testes de recebimento de mensagens
      notifications: "yes",
    };

    [user] = await db.insert(usersSchema).values(userData).returning();
    userId = user.id;

    // 2. Criar um token de autenticação para o usuário
    const token = await app.handle(
      new Request("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: password,
        }),
      })
    );
    tokenData = token.headers.get("set-cookie");
    console.log("Token: ", tokenData);

    if (!tokenData) {
      throw new Error("Token data is null");
    }

    // 3. Criar um lugar de teste
    [place] = await db
      .insert(placesSchema)
      .values({
        name: faker.company.name(),
        latitude: faker.location.latitude().toString(),
        longitude: faker.location.longitude().toString(),
      })
      .returning();

    placeId = place.id;

    // 4. Adicionar o lugar como favorito para o usuário
    await db.insert(favoritePlacesSchema).values({
      userId: userId,
      placeId: placeId,
    });

    // 5. Adicionar fonte de dado
    const [dataSource] = await db
      .insert(dataSourceSchema)
      .values({
        name: faker.company.name(),
      })
      .returning();
    dataSourceId = dataSource.id;

    //6. Adicionar dado de sensor para verificar se o usuário recebe a mensagem
    [sensor] = await db
      .insert(sensorsSchema)
      .values({
        placeId: placeId,
        sourceId: dataSourceId,
        waterLevelUnit: "m",
        waterLevel: "5",
      })
      .returning();
    sensorId = sensor.id;
  });

  afterAll(async () => {
    // 1.Deletar os dados de locais favoritos do banco de dados
    if (userId && placeId) {
      await db
        .delete(favoritePlacesSchema)
        .where(
          and(
            eq(favoritePlacesSchema.userId, userId),
            eq(favoritePlacesSchema.placeId, placeId)
          )
        );
    }

    // 2. Deletar dado do sensor do banco de dados no final do teste
    if (sensor && sensorId) {
      await db.delete(sensorsSchema).where(eq(sensorsSchema.id, sensor.id));
    }

    // 3. Deletar o usuário do banco de dados no final do teste
    if (userData && userId) {
      await db.delete(usersSchema).where(eq(usersSchema.email, userData.email));
    }

    // 4. Deletar fonte de dado do banco de dados no final do teste
    if (dataSource && dataSourceId) {
      await db
        .delete(dataSourceSchema)
        .where(eq(dataSourceSchema.id, dataSourceId));
    }

    // 5. Deletar o local do banco de dados no final do teste
    if (place && placeId) {
      await db.delete(placesSchema).where(eq(placesSchema.id, placeId));
    }
  });

  it("should send a floor warning message to the user", async () => {
    if (!tokenData) {
      throw new Error("Token data is null");
    }

    const response = await app.handle(
      new Request("http://localhost:8080/messages/send-floor-warning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: tokenData,
        },
        body: JSON.stringify({
          to: user.phoneNumber,
          place: place.name,
          floor: "5",
        }),
      })
    );

    // Debug a resposta
    console.log("Response status:", response.status);

    // Tentar ler o corpo da resposta
    const responseText = await response.text();
    console.log("Response text:", responseText);

    // Se for JSON válido, fazer o parse
    let responseData;
    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
        console.log("Response data:", responseData);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        console.error("Response was:", responseText);
      }
    }

    expect(response.status).toBe(201);
    if (responseData) {
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe("Message sent successfully");
    }
  });
});
