import type { UserRecord } from "../infra/users.repository";

export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  notifications: "yes" | "no";
}

export interface IUsersRepository {
  getById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  createUser(params: CreateUserParams): Promise<UserRecord>;
}
