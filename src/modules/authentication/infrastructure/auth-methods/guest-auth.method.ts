import { Inject, Injectable } from "@nestjs/common";
import { AuthUser } from "../../domain/entities/auth-user.entity";
import { AuthMethodPort } from "../../domain/contracts/auth-method.port";
import { AUTH_USER_REPO, AuthUserRepositoryPort } from "../../domain/contracts/auth-user-repository.port";
import { AuthMethodType } from "../../domain/types/auth-method-type";
import { randomUUID } from "crypto";
import { Email } from "../../domain/value-objects/email.vo";

@Injectable()
export class GuestAuthMethod implements AuthMethodPort {
    readonly type: AuthMethodType = "guest";

    constructor(
        @Inject(AUTH_USER_REPO)
        private readonly users: AuthUserRepositoryPort,
    ) { }

    async login(payload: { isGuest: boolean }): Promise<AuthUser> {
        if (!payload.isGuest) throw new Error("Guest flag required");
        const userName = "Guest";
        const guestCode = Email.create(randomUUID() + "@guest.com");
        const user = new AuthUser(crypto.randomUUID(), guestCode, userName, true, null, "guest");
        await this.users.save(user, null);
        return user;
    }
}
