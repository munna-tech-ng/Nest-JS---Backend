// modules/auth/infrastructure/persistence/auth-user.repository.ts
import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { AuthUserRepositoryPort } from "../../domain/contracts/auth-user-repository.port";
import { AuthProvider, AuthUser } from "../../domain/entities/auth-user.entity";
import { DRIZZLE } from "src/infra/db/db.config";
import { Email } from "../../domain/value-objects/email.vo";
import * as schema from "src/infra/db/schema";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { Phone } from "../../domain/value-objects/phone.vo";
import { SaveUserPayload } from "../../domain/types/auth-method-type";

@Injectable()
export class AuthUserRepository implements AuthUserRepositoryPort {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findByEmail(email: Email): Promise<AuthUser | null> {
    const row = await this.db.query.user.findFirst({
      where: eq(schema.user.email, email.value),
    });
    if (!row) return null;
    return new AuthUser((row.id).toString(), email, row.name, false, row.code, row.provider as AuthProvider);
  }

  async getPasswordHashByEmail(email: Email): Promise<string | null> {
    const row = await this.db.query.user.findFirst({
      where: eq(schema.user.email, email.value),
    });
    return row?.password ?? null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const row = await this.db.query.user.findFirst({
      where: eq(schema.user.id, Number(id)),
    });
    if (!row) return null;
    return new AuthUser((row.id).toString(), Email.create(row.email), row.name, true, row.code, "email");
  }

  async findByCode(code: string): Promise<AuthUser | null> {
    const row = await this.db.query.user.findFirst({
        where: eq(schema.user.code, code),
      });
      if (!row) return null;
      return new AuthUser((row.id).toString(), Email.create(row.email), row.name, false, row.code, "code");
  }

  async findByPhone(phone: Phone): Promise<AuthUser | null> {
    const row = await this.db.query.user.findFirst({
      where: eq(schema.user.phone, phone.value),
    });
    if (!row) return null;
    return new AuthUser((row.id).toString(), Email.create(row.email), row.name, false, row.code, "phone", true, Phone.create(row.phone!));
  }
  
  async generatePasswordHash(password?: string): Promise<string> {
    // if password not provided then generate random string
    if (!password) {
      password = randomUUID();
    }
    return await bcrypt.hash(password, 10);
  }
  
  async save(payload: SaveUserPayload): Promise<void> {
    await this.db.insert(schema.user).values({
      name: payload.user.name,
      email: payload.user.email?.value as string,
      is_guest: payload.user.isGuest ? true : false,
      password: payload.passwordHash ?? "",
      code: payload.user.code ?? "",
      provider: payload.provider ?? "",
      provider_id: payload.providerId ?? "",
      avatar: payload.avatar ?? "",
      phone: payload.phone?.value as string,
    });
  }
}