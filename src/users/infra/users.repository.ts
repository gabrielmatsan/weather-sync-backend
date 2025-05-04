import { db } from "@/shared/database/db";
import { eq } from "drizzle-orm";
import type {
  CreateUserParams,
  IUsersRepository,
} from "../domain/users-repository.interface";
import { usersSchema } from "../domain/users.schema";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  signatureStatus: "active" | "inactive" | null;
  phoneNumber: string;
  role: "admin" | "user" | null;
  notifications: "yes" | "no" | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export class UsersRepository implements IUsersRepository {
  async getById(id: string): Promise<UserRecord | null> {
    const [user] = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.id, id));

    return user;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const [user] = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.email, email));

    return user;
  }

  async createUser(params: CreateUserParams): Promise<UserRecord> {
    const { name, email, password, phoneNumber, notifications } = params;

    const [user] = await db
      .insert(usersSchema)
      .values({
        name,
        email,
        password,
        phoneNumber,
        notifications,
      })
      .returning();

    return user;
  }
}
