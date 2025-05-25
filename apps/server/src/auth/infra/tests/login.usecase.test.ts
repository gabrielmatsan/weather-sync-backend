import { db } from "@/shared/database/db";
import { authMiddleware } from "@/shared/infra/auth.middleware";
import { hashPassword } from "@/shared/infra/password";
import type { CreateUserParams } from "@/users/domain/users-repository.interface";
import { usersSchema } from "@/users/domain/users.schema";
import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { AuthController } from "../auth.controller";

describe("Login Usecase", () => {
  let app: Elysia;
  let userData: CreateUserParams;
  let user: any;
  let userId: string;
  let password: string;
  beforeAll(async () => {
    //@ts-expect-error
    app = new Elysia().use(authMiddleware).use(AuthController);

    // 1. Criar o usuário no banco de dados antes do teste
    password = faker.string.alphanumeric(10);
    const passwordHashed: string = await hashPassword(password);

    [user] = await db
      .insert(usersSchema)
      .values({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHashed,
        phoneNumber: faker.phone.number({ style: "international" }),
        notifications: "yes",
      })
      .returning();

    userId = user.id;
  });

  afterAll(async () => {
    // 1. Deletar o usuário do banco de dados no final do teste
    if (user && userId) {
      await db.delete(usersSchema).where(eq(usersSchema.id, userId));
    }
  });

  it("should login a user successfully", async () => {
    const login = {
      email: user.email,
      password: password,
    };

    const response = await app.handle(
      new Request("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
      })
    );

    const data = await response.json();
    console.log("Response Data:", data);
    expect(response.status).toBe(200);
  });
});

// Add new favorite location
