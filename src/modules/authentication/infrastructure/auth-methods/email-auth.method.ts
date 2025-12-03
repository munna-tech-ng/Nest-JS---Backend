import { Injectable, Inject } from "@nestjs/common";
import { AuthMethodPort } from "../../domain/contracts/auth-method.port";
import { AuthMethodType } from "../../domain/types/auth-method-type";
import { AUTH_USER_REPO, AuthUserRepositoryPort } from "../../domain/contracts/auth-user-repository.port";
import { Email } from "../../domain/value-objects/email.vo";
import { Password } from "../../domain/value-objects/password.vo";
import { AuthUser } from "../../domain/entities/auth-user.entity";
import { hash, compare } from "bcrypt";
import { randomUUID } from "crypto";

@Injectable()
export class EmailAuthMethod implements AuthMethodPort {
    readonly type: AuthMethodType = "email";

    constructor(
        @Inject(AUTH_USER_REPO) private readonly users: AuthUserRepositoryPort,
    ) { }

    async login(payload: { email: string; password: string }): Promise<AuthUser> {
        const email = Email.create(payload.email);
        const user: AuthUser | null = await this.users.findByEmail(email);
        if (!user) throw new Error("Invalid credentials");

        const passwordHash: string | null = await this.users.getPasswordHashByEmail(email);
        if (!passwordHash) throw new Error("Invalid credentials");

        const passwordOk: boolean = await compare(payload.password, passwordHash);
        if (!passwordOk) throw new Error("Invalid credentials");

        return user;
    }

    async register(payload: { email: string; password: string }): Promise<AuthUser> {
        const email = Email.create(payload.email);
        const password = Password.create(payload.password);

        // Check if user already exists
        const existingUser = await this.users.findByEmail(email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        const passwordHash: string = await hash(password.value, 10);
        const user = new AuthUser(randomUUID(), email, false, "email");
        await this.users.save(user, passwordHash);

        return user;
    }
}