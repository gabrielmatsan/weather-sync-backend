import { WrongCredentialsError } from "@/shared/errors/wrong-crendentials-error";
import { comparePassword } from "@/shared/infra/password";
import type { IUsersRepository } from "@/users/domain/users-repository.interface";
import type { User } from "@/users/domain/users.type";
import { t, type Static } from "elysia";

export const loginUserRequestSchema = t.Object({
  email: t.String(),
  password: t.String(),
});

export type LoginUserRequest = Static<typeof loginUserRequestSchema>;

export type LoginUserResponse = Omit<User, "password">;

export async function loginUseCase(
  userRepository: IUsersRepository,
  { email, password }: LoginUserRequest
): Promise<LoginUserResponse> {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new WrongCredentialsError();
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new WrongCredentialsError();
  }

  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}
