import { AuthUser } from "../entities/auth-user.entity";
import { SaveUserPayload } from "../types/auth-method-type";
import { Email } from "../value-objects/email.vo";
import { Phone } from "../value-objects/phone.vo";

export interface AuthUserRepositoryPort {
  findById(id: string): Promise<AuthUser | null>;
  findByEmail(email: Email): Promise<AuthUser | null>;
  findByPhone(phone: Phone): Promise<AuthUser | null>;
  findByCode(code: string): Promise<AuthUser | null>;
  getPasswordHashByEmail(email: Email): Promise<string | null>;
  generatePasswordHash(password?: string): Promise<string>;
  save(payload: SaveUserPayload): Promise<void>;
}
export const AUTH_USER_REPO = "AUTH_USER_REPOSITORY_PORT";