import { Inject, Injectable } from "@nestjs/common";
import { AuthServicePort } from "../../domain/contracts/auth-service-port";
import { DRIZZLE } from "src/infra/db/db.config";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "src/infra/db/schema";
import { eq } from "drizzle-orm";
import { AuthProvider, AuthUser } from "../../domain/entities/auth-user.entity";
import { AuthMethodType } from "../../domain/types/auth-method-type";
import { Email } from "../../domain/value-objects/email.vo";
import { Phone } from "../../domain/value-objects/phone.vo";

@Injectable()
export class AuthServiceRepository implements AuthServicePort {
    constructor(
        @Inject(DRIZZLE)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async getUserByPhone(phone: string): Promise<AuthUser> {
        const user = await this.db.query.user.findFirst({
            where: eq(schema.user.phone, phone),
        });
        return new AuthUser(user?.id?.toString() ?? "", Email.create(user?.email ?? ""), user?.name ?? "", user?.is_guest ?? false, user?.code ?? "", user?.provider as AuthProvider, false, user?.phone ? Phone.create(user?.phone ?? "") : null);
    }

    async getUserByEmail(email: string): Promise<AuthUser> {
        const user = await this.db.query.user.findFirst({
            where: eq(schema.user.email, email),
        });
        return new AuthUser(user?.id?.toString() ?? "", Email.create(user?.email ?? ""), user?.name ?? "", user?.is_guest ?? false, user?.code ?? "", user?.provider as AuthProvider, false, user?.phone ? Phone.create(user?.phone ?? "") : null);
    }
    
    async getUserByCode(code: string): Promise<AuthUser> {
        const user = await this.db.query.user.findFirst({
            where: eq(schema.user.code, code),
        });
        return new AuthUser(user?.id?.toString() ?? "", Email.create(user?.email ?? ""), user?.name ?? "", user?.is_guest ?? false, user?.code ?? "", user?.provider as AuthProvider, false, user?.phone ? Phone.create(user?.phone ?? "") : null);
    }
    
    
    async getUserByGuest(guest: boolean): Promise<AuthUser> {
        const user = await this.db.query.user.findFirst({
            where: eq(schema.user.is_guest, guest),
        });
        return new AuthUser(user?.id?.toString() ?? "", Email.create(user?.email ?? ""), user?.name ?? "", user?.is_guest ?? false, user?.code ?? "", user?.provider as AuthProvider, false, user?.phone ? Phone.create(user?.phone ?? "") : null);
    }
    
    async getListOfUsers(): Promise<AuthUser[]> {
        const users = await this.db.query.user.findMany();
        return users.map(user => new AuthUser(user?.id?.toString() ?? "", Email.create(user?.email ?? ""), user?.name ?? "", user?.is_guest ?? false, user?.code ?? "", user?.provider as AuthProvider, false, user?.phone ? Phone.create(user?.phone ?? "") : null));
    }
    
    async getUserById(id: string): Promise<AuthUser> {
        const user = await this.db.query.user.findFirst({
            where: eq(schema.user.id, Number(id)),
        });
        return new AuthUser(user?.id?.toString() ?? "", Email.create(user?.email ?? ""), user?.name ?? "", user?.is_guest ?? false, user?.code ?? "", user?.provider as AuthProvider, false, user?.phone ? Phone.create(user?.phone ?? "") : null);
    }
    
    async getUserByProvider(provider: AuthProvider): Promise<AuthUser[]> {
        const users = await this.db.query.user.findMany({
            where: eq(schema.user.provider, provider as string),
        });
        return users.map(user => new AuthUser(user?.id?.toString() ?? "", Email.create(user?.email ?? ""), user?.name ?? "", user?.is_guest ?? false, user?.code ?? "", user?.provider as AuthProvider, false, user?.phone ? Phone.create(user?.phone ?? "") : null));
    }
    
    getAuthProviders(): AuthProvider[] {
        // this is not db its static data
        return ["email", "firebase", "code", "guest", "phone"] as AuthProvider[];
    }
    
    getAuthMethods(): AuthMethodType[] {
        // this is not db its static data
        return ["email", "firebase", "code", "guest", "phone"] as AuthMethodType[];
    }
}   