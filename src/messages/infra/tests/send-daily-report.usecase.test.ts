import { dataSourceSchema } from "@/data-source/domain/data-source.schema";
import { placesSchema } from "@/places/domain/places.schema";
import { db } from "@/shared/database/db";
import { usersSchema } from "@/users/domain/users.schema";
import { weatherSchema } from "@/weather/domain/weather.schema";
import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { MessageController } from "../message.controller";

describe("Send Daily Report Use Case", () => {
  let app: Elysia;

  let user: any;
  let userId: string;

  let weather: any;
  let weatherId: number;

  let place: any;
  let placeId: number;

  let dataSource: any;
  let dataSourceId: number;
  beforeAll(async () => {
    //@ts-expect-error
    app = new Elysia().use(MessageController);

    await db.transaction(async (tx) => {
      // 1. Create a user
      [user] = await tx
        .insert(usersSchema)
        .values({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          phoneNumber: faker.string.numeric(11),
          notifications: "yes",
        })
        .returning();

      userId = user.id;

      placeId = 5458;
      [place] = await tx
        .insert(placesSchema)
        .values({
          id: placeId,
          name: faker.company.name(),
          latitude: faker.location.latitude().toString(),
          longitude: faker.location.longitude().toString(),
        })
        .returning();

      // 2. Create a source
      [dataSource] = await tx
        .insert(dataSourceSchema)
        .values({
          name: faker.company.name(),
        })
        .returning();
      dataSourceId = dataSource.id;

      // 2. Create a weather record

      const date = new Date();

      for (let i = 0; i <= 10; i++) {
        [weather] = await tx
          .insert(weatherSchema)
          .values({
            placeId: placeId,
            sourceId: dataSourceId,
            temperature: faker.number.int({ min: 15, max: 35 }).toString(),
            humidity: faker.number.int({ min: 30, max: 90 }),
            pressure: faker.number.int({ min: 1000, max: 1020 }),
            windSpeed: faker.number
              .float({ min: 0, max: 30, fractionDigits: 2 })
              .toString(),
            windDirection: faker.number.int({ min: 0, max: 359 }),
            createdAt: date,
          })
          .returning();
      }

      weatherId = weather.id;
    });
  });

  afterAll(async () => {
    await db.delete(weatherSchema);
    console.log("Weather deleted");
    // Clean up the database
    await db.delete(usersSchema).where(eq(usersSchema.id, userId));
    console.log("User deleted");

    await db.delete(placesSchema).where(eq(placesSchema.id, placeId));
    console.log("Place deleted");
    await db
      .delete(dataSourceSchema)
      .where(eq(dataSourceSchema.id, dataSourceId));
    console.log("Data source deleted");
  });

  it("should send daily report emails to users", async () => {
    const response = await app.handle(
      new Request("http://localhost:8080/messages/send-daily-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    expect(response.status).toBe(201);
  }, 20000);
});
