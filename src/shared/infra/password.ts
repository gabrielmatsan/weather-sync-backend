export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await Bun.password.verify(password, hashedPassword);
}
