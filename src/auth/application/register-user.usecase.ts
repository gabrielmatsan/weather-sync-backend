import { EmailAlreadyUsedError } from "@/shared/errors/email-already-used-error";
import { WrongCredentialsError } from "@/shared/errors/wrong-credentials-error";
import { hashPassword } from "@/shared/infra/password";
import type { IUsersRepository } from "@/users/domain/users-repository.interface";
import { UserType } from "@/users/domain/users.type";
import { t, type Static } from "elysia";

export const registerUserRequestSchema = t.Intersect([
  t.Omit(UserType, ["id", "createdAt", "updatedAt", "signatureStatus"]),
  t.Object({
    // Caso um dia fizer integração com o google, facebook, etc, colocar oauth
    provider: t.UnionEnum(["credentials"]),
  }),
]);

export type RegisterUserRequest = Static<typeof registerUserRequestSchema>;

export async function registerUserUseCase(
  userRepository: IUsersRepository,
  userData: RegisterUserRequest
) {
  const isUserAlreadyExists = await userRepository.findByEmail(userData.email);

  if (isUserAlreadyExists) {
    throw new EmailAlreadyUsedError();
  }

  if (userData.provider === "credentials") {
    if (!userData.password) {
      throw new WrongCredentialsError();
    }

    userData.password = await hashPassword(userData.password.trim());
  }

  const user = await userRepository.createUser({
    ...userData,
    notifications: userData.notifications ?? "yes",
  });

  return { user };
}
