import { EmailAlreadyUsedError } from "@/shared/errors/email-already-used-error";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { WrongCredentialsError } from "@/shared/errors/wrong-crendentials-error";
import { authMiddleware } from "@/shared/infra/auth.middleware";
import { repositories } from "@/shared/singleton/repositories";
import Elysia, { t } from "elysia";
import { loginUseCase } from "../application/login.usecase";
import {
  registerUserRequestSchema,
  registerUserUseCase,
} from "../application/register-user.usecase";

export const AuthController = new Elysia({
  prefix: "/auth",
  tags: ["Auth"],
})
  .use(authMiddleware)
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        await registerUserUseCase(repositories.userRepository, body);

        set.status = 201;
        return {
          status: "success",
          message: "User registered successfully",
        };
      } catch (e) {
        if (e instanceof WrongCredentialsError) {
          set.status = 401;
          return { status: "failed", message: e.message };
        }
        if (e instanceof EmailAlreadyUsedError) {
          set.status = 409;
          return { status: "failed", message: e.message };
        }

        set.status = 500;
        return { status: "failed", message: "Internal server error" };
      }
    },
    {
      body: registerUserRequestSchema,
      response: {
        201: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        401: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        409: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        500: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Auth"],
        description: "Register user",
        summary: "Register user",
      },
    }
  )
  .post(
    "/login",
    async ({ body, set, createToken }) => {
      try {
        const { email, password } = body;

        const user = await loginUseCase(repositories.userRepository, {
          email,
          password,
        });

        if (!user.role) {
          throw new UnauthorizedError();
        }

        const token = await createToken(user.id);

        set.status = 200;
        return {
          status: "success",
          message: "Login successful",
          token: token,
        };
      } catch (e) {
        console.error(e);
        if (e instanceof UnauthorizedError) {
          set.status = 401;
          return { status: "failed", message: e.message };
        }
        if (e instanceof WrongCredentialsError) {
          set.status = 401;
          return { status: "failed", message: e.message };
        }

        set.status = 500;
        return { status: "failed", message: "Internal server error" };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
      response: {
        200: t.Object({
          status: t.String(),
          message: t.String(),
          token: t.String(),
        }),
        401: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        500: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Auth"],
        description: "Login user",
        summary: "Login user",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
                required: ["email", "password"],
              },
              examples: {
                valid: {
                  summary: "Valid login",
                  value: {
                    email: "user@example.com",
                    password: "password123",
                  },
                },
                invalid: {
                  summary: "Invalid email format",
                  value: {
                    email: "invalid-email",
                    password: "password123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    message: { type: "string" },
                  },
                },
                examples: {
                  success: {
                    summary: "Login successful",
                    value: {
                      status: "success",
                      message: "Login successful",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Authentication failed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    message: { type: "string" },
                  },
                },
                examples: {
                  wrongCredentials: {
                    summary: "Wrong credentials",
                    value: {
                      status: "failed",
                      message: "Invalid email or password",
                    },
                  },
                  unauthorized: {
                    summary: "Unauthorized",
                    value: {
                      status: "failed",
                      message: "Unauthorized access",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    message: { type: "string" },
                  },
                },
                examples: {
                  serverError: {
                    summary: "Server error",
                    value: {
                      status: "failed",
                      message: "Internal server error",
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
  );
