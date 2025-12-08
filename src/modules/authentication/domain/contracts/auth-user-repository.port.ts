import { AuthUser } from "../entities/auth-user.entity";
import { Email } from "../value-objects/email.vo";

export interface AuthUserRepositoryPort {
  findById(id: string): Promise<AuthUser | null>;
  findByEmail(email: Email): Promise<AuthUser | null>;
  findByCode(code: string): Promise<AuthUser | null>;
  getPasswordHashByEmail(email: Email): Promise<string | null>;
  generatePasswordHash(password?: string): Promise<string>;
  save(user: AuthUser, passwordHash?: string | null, provider?: string, providerId?: string, avatar?: string | null): Promise<void>;
}
export const AUTH_USER_REPO = "AUTH_USER_REPOSITORY_PORT";