import { UsersRepository } from "@/users/infra/users.repository";

/**
 * Singleton pattern for repositories
 */
const userRepository = new UsersRepository();

export const repositories = {
  userRepository,
};
