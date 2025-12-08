import { Injectable, Inject } from "@nestjs/common";
import { AuthMethodPort } from "../../domain/contracts/auth-method.port";
import { AuthMethodType } from "../../domain/types/auth-method-type";
import { AUTH_USER_REPO, AuthUserRepositoryPort } from "../../domain/contracts/auth-user-repository.port";
import { Email } from "../../domain/value-objects/email.vo";
import { Password } from "../../domain/value-objects/password.vo";
import { AuthUser } from "../../domain/entities/auth-user.entity";
import { compare } from "bcrypt";
import { randomUUID } from "crypto";
import { UserAlreadyExistsException, InvalidCredentialsException } from "../../domain/exceptions/auth.exceptions";

@Injectable()
export class EmailAuthMethod implements AuthMethodPort {
    readonly type: AuthMethodType = "email";

    constructor(
        @Inject(AUTH_USER_REPO) private readonly users: AuthUserRepositoryPort,
    ) { }

    async login(payload: { email: string; password: string }): Promise<AuthUser> {
        const email = Email.create(payload.email);
        const user: AuthUser | null = await this.users.findByEmail(email);
        if (!user) throw new InvalidCredentialsException();

        const passwordHash: string = await this.users.getPasswordHashByEmail(email) as string;
        if (!passwordHash) throw new InvalidCredentialsException();

        const passwordOk: boolean = await compare((payload.password).toString(), passwordHash);
        if (!passwordOk) throw new InvalidCredentialsException();

        return user;
    }

    async register(payload: { email: string; password: string, name: string }): Promise<AuthUser> {
        const email = Email.create(payload.email);
        const password = Password.create(payload.password);

        // Check if user already exists
        const existingUser = await this.users.findByEmail(email);
        if (existingUser) {
            throw new UserAlreadyExistsException(email.value);
        }

        const passwordHash: string = await this.users.generatePasswordHash(password.value.toString());
        const user = new AuthUser(randomUUID(), email, payload.name, false, null, "email");
        await this.users.save(user, passwordHash, "email", "", null);
        return user;
    }
}