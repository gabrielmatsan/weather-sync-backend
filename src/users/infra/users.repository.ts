import { favoritePlacesSchema } from "@/favorite-places/domain/favorite-places.schema";
import { db } from "@/shared/database/db";
import { and, eq } from "drizzle-orm";
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

  async getUsersToSendMessage(placeId: number) {
    const users = await db
      .select()
      .from(usersSchema)
      .innerJoin(
        favoritePlacesSchema,
        eq(usersSchema.id, favoritePlacesSchema.userId)
      )
      .where(
        and(
          eq(favoritePlacesSchema.placeId, placeId),
          eq(usersSchema.signatureStatus, "active")
        )
      );

    if (users.length === 0) {
      return null;
    }

    return users.map((user) => ({
      id: user.users.id,
      name: user.users.name,
      phoneNumber: user.users.phoneNumber,
    }));
  }
}
