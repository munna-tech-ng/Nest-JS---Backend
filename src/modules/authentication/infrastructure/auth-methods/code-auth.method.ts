import { Inject, Injectable } from "@nestjs/common";
import { AuthMethodPort } from "../../domain/contracts/auth-method.port";
import { AuthMethodType } from "../../domain/types/auth-method-type";
import { AuthUser } from "../../domain/entities/auth-user.entity";
import { AUTH_USER_REPO, AuthUserRepositoryPort } from "../../domain/contracts/auth-user-repository.port";
import { InvalidActivationCodeException } from "../../domain/exceptions";

@Injectable()
export class CodeAuthMethod implements AuthMethodPort {
    readonly type: AuthMethodType = "code";

    constructor(
        @Inject(AUTH_USER_REPO) private readonly users: AuthUserRepositoryPort
    ) { }

    async login(payload: { code: string }): Promise<AuthUser> {
        const user: AuthUser | null = await this.users.findByCode(payload.code);
        if (!user) throw new InvalidActivationCodeException();
        return user;
    }
}
