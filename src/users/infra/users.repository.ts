import { favoritePlacesSchema } from "@/favorite-places/domain/favorite-places.schema";
import { db } from "@/shared/database/db";
import { and, eq } from "drizzle-orm";
import type {
  CreateUserParams,
  IUsersRepository,
  UserRecord,
} from "../domain/users-repository.interface";
import { usersSchema } from "../domain/users.schema";

export class UsersRepository implements IUsersRepository {
  async registerUser(data: CreateUserParams): Promise<UserRecord> {
    const [user] = await db.insert(usersSchema).values(data).returning();

    return user;
  }

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

  async getUsersToSendMessage(placeId: number): Promise<UserRecord[]> {
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
          eq(usersSchema.notifications, "yes")
        )
      );

    return users.map((user) => ({
      id: user.users.id,
      name: user.users.name,
      email: user.users.email, // Placeholder as email is required in UserRecord
      password: "", // Placeholder as password is required in UserRecord
      signatureStatus: user.users.signatureStatus,
      phoneNumber: user.users.phoneNumber,
      role: user.users.role, // Placeholder as role is required in UserRecord
      notifications: user.users.notifications, // Placeholder as notifications is required in UserRecord
      createdAt: user.users.createdAt, // Placeholder as createdAt is required in UserRecord
      updatedAt: user.users.updatedAt, // Placeholder as updatedAt is required in UserRecord
    }));
  }

  async favoritePlace(placeId: number, userId: string) {
    return await db.insert(favoritePlacesSchema).values({
      placeId,
      userId,
    });
  }
}
