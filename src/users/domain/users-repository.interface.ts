export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  notifications: "yes" | "no";
}

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

export interface IUsersRepository {
  getById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  createUser(params: CreateUserParams): Promise<UserRecord>;
  getUsersToSendMessage(placeId: number): Promise<UserRecord[]>;
  registerUser(data: CreateUserParams): Promise<UserRecord>;
  getUsersToSendEmail(): Promise<UserRecord[]>;
}
