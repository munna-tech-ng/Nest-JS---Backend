import { Inject, Injectable } from "@nestjs/common";
import { AuthUser } from "../../domain/entities/auth-user.entity";
import { AuthMethodPort } from "../../domain/contracts/auth-method.port";
import { AUTH_USER_REPO, AuthUserRepositoryPort } from "../../domain/contracts/auth-user-repository.port";
import { AuthMethodType } from "../../domain/types/auth-method-type";

@Injectable()
export class GuestAuthMethod implements AuthMethodPort {
    readonly type: AuthMethodType = "guest";

    constructor(
        @Inject(AUTH_USER_REPO)
        private readonly users: AuthUserRepositoryPort,
    ) { }

    async login(payload: { isGuest: boolean }): Promise<AuthUser> {
        if (!payload.isGuest) throw new Error("Guest flag required");
        const user = new AuthUser(crypto.randomUUID(), null, true, "guest");
        await this.users.save(user, null);
        return user;
    }
}
