import { db } from "@/shared/database/db";
import { authMiddleware } from "@/shared/infra/auth.middleware";
import type { CreateUserParams } from "@/users/domain/users-repository.interface";
import { usersSchema } from "@/users/domain/users.schema";
import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { AuthController } from "../auth.controller";

describe("Register User Usecase", () => {
  let app: Elysia;
  let userData: CreateUserParams;
  beforeAll(() => {
    //@ts-expect-error
    app = new Elysia().use(authMiddleware).use(AuthController);
  });

  afterAll(async () => {
    // 1. Deletar o usuário do banco de dados no final do teste
    if (userData) {
      await db.delete(usersSchema).where(eq(usersSchema.email, userData.email));
    }
  });

  it("should register a user successfully", async () => {
    userData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      phoneNumber: faker.phone.number({ style: "international" }),
      notifications: "yes",
    };

    const response = await app.handle(
      new Request("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
    );

    const data = await response.json();

    console.log("Response Data:", data);
    expect(response.status).toBe(201);
  });
});
