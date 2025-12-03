// modules/auth/infrastructure/persistence/auth-user.repository.ts
import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { AuthUserRepositoryPort } from "../../domain/contracts/auth-user-repository.port";
import { AuthUser } from "../../domain/entities/auth-user.entity";
import { DRIZZLE } from "src/infra/db/db.config";
import { Email } from "../../domain/value-objects/email.vo";
import * as schema from "src/infra/db/schema";

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
    return new AuthUser((row.id).toString(), email, row.name, false, row.code, "email");
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
  
  async save(user: AuthUser, passwordHash?: string | null): Promise<void> {
    await this.db.insert(schema.user).values({
      name: user.name,
      email: user.email?.value as string,
      is_guest: user.isGuest ? true : false,
      password: passwordHash ?? "",
      code: user.code ?? "",
    });
  }
}