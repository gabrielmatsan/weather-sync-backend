import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { env } from "../env/env";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { repositories } from "../singleton/repositories";

interface JwtPayload {
  userId: string;
  role: "admin" | "user";
  iat?: number;
  exp?: number;
}

export const authMiddleware = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case "UNAUTHORIZED":
        set.status = 401;
        return { code, message: error.message };
    }
  })
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
      exp: "30d",
    })
  )
  .use(cookie())
  .derive(
    { as: "scoped" },
    ({ jwt, cookie: { weather_sync_token }, headers }) => {
      return {
        validateToken: async () => {
          let token: string | undefined = weather_sync_token?.value;

          // Também verifica header Authorization
          if (!token) {
            const authHeader = headers["authorization"];
            if (authHeader?.startsWith("Bearer ")) {
              token = authHeader.substring(7);
            }
          }

          if (env.NODE_ENV === "development") {
            console.log("DEV: Token:", token);
          }

          if (!token) {
            if (env.NODE_ENV === "development") {
              console.log("DEV: No token found");
            }
            throw new UnauthorizedError();
          }

          try {
            const payload = (await jwt.verify(token)) as JwtPayload | false;

            if (!payload) {
              // Remove cookie inválido
              weather_sync_token.remove();

              if (env.NODE_ENV === "development") {
                console.log("DEV: Invalid token");
              }

              throw new UnauthorizedError();
            }

            // Verifica se o usuário ainda existe
            const user = await repositories.userRepository.getById(
              payload.userId
            );

            if (!user) {
              weather_sync_token.remove();
              throw new UnauthorizedError();
            }

            // Remove senha antes de retornar
            const { password, ...userWithoutPassword } = user;

            return userWithoutPassword;
          } catch (error) {
            if (env.NODE_ENV === "development") {
              console.log("DEV: Token verification failed", error);
            }

            // Remove cookie inválido
            weather_sync_token.remove();

            throw new UnauthorizedError();
          }
        },

        createToken: async (userId: string) => {
          const user = await repositories.userRepository.getById(userId);

          if (!user) {
            throw new UnauthorizedError();
          }

          const token = await jwt.sign({
            userId,
            role: user.role as "admin" | "user",
          });

          console.log("Setting cookie with token:", token);

          // Define o cookie usando a API do Elysia
          weather_sync_token.set({
            value: token,
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 dias em segundos
            path: "/",
          });

          return token;
        },

        logout: () => {
          weather_sync_token.remove();
        },
      };
    }
  );
